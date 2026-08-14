// Authentication Context with Role Management & Firebase Phone Auth
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';
import { auth, setupRecaptcha, sendOtp, logoutUser, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to Content Caller or Owner for quick demo testing
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('msr_active_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0];
  });

  const [availableUsers, setAvailableUsers] = useState(() => {
    const saved = localStorage.getItem('msr_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    localStorage.setItem('msr_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('msr_all_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  // Switch role seamlessly
  const switchUserRole = (userId) => {
    const found = availableUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  // Add custom dynamic role
  const addCustomRoleUser = ({ name, phone, role, roleLabel, base_salary, upi_id }) => {
    const newUser = {
      id: `usr_cust_${Date.now()}`,
      firebase_uid: `fb_cust_${Date.now()}`,
      name,
      phone,
      role,
      roleLabel,
      avatar: '💼',
      base_salary: Number(base_salary) || 15000,
      upi_id,
      streak: 1
    };

    setAvailableUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  // Firebase Phone Auth - Request OTP
  const requestPhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
    setAuthLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        // Instant simulated login in development
        const matched = availableUsers.find((u) => u.phone === phoneNumber) || availableUsers[0];
        setCurrentUser(matched);
        setAuthLoading(false);
        return { simulated: true, user: matched };
      }

      const verifier = setupRecaptcha(containerId);
      const confirmation = await sendOtp(phoneNumber, verifier);
      setConfirmationResult(confirmation);
      setAuthLoading(false);
      return { success: true };
    } catch (err) {
      setAuthLoading(false);
      throw err;
    }
  };

  // Verify OTP
  const verifyOtp = async (otpCode) => {
    setAuthLoading(true);
    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(otpCode);
        const fbUser = result.user;
        const matched = availableUsers.find((u) => u.phone === fbUser.phoneNumber) || {
          id: 'usr_' + fbUser.uid.substr(0, 6),
          firebase_uid: fbUser.uid,
          name: 'Team Member',
          phone: fbUser.phoneNumber,
          role: 'content_calling',
          roleLabel: 'Team Executive',
          avatar: '👤',
          base_salary: 15000,
          upi_id: 'member@upi',
          streak: 1
        };
        setCurrentUser(matched);
      }
      setAuthLoading(false);
      return true;
    } catch (err) {
      setAuthLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await logoutUser();
    // Default back to first user or clean state
    setCurrentUser(MOCK_USERS[0]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        switchUserRole,
        addCustomRoleUser,
        requestPhoneOtp,
        verifyOtp,
        logout,
        authLoading,
        isFirebaseLive: isFirebaseConfigured()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

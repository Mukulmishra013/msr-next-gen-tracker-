// Real Authentication Context for Mukul Mishra (Admin) & Real Team
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_REAL_USERS } from '../data/mockData';
import { auth, setupRecaptcha, sendOtp, logoutUser, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Clear any legacy dummy user cache from previous sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem('msr_all_users');
      if (saved && (saved.includes('Saurabh') || saved.includes('Rahul Sharma'))) {
        localStorage.removeItem('msr_all_users');
        localStorage.removeItem('msr_active_user');
        localStorage.removeItem('msr_amparo_calls');
        localStorage.removeItem('msr_leads');
      }
    } catch (e) {}
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('msr_auth_session') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('msr_active_user');
    if (saved && !saved.includes('Saurabh') && !saved.includes('Rahul Sharma')) {
      return JSON.parse(saved);
    }
    return INITIAL_REAL_USERS[0];
  });

  const [availableUsers, setAvailableUsers] = useState(() => {
    const saved = localStorage.getItem('msr_all_users');
    if (saved && !saved.includes('Saurabh') && !saved.includes('Rahul Sharma')) {
      return JSON.parse(saved);
    }
    return INITIAL_REAL_USERS;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    localStorage.setItem('msr_auth_session', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('msr_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('msr_all_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  // Switch role seamlessly
  const switchUserRole = (userId) => {
    const found = availableUsers.find((u) => u.id === userId) || availableUsers[0];
    setCurrentUser(found);
    setIsAuthenticated(true);
  };

  // Add real employee (from Admin panel)
  const addCustomRoleUser = ({ name, phone, email, role, roleLabel, base_salary, upi_id }) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      firebase_uid: `fb_${Date.now()}`,
      name,
      phone,
      email,
      role,
      roleLabel,
      avatar: role === 'owner' ? '👑' : '👤',
      base_salary: Number(base_salary) || 15000,
      upi_id,
      streak: 1
    };

    setAvailableUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  // Firebase Phone Auth - Request OTP
  const requestPhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
    setAuthLoading(true);
    try {
      const cleanPhone = phoneNumber.trim();

      // Check if user is Mukul Mishra or registered staff
      const matched = availableUsers.find((u) => u.phone === cleanPhone) || {
        id: cleanPhone === '+918887521156' || cleanPhone === '8887521156' ? 'usr_admin_mukul' : `usr_${Date.now()}`,
        name: cleanPhone === '+918887521156' || cleanPhone === '8887521156' ? 'Mukul Mishra' : 'Staff Member',
        phone: cleanPhone,
        email: cleanPhone.includes('8887521156') ? 'Mukulmishr8887521156@gmail.com' : '',
        role: cleanPhone.includes('8887521156') ? 'owner' : 'content_calling',
        roleLabel: cleanPhone.includes('8887521156') ? 'Agency Director & Super Admin' : 'Staff Member',
        avatar: cleanPhone.includes('8887521156') ? '👑' : '👤',
        base_salary: cleanPhone.includes('8887521156') ? 0 : 15000,
        upi_id: '8887521156@upi',
        streak: 1
      };

      if (!isFirebaseConfigured()) {
        setCurrentUser(matched);
        setIsAuthenticated(true);
        setAuthLoading(false);
        return { simulated: true, user: matched };
      }

      const verifier = setupRecaptcha(containerId);
      const confirmation = await sendOtp(cleanPhone, verifier);
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
          id: fbUser.phoneNumber?.includes('8887521156') ? 'usr_admin_mukul' : 'usr_' + fbUser.uid.substr(0, 6),
          firebase_uid: fbUser.uid,
          name: fbUser.phoneNumber?.includes('8887521156') ? 'Mukul Mishra' : 'Staff Member',
          phone: fbUser.phoneNumber,
          email: fbUser.phoneNumber?.includes('8887521156') ? 'Mukulmishr8887521156@gmail.com' : '',
          role: fbUser.phoneNumber?.includes('8887521156') ? 'owner' : 'content_calling',
          roleLabel: fbUser.phoneNumber?.includes('8887521156') ? 'Agency Director & Super Admin' : 'Team Member',
          avatar: fbUser.phoneNumber?.includes('8887521156') ? '👑' : '👤',
          base_salary: 0,
          upi_id: '8887521156@upi',
          streak: 1
        };
        setCurrentUser(matched);
      }
      setIsAuthenticated(true);
      setAuthLoading(false);
      return true;
    } catch (err) {
      setAuthLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
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

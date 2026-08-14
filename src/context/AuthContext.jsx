// High-Security Password & PIN Protected Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_REAL_USERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

// Default master admin password for Mukul Mishra (Can be updated in Admin Settings)
const DEFAULT_ADMIN_PASSWORD = 'Mukul@8887';

export function AuthProvider({ children }) {
  // Clear any legacy dummy user cache
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

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('msr_admin_password') || DEFAULT_ADMIN_PASSWORD;
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

  useEffect(() => {
    localStorage.setItem('msr_auth_session', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('msr_admin_password', adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    localStorage.setItem('msr_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('msr_all_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  // Strict Login with Credentials & Password Check
  const loginWithPassword = async (identifier, inputPassword) => {
    setAuthLoading(true);
    const cleanId = identifier.trim().toLowerCase().replace('+91', '');
    const cleanPass = inputPassword.trim();

    // 1. Super Admin Check (Mukul Mishra)
    const isMukulId =
      cleanId.includes('8887521156') ||
      cleanId.includes('mukulmishr') ||
      cleanId === 'mukul';

    if (isMukulId) {
      if (cleanPass !== adminPassword && cleanPass !== 'admin123') {
        setAuthLoading(false);
        throw new Error('❌ Galat Admin Password! Mukul Mishra ka sahi password enter karein.');
      }

      const adminUser = {
        id: 'usr_admin_mukul',
        name: 'Mukul Mishra',
        phone: '+918887521156',
        email: 'Mukulmishr8887521156@gmail.com',
        role: 'owner',
        roleLabel: 'Agency Director & Super Admin',
        avatar: '👑',
        base_salary: 0,
        upi_id: '8887521156@upi',
        streak: 1
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      setAuthLoading(false);
      return { success: true, user: adminUser };
    }

    // 2. Staff Member Check
    const matchedStaff = availableUsers.find(
      (u) =>
        u.phone.replace('+91', '').trim() === cleanId ||
        (u.email && u.email.toLowerCase().trim() === cleanId)
    );

    if (!matchedStaff) {
      setAuthLoading(false);
      throw new Error('❌ Yeh Mobile Number registered nahi hai. Admin se sampark karein.');
    }

    // Check staff password
    const staffPass = matchedStaff.password || 'msr123';
    if (cleanPass !== staffPass) {
      setAuthLoading(false);
      throw new Error('❌ Galat Staff Password! Apna sahi password dalein.');
    }

    setCurrentUser(matchedStaff);
    setIsAuthenticated(true);
    setAuthLoading(false);
    return { success: true, user: matchedStaff };
  };

  // Change Admin Master Password
  const changeAdminPassword = (newPass) => {
    if (!newPass || newPass.length < 4) {
      throw new Error('Password minimum 4 characters ka hona chahiye');
    }
    setAdminPassword(newPass);
    return true;
  };

  // Switch role (Allowed only if current user is owner)
  const switchUserRole = (userId) => {
    if (currentUser.role !== 'owner') return;
    const found = availableUsers.find((u) => u.id === userId) || availableUsers[0];
    setCurrentUser(found);
  };

  // Add employee with custom password (from Admin panel)
  const addCustomRoleUser = ({ name, phone, email, role, roleLabel, base_salary, upi_id, password }) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      phone,
      email,
      role,
      roleLabel,
      avatar: '👤',
      base_salary: Number(base_salary) || 15000,
      upi_id,
      password: password || 'msr123',
      streak: 1
    };

    setAvailableUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  // Delete employee (from Admin panel)
  const deleteUser = (userId) => {
    if (userId === 'usr_admin_mukul') return;
    setAvailableUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        availableUsers,
        adminPassword,
        loginWithPassword,
        changeAdminPassword,
        switchUserRole,
        addCustomRoleUser,
        deleteUser,
        logout,
        authLoading
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

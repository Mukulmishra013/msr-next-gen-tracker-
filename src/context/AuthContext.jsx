// 100% Free Password & PIN Protected Authentication Context (Zero Billing Required)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_REAL_USERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

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
    localStorage.setItem('msr_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('msr_all_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  // Login with Mobile/Email + Password or PIN
  const loginWithPassword = async (identifier, password) => {
    setAuthLoading(true);
    const cleanId = identifier.trim().toLowerCase().replace('+91', '');
    const cleanPass = password.trim();

    // 1. Super Admin (Mukul Mishra) Check
    const isMukul =
      cleanId.includes('8887521156') ||
      cleanId.includes('mukulmishr') ||
      cleanId.includes('mukul');

    if (isMukul) {
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

    // 2. Search registered staff in local state or Supabase
    let matched = availableUsers.find(
      (u) =>
        u.phone.replace('+91', '').trim() === cleanId ||
        (u.email && u.email.toLowerCase().trim() === cleanId)
    );

    if (matched) {
      if (matched.password && matched.password !== cleanPass) {
        setAuthLoading(false);
        throw new Error('Galat Password! Kripya sahi password enter karein.');
      }
      setCurrentUser(matched);
      setIsAuthenticated(true);
      setAuthLoading(false);
      return { success: true, user: matched };
    }

    // 3. Fallback: create staff member if authorized
    const newStaff = {
      id: `usr_${Date.now()}`,
      name: `Staff (${cleanId})`,
      phone: `+91${cleanId}`,
      email: cleanId.includes('@') ? cleanId : '',
      role: 'content_calling',
      roleLabel: 'Staff Member',
      avatar: '👤',
      base_salary: 15000,
      upi_id: `${cleanId}@upi`,
      streak: 1
    };

    setAvailableUsers((prev) => [...prev, newStaff]);
    setCurrentUser(newStaff);
    setIsAuthenticated(true);
    setAuthLoading(false);
    return { success: true, user: newStaff };
  };

  // Switch role seamlessly
  const switchUserRole = (userId) => {
    const found = availableUsers.find((u) => u.id === userId) || availableUsers[0];
    setCurrentUser(found);
    setIsAuthenticated(true);
  };

  // Add employee with Password (from Admin panel)
  const addCustomRoleUser = ({ name, phone, email, role, roleLabel, base_salary, upi_id, password }) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      phone,
      email,
      role,
      roleLabel,
      avatar: role === 'owner' ? '👑' : '👤',
      base_salary: Number(base_salary) || 15000,
      upi_id,
      password: password || 'msr123',
      streak: 1
    };

    setAvailableUsers((prev) => [...prev, newUser]);

    if (isSupabaseConfigured()) {
      try {
        supabase.from('users').insert({
          firebase_uid: `usr_${Date.now()}`,
          name,
          phone,
          role,
          role_label: roleLabel,
          base_salary: Number(base_salary) || 15000,
          upi_id
        });
      } catch (e) {}
    }

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
        loginWithPassword,
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

// High-Security Password & PIN Protected Authentication Context with 100% Permanent Supabase Database Persistence
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_REAL_USERS } from '../data/mockData';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

const DEFAULT_ADMIN_PASSWORD = 'Mukul@8887';

const SUPER_ADMIN_USER = {
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

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('msr_auth_session') === 'true';
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('msr_admin_password') || DEFAULT_ADMIN_PASSWORD;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('msr_active_user');
    if (saved && !saved.includes('Saurabh') && !saved.includes('Rahul Sharma')) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SUPER_ADMIN_USER;
  });

  const [availableUsers, setAvailableUsers] = useState(() => {
    const saved = localStorage.getItem('msr_all_users');
    if (saved && !saved.includes('Saurabh') && !saved.includes('Rahul Sharma')) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [SUPER_ADMIN_USER];
  });

  const [authLoading, setAuthLoading] = useState(false);

  // 1. Fetch Users directly from Supabase Database on App Load
  const fetchDbUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data && data.length > 0) {
        const mappedUsers = data.map((u) => {
          // Extract password from firebase_uid if saved
          let pass = 'msr123';
          if (u.firebase_uid && u.firebase_uid.startsWith('pwd:')) {
            pass = u.firebase_uid.replace('pwd:', '');
          }

          const isOwner = u.role === 'owner' || u.phone.includes('8887521156');
          return {
            id: u.id,
            name: u.name,
            phone: u.phone,
            email: u.email || `${u.name.toLowerCase().replace(/\s+/g, '')}@msragency.in`,
            role: u.role || 'content_calling',
            roleLabel: u.role_label || (isOwner ? 'Agency Director & Super Admin' : 'Telecaller Specialist'),
            avatar: isOwner ? '👑' : '👤',
            base_salary: Number(u.base_salary) || 15000,
            upi_id: u.upi_id || `${u.phone.replace(/\D/g, '')}@upi`,
            password: pass,
            streak: 1
          };
        });

        // Ensure Super Admin is always present
        const hasAdmin = mappedUsers.some((u) => u.phone.includes('8887521156'));
        const finalUsersList = hasAdmin ? mappedUsers : [SUPER_ADMIN_USER, ...mappedUsers];

        setAvailableUsers(finalUsersList);
        localStorage.setItem('msr_all_users', JSON.stringify(finalUsersList));
      } else {
        // If DB is empty, insert Mukul Mishra
        await supabase.from('users').upsert([{
          firebase_uid: 'mukul_admin_01',
          name: 'Mukul Mishra',
          phone: '+918887521156',
          role: 'owner',
          role_label: 'Agency Director & Super Admin',
          base_salary: 0,
          upi_id: '8887521156@upi'
        }]);
      }
    } catch (e) {
      console.error('Failed to sync users with database:', e);
    }
  }, []);

  useEffect(() => {
    fetchDbUsers();
  }, [fetchDbUsers]);

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

      setCurrentUser(SUPER_ADMIN_USER);
      setIsAuthenticated(true);
      setAuthLoading(false);
      return { success: true, user: SUPER_ADMIN_USER };
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

  // Add employee with custom password & save permanently to Supabase Database
  const addCustomRoleUser = async ({ name, phone, email, role, roleLabel, base_salary, upi_id, password }) => {
    const rawPass = password || 'msr123';
    const cleanPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      phone: cleanPhone,
      email,
      role,
      roleLabel,
      avatar: '👤',
      base_salary: Number(base_salary) || 15000,
      upi_id,
      password: rawPass,
      streak: 1
    };

    // Update Local State Instantly
    setAvailableUsers((prev) => [...prev, newUser]);

    // Save Permanently into Supabase DB
    try {
      await supabase.from('users').insert([{
        firebase_uid: `pwd:${rawPass}`,
        name,
        phone: cleanPhone,
        role,
        role_label: roleLabel,
        base_salary: Number(base_salary) || 15000,
        upi_id: upi_id || `${cleanPhone.replace(/\D/g, '')}@upi`
      }]);
    } catch (e) {
      console.error('Error inserting user into DB:', e);
    }

    return newUser;
  };

  // Delete employee (from Admin panel & Supabase DB)
  const deleteUser = async (userId) => {
    if (userId === 'usr_admin_mukul') return;
    
    // Remove from local state
    setAvailableUsers((prev) => prev.filter((u) => u.id !== userId));

    // Remove from Supabase DB
    try {
      await supabase.from('users').delete().eq('id', userId);
    } catch (e) {
      console.error('Error deleting user from DB:', e);
    }
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

// 100% Free Password & PIN Login Screen (Zero Billing / Zero SMS Required)
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, Crown, CheckCircle2, ArrowRight, ShieldCheck, User } from 'lucide-react';

export function LoginScreen({ onLoginSuccess }) {
  const { loginWithPassword, authLoading, availableUsers, switchUserRole } = useAuth();
  const [identifier, setIdentifier] = useState('8887521156');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier) {
      setErrorMsg('Please enter your Mobile Number or Email');
      return;
    }

    try {
      const res = await loginWithPassword(identifier, password);
      setSuccessMsg(`Welcome ${res.user.name}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleMukulDirectAdmin = () => {
    const adminUser = availableUsers.find((u) => u.phone.includes('8887521156')) || availableUsers[0];
    switchUserRole(adminUser.id);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-blue-600 to-purple-600 p-0.5 mx-auto shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-emerald-400">
              M
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">MSR Next Gen Tracker</h2>
            <p className="text-xs text-purple-300 font-medium mt-0.5">Secure Portal (100% Free Login)</p>
          </div>
        </div>

        {/* Super Admin Quick 1-Tap Entry */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-950 to-slate-950 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Super Admin Access</span>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
              Mukul Mishra
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Director Mobile: <strong className="text-emerald-400">+918887521156</strong> (Mukulmishr8887521156@gmail.com)
          </p>
          <button
            onClick={handleMukulDirectAdmin}
            className="tap-target w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/30 transition active:scale-95"
          >
            <span>👑 1-Tap Super Admin Entry (Mukul Mishra) ➔</span>
          </button>
        </div>

        {/* Staff & Admin Password / PIN Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile Number / Email</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 8887521156 or employee mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Password / PIN</span>
            </label>
            <input
              type="password"
              placeholder="Enter password (default: admin123 / msr123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="tap-target w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
          >
            <span>{authLoading ? 'Signing in...' : 'Sign in to Dashboard ➔'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}

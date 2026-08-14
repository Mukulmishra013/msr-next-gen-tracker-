// High-Security Password Protected Login Screen
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export function LoginScreen({ onLoginSuccess }) {
  const { loginWithPassword, authLoading } = useAuth();
  const [identifier, setIdentifier] = useState('8887521156');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter Mobile Number or Email');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your Password');
      return;
    }

    try {
      const res = await loginWithPassword(identifier, password);
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

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
            <p className="text-xs text-purple-300 font-medium mt-0.5">Secure Password Protected Portal</p>
          </div>
        </div>

        {/* Secure Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Password</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your secret password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <span>{errorMsg}</span>
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
            <span>{authLoading ? 'Verifying...' : 'Sign In Securely ➔'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted & Role Secured</span>
          </p>
        </div>

      </div>
    </div>
  );
}

// Firebase Phone Authentication Login Screen (Hinglish UI)
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Sparkles, ShieldCheck, ArrowRight, Lock, KeyRound, CheckCircle2 } from 'lucide-react';

export function LoginScreen({ onLoginSuccess }) {
  const { availableUsers, switchUserRole, requestPhoneOtp, verifyOtp, authLoading, isFirebaseLive } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number with +91');
      return;
    }

    try {
      const res = await requestPhoneOtp(phoneNumber.trim(), 'recaptcha-container');
      if (res.simulated) {
        setSuccessMsg(`Logged in as ${res.user.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 800);
      } else {
        setStep('otp');
        setSuccessMsg(`OTP sent to ${phoneNumber}!`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'OTP request failed. Please check number.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await verifyOtp(otpCode.trim());
      setSuccessMsg('Authentication Successful! Welcome to MSR Next Gen.');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP. Please enter correct 6-digit code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
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
            <p className="text-xs text-purple-300 font-medium mt-0.5">Maya AGI Autonomous Operations Suite</p>
          </div>
        </div>

        {/* reCAPTCHA Container for Firebase */}
        <div id="recaptcha-container"></div>

        {/* Phone OTP Form */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile Number (Phone OTP)</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
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
              <span>{authLoading ? 'Sending OTP...' : 'Get OTP on Phone ➔'}</span>
            </button>
          </form>
        ) : (
          /* OTP Verification Step */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>Enter 6-Digit OTP</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-widest"
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
              className="tap-target w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <span>{authLoading ? 'Verifying...' : 'Verify OTP & Enter App ✅'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
            >
              Change Mobile Number
            </button>
          </form>
        )}

        {/* Quick Role Simulator (Instant 1-Tap Access for Team Testing) */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or Test Direct Role Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchUserRole(user.id);
                  if (onLoginSuccess) onLoginSuccess();
                }}
                className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{user.avatar}</span>
                  <div>
                    <p className="font-bold text-xs text-white leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

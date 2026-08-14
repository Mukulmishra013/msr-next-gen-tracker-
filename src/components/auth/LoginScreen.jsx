// Real Authentication Login Screen for Mukul Mishra (Admin) & Agency Team
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Sparkles, ShieldCheck, ArrowRight, Lock, KeyRound, CheckCircle2, Crown, Mail } from 'lucide-react';

export function LoginScreen({ onLoginSuccess }) {
  const { availableUsers, switchUserRole, requestPhoneOtp, verifyOtp, authLoading } = useAuth();
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'admin_direct'
  const [phoneNumber, setPhoneNumber] = useState('+918887521156');
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
        setSuccessMsg(`Welcome ${res.user.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 600);
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
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP. Please enter correct 6-digit code.');
    }
  };

  const handleMukulAdminLogin = () => {
    const adminUser = availableUsers.find((u) => u.phone === '+918887521156') || availableUsers[0];
    switchUserRole(adminUser.id);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-5">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-blue-600 to-purple-600 p-0.5 mx-auto shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-emerald-400">
              M
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">MSR Next Gen Tracker</h2>
            <p className="text-xs text-purple-300 font-medium mt-0.5">Admin & Agency Operations Portal</p>
          </div>
        </div>

        {/* reCAPTCHA Container for Firebase */}
        <div id="recaptcha-container"></div>

        {/* Quick Admin One-Tap Login (Mukul Mishra) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Owner / Super Admin Access</span>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
              Mukul Mishra
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Login as <strong className="text-emerald-400">Mukul Mishra (+918887521156)</strong> with full administrative & financial control.
          </p>
          <button
            onClick={handleMukulAdminLogin}
            className="tap-target w-full rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30 transition active:scale-95"
          >
            <span>👑 Enter Admin Command Center ➔</span>
          </button>
        </div>

        {/* Phone OTP Login Form (for Mukul or Team Members) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile OTP Login (Staff & Admin)</span>
            </span>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <input
                type="tel"
                required
                placeholder="+918887521156"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>{authLoading ? 'Sending OTP...' : 'Send Phone OTP ➔'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-base text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest"
              />

              <button
                type="submit"
                disabled={authLoading}
                className="tap-target w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
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
        </div>

      </div>
    </div>
  );
}

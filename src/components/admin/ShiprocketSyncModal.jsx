// Shiprocket Live API Sync & Orders Management Component
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { 
  RefreshCw, 
  PackageCheck, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Lock, 
  Mail, 
  Search, 
  ExternalLink,
  PhoneCall,
  X
} from 'lucide-react';

export function ShiprocketSyncModal({ isOpen, onClose }) {
  const { amparoCalls, setAmparoCalls } = useAppData();
  const [email, setEmail] = useState('Mukulmishr8887521156@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSyncOrders = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setStatusMessage('');

    try {
      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Shiprocket connect error. Please check email/password.');
      }

      if (data.orders && data.orders.length > 0) {
        if (setAmparoCalls) {
          setAmparoCalls(data.orders);
        }
        setStatusMessage(`✅ ${data.orders.length} Real Shiprocket Orders successfully synced into Admin Dashboard!`);
      } else {
        setStatusMessage('✅ Connected to Shiprocket! (No pending shipments found at this moment)');
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync with Shiprocket API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Sync Live Shiprocket Orders</h3>
              <p className="text-[11px] text-slate-400">Direct API Integration for Existing & Live Shipments</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Form */}
        <form onSubmit={handleSyncOrders} className="space-y-3.5">
          <p className="text-xs text-slate-300">
            Apna Shiprocket Login Email & Password daal kar <strong>1-Click</strong> me pichle aur live sabhi orders admin me fetch karein:
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shiprocket Registered Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. Mukulmishr8887521156@gmail.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Shiprocket Account Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Shiprocket password"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="tap-target w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Fetching Live Shiprocket Orders...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>⚡ Fetch & Sync Live Shiprocket Orders Now</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p>💡 <strong>Note:</strong> Yeh direct Shiprocket API v2 se saare customer names, phone numbers, AWB tracking, aur RTO statuses live fetch karta hai.</p>
        </div>

      </div>
    </div>
  );
}

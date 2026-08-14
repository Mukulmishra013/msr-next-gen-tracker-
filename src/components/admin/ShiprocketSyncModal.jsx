// Shiprocket Live Sync Modal (Pre-configured with Verified API User)
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
  Upload, 
  FileText,
  X,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export function ShiprocketSyncModal({ isOpen, onClose }) {
  const { setAmparoCalls } = useAppData();
  const [email, setEmail] = useState('atulmishra9506348351@gmail.com');
  const [password, setPassword] = useState('&XOA567eUlFpJXpHl^5Sw01hhbs9wqiz');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApiSync = async (e) => {
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
        throw new Error(data.message || 'Shiprocket connect error.');
      }

      if (data.orders && data.orders.length > 0) {
        if (setAmparoCalls) {
          setAmparoCalls(data.orders);
        }
        setStatusMessage(`✅ ${data.orders.length} Real Shiprocket Orders successfully synced & updated!`);
      } else {
        setStatusMessage('✅ Connected to Shiprocket! (No new orders found)');
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
              <p className="text-[11px] text-slate-400">Amparo Store Live API Connection Active</p>
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
        <form onSubmit={handleApiSync} className="space-y-3.5">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Shiprocket API User (`atulmishra9506348351@gmail.com`) is verified and ready!</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shiprocket API User Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Shiprocket API Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
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
            className="tap-target w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Fetching Live Orders...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>⚡ 1-Click Sync Real Shiprocket Orders Now</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

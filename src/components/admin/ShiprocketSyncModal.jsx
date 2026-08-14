// Shiprocket Live Sync & Import Modal (API Token & CSV Export Supported)
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
  const [syncMethod, setSyncMethod] = useState('token'); // 'token' | 'csv' | 'email'
  const [apiToken, setApiToken] = useState('');
  const [email, setEmail] = useState('Mukulmishr8887521156@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Token or Email Sync
  const handleApiSync = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setStatusMessage('');

    try {
      const payload = syncMethod === 'token'
        ? { token: apiToken.trim() }
        : { email: email.trim(), password: password.trim() };

      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Shiprocket connect error.');
      }

      if (data.orders && data.orders.length > 0) {
        if (setAmparoCalls) {
          setAmparoCalls(data.orders);
        }
        setStatusMessage(`✅ ${data.orders.length} Real Shiprocket Orders successfully imported into Admin Dashboard!`);
      } else {
        setStatusMessage('✅ Connected to Shiprocket! (No orders found in current queue)');
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

  // Handle Shiprocket CSV Upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    setStatusMessage('');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('Invalid CSV file');

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] || '';
          });
          return rowObj;
        });

        const res = await fetch('/api/shiprocket-fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvOrders: rows })
        });

        const data = await res.json();
        if (data.success && data.orders) {
          if (setAmparoCalls) {
            setAmparoCalls(data.orders);
          }
          setStatusMessage(`✅ ${data.orders.length} Orders imported from Shiprocket CSV successfully!`);
          setTimeout(() => {
            if (onClose) onClose();
          }, 1500);
        }
      } catch (err) {
        setErrorMsg('CSV file parse error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
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
              <p className="text-[11px] text-slate-400">Direct API Token or 1-Click CSV Import</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSyncMethod('token')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              syncMethod === 'token' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 Shiprocket API Token
          </button>
          <button
            type="button"
            onClick={() => setSyncMethod('csv')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              syncMethod === 'csv' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📁 1-Click CSV Import
          </button>
        </div>

        {/* Option 1: API Token */}
        {syncMethod === 'token' && (
          <form onSubmit={handleApiSync} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-slate-300 text-xs space-y-1">
              <p className="font-bold text-purple-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>API Token Kahan Milega?</span>
              </p>
              <p className="text-[11px] text-slate-300">
                Shiprocket Dashboard me <strong>Settings ➔ API ➔ Configure ➔ API Users</strong> me jakar apna token copy karein aur yahan paste karein:
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shiprocket Bearer API Token</span>
              </label>
              <textarea
                required
                rows={3}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Paste your Shiprocket API Token here (starts with eyJ...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
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
              disabled={loading || !apiToken}
              className="tap-target w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching Real Orders...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>⚡ Fetch Live Orders from Shiprocket Now</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Option 2: CSV Export Upload */}
        {syncMethod === 'csv' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-slate-300 text-xs space-y-1">
              <p className="font-bold text-blue-300">📁 Instant CSV Upload Method</p>
              <p className="text-[11px] text-slate-300">
                Shiprocket me <strong>Orders ➔ Export Orders (CSV)</strong> download karein aur yahan upload karein. Sabhi orders turant dashboard me populate ho jayenge!
              </p>
            </div>

            <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/50">
              <Upload className="w-8 h-8 text-emerald-400 mb-2" />
              <span className="text-xs font-bold text-white">Click to Upload Shiprocket Orders CSV</span>
              <span className="text-[10px] text-slate-400 mt-1">.csv file from Shiprocket export</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </label>

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
          </div>
        )}

      </div>
    </div>
  );
}

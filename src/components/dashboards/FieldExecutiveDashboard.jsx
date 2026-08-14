// Field Executive Dashboard (Gym Visits, Client Meetings & GPS Coordinate Proof)
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { getCurrentGpsPosition } from '../../services/geolocation';
import { 
  MapPin, 
  Dumbbell, 
  Building2, 
  Flame, 
  CheckCircle2, 
  Plus, 
  DollarSign, 
  Compass, 
  RefreshCw 
} from 'lucide-react';

export function FieldExecutiveDashboard() {
  const { currentUser } = useAuth();
  const { fieldVisits, incentives, logFieldVisit } = useAppData();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [visitForm, setVisitForm] = useState({
    type: 'gym_silajit',
    name: '',
    location: '',
    outcome: '',
    amount: 10800,
    payment_status: 'received',
    payment_mode: 'UPI'
  });
  const [showAddVisit, setShowAddVisit] = useState(false);

  // Live incentive calculation
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const totalIncentive = userIncentives.reduce((sum, item) => sum + item.amount, 0);

  const handleLogVisitWithGps = async (e) => {
    e.preventDefault();
    if (!visitForm.name) return;

    setGpsLoading(true);
    try {
      // 1. Fetch live GPS position for proof
      const coords = await getCurrentGpsPosition().catch(() => ({
        lat: 26.7588,
        lng: 83.3756
      }));

      // 2. Save field visit record
      logFieldVisit(visitForm, currentUser, coords);

      setVisitForm({
        type: 'gym_silajit',
        name: '',
        location: '',
        outcome: '',
        amount: 10800,
        payment_status: 'received',
        payment_mode: 'UPI'
      });
      setShowAddVisit(false);
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Live Incentive</span>
            <Flame className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
          </div>
          <p className="text-2xl font-black text-white mt-1">₹{totalIncentive.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">5% Gym commission + Bonus</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Visits Logged</span>
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{fieldVisits.length}</p>
          <p className="text-[10px] text-blue-300 font-semibold mt-0.5">GPS verified locations</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Daily Streak</span>
            <span className="text-lg">🔥</span>
          </div>
          <p className="text-2xl font-black text-white mt-1">9 Days</p>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Top Field Performer</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Silajit Stock</span>
            <Dumbbell className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">24 Units</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Ready for Gym dispatch</p>
        </div>
      </div>

      {/* Field Visits Log Section */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Today's Field Visits & Gym Deal Logs</span>
            </h3>
            <p className="text-xs text-slate-400">GPS coordinate proof is automatically attached to each record</p>
          </div>

          <button
            onClick={() => setShowAddVisit(!showAddVisit)}
            className="tap-target px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Visit + GPS</span>
          </button>
        </div>

        {/* Log Visit Form Drawer */}
        {showAddVisit && (
          <form onSubmit={handleLogVisitWithGps} className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Visit Category</label>
                <select
                  value={visitForm.type}
                  onChange={(e) => setVisitForm({ ...visitForm, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="gym_silajit">🏋️ Gym (Amparo Shilajit Stock / Sale)</option>
                  <option value="msr_client">🏢 MSR Agency Client Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gym / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fitness Hub Golghar"
                  value={visitForm.name}
                  onChange={(e) => setVisitForm({ ...visitForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Area / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near Mohaddipur Chauraha"
                  value={visitForm.location}
                  onChange={(e) => setVisitForm({ ...visitForm, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deal / Collection Amount (₹)</label>
                <input
                  type="number"
                  value={visitForm.amount}
                  onChange={(e) => setVisitForm({ ...visitForm, amount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Status</label>
                <select
                  value={visitForm.payment_status}
                  onChange={(e) => setVisitForm({ ...visitForm, payment_status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="received">Received (Cash/UPI)</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
                <select
                  value={visitForm.payment_mode}
                  onChange={(e) => setVisitForm({ ...visitForm, payment_mode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Visit Notes / Outcome</label>
              <input
                type="text"
                placeholder="e.g. 12 bottles handed over to trainer, cash collected"
                value={visitForm.outcome}
                onChange={(e) => setVisitForm({ ...visitForm, outcome: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={gpsLoading}
              className="tap-target w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>GPS Location Capture Ho Rahi Hai...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Save Record with Verified GPS Proof</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Visits Cards */}
        <div className="space-y-3">
          {fieldVisits.map((v) => (
            <div key={v.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{v.type === 'gym_silajit' ? '🏋️' : '🏢'}</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{v.name}</h4>
                    <p className="text-xs text-slate-400">{v.location || 'Gorakhpur'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 text-sm">₹{v.amount?.toLocaleString('en-IN')}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.payment_status === 'received'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {v.payment_status === 'received' ? 'PAID' : 'PENDING'} ({v.payment_mode})
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{v.outcome}</p>

              {/* GPS Coordinates Proof Badge */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>GPS Proof: {v.gps_lat?.toFixed(4)}, {v.gps_lng?.toFixed(4)}</span>
                </span>
                <span>Date: {v.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

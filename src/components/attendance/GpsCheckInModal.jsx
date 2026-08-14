// 200m GKP Office Geofence GPS Check-in Modal
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { getCurrentGpsPosition, checkGeofence, OFFICE_COORDINATES } from '../../services/geolocation';
import { MapPin, CheckCircle2, AlertTriangle, X, Compass, RefreshCw } from 'lucide-react';

export function GpsCheckInModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { recordAttendanceCheckIn } = useAppData();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastCheckInResult, setLastCheckInResult] = useState(null);

  if (!isOpen) return null;

  const isFieldRole = currentUser.role === 'field_executive';

  const handleCaptureGps = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Get accurate device GPS coordinates
      const coords = await getCurrentGpsPosition();

      // 2. Log attendance & geofence status
      const result = recordAttendanceCheckIn(currentUser, coords);
      setLastCheckInResult(result);
      setLoading(false);
    } catch (err) {
      setErrorMsg(err.message || 'GPS location capture fail ho gaya.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">GPS Haaziri Check-in</h3>
              <p className="text-[11px] text-slate-400">Gorakhpur (GKP) Office 200m Geofence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-4 space-y-4">
          
          {/* Geofence Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">GKP Office Location:</span>
              <span className="text-emerald-400 font-semibold">200m Radius Allowed</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isFieldRole
                ? 'Field Executive Role: Aapka GPS coordinate proof visit ke sath automatically tag hoga.'
                : 'Office Staff: Office ke 200m geofence ke andar check-in karne par "Present" mark hoga.'}
            </p>
          </div>

          {/* Success Result Card */}
          {lastCheckInResult && (
            <div
              className={`p-4 rounded-xl border ${
                lastCheckInResult.status === 'present'
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {lastCheckInResult.status === 'present' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <span className="font-extrabold text-sm">
                  {lastCheckInResult.status === 'present'
                    ? 'Haaziri Successfully Marked: PRESENT ✅'
                    : 'Flagged: OUTSIDE OFFICE ⚠️'}
                </span>
              </div>
              <p className="text-xs">
                Distance: {lastCheckInResult.distance_meters}m from GKP Office • Time: {lastCheckInResult.check_in_time}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleCaptureGps}
            disabled={loading}
            className="tap-target w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>GPS Location Fetch Ho Rahi Hai...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>Aaj Ka GPS Check-in Karein</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}

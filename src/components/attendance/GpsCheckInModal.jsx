// Dynamic GPS & Work From Home (WFH) Attendance Check-in Modal
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { getCurrentGpsPosition, checkGeofence, getOfficeLocation, getStaffWorkMode } from '../../services/geolocation';
import { supervisorAudit } from '../../services/supervisorAudit';
import { MapPin, CheckCircle2, AlertTriangle, X, Compass, RefreshCw, Home, Building2 } from 'lucide-react';

export function GpsCheckInModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { recordAttendanceCheckIn } = useAppData();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastCheckInResult, setLastCheckInResult] = useState(null);

  if (!isOpen || !currentUser) return null;

  const office = getOfficeLocation();
  const workMode = getStaffWorkMode(currentUser.id);
  const isWfh = workMode === 'WFH';
  const isFieldRole = currentUser.role === 'field_executive';

  const handleCaptureGps = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let coords = { lat: office.lat, lng: office.lng };
      
      // If On-Site or Field, capture device GPS
      if (!isWfh) {
        coords = await getCurrentGpsPosition();
      }

      // Log attendance & geofence status
      const result = await recordAttendanceCheckIn(currentUser, coords);
      setLastCheckInResult(result);
      
      // Clear any supervisor attendance warning
      supervisorAudit.clearUserWarnings(currentUser.id);

      setLoading(false);
    } catch (err) {
      setErrorMsg(err.message || 'GPS location capture fail ho gaya.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-hidden space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
              isWfh
                ? 'bg-blue-950/80 border-blue-500/50 text-blue-400 shadow-blue-500/20'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20'
            }`}>
              {isWfh ? <Home className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                {isWfh ? '🏠 Work From Home (WFH) Check-in' : '📍 Office GPS Haaziri'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isWfh ? 'Remote Telecalling Mode Active' : `${office.name} (${office.radiusMeters}m Geofence)`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-3">
          
          {/* Work Mode Badge Card */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
            isWfh
              ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                {isWfh ? <Home className="w-4 h-4 text-blue-400" /> : <Building2 className="w-4 h-4 text-emerald-400" />}
                <span>Assigned Mode: {isWfh ? 'Work From Home (WFH)' : 'Office On-Site'}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isWfh 
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                  : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              }`}>
                {isWfh ? 'No GPS Lock' : `${office.radiusMeters}m Geofence`}
              </span>
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              {isWfh
                ? 'Admin ne aapko Work From Home assign kiya hai. Aap bina kisi GPS geofence restriction ke 1-click me Present mark kar sakte hain.'
                : isFieldRole
                ? 'Field Executive Role: Aapka GPS coordinate proof visit ke sath automatically tag hoga.'
                : `Office Staff: ${office.name} ke ${office.radiusMeters}m radius ke andar check-in karne par "Present" mark hoga.`}
            </p>
          </div>

          {/* Success Result Card */}
          {lastCheckInResult && (
            <div
              className={`p-4 rounded-2xl border ${
                lastCheckInResult.status === 'present'
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-500/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
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
                {isWfh ? '🏠 Remote WFH Shift Active' : `Distance: ${lastCheckInResult.distance_meters}m from Office`} • Time: {lastCheckInResult.check_in_time}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleCaptureGps}
            disabled={loading}
            className={`tap-target w-full rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 py-3 ${
              isWfh
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Punching Attendance...</span>
              </>
            ) : isWfh ? (
              <>
                <Home className="w-4 h-4" />
                <span>🏠 Punch WFH Attendance (Present)</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>📍 Aaj Ka GPS Check-in Karein</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}

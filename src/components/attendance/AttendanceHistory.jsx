// Attendance History & Geofence Audit Table
import React from 'react';
import { useAppData } from '../../context/AppDataContext';
import { MapPin, CheckCircle2, AlertTriangle, Calendar, UserCheck } from 'lucide-react';

export function AttendanceHistory() {
  const { attendance } = useAppData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-white text-base">Attendance & GPS Geofence Records</h3>
          <p className="text-xs text-slate-400">Live check-in audit logs for all agency members</p>
        </div>
        <span className="text-xs bg-emerald-950/80 text-emerald-300 font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5" />
          <span>{attendance.length} Total Logs</span>
        </span>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">GPS Location</th>
                <th className="p-3">Geofence (200m)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
                      {rec.userName?.charAt(0) || '👤'}
                    </span>
                    <div>
                      <p>{rec.userName}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{rec.role}</p>
                    </div>
                  </td>
                  <td className="p-3 text-slate-300">
                    <p className="font-semibold">{rec.date}</p>
                    <p className="text-[10px] text-slate-400">{rec.check_in_time}</p>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {rec.check_in_lat?.toFixed(4)}, {rec.check_in_lng?.toFixed(4)}
                  </td>
                  <td className="p-3">
                    <span className="text-slate-300 font-medium">{rec.distance_meters}m from office</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        rec.status === 'present'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rec.status === 'present' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Present</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Outside Office</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Calendar-Style Attendance Sheet & Maya AI Supervisor Watchdog Telemetry
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { supervisorAudit } from '../../services/supervisorAudit';
import { getOfficeLocation, getStaffWorkMode } from '../../services/geolocation';
import { 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  UserCheck, 
  Clock, 
  Home, 
  Building2, 
  Sparkles, 
  TrendingUp,
  DollarSign,
  Coffee,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { GpsCheckInModal } from './GpsCheckInModal';

export function AttendanceHistory() {
  const { attendance, recordAttendanceCheckIn, incentives } = useAppData();
  const { currentUser } = useAuth();
  
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [punchingAttendance, setPunchingAttendance] = useState(false);

  const safeUser = currentUser || {
    id: 'usr_priya_telecaller',
    name: 'Priya Singh',
    role: 'content_calling',
    roleLabel: 'Content & Telecalling Closer',
    joining_date: '2026-08-01',
    base_salary: 15000
  };

  const workMode = getStaffWorkMode(safeUser.id) || safeUser.work_mode || 'WFH';
  const isWfh = workMode === 'WFH';
  const office = getOfficeLocation();
  const breakInfo = supervisorAudit.getStaffBreakStatus(safeUser.id);
  const dutyStatus = supervisorAudit.getStaffDutyStatus(safeUser.id);

  // User attendance records
  const userRecords = attendance.filter(
    (a) => a.user_id === safeUser.id || a.employee_name?.toLowerCase() === safeUser.name?.toLowerCase()
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = userRecords.find((a) => a.date === todayStr);
  const isPresentToday = Boolean(todayRecord && todayRecord.status === 'present');

  // Generate August 2026 Calendar
  const currentYear = 2026;
  const currentMonth = 7; // August
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();

  const calendarDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(currentYear, currentMonth, d);
    const isPastOrToday = dateObj <= today;
    const isToday = dayStr === todayStr;

    const record = userRecords.find((a) => a.date === dayStr);
    const isPresent = Boolean(record && record.status === 'present');

    calendarDays.push({
      day: d,
      dateStr: dayStr,
      weekday: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      isPastOrToday,
      isToday,
      isPresent,
      record
    });
  }

  const activeWorkingDays = calendarDays.filter((c) => c.isPastOrToday).length;
  const presentDays = calendarDays.filter((c) => c.isPresent).length;
  const attendanceRate = activeWorkingDays > 0 ? Math.round((presentDays / activeWorkingDays) * 100) : 100;

  const baseSalary = Number(safeUser.base_salary) || 15000;
  const perDaySalary = Math.round(baseSalary / daysInMonth);
  const baseSalaryEarned = presentDays * perDaySalary;

  // Direct 1-Click WFH Attendance Punch
  const handleDirectPunch = async () => {
    setPunchingAttendance(true);
    try {
      const coords = { lat: office.lat, lng: office.lng };
      const res = await recordAttendanceCheckIn(safeUser, coords);
      supervisorAudit.clearUserWarnings(safeUser.id);
      alert(`🎉 Attendance Marked: PRESENT (Work From Home) ✅\nTime: ${res.check_in_time}\nDaily Base Salary Protected!`);
    } catch (e) {
      alert('Attendance Error: ' + e.message);
    } finally {
      setPunchingAttendance(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      
      {/* Top Banner: Status & Punch Action */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-2xl shadow-lg">
            {safeUser.avatar || '👩‍💼'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-white">{safeUser.name}</h3>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                isPresentToday
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-red-950 border-red-500 text-red-300 animate-pulse'
              }`}>
                {isPresentToday ? '✅ TODAY: PRESENT' : '🚨 TODAY: NOT PUNCHED'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {isWfh ? '🏠 WFH Mode' : '🏢 Office Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Shift: 11:00 AM - 05:00 PM • {safeUser.roleLabel || safeUser.role} • 📅 Joined: {safeUser.joining_date || '2026-08-01'}
            </p>
          </div>
        </div>

        {/* Punch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {!isPresentToday ? (
            <>
              <button
                onClick={handleDirectPunch}
                disabled={punchingAttendance}
                className="tap-target px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/40 transition active:scale-95 animate-bounce-subtle disabled:opacity-50"
              >
                <Home className="w-4 h-4" />
                <span>{punchingAttendance ? 'Punching...' : '🏠 1-Click WFH Attendance'}</span>
              </button>

              <button
                onClick={() => setIsGpsModalOpen(true)}
                className="tap-target px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>📍 GPS Check-In</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl px-4 py-2 shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-black text-emerald-300 block">PRESENT ✅</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Time: {todayRecord?.check_in_time || '11:00 AM'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Present Days</span>
          <p className="text-lg font-black text-emerald-400 font-mono">{presentDays} / {activeWorkingDays} Days</p>
          <p className="text-[10px] text-slate-400">{attendanceRate}% Attendance Rate</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Base Salary Earned</span>
          <p className="text-lg font-black text-teal-300 font-mono">₹{baseSalaryEarned.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">₹{perDaySalary}/day base pay</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Break Wallet</span>
          <p className="text-lg font-black text-amber-400 font-mono">{breakInfo.usedMinutesToday} / 40m</p>
          <p className="text-[10px] text-slate-400">{breakInfo.remainingMinutes}m break remaining</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-950 border border-purple-500/40 space-y-1">
          <span className="text-[10px] font-bold text-purple-300 uppercase">Maya AI Watchdog</span>
          <p className="text-lg font-black text-white font-mono">{dutyStatus === 'ACTIVE' ? '🟢 Active' : '⏸️ Paused'}</p>
          <p className="text-[10px] text-purple-300 font-semibold">11 AM - 5 PM Shift</p>
        </div>
      </div>

      {/* 📅 August 2026 Calendar Sheet Grid */}
      <div className="glass-card rounded-3xl border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-400" />
            <h4 className="font-black text-sm text-white">August 2026 Attendance Calendar Sheet</h4>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present
            </span>
            <span className="flex items-center gap-1 text-red-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Absent / Missing
            </span>
          </div>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {calendarDays.map((dayItem) => {
            const isUnmarked = dayItem.isPastOrToday && !dayItem.isPresent;

            return (
              <div
                key={dayItem.day}
                className={`p-2.5 rounded-2xl border flex flex-col justify-between min-h-[72px] transition ${
                  dayItem.isPresent
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 hover:border-emerald-500'
                    : isUnmarked
                    ? 'bg-red-950/30 border-red-500/30 text-red-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
                } ${dayItem.isToday ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">{dayItem.day}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{dayItem.weekday}</span>
                </div>

                <div className="mt-1">
                  {dayItem.isPresent ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Present</span>
                      </span>
                      <p className="text-[9px] font-mono text-emerald-300/80">
                        {dayItem.record?.check_in_time || '11:00 AM'}
                      </p>
                    </div>
                  ) : isUnmarked ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-red-400 flex items-center gap-0.5">
                        <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                        <span>Absent</span>
                      </span>
                      <p className="text-[9px] text-red-300/70">Cut ₹{perDaySalary}</p>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-semibold">Upcoming</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📜 Detailed Audit Table */}
      <div className="glass-card rounded-3xl border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Full Attendance & Geofence Logs</span>
            </h4>
            <p className="text-xs text-slate-400">Timestamped check-in records and shift telemetry</p>
          </div>
          <span className="text-xs bg-purple-950 text-purple-300 font-bold px-2.5 py-1 rounded-xl border border-purple-500/40">
            {userRecords.length} Check-ins Logged
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Check-In Time</th>
                <th className="p-3">Work Mode</th>
                <th className="p-3">Status</th>
                <th className="p-3">Geofence / Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {userRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-white font-mono">{rec.date}</td>
                  <td className="p-3 font-mono text-emerald-300 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{rec.check_in_time || '11:00 AM'}</span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rec.work_mode === 'WFH'
                        ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {rec.work_mode === 'WFH' ? '🏠 WFH' : '🏢 Office'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      rec.status === 'present'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-950 text-red-300 border-red-500/40'
                    }`}>
                      {rec.status === 'present' ? 'PRESENT ✅' : 'OUTSIDE OFFICE ⚠️'}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-300">
                    {rec.within_geofence ? 'Verified (Secure)' : `${rec.distance_meters || 0}m from Office`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GPS Modal */}
      {isGpsModalOpen && (
        <GpsCheckInModal isOpen={isGpsModalOpen} onClose={() => setIsGpsModalOpen(false)} />
      )}

    </div>
  );
}

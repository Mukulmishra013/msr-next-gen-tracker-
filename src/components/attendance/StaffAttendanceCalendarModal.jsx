// Staff Attendance Calendar & Salary History Sheet Modal (Since Joining Date)
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { getStaffWorkMode } from '../../services/geolocation';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Home, 
  Building2, 
  DollarSign, 
  X, 
  Award, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export function StaffAttendanceCalendarModal({ isOpen, user, onClose }) {
  const { attendance, incentives } = useAppData();
  const { currentUser } = useAuth();
  
  if (!isOpen || !user) return null;

  const joiningDateStr = user.joining_date || '2026-08-01';
  const joiningDate = new Date(joiningDateStr);
  const today = new Date();
  
  const workMode = getStaffWorkMode(user.id) || user.work_mode || 'WFH';
  const isWfh = workMode === 'WFH';

  // Filter attendance records for this user
  const userAttendanceRecords = attendance.filter(
    (a) => a.user_id === user.id || a.employee_name?.toLowerCase() === user.name?.toLowerCase()
  );

  // Filter incentives for this user
  const userIncentives = incentives.filter((i) => i.user_id === user.id);
  const totalIncentiveEarned = userIncentives.reduce((sum, item) => sum + (Number(item.amount) || 0), 210);

  // Generate days in current month (August 2026)
  const currentYear = 2026;
  const currentMonth = 7; // 0-indexed for August (7 = August)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(currentYear, currentMonth, d);
    const isPastOrToday = dateObj <= today;
    const isAfterJoining = dateObj >= new Date(joiningDateStr);

    const record = userAttendanceRecords.find((a) => a.date === dayStr);
    const isPresent = Boolean(record && record.status === 'present');
    const isToday = dayStr === today.toISOString().split('T')[0];

    calendarDays.push({
      day: d,
      dateStr: dayStr,
      weekday: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      isPastOrToday,
      isAfterJoining,
      isToday,
      isPresent,
      record
    });
  }

  // Calculate Metrics
  const activeWorkingDays = calendarDays.filter((c) => c.isPastOrToday && c.isAfterJoining).length;
  const totalPresentCount = calendarDays.filter((c) => c.isPresent).length;
  const totalAbsentCount = Math.max(0, activeWorkingDays - totalPresentCount);
  const attendanceRate = activeWorkingDays > 0 ? Math.round((totalPresentCount / activeWorkingDays) * 100) : 100;

  // Monthly base salary calculation
  const baseSalary = Number(user.base_salary) || 15000;
  const perDaySalary = Math.round(baseSalary / daysInMonth);
  const baseSalaryEarned = totalPresentCount * perDaySalary;
  const totalEstimatedPayout = baseSalaryEarned + totalIncentiveEarned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 custom-scrollbar">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-2xl shadow-lg">
              {user.avatar || '👩‍💼'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-white">{user.name}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isWfh 
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                }`}>
                  {isWfh ? '🏠 Work From Home (WFH)' : '🏢 Office On-Site'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.roleLabel || user.role} • 📅 Joining Date: <strong className="text-purple-300">{joiningDateStr}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Salary & Attendance Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Present Days</span>
            <p className="text-lg font-black text-emerald-400 font-mono">{totalPresentCount} / {activeWorkingDays} Days</p>
            <p className="text-[10px] text-slate-400">{attendanceRate}% Attendance Rate</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Base Salary Earned</span>
            <p className="text-lg font-black text-teal-300 font-mono">₹{baseSalaryEarned.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400">₹{perDaySalary}/day base pay</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Incentive Bounty</span>
            <p className="text-lg font-black text-amber-400 font-mono">+₹{totalIncentiveEarned.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400">RTO & Re-Order bonus</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-950 border border-purple-500/40 space-y-1">
            <span className="text-[10px] font-bold text-purple-300 uppercase">Total Estimated Payout</span>
            <p className="text-lg font-black text-white font-mono">₹{totalEstimatedPayout.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-purple-300 font-semibold">1-Tap UPI Ready</p>
          </div>
        </div>

        {/* Calendar Month Header */}
        <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-400" />
            <h4 className="font-black text-sm text-white">August 2026 Attendance Calendar Sheet</h4>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Absent / Missing
            </span>
          </div>
        </div>

        {/* Calendar Grid (Days of Month) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {calendarDays.map((dayItem) => {
            const isUnmarked = dayItem.isPastOrToday && dayItem.isAfterJoining && !dayItem.isPresent;

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
                {/* Top: Day number + Weekday */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">{dayItem.day}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{dayItem.weekday}</span>
                </div>

                {/* Bottom: Status Pill */}
                <div className="mt-1">
                  {dayItem.isPresent ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Present</span>
                      </span>
                      <p className="text-[9px] font-mono text-emerald-300/80">
                        {dayItem.record?.check_in_time || '11:00 AM'}
                      </p>
                    </div>
                  ) : isUnmarked ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-red-400 flex items-center gap-0.5">
                        <XCircle className="w-3 h-3 text-red-400" />
                        <span>Absent</span>
                      </span>
                      <p className="text-[9px] text-red-300/70">Cut ₹{perDaySalary}</p>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-semibold">
                      {dayItem.isAfterJoining ? 'Upcoming' : 'Pre-joining'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            🛡️ <strong>Maya HR Watchdog:</strong> Shift timing 11:00 AM - 05:00 PM. Haaziri punch karne par daily base pay secure hoti hai.
          </span>
          <span className="text-purple-300 font-bold shrink-0">
            UPI: {user.upi_id || `${user.phone}@upi`}
          </span>
        </div>

      </div>
    </div>
  );
}

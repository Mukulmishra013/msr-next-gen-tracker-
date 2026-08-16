// Maya Autonomous AI Supervisor & HR Watchdog Service (Maya Sentinel)
// Shift Hours: 11:00 AM to 5:00 PM | 40-Min Daily Break Wallet (Multiple Small Breaks Supported) | Admin Work Status Control (Active/Off/Leave)

const AUDIT_STORAGE_KEY = 'msr_supervisor_audit_logs';
const WARNINGS_STORAGE_KEY = 'msr_telecaller_active_warnings';
const ACTIVITY_STORAGE_KEY = 'msr_telecaller_last_activity';
const BREAK_STORAGE_KEY = 'msr_telecaller_breaks_v2';
const DUTY_STATUS_KEY = 'msr_staff_duty_status';

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DAILY_BREAK_QUOTA_SECONDS = 40 * 60; // 2400 seconds (40 minutes daily)

class SupervisorAuditService {
  constructor() {
    this.listeners = [];
  }

  getTodayKey() {
    return getTodayDateString();
  }

  // Subscribe to live supervisor alerts
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error('Supervisor listener error:', e);
      }
    });
  }

  // 1. Shift Time Checker (11:00 AM to 5:00 PM IST)
  isWithinShiftHours() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentDecimal = hours + minutes / 60;
    // 11:00 AM (11.0) to 5:00 PM (17.0)
    return currentDecimal >= 11.0 && currentDecimal < 17.0;
  }

  getShiftInfo() {
    const now = new Date();
    const isShift = this.isWithinShiftHours();
    return {
      isWithinShiftHours: isShift,
      shiftStartText: '11:00 AM',
      shiftEndText: '05:00 PM',
      currentDateText: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      currentTimeText: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // 2. Admin Staff Duty Status Control (ACTIVE | PAUSED | LEAVE)
  getAllStaffDutyStatuses() {
    try {
      const saved = localStorage.getItem(DUTY_STATUS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      usr_priya_telecaller: 'ACTIVE',
      usr_rahul_telecaller: 'ACTIVE'
    };
  }

  getStaffDutyStatus(userId) {
    const statuses = this.getAllStaffDutyStatuses();
    return statuses[userId] || 'ACTIVE';
  }

  setStaffDutyStatus(userId, staffName, newStatus, adminName = 'Mukul Mishra') {
    const statuses = this.getAllStaffDutyStatuses();
    statuses[userId] = newStatus;
    try {
      localStorage.setItem(DUTY_STATUS_KEY, JSON.stringify(statuses));
    } catch (e) {}

    let statusText = 'ACTIVE (Shift Chalu)';
    if (newStatus === 'PAUSED') statusText = 'PAUSED (Work Stopped by Admin)';
    if (newStatus === 'LEAVE') statusText = 'ON LEAVE (Chhutti)';

    this.addAuditLog({
      type: 'STAFF_STATUS_CHANGE',
      severity: newStatus === 'ACTIVE' ? 'info' : 'warning',
      staffName,
      userId,
      message: `👑 Admin ${adminName} ne ${staffName} ka work status badalkar "${statusText}" set kiya. Supervisor monitoring ${newStatus === 'ACTIVE' ? 'chalu' : 'band'} hai.`
    });

    // Clear active warnings if marked paused/leave
    if (newStatus !== 'ACTIVE') {
      this.clearUserWarnings(userId);
    }

    this.notify({ type: 'STATUS_UPDATED', userId, newStatus });
  }

  // 3. Daily 40-Minute Break Wallet System (Auto-resets every new day at midnight)
  getBreakData() {
    try {
      const saved = localStorage.getItem(BREAK_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }

  getStaffBreakStatus(userId) {
    const todayStr = getTodayDateString();
    const allBreaks = this.getBreakData();
    let userBreak = allBreaks[userId];

    // Auto-Reset at midnight: If date is different from today, restore full 40 minutes!
    if (!userBreak || userBreak.date !== todayStr) {
      userBreak = {
        date: todayStr,
        isOnBreak: false,
        breakStartTime: null,
        usedSecondsToday: 0
      };
      // Persist the clean daily reset
      allBreaks[userId] = userBreak;
      try {
        localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify(allBreaks));
      } catch (e) {}
    }

    const totalAllowedSec = DAILY_BREAK_QUOTA_SECONDS; // 2400s (40 min)
    let currentSessionElapsedSec = 0;

    if (userBreak.isOnBreak && userBreak.breakStartTime) {
      currentSessionElapsedSec = Math.floor((Date.now() - userBreak.breakStartTime) / 1000);
    }

    const totalUsedSec = (userBreak.usedSecondsToday || 0) + currentSessionElapsedSec;
    const remainingSec = Math.max(0, totalAllowedSec - totalUsedSec);
    const isQuotaExhausted = (userBreak.usedSecondsToday || 0) >= totalAllowedSec;
    const isOverdue = userBreak.isOnBreak && totalUsedSec > totalAllowedSec;

    return {
      date: todayStr,
      isOnBreak: userBreak.isOnBreak,
      breakStartTime: userBreak.breakStartTime,
      usedSecondsToday: totalUsedSec,
      usedMinutesToday: Math.floor(totalUsedSec / 60),
      remainingSec,
      remainingMinutes: Math.floor(remainingSec / 60),
      isQuotaExhausted,
      isOverdue,
      totalAllowedMinutes: 40
    };
  }

  startBreak(userId, staffName) {
    const status = this.getStaffBreakStatus(userId);
    if (status.isQuotaExhausted || status.remainingSec <= 0) {
      return {
        success: false,
        message: '⚠️ Aaj ka 40-minute break quota khatam ho chuka hai! Aur break allowed nahi hai.'
      };
    }

    const todayStr = getTodayDateString();
    const allBreaks = this.getBreakData();
    allBreaks[userId] = {
      date: todayStr,
      isOnBreak: true,
      breakStartTime: Date.now(),
      usedSecondsToday: allBreaks[userId]?.date === todayStr ? (allBreaks[userId].usedSecondsToday || 0) : 0
    };

    try {
      localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify(allBreaks));
    } catch (e) {}

    const remainingMins = Math.floor(status.remainingSec / 60);

    this.addAuditLog({
      type: 'BREAK_STARTED',
      severity: 'info',
      staffName,
      userId,
      message: `☕ ${staffName} ne Break shuru kiya (Remaining Quota: ${remainingMins}m). Maya AI Watchdog break ke dauran paused rahega.`
    });

    this.clearUserWarnings(userId);
    this.notify({ type: 'BREAK_STARTED', userId });
    return { success: true };
  }

  endBreak(userId, staffName) {
    const todayStr = getTodayDateString();
    const allBreaks = this.getBreakData();
    const current = allBreaks[userId];
    let thisSessionSec = 0;

    if (current?.isOnBreak && current?.breakStartTime) {
      thisSessionSec = Math.floor((Date.now() - current.breakStartTime) / 1000);
    }

    const newUsedSec = (current?.usedSecondsToday || 0) + thisSessionSec;

    allBreaks[userId] = {
      date: todayStr,
      isOnBreak: false,
      breakStartTime: null,
      usedSecondsToday: newUsedSec
    };

    try {
      localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify(allBreaks));
    } catch (e) {}

    this.recordActivity(userId, staffName, 'BREAK_ENDED_RESUME_WORK');

    const usedMins = Math.floor(thisSessionSec / 60);
    const totalRemainingMins = Math.max(0, Math.floor((DAILY_BREAK_QUOTA_SECONDS - newUsedSec) / 60));

    this.addAuditLog({
      type: 'BREAK_ENDED',
      severity: 'info',
      staffName,
      userId,
      message: `🟢 ${staffName} ne Break khatam kiya (${usedMins}m use hua • Aaj ka balance: ${totalRemainingMins}m bacha hai). Kaam dobara shuru ho gaya.`
    });

    this.notify({ type: 'BREAK_ENDED', userId });
    return { success: true, remainingMinutes: totalRemainingMins };
  }

  // 4. Record telecaller action to reset idle timer
  recordActivity(userId, userName, actionType = 'calling_action') {
    const timestamp = Date.now();
    const currentActivities = this.getLastActivities();
    currentActivities[userId] = {
      userId,
      userName,
      lastActive: timestamp,
      lastAction: actionType
    };
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(currentActivities));
    } catch (e) {}
  }

  getLastActivities() {
    try {
      const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }

  getAuditLogs() {
    try {
      const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'aud_init_1',
        type: 'SUPERVISOR_ROUTINE',
        severity: 'info',
        staffName: 'Priya Singh',
        role: 'content_calling',
        message: 'Maya AI Supervisor routine audit: Shift hours 11 AM - 5 PM (40m Daily Break Quota active).',
        timestamp: Date.now() - 3600000
      }
    ];
  }

  addAuditLog(logEntry) {
    const logs = this.getAuditLogs();
    const newEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      ...logEntry
    };
    const updated = [newEntry, ...logs.slice(0, 49)];
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    this.notify({ type: 'NEW_AUDIT_LOG', log: newEntry });
    return newEntry;
  }

  getActiveWarnings(userId) {
    try {
      const saved = localStorage.getItem(WARNINGS_STORAGE_KEY);
      if (saved) {
        const allWarnings = JSON.parse(saved);
        return allWarnings.filter((w) => w.userId === userId && !w.dismissed);
      }
    } catch (e) {}
    return [];
  }

  issueWarning(warning) {
    try {
      const saved = localStorage.getItem(WARNINGS_STORAGE_KEY);
      const allWarnings = saved ? JSON.parse(saved) : [];
      const newWarning = {
        id: `warn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        dismissed: false,
        ...warning
      };
      const updated = [newWarning, ...allWarnings.slice(0, 30)];
      localStorage.setItem(WARNINGS_STORAGE_KEY, JSON.stringify(updated));

      this.addAuditLog({
        type: 'WARNING_ISSUED',
        severity: warning.severity || 'warning',
        staffName: warning.userName || 'Telecaller',
        userId: warning.userId,
        message: `🚨 HR Warning Issued: ${warning.title} — ${warning.reason}`,
        actionRequired: warning.actionRequired
      });

      this.notify({ type: 'WARNING_ISSUED', warning: newWarning });
      return newWarning;
    } catch (e) {
      console.error('Error issuing warning:', e);
    }
  }

  dismissWarning(warningId) {
    try {
      const saved = localStorage.getItem(WARNINGS_STORAGE_KEY);
      if (saved) {
        const allWarnings = JSON.parse(saved);
        const updated = allWarnings.map((w) => (w.id === warningId ? { ...w, dismissed: true } : w));
        localStorage.setItem(WARNINGS_STORAGE_KEY, JSON.stringify(updated));
        this.notify({ type: 'WARNING_DISMISSED', warningId });
      }
    } catch (e) {}
  }

  clearUserWarnings(userId) {
    try {
      const saved = localStorage.getItem(WARNINGS_STORAGE_KEY);
      if (saved) {
        const allWarnings = JSON.parse(saved);
        const updated = allWarnings.map((w) => (w.userId === userId ? { ...w, dismissed: true } : w));
        localStorage.setItem(WARNINGS_STORAGE_KEY, JSON.stringify(updated));
        this.notify({ type: 'WARNINGS_CLEARED', userId });
      }
    } catch (e) {}
  }

  // 5. Full Autonomous Watchdog Engine
  runAutonomousAudit({ user, attendance = [], amparoCalls = [], incentives = [] }) {
    if (!user || user.role === 'owner') return null;

    // Rule 1: Check if staff is marked OFF or ON LEAVE by Admin
    const dutyStatus = this.getStaffDutyStatus(user.id);
    if (dutyStatus === 'PAUSED' || dutyStatus === 'LEAVE') {
      return {
        dutyStatus,
        isMonitoringActive: false,
        reason: dutyStatus === 'LEAVE' ? 'Staff on Leave (Chhutti)' : 'Shift Paused by Admin'
      };
    }

    // Rule 2: Check if currently on Break or Quota Exceeded
    const breakStatus = this.getStaffBreakStatus(user.id);
    if (breakStatus.isOnBreak) {
      if (breakStatus.isOverdue) {
        const activeWarnings = this.getActiveWarnings(user.id);
        if (!activeWarnings.some((w) => w.category === 'BREAK_OVERDUE')) {
          this.issueWarning({
            userId: user.id,
            userName: user.name,
            category: 'BREAK_OVERDUE',
            severity: 'high',
            title: `🚨 40-Min Daily Break Limit Exceeded (${breakStatus.usedMinutesToday}m used)`,
            reason: `Aapka aaj ka total 40-minute break quota khatam ho chuka hai (${breakStatus.usedMinutesToday} minute use ho chuke hain). Kripya turant shift resume karein.`,
            actionRequired: 'Break khatam karein aur calling duty start karein.'
          });
        }
      }
      return {
        dutyStatus,
        isOnBreak: true,
        breakStatus,
        isMonitoringActive: false
      };
    }

    // Rule 3: Check Shift Hours (11 AM to 5 PM)
    const inShift = this.isWithinShiftHours();
    if (!inShift) {
      return {
        dutyStatus,
        isWithinShiftHours: false,
        isMonitoringActive: false,
        reason: 'Shift Time Finished / Not Started (11 AM - 5 PM)'
      };
    }

    // Standard Shift Vigilance
    const userActivity = this.getLastActivities()[user.id];
    const now = Date.now();
    const lastActive = userActivity?.lastActive || now - 60000;
    const idleMinutes = Math.floor((now - lastActive) / 60000);

    const userAttendance = attendance.find(
      (a) => a.user_id === user.id || a.employee_name?.toLowerCase() === user.name?.toLowerCase()
    );

    const userIncentives = incentives.filter((i) => i.user_id === user.id);
    const completedTasksCount = userIncentives.length;
    const urgentRtoPending = amparoCalls.filter((c) => c.urgent_rto && c.status !== 'confirmed' && c.status !== 'rto_saved').length;

    const activeWarnings = this.getActiveWarnings(user.id);
    const recentWarningTypes = activeWarnings.map((w) => w.category);

    // Attendance Missing Check
    if ((!userAttendance || userAttendance.status === 'absent') && !recentWarningTypes.includes('ATTENDANCE')) {
      this.issueWarning({
        userId: user.id,
        userName: user.name,
        category: 'ATTENDANCE',
        severity: 'high',
        title: '📍 GPS Haaziri Missing (Attendance Warning)',
        reason: '11:00 AM Shift chalu ho chuki hai par aapne office geofence haaziri punch nahi ki hai.',
        actionRequired: 'GPS Haaziri tab me jakar Check-In punch karein.'
      });
    }

    // Inactivity Check (> 20 mins)
    if (idleMinutes >= 20 && !recentWarningTypes.includes('INACTIVITY')) {
      this.issueWarning({
        userId: user.id,
        userName: user.name,
        category: 'INACTIVITY',
        severity: 'warning',
        title: `⏱️ Inactivity Warning (${idleMinutes}m Idle)`,
        reason: `Aap pichhle ${idleMinutes} minute se inactive hain. Queue me ${urgentRtoPending} Urgent RTO orders pending hain!`,
        actionRequired: 'Customer calling ya WhatsApp task turant shuru karein.'
      });
    }

    return {
      dutyStatus: 'ACTIVE',
      isMonitoringActive: true,
      idleMinutes,
      completedTasksCount,
      urgentRtoPending,
      attendanceStatus: userAttendance?.status || 'unmarked',
      breakStatus
    };
  }
}

export const supervisorAudit = new SupervisorAuditService();

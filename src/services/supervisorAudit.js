// Maya Autonomous AI Supervisor & HR Watchdog Service (Maya Sentinel)
// Shift Hours: 11:00 AM to 5:00 PM | 40-Min Flexible Break System | Admin Work Status Control (Active/Off/Leave)

const AUDIT_STORAGE_KEY = 'msr_supervisor_audit_logs';
const WARNINGS_STORAGE_KEY = 'msr_telecaller_active_warnings';
const ACTIVITY_STORAGE_KEY = 'msr_telecaller_last_activity';
const BREAK_STORAGE_KEY = 'msr_telecaller_breaks';
const DUTY_STATUS_KEY = 'msr_staff_duty_status';

class SupervisorAuditService {
  constructor() {
    this.listeners = [];
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

  // 3. Flexible 40-Minute Break System
  getBreakData() {
    try {
      const saved = localStorage.getItem(BREAK_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }

  getStaffBreakStatus(userId) {
    const allBreaks = this.getBreakData();
    const userBreak = allBreaks[userId] || {
      isOnBreak: false,
      breakStartTime: null,
      totalBreakMinutesToday: 0
    };

    if (userBreak.isOnBreak && userBreak.breakStartTime) {
      const elapsedMs = Date.now() - userBreak.breakStartTime;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const remainingSec = Math.max(0, 40 * 60 - elapsedSec);
      const isOverdue = elapsedSec > 40 * 60;
      return {
        ...userBreak,
        elapsedSec,
        remainingSec,
        isOverdue,
        elapsedMinutes: Math.floor(elapsedSec / 60)
      };
    }

    return {
      ...userBreak,
      elapsedSec: 0,
      remainingSec: 40 * 60,
      isOverdue: false,
      elapsedMinutes: userBreak.totalBreakMinutesToday || 0
    };
  }

  startBreak(userId, staffName) {
    const allBreaks = this.getBreakData();
    allBreaks[userId] = {
      isOnBreak: true,
      breakStartTime: Date.now(),
      totalBreakMinutesToday: allBreaks[userId]?.totalBreakMinutesToday || 0
    };
    try {
      localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify(allBreaks));
    } catch (e) {}

    this.addAuditLog({
      type: 'BREAK_STARTED',
      severity: 'info',
      staffName,
      userId,
      message: `☕ ${staffName} ne 40-minute ka Break shuru kiya. Maya AI Watchdog break ke dauran paused rahega.`
    });

    this.clearUserWarnings(userId);
    this.notify({ type: 'BREAK_STARTED', userId });
  }

  endBreak(userId, staffName) {
    const allBreaks = this.getBreakData();
    const current = allBreaks[userId];
    let addedMinutes = 0;
    if (current?.breakStartTime) {
      const elapsedMs = Date.now() - current.breakStartTime;
      addedMinutes = Math.floor(elapsedMs / 60000);
    }

    allBreaks[userId] = {
      isOnBreak: false,
      breakStartTime: null,
      totalBreakMinutesToday: (current?.totalBreakMinutesToday || 0) + addedMinutes
    };

    try {
      localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify(allBreaks));
    } catch (e) {}

    this.recordActivity(userId, staffName, 'BREAK_ENDED_RESUME_WORK');

    this.addAuditLog({
      type: 'BREAK_ENDED',
      severity: 'info',
      staffName,
      userId,
      message: `🟢 ${staffName} ne Break khatam kiya (${addedMinutes}m use hua). Kaam dobara shuru ho gaya hai.`
    });

    this.notify({ type: 'BREAK_ENDED', userId });
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
        message: 'Maya AI Supervisor routine audit: Shift hours 11 AM - 5 PM active.',
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
      // Supervisor stops checking because worker is inactive or on leave
      return {
        dutyStatus,
        isMonitoringActive: false,
        reason: dutyStatus === 'LEAVE' ? 'Staff on Leave (Chhutti)' : 'Shift Paused by Admin'
      };
    }

    // Rule 2: Check if currently on 40-Min Break
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
            title: `🚨 40-Min Break Overdue (${breakStatus.elapsedMinutes}m elapsed)`,
            reason: `Aapka 40-minute break limit exceed ho chuka hai (${breakStatus.elapsedMinutes} minute ho chuke hain). Kripya shift resume karein.`,
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
      attendanceStatus: userAttendance?.status || 'unmarked'
    };
  }
}

export const supervisorAudit = new SupervisorAuditService();

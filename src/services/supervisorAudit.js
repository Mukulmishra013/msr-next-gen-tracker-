// Maya Autonomous AI Supervisor & HR Watchdog Service (Maya Sentinel)
// Monitors telecaller attendance, idle time, duty tasks, issues real-time warnings & sends notices to Admin.

const AUDIT_STORAGE_KEY = 'msr_supervisor_audit_logs';
const WARNINGS_STORAGE_KEY = 'msr_telecaller_active_warnings';
const ACTIVITY_STORAGE_KEY = 'msr_telecaller_last_activity';

class SupervisorAuditService {
  constructor() {
    this.listeners = [];
    this.auditInterval = null;
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

  // Record telecaller action to reset idle timer
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
        message: 'Maya AI Supervisor routine audit: Staff online & monitored.',
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

  // Get active warnings for a specific telecaller
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

  // Add an HR/Supervisor warning for telecaller
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

      // Also create an audit log for Admin
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

  // Autonomous Audit Engine: Evaluates attendance, idle duration, and duty tasks
  runAutonomousAudit({ user, attendance = [], amparoCalls = [], incentives = [] }) {
    if (!user || user.role === 'owner') return null;

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

    // 1. Attendance Check
    if ((!userAttendance || userAttendance.status === 'absent') && !recentWarningTypes.includes('ATTENDANCE')) {
      this.issueWarning({
        userId: user.id,
        userName: user.name,
        category: 'ATTENDANCE',
        severity: 'high',
        title: '📍 GPS Haaziri Missing (Attendance Warning)',
        reason: 'Aapne aaj office geofence haaziri punch nahi ki hai. Shift start karne ke liye GPS Haaziri lagayein.',
        actionRequired: 'GPS Haaziri tab me jakar Check-In punch karein.'
      });
    }

    // 2. Idle Inactivity Check (If idle > 20 mins)
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

    // 3. Duty Tasks Lagging Check (If 0 tasks completed and idle > 10m)
    if (completedTasksCount === 0 && idleMinutes >= 10 && !recentWarningTypes.includes('DUTY_LAG')) {
      this.issueWarning({
        userId: user.id,
        userName: user.name,
        category: 'DUTY_LAG',
        severity: 'medium',
        title: '📋 Daily 10 Duty Targets Pending',
        reason: 'Aaj ke Top 10 High-Impact tasks me se abhi tak 0 complete huye hain. Maya AI duty targets complete karein.',
        actionRequired: 'Daily Duty tab me jakar assigned calls confirm karein.'
      });
    }

    return {
      idleMinutes,
      completedTasksCount,
      urgentRtoPending,
      attendanceStatus: userAttendance?.status || 'unmarked'
    };
  }
}

export const supervisorAudit = new SupervisorAuditService();

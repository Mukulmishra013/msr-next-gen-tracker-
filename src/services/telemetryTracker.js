// Real-Time Employee Action & Click Telemetry Tracker (Maya Sentinel Eye)
// Tracks button clicks, calling pace, screen interactions, and idle periods

const TELEMETRY_STORAGE_KEY = 'msr_employee_telemetry_v2';
const MAX_TELEMETRY_LOGS = 300;

class TelemetryTracker {
  constructor() {
    this.sessionLogs = [];
    this.listeners = [];
    this.initStorage();
    this.initGlobalClickListener();
  }

  initStorage() {
    try {
      const saved = localStorage.getItem(TELEMETRY_STORAGE_KEY);
      if (saved) {
        this.sessionLogs = JSON.parse(saved);
      }
    } catch (e) {
      this.sessionLogs = [];
    }
  }

  save() {
    try {
      localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(this.sessionLogs.slice(-MAX_TELEMETRY_LOGS)));
    } catch (e) {}
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try { cb(event); } catch (e) {}
    });
  }

  // 🖱️ Global Click Listener to capture user interactions automatically
  initGlobalClickListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('click', (e) => {
      try {
        const target = e.target.closest('button, a, input, [role="button"]');
        if (!target) return;

        const buttonText = (target.innerText || target.getAttribute('aria-label') || target.getAttribute('title') || target.tagName).trim().slice(0, 40);
        const currentUserStr = localStorage.getItem('msr_current_user');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

        if (currentUser && currentUser.id) {
          this.logAction({
            userId: currentUser.id,
            userName: currentUser.name || 'Staff',
            actionType: 'BUTTON_CLICK',
            element: buttonText || 'Action Button',
            path: window.location.pathname || '/'
          });
        }
      } catch (err) {}
    }, true);
  }

  // 📝 Explicit Action Logging (Calls, Re-Attempts, Confirmations, Exams)
  logAction({ userId, userName, actionType, element, details = {} }) {
    if (!userId) return;

    const entry = {
      id: `tel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      userId,
      userName: userName || 'Staff',
      actionType,
      element: element || 'System Action',
      details
    };

    this.sessionLogs.push(entry);
    if (this.sessionLogs.length > MAX_TELEMETRY_LOGS) {
      this.sessionLogs = this.sessionLogs.slice(-MAX_TELEMETRY_LOGS);
    }
    this.save();
    this.notify(entry);
    return entry;
  }

  // 📊 Get Clicks & Actions in Last N Minutes for a specific employee
  getActionsInWindow(userId, minutes = 20) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.sessionLogs.filter((l) => l.userId === userId && l.timestamp >= cutoff);
  }

  // ⏱️ Get Last Active Timestamp & Action
  getLastActiveInfo(userId) {
    const userLogs = this.sessionLogs.filter((l) => l.userId === userId);
    if (userLogs.length === 0) return { lastActive: null, lastAction: 'No recent activity', idleMinutes: 999 };

    const last = userLogs[userLogs.length - 1];
    const idleMs = Date.now() - last.timestamp;
    const idleMinutes = Math.floor(idleMs / (60 * 1000));

    return {
      lastActive: last.timestamp,
      lastAction: `${last.actionType}: ${last.element}`,
      idleMinutes
    };
  }

  // 📈 Compute Live Productivity Score for Maya AI HR (0 - 100%)
  getLiveProductivityStats(userId, minutes = 20) {
    const recentActions = this.getActionsInWindow(userId, minutes);
    const clickCount = recentActions.length;
    const callCount = recentActions.filter((a) => a.actionType.includes('CALL') || a.actionType.includes('ATTEMPT')).length;
    const lastInfo = this.getLastActiveInfo(userId);

    // Productivity Score formula: Click velocity + Calling intensity - Idle penalty
    let score = Math.min(100, (clickCount * 4) + (callCount * 12));
    if (lastInfo.idleMinutes > 15) {
      score = Math.max(10, score - (lastInfo.idleMinutes - 15) * 5);
    }

    let statusLabel = 'ACTIVE_PRODUCTIVE';
    if (lastInfo.idleMinutes > 20) statusLabel = 'IDLE_WARNING';
    else if (score >= 70) statusLabel = 'HIGH_VELOCITY_STAR';
    else if (score >= 40) statusLabel = 'NORMAL_PACING';
    else statusLabel = 'SLOW_PACING';

    return {
      userId,
      clickCountInLast20Min: clickCount,
      callCountInLast20Min: callCount,
      lastActive: lastInfo.lastActive,
      lastAction: lastInfo.lastAction,
      idleMinutes: lastInfo.idleMinutes,
      productivityScore: Math.round(score),
      statusLabel
    };
  }
}

export const telemetryTracker = new TelemetryTracker();

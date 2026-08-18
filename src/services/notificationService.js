// Enterprise Realtime Broadcast, Loud Audio Chime Synthesizer & Service Worker Alerts (100% Voice Speech Disabled - Sound Only)
import { supabase, isSupabaseConfigured } from './supabase';

const OFFLINE_QUEUE_KEY = 'msr_offline_notification_queue_v9';
const NOTIFICATION_HISTORY_KEY = 'msr_notification_history_v9';
const BROADCAST_STORAGE_KEY = 'msr_admin_broadcast_channel_v9';
const LAST_SEEN_BROADCAST_KEY = 'msr_last_seen_broadcast_id_v9';

class NotificationService {
  constructor() {
    this.audioCtx = null;
    this.permissionGranted = false;
    this.listeners = [];
    this.realtimeChannel = null;
    this.pollInterval = null;
    this.swRegistration = null;

    if (typeof window !== 'undefined') {
      this.initUserInteractionAudioUnlock();
      this.initStorageListener();
      this.initCrossDeviceRealtime();
      this.initCloudPolling();
      this.initNetworkListener();
      setTimeout(() => this.initServiceWorker(), 300);
    }
  }

  // 1. Unlock Audio Context on first user tap/click
  initUserInteractionAudioUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  // 2. Initialize Service Worker
  async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('MSR ServiceWorker active:', this.swRegistration.scope);

      if ('Notification' in window && Notification.permission === 'granted') {
        this.permissionGranted = true;
        this.subscribeToPushNotifications(this.swRegistration);
      }
    } catch (e) {
      console.warn('ServiceWorker fallback:', e);
    }
  }

  // 3. Request Push Notification Permission & Subscribe with VAPID Key
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    try {
      const perm = await Notification.requestPermission();
      this.permissionGranted = perm === 'granted';
      if (this.permissionGranted) {
        if (!this.swRegistration && navigator.serviceWorker) {
          this.swRegistration = await navigator.serviceWorker.ready;
        }
        if (this.swRegistration) {
          await this.subscribeToPushNotifications(this.swRegistration);
        }

        this.playSuccessChime();
        await this.sendLocalNotification({
          title: '🔔 Alerts Activated',
          body: 'Admin & Maya AI broadcast alerts ab aapke phone par sound ke sath milenge!'
        });
      }
      return this.permissionGranted;
    } catch (e) {
      return false;
    }
  }

  // 4. Register Device Push Subscription in Cloud Database for closed-app Google FCM delivery
  async subscribeToPushNotifications(reg) {
    if (!reg || !('pushManager' in reg)) return null;

    try {
      const padding = '='.repeat((4 - ('BENbeoBz5MJIMzlqyUeTyOMEuHZLnXlkdMfF8X_kbSmGZvjaWJAd0jDed5_6cGZdkUsKF_vXpM_uTiVDslhVboI'.length % 4)) % 4);
      const base64 = ('BENbeoBz5MJIMzlqyUeTyOMEuHZLnXlkdMfF8X_kbSmGZvjaWJAd0jDed5_6cGZdkUsKF_vXpM_uTiVDslhVboI' + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const applicationServerKey = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        applicationServerKey[i] = rawData.charCodeAt(i);
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      if (sub && isSupabaseConfigured()) {
        const userStr = localStorage.getItem('msr_active_user') || localStorage.getItem('msr_current_user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        if (currentUser && currentUser.id) {
          const { data: userRecord } = await supabase.from('users').select('role_label').eq('id', currentUser.id).single();
          const baseLabel = (userRecord?.role_label || '').replace(/\[PUSH_SUB\].*?\[\/PUSH_SUB\]/gs, '').trim();
          await supabase.from('users').update({
            role_label: `${baseLabel} [PUSH_SUB]${JSON.stringify(sub)}[/PUSH_SUB]`
          }).eq('id', currentUser.id);
        }
      }

      return sub;
    } catch (err) {
      console.warn('Push subscription registration error:', err);
      return null;
    }
  }

  // 5. Web Audio Synthesizer: 100% Reliable, Loud & Instant Alert Sounds
  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch (e) {}
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try { this.audioCtx.resume(); } catch (e) {}
    }
    return this.audioCtx;
  }

  // 🚨 Loud Supervisor Siren (Two-tone attention getter)
  playSupervisorAlertSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.15);
      osc.frequency.setValueAtTime(880, now + 0.30);
      osc.frequency.setValueAtTime(440, now + 0.45);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  // 📢 Loud Attention Broadcast Chime (Four-tone bright chime)
  playBroadcastChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.5, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch (e) {}
  }

  // 💰 Cash Bounty Coin Drop Sound
  playCoinDrop() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  // 🟢 Success Chime
  playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.1);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 🗣️ Voice Speech Completely Disabled (No Talking - Only Sound)
  speakHindiVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  // 5. Cross-Device Realtime Subscriptions (WebSockets + Postgres Changes)
  initCrossDeviceRealtime() {
    if (!isSupabaseConfigured()) return;

    try {
      this.realtimeChannel = supabase.channel('msr_global_broadcast_hub', {
        config: { broadcast: { self: false } }
      });

      this.realtimeChannel
        .on('broadcast', { event: 'ADMIN_BROADCAST' }, (payload) => {
          if (payload && payload.payload) {
            this.handleIncomingBroadcast(payload.payload, 'REALTIME_WEBSOCKET');
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, () => {
          this.checkCloudBroadcasts();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription fallback:', e);
    }
  }

  // 6. Multi-Tab Local Storage Sync
  initStorageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (e) => {
      if (e.key === BROADCAST_STORAGE_KEY && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          this.handleIncomingBroadcast(payload, 'LOCAL_STORAGE_TAB_SYNC');
        } catch (err) {}
      }
    });
  }

  // 7. Cloud Polling & App Resume Listener (Active every 2.5 seconds)
  initCloudPolling() {
    if (typeof window === 'undefined') return;

    window.addEventListener('focus', () => this.checkCloudBroadcasts());
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.checkCloudBroadcasts();
    });
    window.addEventListener('online', () => {
      this.checkCloudBroadcasts();
      this.flushOfflineQueue();
    });

    if (!this.pollInterval) {
      this.pollInterval = setInterval(() => {
        this.checkCloudBroadcasts();
      }, 2500);
    }
  }

  async checkCloudBroadcasts() {
    if (!isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role_label')
        .or('phone.eq.+918887521156,role.eq.owner')
        .limit(1);

      if (!error && data && data.length > 0 && data[0].role_label) {
        const raw = data[0].role_label;
        if (raw.includes('[ADMIN_BROADCAST]')) {
          const match = raw.match(/\[ADMIN_BROADCAST\](.*?)\[\/ADMIN_BROADCAST\]/s);
          if (match && match[1]) {
            const broadcastPayload = JSON.parse(match[1]);
            const lastSeenId = localStorage.getItem(LAST_SEEN_BROADCAST_KEY);

            const isRecent = Date.now() - Number(broadcastPayload.timestamp || 0) < 30 * 60 * 1000;
            if (broadcastPayload.id && broadcastPayload.id !== lastSeenId && isRecent) {
              this.handleIncomingBroadcast(broadcastPayload, 'CLOUD_SYNC');
            }
          }
        }
      }
    } catch (e) {}
  }

  // 8. Deliver Incoming Broadcast with Sound Only (NO Voice, Silent on Admin)
  handleIncomingBroadcast(payload, source = 'UNKNOWN') {
    try {
      const lastSeenId = localStorage.getItem(LAST_SEEN_BROADCAST_KEY);
      if (lastSeenId === payload.id) return;

      const userStr = localStorage.getItem('msr_active_user') || localStorage.getItem('msr_current_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      // 👑 If currently viewing as Owner / Admin, NEVER play sound or open popup on Admin device!
      const isOwner = currentUser && (currentUser.role === 'owner' || currentUser.phone?.includes('8887521156') || currentUser.name?.toLowerCase().includes('mukul'));
      if (isOwner) {
        localStorage.setItem(LAST_SEEN_BROADCAST_KEY, payload.id);
        return;
      }

      // Check audience targeting (ALL or specific employee)
      const isForMe = !payload.targetUserId || payload.targetUserId === 'ALL' || (currentUser && currentUser.id === payload.targetUserId);
      if (!isForMe) return;

      localStorage.setItem(LAST_SEEN_BROADCAST_KEY, payload.id);

      // 🔊 1. Play Loud Attention Chime Sound Only
      this.playBroadcastChime();

      // 📱 2. Show System Notification in phone notification bar
      this.sendLocalNotification({
        title: payload.title || '👑 Mukul Mishra (Admin Directive)',
        body: payload.body
      });

      // 🌟 3. Pop-up Interactive Screen Alert Modal on Screen
      this.recordNotificationHistory(payload);
      this.notifySubscribers({ type: 'INCOMING_BROADCAST', payload });
    } catch (e) {
      console.warn('handleIncomingBroadcast error:', e);
    }
  }

  // 9. Admin Send Live Broadcast (Plays Pleasant Chime Sound on Admin & Sends to Team)
  async sendAdminBroadcast({ title, body, targetUserId = 'ALL', adminName = 'Mukul Mishra' }) {
    const payload = {
      id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title || '👑 Mukul Mishra (Admin Directive)',
      body,
      adminName,
      targetUserId,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(LAST_SEEN_BROADCAST_KEY, payload.id);
    } catch (e) {}

    // A. Push via Realtime WebSockets to all connected laptops & phones
    if (this.realtimeChannel) {
      try {
        await this.realtimeChannel.send({
          type: 'broadcast',
          event: 'ADMIN_BROADCAST',
          payload
        });
      } catch (err) {}
    }

    // B. Save to Supabase Cloud DB
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update({
          role_label: `[ADMIN_BROADCAST]${JSON.stringify(payload)}[/ADMIN_BROADCAST]`
        }).or('phone.eq.+918887521156,role.eq.owner');
      } catch (err) {}
    }

    // C. Trigger Serverless Push Relay to Google FCM (Wakes up closed phones & lock screens)
    try {
      fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          targetUserId: payload.targetUserId,
          url: '/'
        })
      }).catch(() => {});
    } catch (e) {}

    // D. Play pleasant success chime on Admin device (Sound Only - NO Voice)
    this.playSuccessChime();
    this.recordNotificationHistory(payload);
    this.notifySubscribers({ type: 'ADMIN_BROADCAST_SENT', payload });

    return { status: 'TRANSMITTED_WORLDWIDE', payload };
  }

  async sendLocalNotification({ title, body, url = '/' }) {
    if (typeof window === 'undefined') return;

    try {
      let reg = this.swRegistration;
      if (!reg && navigator.serviceWorker) {
        reg = await navigator.serviceWorker.ready;
      }

      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/assets/maya_avatar.jpg',
          badge: '/assets/maya_avatar.jpg',
          image: '/assets/sales_trophy.jpg',
          vibrate: [300, 100, 400, 100, 300],
          requireInteraction: true,
          tag: 'msr-alert-' + Date.now(),
          renotify: true,
          silent: false,
          data: { url }
        });
        return;
      }
    } catch (err) {
      console.warn('ServiceWorker showNotification error:', err);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, {
          body,
          icon: '/assets/maya_avatar.jpg',
          badge: '/assets/maya_avatar.jpg',
          vibrate: [300, 100, 400],
          requireInteraction: true,
          tag: 'msr-alert-' + Date.now()
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch (e) {}
    }
  }

  initNetworkListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.flushOfflineQueue();
    });
  }

  enqueueOfflineNotification(payload) {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = saved ? JSON.parse(saved) : [];
      queue.push(payload);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {}
  }

  flushOfflineQueue() {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!saved) return;

      const queue = JSON.parse(saved);
      if (Array.isArray(queue) && queue.length > 0) {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
        this.playBroadcastChime();
        queue.forEach((notif) => {
          this.notify({
            ...notif,
            title: `📶 [Synced Online] ${notif.title}`
          });
        });
      }
    } catch (e) {}
  }

  recordNotificationHistory(item) {
    try {
      const saved = localStorage.getItem(NOTIFICATION_HISTORY_KEY);
      const history = saved ? JSON.parse(saved) : [];
      const updated = [item, ...history.slice(0, 49)];
      localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {}
  }

  getNotificationHistory() {
    try {
      const saved = localStorage.getItem(NOTIFICATION_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notifySubscribers(event) {
    this.listeners.forEach((cb) => {
      try { cb(event); } catch (e) {}
    });
  }
}

export const notificationService = new NotificationService();

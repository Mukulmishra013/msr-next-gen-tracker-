// Enterprise Web Push Subscription, VAPID Push Dispatcher, Loud Audio & Cross-Device Sync
import { supabase, isSupabaseConfigured } from './supabase';

const OFFLINE_QUEUE_KEY = 'msr_offline_notification_queue_v5';
const NOTIFICATION_HISTORY_KEY = 'msr_notification_history_v5';
const BROADCAST_STORAGE_KEY = 'msr_admin_broadcast_channel_v5';
const LAST_SEEN_BROADCAST_KEY = 'msr_last_seen_broadcast_id_v5';

const VAPID_PUBLIC_KEY = 'BENbeoBz5MJIMzlqyUeTyOMEuHZLnXlkdMfF8X_kbSmGZvjaWJAd0jDed5_6cGZdkUsKF_vXpM_uTiVDslhVboI';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
      setTimeout(() => this.initServiceWorker(), 500);
    }
  }

  // 1. Unlock Audio Context on first interaction on mobile/desktop browsers
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

  // 2. Initialize Service Worker & Auto-Register Push Subscription
  async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('MSR ServiceWorker registered:', this.swRegistration.scope);

      if ('Notification' in window && Notification.permission === 'granted') {
        this.permissionGranted = true;
        this.subscribeToPushNotifications(this.swRegistration);
      }
    } catch (e) {
      console.warn('ServiceWorker registration error:', e);
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
        this.speakHindiVoice('Notification aur voice alerts successfully activate ho gaye hain.');
        this.sendLocalNotification({
          title: '🔔 Alerts Activated',
          body: 'Admin & Maya AI broadcast alerts ab aapke phone par background me bhi aayenge!'
        });
      }
      return this.permissionGranted;
    } catch (e) {
      return false;
    }
  }

  // 4. Subscribe Device to OS-Level Push via Google FCM / Mozilla / Apple
  async subscribeToPushNotifications(reg) {
    if (!reg || !('pushManager' in reg)) return null;

    try {
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      }

      // Save push subscription to Supabase Cloud Database for current user
      if (sub && isSupabaseConfigured()) {
        const userStr = localStorage.getItem('msr_active_user') || localStorage.getItem('msr_current_user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        if (currentUser && currentUser.id) {
          const subJson = JSON.stringify(sub);
          await supabase.from('users').update({
            notes: `[PUSH_SUB]${subJson}[/PUSH_SUB]`
          }).eq('id', currentUser.id);
        }
      }

      return sub;
    } catch (err) {
      console.warn('Push subscription failed:', err);
      return null;
    }
  }

  // 5. Web Audio Synthesizer: Loud & Instant Alert Sounds
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

  // 📢 Loud Admin Broadcast Chime (Four-tone bright chime)
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

  // 🗣️ Hindi Spoken Voice Synthesis Engine
  speakHindiVoice(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const cleanText = String(text || '').replace(/[^\w\s\u0900-\u097F.,!?]/gi, ' ').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('Hindi') || v.name.includes('India'));
      if (hindiVoice) utterance.voice = hindiVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis fallback:', e);
    }
  }

  // 6. Cross-Device Realtime Subscriptions (WebSockets + Postgres Changes)
  initCrossDeviceRealtime() {
    if (!isSupabaseConfigured()) return;

    try {
      this.realtimeChannel = supabase.channel('msr_global_broadcast_hub', {
        config: { broadcast: { self: true } }
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

  // 7. Multi-Tab Local Storage Sync
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

  // 8. Cloud Polling & App Resume Listener (Active every 2.5 seconds)
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

  // 9. Deliver Incoming Broadcast to Employee Device
  handleIncomingBroadcast(payload, source = 'UNKNOWN') {
    try {
      const lastSeenId = localStorage.getItem(LAST_SEEN_BROADCAST_KEY);
      if (lastSeenId === payload.id) return;

      const userStr = localStorage.getItem('msr_active_user') || localStorage.getItem('msr_current_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const isForMe = !payload.targetUserId || payload.targetUserId === 'ALL' || (currentUser && currentUser.id === payload.targetUserId);
      if (!isForMe) return;

      localStorage.setItem(LAST_SEEN_BROADCAST_KEY, payload.id);

      // 🔊 1. Play Loud Attention Chime Siren
      this.playBroadcastChime();

      // 🗣️ 2. Announce Spoken Hindi Voice on Employee Phone
      setTimeout(() => {
        const spokenDirective = payload.voiceText || `Mukul Mishra ji ka sandesh: ${payload.body}`;
        this.speakHindiVoice(spokenDirective);
      }, 500);

      // 📱 3. Show Native System Web Notification (Banner on phone screen)
      this.sendLocalNotification({
        title: payload.title || '👑 Mukul Mishra (Admin Directive)',
        body: payload.body
      });

      // 🌟 4. Pop-up Interactive Screen Alert Modal on Employee Screen
      this.recordNotificationHistory(payload);
      this.notifySubscribers({ type: 'INCOMING_BROADCAST', payload });
    } catch (e) {
      console.warn('handleIncomingBroadcast error:', e);
    }
  }

  // 10. Admin Send Live Broadcast (Pushes worldwide via WebSockets, DB & Serverless OS WebPush)
  async sendAdminBroadcast({ title, body, targetUserId = 'ALL', adminName = 'Mukul Mishra' }) {
    const payload = {
      id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title || '👑 Admin Important Directive',
      body,
      adminName,
      targetUserId,
      timestamp: Date.now(),
      speakVoice: true,
      voiceText: `Mukul Mishra ji ka sandesh: ${body}`
    };

    // Save to Local Storage (Fires Tab Sync)
    try {
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(payload));
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

    // C. Trigger Serverless OS-Level Web Push API (Hits closed phones & lock screens via Google FCM)
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

    // D. Confirmation
    this.playSuccessChime();
    this.recordNotificationHistory(payload);
    this.notifySubscribers({ type: 'ADMIN_BROADCAST_SENT', payload });

    return { status: 'TRANSMITTED_WORLDWIDE', payload };
  }

  sendLocalNotification({ title, body }) {
    if (typeof window === 'undefined') return;

    if (this.swRegistration && this.swRegistration.showNotification) {
      this.swRegistration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [300, 100, 400, 100, 300],
        requireInteraction: true,
        tag: 'msr-admin-alert'
      }).catch(() => {
        new Notification(title, { body, icon: '/favicon.svg', badge: '/favicon.svg' });
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [300, 100, 400]
        });
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

// Enterprise Push Notification, Loud Audio Synthesizer, Hindi Voice & 100% Cross-Device Realtime Sync
import { supabase, isSupabaseConfigured } from './supabase';

const OFFLINE_QUEUE_KEY = 'msr_offline_notification_queue_v4';
const NOTIFICATION_HISTORY_KEY = 'msr_notification_history_v4';
const BROADCAST_STORAGE_KEY = 'msr_admin_broadcast_channel_v4';
const LAST_SEEN_BROADCAST_KEY = 'msr_last_seen_broadcast_id_v4';

const APP_BOOT_TIME = Date.now() - 3000;

class NotificationService {
  constructor() {
    this.audioCtx = null;
    this.permissionGranted = false;
    this.listeners = [];
    this.realtimeChannel = null;
    this.pollInterval = null;
    this.audioUnlocked = false;

    if (typeof window !== 'undefined') {
      this.initUserInteractionAudioUnlock();
      this.initStorageListener();
      this.initCrossDeviceRealtime();
      this.initCloudPolling();
      this.initNetworkListener();
      setTimeout(() => this.initServiceWorker(), 1000);
    }
  }

  // 1. Unlock Audio Context on first interaction on mobile/desktop browsers
  initUserInteractionAudioUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.audioUnlocked = true;
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

  // 2. Initialize Service Worker for PWA Background Push Notifications
  async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('MSR ServiceWorker active:', reg.scope);
    } catch (e) {
      console.warn('ServiceWorker fallback:', e);
    }

    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  // 3. Request Push Notification Permission
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    try {
      const perm = await Notification.requestPermission();
      this.permissionGranted = perm === 'granted';
      if (this.permissionGranted) {
        this.playSuccessChime();
        this.speakHindiVoice('Notification aur voice alerts successfully activate ho gaye hain.');
        this.sendLocalNotification({
          title: '🔔 Alerts Activated',
          body: 'Admin & Maya AI broadcast alerts ab aapke phone par loud sound aur voice ke sath aayenge!'
        });
      }
      return this.permissionGranted;
    } catch (e) {
      return false;
    }
  }

  // 4. Web Audio Synthesizer: Loud & Instant Alert Sounds
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
      window.speechSynthesis.cancel(); // Stop any pending speech
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

  // 5. Cross-Device Realtime Subscriptions (WebSockets + Postgres Changes)
  initCrossDeviceRealtime() {
    if (!isSupabaseConfigured()) return;

    try {
      // Channel 1: Supabase Realtime Broadcast
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
        .subscribe((status) => {
          console.log('Supabase Realtime Hub Status:', status);
        });
    } catch (e) {
      console.warn('Realtime subscription fallback:', e);
    }
  }

  // 6. Multi-Tab Local Storage Sync (For instant tab-to-tab testing)
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

            // If broadcast was created after app boot or in last 30 minutes, and not seen yet
            const isRecent = Date.now() - Number(broadcastPayload.timestamp || 0) < 30 * 60 * 1000;
            if (broadcastPayload.id && broadcastPayload.id !== lastSeenId && isRecent) {
              this.handleIncomingBroadcast(broadcastPayload, 'CLOUD_SYNC');
            }
          }
        }
      }
    } catch (e) {}
  }

  // 8. Deliver Incoming Broadcast to Employee Device
  handleIncomingBroadcast(payload, source = 'UNKNOWN') {
    try {
      const lastSeenId = localStorage.getItem(LAST_SEEN_BROADCAST_KEY);
      if (lastSeenId === payload.id) return; // Prevent duplicate triggers

      const userStr = localStorage.getItem('msr_active_user') || localStorage.getItem('msr_current_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      // Check audience targeting (ALL or specific user)
      const isForMe = !payload.targetUserId || payload.targetUserId === 'ALL' || (currentUser && currentUser.id === payload.targetUserId);
      if (!isForMe) return;

      // Mark as received immediately
      localStorage.setItem(LAST_SEEN_BROADCAST_KEY, payload.id);

      // 🔊 1. Play Loud Attention Chime Siren
      this.playBroadcastChime();

      // 🗣️ 2. Announce Spoken Hindi Voice on Employee Phone
      setTimeout(() => {
        const spokenDirective = payload.voiceText || `Mukul Mishra ji ka message: ${payload.body}`;
        this.speakHindiVoice(spokenDirective);
      }, 500);

      // 📱 3. Show System Web Notification
      this.sendLocalNotification({
        title: payload.title || '👑 Admin Important Directive',
        body: payload.body
      });

      // 🌟 4. Pop-up Interactive Screen Alert Modal on Employee Screen
      this.recordNotificationHistory(payload);
      this.notifySubscribers({ type: 'INCOMING_BROADCAST', payload });
    } catch (e) {
      console.warn('handleIncomingBroadcast error:', e);
    }
  }

  // 9. Admin Send Live Broadcast (Pushes worldwide via WebSockets, DB & Storage)
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

    // Save to Local Storage (Fires Tab Sync on same machine)
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

    // B. Save to Supabase Cloud DB for polling / sleeping devices
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update({
          role_label: `[ADMIN_BROADCAST]${JSON.stringify(payload)}[/ADMIN_BROADCAST]`
        }).or('phone.eq.+918887521156,role.eq.owner');
      } catch (err) {}
    }

    // C. Play confirmation on Admin device
    this.playSuccessChime();
    this.recordNotificationHistory(payload);
    this.notifySubscribers({ type: 'ADMIN_BROADCAST_SENT', payload });

    return { status: 'TRANSMITTED_WORLDWIDE', payload };
  }

  // 10. General Unified Push & Audio Notification
  async notify({
    title,
    body,
    sound = 'alert',
    speakVoice = false,
    voiceText = '',
    priority = 'normal',
    targetUserId = 'ALL'
  }) {
    const payload = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      title,
      body,
      sound,
      speakVoice,
      voiceText: voiceText || body,
      priority,
      targetUserId
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.enqueueOfflineNotification(payload);
      return { status: 'QUEUED_OFFLINE', payload };
    }

    if (sound === 'alert') this.playSupervisorAlertSound();
    else if (sound === 'broadcast') this.playBroadcastChime();
    else if (sound === 'coin') this.playCoinDrop();
    else if (sound === 'success') this.playSuccessChime();

    if (speakVoice) {
      this.speakHindiVoice(voiceText || body);
    }

    this.sendLocalNotification(payload);
    this.recordNotificationHistory(payload);
    this.notifySubscribers({ type: 'NEW_NOTIFICATION', payload });

    return { status: 'DELIVERED', payload };
  }

  sendLocalNotification({ title, body }) {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [200, 100, 200, 100, 300]
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

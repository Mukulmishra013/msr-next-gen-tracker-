// Enterprise Push Notification, Loud Audio Synthesizer, Hindi Voice & Cross-Device Realtime Sync
import { supabase, isSupabaseConfigured } from './supabase';

const OFFLINE_QUEUE_KEY = 'msr_offline_notification_queue_v3';
const NOTIFICATION_HISTORY_KEY = 'msr_notification_history_v3';
const BROADCAST_STORAGE_KEY = 'msr_admin_broadcast_channel_v3';
const LAST_SEEN_BROADCAST_KEY = 'msr_last_seen_broadcast_id';

class NotificationService {
  constructor() {
    this.audioCtx = null;
    this.permissionGranted = false;
    this.listeners = [];
    this.realtimeChannel = null;
    this.pollInterval = null;

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.initServiceWorker();
        this.initNetworkListener();
        this.initCrossDeviceRealtime();
        this.initCloudPolling();
      }, 500);
    }
  }

  // 1. Initialize Service Worker for PWA Background Push Notifications
  async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('MSR ServiceWorker registered:', reg.scope);
    } catch (e) {
      console.warn('ServiceWorker registration fallback:', e);
    }

    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  // 2. Request Push Notification Permission
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    try {
      const perm = await Notification.requestPermission();
      this.permissionGranted = perm === 'granted';
      if (this.permissionGranted) {
        this.playSuccessChime();
        this.speakHindiVoice('Notification aur voice alerts active ho gaye hain.');
        this.sendLocalNotification({
          title: '🔔 Alerts Activated',
          body: 'Admin & Maya AI broadcast alerts ab aapko loud sound aur Hindi voice ke sath milenge!'
        });
      }
      return this.permissionGranted;
    } catch (e) {
      return false;
    }
  }

  // 3. Web Audio Synthesizer: 100% Reliable, Loud & Instant Alert Sounds
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

  // 🚨 Loud Urgent Siren (Two-tone attention getter)
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

      gain.gain.setValueAtTime(0.4, now);
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

        gain.gain.setValueAtTime(0.45, now + i * 0.12);
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
      console.warn('Speech synthesis error:', e);
    }
  }

  // 4. Cross-Device Realtime WebSocket Channel
  initCrossDeviceRealtime() {
    if (!isSupabaseConfigured()) return;

    try {
      this.realtimeChannel = supabase.channel('msr_global_broadcast_hub', {
        config: { broadcast: { self: false } }
      });

      this.realtimeChannel
        .on('broadcast', { event: 'ADMIN_BROADCAST' }, (payload) => {
          if (payload && payload.payload) {
            this.handleIncomingBroadcast(payload.payload);
          }
        })
        .subscribe((status) => {
          console.log('Supabase Realtime Broadcast Status:', status);
        });
    } catch (e) {
      console.warn('Realtime broadcast init fallback:', e);
    }
  }

  // 5. Cloud Database Polling & App-Resume Listener
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
      }, 7000);
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

            if (!lastSeenId) {
              // Mark current cloud broadcast as seen on initial load so it doesn't pop up old alerts on first load
              localStorage.setItem(LAST_SEEN_BROADCAST_KEY, broadcastPayload.id);
              return;
            }

            const isFresh = Date.now() - Number(broadcastPayload.timestamp || 0) < 60 * 60 * 1000;
            if (broadcastPayload.id && broadcastPayload.id !== lastSeenId && isFresh) {
              this.handleIncomingBroadcast(broadcastPayload);
            }
          }
        }
      }
    } catch (e) {}
  }

  // 6. Handle Incoming Broadcast on Employee Device
  handleIncomingBroadcast(payload) {
    try {
      const userStr = localStorage.getItem('msr_active_user') || localStorage.getItem('msr_current_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const isForMe = !payload.targetUserId || payload.targetUserId === 'ALL' || (currentUser && currentUser.id === payload.targetUserId);
      if (!isForMe) return;

      localStorage.setItem(LAST_SEEN_BROADCAST_KEY, payload.id);

      this.playBroadcastChime();

      setTimeout(() => {
        this.speakHindiVoice(payload.voiceText || payload.body);
      }, 450);

      this.sendLocalNotification({
        title: payload.title || '👑 Admin Important Directive',
        body: payload.body
      });

      this.recordNotificationHistory(payload);
      this.notifySubscribers({ type: 'INCOMING_BROADCAST', payload });
    } catch (e) {
      console.warn('handleIncomingBroadcast error:', e);
    }
  }

  // 7. Admin Send Instant Broadcast
  async sendAdminBroadcast({ title, body, targetUserId = 'ALL', adminName = 'Mukul Mishra' }) {
    const payload = {
      id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title || '👑 Admin Important Directive',
      body,
      adminName,
      targetUserId,
      timestamp: Date.now(),
      speakVoice: true,
      voiceText: body
    };

    try {
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(LAST_SEEN_BROADCAST_KEY, payload.id);
    } catch (e) {}

    if (this.realtimeChannel) {
      try {
        await this.realtimeChannel.send({
          type: 'broadcast',
          event: 'ADMIN_BROADCAST',
          payload
        });
      } catch (err) {}
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update({
          role_label: `[ADMIN_BROADCAST]${JSON.stringify(payload)}[/ADMIN_BROADCAST]`
        }).or('phone.eq.+918887521156,role.eq.owner');
      } catch (err) {}
    }

    this.playBroadcastChime();
    setTimeout(() => {
      this.speakHindiVoice(payload.body);
    }, 400);

    this.sendLocalNotification({
      title: payload.title,
      body: payload.body
    });

    this.recordNotificationHistory(payload);
    this.notifySubscribers({ type: 'ADMIN_BROADCAST_SENT', payload });

    return { status: 'TRANSMITTED_WORLDWIDE', payload };
  }

  // 8. General Unified Push & Audio Notification
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

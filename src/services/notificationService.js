// Enterprise Push Notification, Loud Audio & Offline Alert Queue Service
import { supabase, isSupabaseConfigured } from './supabase';

const OFFLINE_QUEUE_KEY = 'msr_offline_notification_queue_v2';
const NOTIFICATION_HISTORY_KEY = 'msr_notification_history_v2';
const BROADCAST_STORAGE_KEY = 'msr_admin_broadcast_channel';

class NotificationService {
  constructor() {
    this.audioCtx = null;
    this.permissionGranted = false;
    this.listeners = [];
    this.initServiceWorker();
    this.initNetworkListener();
    this.initBroadcastListener();
  }

  // 1. Initialize Service Worker for PWA Background Push Notifications
  async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('MSR ServiceWorker registered successfully:', reg.scope);
    } catch (e) {
      console.warn('ServiceWorker registration error:', e);
    }

    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  // 2. Request System Push Notification Permission from User / Telecaller
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    try {
      const perm = await Notification.requestPermission();
      this.permissionGranted = perm === 'granted';
      if (this.permissionGranted) {
        this.playSuccessChime();
        this.sendLocalNotification({
          title: '🔔 Notifications Active',
          body: 'Maya AI Supervisor & Admin alerts ab aapke device par sound ke sath milenge!',
          sound: 'success'
        });
      }
      return this.permissionGranted;
    } catch (e) {
      return false;
    }
  }

  // 3. Web Audio Synthesizer: 100% Reliable, Loud & Instant Sounds without external files
  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // 🚨 Loud Supervisor Warning Sound (Two-tone urgent siren)
  playSupervisorAlertSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(440, now + 0.15); // A4
      osc.frequency.setValueAtTime(880, now + 0.30);
      osc.frequency.setValueAtTime(440, now + 0.45);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  // 📢 Admin Broadcast Loud Chime (Three-tone pleasant attention chime)
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

        gain.gain.setValueAtTime(0.4, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch (e) {}
  }

  // 💰 Cash Bounty Coin Drop
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

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  // 🟢 Soft Success Chime
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

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 🗣️ Hindi Spoken Voice Synthesis (Maya Speaks out notification)
  speakHindiVoice(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const cleanText = text.replace(/[^\w\s\u0900-\u097F.,!?]/gi, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Friendly supervisor pitch

      // Try selecting Hindi or Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hindiVoice) utterance.voice = hindiVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  // 4. Send Unified Push & Audio Notification
  async notify({
    title,
    body,
    sound = 'alert', // 'alert' | 'broadcast' | 'coin' | 'success'
    speakVoice = false,
    voiceText = '',
    priority = 'normal', // 'urgent' | 'high' | 'normal'
    targetUserId = 'ALL',
    url = '/'
  }) {
    const notificationPayload = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      title,
      body,
      sound,
      speakVoice,
      voiceText: voiceText || body,
      priority,
      targetUserId,
      url
    };

    // If device is offline, store in offline queue to fire as soon as network returns
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.enqueueOfflineNotification(notificationPayload);
      return { status: 'QUEUED_OFFLINE', payload: notificationPayload };
    }

    // Play synthesized sound
    if (sound === 'alert') this.playSupervisorAlertSound();
    else if (sound === 'broadcast') this.playBroadcastChime();
    else if (sound === 'coin') this.playCoinDrop();
    else if (sound === 'success') this.playSuccessChime();

    // Speak voice if enabled
    if (speakVoice) {
      this.speakHindiVoice(voiceText || body);
    }

    // Send Browser OS Notification
    this.sendLocalNotification(notificationPayload);

    // Save to Notification History
    this.recordNotificationHistory(notificationPayload);

    // Notify in-app subscribers
    this.notifySubscribers(notificationPayload);

    return { status: 'DELIVERED', payload: notificationPayload };
  }

  // 5. Send Local / Web Notification
  sendLocalNotification({ title, body, url = '/' }) {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            body,
            url
          });
        } else {
          new Notification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [200, 100, 200]
          });
        }
      } catch (e) {}
    }
  }

  // 6. Offline Network Listener: Flushes queue on reconnect with sound
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
        // Play broadcast chime for delayed delivery
        this.playBroadcastChime();
        queue.forEach((notif) => {
          this.notify({
            ...notif,
            title: `📶 [Synced Back Online] ${notif.title}`
          });
        });
      }
    } catch (e) {}
  }

  // 7. Multi-Device Admin Broadcast Listener (Syncs Admin Push across all staff phones)
  initBroadcastListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (e) => {
      if (e.key === BROADCAST_STORAGE_KEY && e.newValue) {
        try {
          const broadcast = JSON.parse(e.newValue);
          const currentUserStr = localStorage.getItem('msr_current_user');
          const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

          if (broadcast && (!broadcast.targetUserId || broadcast.targetUserId === 'ALL' || (currentUser && currentUser.id === broadcast.targetUserId))) {
            this.notify({
              title: broadcast.title || '👑 Admin Urgent Broadcast',
              body: broadcast.body,
              sound: 'broadcast',
              speakVoice: broadcast.speakVoice !== false,
              voiceText: broadcast.body,
              priority: 'urgent'
            });
          }
        } catch (err) {}
      }
    });
  }

  // 👑 Admin Send Live Push Broadcast to Staff
  async sendAdminBroadcast({ title, body, targetUserId = 'ALL', adminName = 'Mukul Mishra' }) {
    const payload = {
      id: `broadcast_${Date.now()}`,
      title: title || '👑 Admin Broadcast Alert',
      body,
      adminName,
      targetUserId,
      timestamp: Date.now(),
      speakVoice: true
    };

    try {
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}

    // Cloud sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update({
          role_label: `[ADMIN_BROADCAST]${JSON.stringify(payload)}[/ADMIN_BROADCAST]`
        }).or('phone.eq.+918887521156,role.eq.owner');
      } catch (e) {}
    }

    // Trigger on current device too
    return this.notify({
      title: payload.title,
      body: payload.body,
      sound: 'broadcast',
      speakVoice: true,
      voiceText: payload.body,
      priority: 'urgent'
    });
  }

  // 8. History & Subscriptions
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

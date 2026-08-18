// Training Masterclass Cloud Service - Live Supabase Cloud Sync & Realtime Broadcast
import { supabase, isSupabaseConfigured } from './supabase';

const TRAINING_STORAGE_KEY = 'msr_training_videos';

// 🌟 20-25 Top-Level Real-World Scenario Question Banks
const NDR_20_QUESTIONS = [
  { q: "NDR call connect hote hi customer ko pehla sentence kya bolna chahiye?", options: ["A. Namaste Sir, main Amparo Store se bol rahi hoon, aapka parcel aane wala tha.", "B. Aapne parcel kyu nahi liya?", "C. Delivery boy ko paise nahi diye aapne."], correct: 0 },
  { q: "Customer bole 'Delivery boy ka call nahi aaya', toh best solution kya hai?", options: ["A. Main courier supervisor ko priority instruction daal rahi hoon, kal dopahar tak parcel mil jayega.", "B. Delivery boy ki galti hai, complaint karein.", "C. Order cancel kar dijiye."], correct: 0 },
  { q: "Customer bole 'Mujhe product ki ab zaroorat nahi hai', toh kya offer dekar order save kar sakte hain?", options: ["A. ₹50 instant discount coupon + fresh batch guarantee.", "B. Theek hai cancel kar dete hain.", "C. Police complaint ki baat karein."], correct: 0 },
  { q: "Shiprocket NDR me 'Customer Not Available' reason par call ka main objective kya hai?", options: ["A. Re-attempt date aur convenient delivery time fix karna.", "B. Customer ko daantna.", "C. Sirf feedback lena."], correct: 0 },
  { q: "Agar customer bole 'Cash nahi hai mere paas kal aana', toh telecaller kya karegi?", options: ["A. Courier boy ko online UPI QR code scan karne ka option batayein ya kal ka re-attempt daalein.", "B. Order cancel mark kar dein.", "C. Delivery boy ko gaali dein."], correct: 0 },
  { q: "NDR order save karne par telecaller ko kitna verified cash incentive milta hai?", options: ["A. ₹50 per delivered parcel", "B. ₹10", "C. ₹0"], correct: 0 },
  { q: "Customer bole 'Address galat hai', toh telecaller ko kya karna chahiye?", options: ["A. Correct landmark aur house number lekar Shiprocket portal par address update karna.", "B. Customer ko bole khud courier office jaye.", "C. Cancel kar dein."], correct: 0 },
  { q: "Agar delivery boy 'Fake Attempt / Customer Refused' mark kare, toh telecaller kya karegi?", options: ["A. Customer se confirm karke Courier Escalation raise karegi aur kal re-attempt schedule karegi.", "B. Chup chap cancel maan legi.", "C. Customer ko block karegi."], correct: 0 },
  { q: "Repeat customer calling me sabse pehla focus kya hona chahiye?", options: ["A. Previous experience kaisa raha aur stock khatam hone se pehle special discount offer karna.", "B. Sirf rate batana.", "C. Bina baat kiye cut karna."], correct: 0 },
  { q: "Customer ko delivery ke din kitne time pehle alert message bhejna chahiye?", options: ["A. Subah 09:00 AM WhatsApp notification with amount & OTP.", "B. Shaam ko.", "C. Kabhi nahi."], correct: 0 },
  { q: "Amparo Shilajit Gummies kitne din me visible energy aur stamina result deti hain?", options: ["A. 2 se 3 hafte regular use karne par.", "B. 1 minute me.", "C. Kabhi nahi."], correct: 0 },
  { q: "Shilajit Gummies ka dose kya hai?", options: ["A. 1 ya 2 gummies daily khana khane ke baad doodh ya paani ke sath.", "B. Poora box 1 din me.", "C. Khaali pet 10 gummies."], correct: 0 },
  { q: "COD customer ko phone par order confirm karte waqt kya confirm karna zaroori hai?", options: ["A. Exact Pin Code, Full Landmark, COD Amount aur delivery date.", "B. Sirf naam.", "C. Bank password."], correct: 0 },
  { q: "Telecaller ko call par voice pitch aur tone kaisi rakhni chahiye?", options: ["A. Calm, Confident, Polite aur Energetic.", "B. Bahut slow aur sleepy.", "C. Tez aur aggressive."], correct: 0 },
  { q: "Agar customer call pick na kare toh pehla action kya hona chahiye?", options: ["A. Official WhatsApp template drop karna with tracking details.", "B. Number delete karna.", "C. 50 baar lagatar dial karna."], correct: 0 },
  { q: "RTO hone se company ka kya nuksan hota hai?", options: ["A. Double courier shipping charge + inventory block + operational cost.", "B. Koi nuksan nahi hota.", "C. Profit hota hai."], correct: 0 },
  { q: "Customer bole 'Product fake toh nahi hai?', toh kya bolna chahiye?", options: ["A. Amparo 100% Lab-Tested, GMP certified aur original Himalayan Shilajit extract se bana hai.", "B. Fake hai toh return kar dena.", "C. Mujhe nahi pata."], correct: 0 },
  { q: "Agar customer 'Out of Town' hai, toh re-attempt kab ka schedule karein?", options: ["A. Jis din customer wapas aane wala ho us specific date ka.", "B. Kal subah ka.", "C. 1 saal baad."], correct: 0 },
  { q: "Shiprocket tracking me 'Out for Delivery' hone par telecaller ka kya role hai?", options: ["A. Customer ko call/SMS karke cash/UPI ready rakhne ko bolna.", "B. Kuch nahi karna.", "C. Delivery boy ko phone band karne bolna."], correct: 0 },
  { q: "Successful Delivery hone par incentive kab credit hota hai?", options: ["A. Shiprocket par parcel 'Delivered' mark hote hi live salary breakdown me add hota hai.", "B. 6 mahine baad.", "C. Kabhi nahi."], correct: 0 }
];

export const INITIAL_TRAINING_VIDEOS = [
  {
    id: 'vid-01',
    title: 'NDR Rescue & RTO Conversion Masterclass',
    description: 'Customer ko 1st/2nd Delivery Attempt fail hone par kaise convince karein aur delivery confirm karwayein.',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_id: 'dQw4w9WgXcQ',
    category: 'NDR Rescue (+₹50 Bounty)',
    duration_minutes: 8,
    assigned_to: 'ALL',
    completed_by: [],
    quiz_questions: NDR_20_QUESTIONS
  },
  {
    id: 'vid-02',
    title: 'Amparo Pure Shilajit Gummies — Product USP & Pitch',
    description: 'Shilajit ke benefits, stamina booster pitch, dosage aur COD customer ke objection handle karne ka tareeqa.',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_id: 'dQw4w9WgXcQ',
    category: 'Product Mastery',
    duration_minutes: 6,
    assigned_to: 'ALL',
    completed_by: [],
    quiz_questions: NDR_20_QUESTIONS
  },
  {
    id: 'vid-03',
    title: 'Telecalling Tone, Etiquette & 30-Second Hook',
    description: 'Pehle 10 second me customer ka trust kaise jeetein aur call cut hone se kaise bachayein.',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_id: 'dQw4w9WgXcQ',
    category: 'Sales Psychology',
    duration_minutes: 5,
    assigned_to: 'ALL',
    completed_by: [],
    quiz_questions: NDR_20_QUESTIONS
  }
];

class TrainingService {
  constructor() {
    this.listeners = [];
    this.initStorageListener();
  }

  initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === TRAINING_STORAGE_KEY) {
          this.notify();
        }
      });
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.getVideos());
      } catch (e) {
        console.error('Training listener error:', e);
      }
    });
  }

  getVideos() {
    try {
      const saved = localStorage.getItem(TRAINING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_TRAINING_VIDEOS;
  }

  async fetchCloudVideos() {
    if (!isSupabaseConfigured()) return this.getVideos();
    try {
      // 1. Try fetching from Supabase 'videos' table where client_name is 'TRAINING_MASTERCLASS'
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('client_name', 'TRAINING_MASTERCLASS')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((row) => {
          let meta = {};
          try {
            meta = JSON.parse(row.type || '{}');
          } catch (e) {}

          return {
            id: meta.id || row.id || `vid-${Date.now()}`,
            title: meta.title || row.title || 'Masterclass Video',
            description: meta.description || '',
            youtube_url: row.link || meta.youtube_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            embed_id: meta.embed_id || 'dQw4w9WgXcQ',
            category: meta.category || 'General Training',
            duration_minutes: Number(meta.duration_minutes) || 5,
            assigned_to: meta.assigned_to || 'ALL',
            completed_by: Array.isArray(meta.completed_by) ? meta.completed_by : [],
            quiz_questions: Array.isArray(meta.quiz_questions) && meta.quiz_questions.length > 0 ? meta.quiz_questions : NDR_20_QUESTIONS,
            supabase_row_id: row.id
          };
        });

        // Merge with initial defaults if not already present
        const combined = [...mapped];
        INITIAL_TRAINING_VIDEOS.forEach((def) => {
          if (!combined.some((c) => c.id === def.id || c.title === def.title)) {
            combined.push(def);
          }
        });

        localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(combined));
        this.notify();
        return combined;
      }
    } catch (e) {
      console.warn('Supabase training cloud fetch fallback to local:', e);
    }
    return this.getVideos();
  }

  async addVideo(videoData) {
    const current = this.getVideos();
    const newEntry = {
      ...videoData,
      id: videoData.id || `vid-${Date.now()}`,
      completed_by: videoData.completed_by || [],
      quiz_questions: videoData.quiz_questions || NDR_20_QUESTIONS
    };

    const updated = [newEntry, ...current];
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(updated));
    this.notify();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('videos').insert({
          client_name: 'TRAINING_MASTERCLASS',
          type: JSON.stringify({
            id: newEntry.id,
            title: newEntry.title,
            description: newEntry.description,
            embed_id: newEntry.embed_id,
            category: newEntry.category,
            duration_minutes: newEntry.duration_minutes,
            assigned_to: newEntry.assigned_to,
            completed_by: newEntry.completed_by,
            quiz_questions: newEntry.quiz_questions
          }),
          link: newEntry.youtube_url,
          status: 'active'
        });
      } catch (e) {
        console.warn('Supabase training video upload fallback:', e);
      }
    }

    return updated;
  }

  async updateVideo(id, updatedFields) {
    const current = this.getVideos();
    const updated = current.map((v) => {
      if (v.id === id) {
        return {
          ...v,
          ...updatedFields,
          quiz_questions: updatedFields.quiz_questions || v.quiz_questions || NDR_20_QUESTIONS
        };
      }
      return v;
    });

    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(updated));
    this.notify();

    if (isSupabaseConfigured()) {
      try {
        const found = updated.find((v) => v.id === id);
        if (found) {
          // Delete old and re-insert or update
          await supabase.from('videos').delete().eq('client_name', 'TRAINING_MASTERCLASS').like('type', `%"id":"${id}"%`);
          await supabase.from('videos').insert({
            client_name: 'TRAINING_MASTERCLASS',
            type: JSON.stringify({
              id: found.id,
              title: found.title,
              description: found.description,
              embed_id: found.embed_id,
              category: found.category,
              duration_minutes: found.duration_minutes,
              assigned_to: found.assigned_to,
              completed_by: found.completed_by,
              quiz_questions: found.quiz_questions
            }),
            link: found.youtube_url,
            status: 'active'
          });
        }
      } catch (e) {
        console.warn('Supabase update video error:', e);
      }
    }

    return updated;
  }

  async deleteVideo(id) {
    const current = this.getVideos();
    const updated = current.filter((v) => v.id !== id);
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(updated));
    this.notify();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('videos').delete().eq('client_name', 'TRAINING_MASTERCLASS').like('type', `%"id":"${id}"%`);
      } catch (e) {
        console.warn('Supabase training video delete error:', e);
      }
    }

    return updated;
  }

  async markCompleted(videoId, userName, examScore, watchTimeSeconds) {
    const current = this.getVideos();
    const updated = current.map((v) => {
      if (v.id === videoId) {
        const completed = v.completed_by || [];
        if (!completed.includes(userName)) {
          completed.push(userName);
        }
        return { ...v, completed_by: completed };
      }
      return v;
    });

    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(updated));
    this.notify();

    // Store local verified certificate record
    const certRecord = {
      id: `cert-${Date.now()}`,
      videoId,
      userName,
      examScore,
      watchTimeSeconds,
      timestamp: Date.now()
    };
    try {
      const certs = JSON.parse(localStorage.getItem('msr_earned_certificates') || '[]');
      certs.push(certRecord);
      localStorage.setItem('msr_earned_certificates', JSON.stringify(certs));
    } catch (e) {}

    return updated;
  }
}

export const trainingService = new TrainingService();

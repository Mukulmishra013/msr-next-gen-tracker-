// Training Masterclass Cloud Service - Live Supabase Sync & Realtime Broadcast
import { supabase, isSupabaseConfigured } from './supabase';

const TRAINING_STORAGE_KEY = 'msr_training_videos';

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
    completed_by: ['Priya Singh'],
    quiz_questions: [
      {
        q: 'Jab customer bole "Delivery boy ka call nahi aaya", toh best response kya hai?',
        options: [
          'A. Maine courier supervisor ko priority instruction daal di hai, kal 12 baje parcel deliver ho jayega.',
          'B. Delivery boy ki galti hai, aap courier office jaakar parcel le lijiye.',
          'C. Theek hai order cancel kar dete hain.'
        ],
        correct: 0
      }
    ]
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
    quiz_questions: [
      {
        q: 'Amparo Shilajit Gummies ka sabse bada USP customer ko kya batana hai?',
        options: [
          'A. 100% Shuddh Himalayan Shilajit, Tasty Gummy Format me bina kisi kadwe swad ke.',
          'B. Normal toffee jaisa hai kabhi bhi khao.',
          'C. Isme koi shilajit nahi hai.'
        ],
        correct: 0
      }
    ]
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
    quiz_questions: [
      {
        q: 'Call start karte hi telecaller ki tone kaisi honi chahiye?',
        options: [
          'A. Confident, Energetic, Respectful aur Hindi/Hinglish me natural.',
          'B. Bahut tez chillakar bolna.',
          'C. Robot ki tarah jaldi-jaldi script padhna.'
        ],
        correct: 0
      }
    ]
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
      const { data, error } = await supabase.from('training_videos').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description || '',
          youtube_url: d.youtube_url,
          embed_id: d.embed_id,
          category: d.category || 'General Training',
          duration_minutes: Number(d.duration_minutes) || 5,
          assigned_to: d.assigned_to || 'ALL',
          completed_by: Array.isArray(d.completed_by) ? d.completed_by : [],
          quiz_questions: Array.isArray(d.quiz_questions) ? d.quiz_questions : []
        }));
        
        // Merge with initial defaults if needed
        localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(mapped));
        this.notify();
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase training fetch fallback to local:', e);
    }
    return this.getVideos();
  }

  async addVideo(videoData) {
    const current = this.getVideos();
    const newEntry = {
      ...videoData,
      id: videoData.id || `vid-${Date.now()}`,
      completed_by: videoData.completed_by || []
    };

    const updated = [newEntry, ...current];
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(updated));
    this.notify();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('training_videos').upsert({
          id: newEntry.id,
          title: newEntry.title,
          description: newEntry.description,
          youtube_url: newEntry.youtube_url,
          embed_id: newEntry.embed_id,
          category: newEntry.category,
          duration_minutes: newEntry.duration_minutes,
          assigned_to: newEntry.assigned_to,
          completed_by: newEntry.completed_by,
          quiz_questions: newEntry.quiz_questions || []
        });
      } catch (e) {
        console.warn('Supabase training video upload fallback:', e);
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
        await supabase.from('training_videos').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase training video delete error:', e);
      }
    }

    return updated;
  }

  async markCompleted(videoId, userName) {
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

    if (isSupabaseConfigured()) {
      try {
        const matched = updated.find((v) => v.id === videoId);
        if (matched) {
          await supabase.from('training_videos').update({
            completed_by: matched.completed_by
          }).eq('id', videoId);
        }
      } catch (e) {
        console.warn('Supabase training complete error:', e);
      }
    }

    return updated;
  }
}

export const trainingService = new TrainingService();

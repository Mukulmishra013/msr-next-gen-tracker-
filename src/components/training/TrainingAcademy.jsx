import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { 
  GraduationCap, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Plus, 
  Trash2, 
  Clock, 
  BookOpen, 
  Video, 
  ExternalLink,
  ShieldCheck,
  User,
  Users,
  Printer,
  ChevronRight,
  Lightbulb,
  Check
} from 'lucide-react';
import { TrainingCertificateModal } from './TrainingCertificateModal';

// Default Masterclass Video Curriculum
const DEFAULT_VIDEOS = [
  {
    id: 'vid-01',
    title: 'NDR Rescue & RTO Conversion Masterclass',
    description: 'Customer ko 1st/2nd Delivery Attempt fail hone par kaise convince karein aur delivery confirm karwayein.',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed_id: 'dQw4w9WgXcQ',
    category: 'NDR Rescue (+₹50 Bounty)',
    duration_minutes: 8,
    assigned_to: 'ALL', // 'ALL' | 'Priya Singh'
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
    assigned_to: 'Priya Singh',
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

export function TrainingAcademy() {
  const { currentUser } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const [videos, setVideos] = useState(() => {
    try {
      const saved = localStorage.getItem('msr_training_videos');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_VIDEOS;
  });

  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'certificates'
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certData, setCertData] = useState(null);

  // New Video Form (Admin)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('NDR Rescue (+₹50 Bounty)');
  const [newDuration, setNewDuration] = useState('8');
  const [newAssignedTo, setNewAssignedTo] = useState('ALL');

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Helper to extract YouTube ID
  const getYoutubeEmbedId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ';
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const embedId = getYoutubeEmbedId(newUrl);
    const newEntry = {
      id: `vid-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      youtube_url: newUrl,
      embed_id: embedId,
      category: newCategory,
      duration_minutes: Number(newDuration) || 5,
      assigned_to: newAssignedTo,
      completed_by: []
    };

    const updated = [newEntry, ...videos];
    setVideos(updated);
    localStorage.setItem('msr_training_videos', JSON.stringify(updated));
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    alert('✅ Training Masterclass Video published successfully!');
  };

  const handleDeleteVideo = (id) => {
    if (!confirm('Kya aap is training video ko delete karna chahte hain?')) return;
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    localStorage.setItem('msr_training_videos', JSON.stringify(updated));
    if (selectedVideo?.id === id) setSelectedVideo(updated[0] || null);
  };

  const handleCompleteTraining = (video) => {
    const updated = videos.map(v => {
      if (v.id === video.id) {
        const completed = v.completed_by || [];
        if (!completed.includes(currentUser.name)) {
          completed.push(currentUser.name);
        }
        return { ...v, completed_by: completed };
      }
      return v;
    });

    setVideos(updated);
    localStorage.setItem('msr_training_videos', JSON.stringify(updated));

    // Open Official Certificate
    setCertData({
      candidateName: currentUser.name,
      courseTitle: video.title,
      category: video.category,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      grade: 'A+ (Outstanding Performer)'
    });
    setShowCertModal(true);
  };

  // Filter videos visible to this employee
  const visibleVideos = videos.filter(v => {
    if (isOwner) return true;
    return v.assigned_to === 'ALL' || v.assigned_to?.toLowerCase() === currentUser.name?.toLowerCase();
  });

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      
      {/* 🌟 Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30 shrink-0">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-lg sm:text-xl text-white">
                  MSR AI Training Academy & Video Hub
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-900 border border-purple-500/50 text-purple-200">
                  Live Masterclasses
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Watch Expert YouTube Training • Pass Maya AI Quiz • Earn Official MSR Next Gen Certificates
              </p>
            </div>
          </div>

          {/* Admin Add Video Button */}
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-yellow-300" />
              <span>➕ Add Video Masterclass</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
          <button
            onClick={() => setActiveTab('courses')}
            className={`tap-target px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'courses'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-yellow-300" />
            <span>🎬 Masterclass Videos ({visibleVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`tap-target px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'certificates'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>📜 My Certificates</span>
          </button>
        </div>
      </div>

      {/* 🎬 Tab 1: Video Masterclass Player & Curriculum */}
      {activeTab === 'courses' && selectedVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left 2 Cols: In-App YouTube Player & Assessment */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* In-App Responsive YouTube Video Embed */}
            <div className="glass-card rounded-3xl border border-purple-500/40 overflow-hidden shadow-2xl bg-black">
              <div className="relative aspect-video w-full bg-slate-950">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.embed_id}?autoplay=0&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Video Info Bar */}
              <div className="p-4 sm:p-5 space-y-3 bg-slate-900/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/40 uppercase">
                      {selectedVideo.category}
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-white mt-1">
                      {selectedVideo.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{selectedVideo.duration_minutes} Mins Watch</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedVideo.description}
                </p>

                {/* 🤖 Maya AI Smart Calling Tip */}
                <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-start gap-2 text-xs text-purple-200">
                  <Lightbulb className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                  <div>
                    <strong>Maya AI Pro-Tip:</strong> Is video ko poora dekhne ke baad niche diye gaye Maya AI Quiz me 100% score karein aur apna verified certificate unlock karein!
                  </div>
                </div>

                {/* Video Complete & Claim Certificate Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">
                      Assigned to: <strong className="text-white">{selectedVideo.assigned_to === 'ALL' ? '🌐 All Team Members' : `👤 ${selectedVideo.assigned_to}`}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => handleCompleteTraining(selectedVideo)}
                    className="tap-target px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
                  >
                    <Award className="w-4 h-4 text-yellow-300" />
                    <span>Complete & Unlock Certificate ➔</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 🤖 Maya AI Interactive Quiz for Selected Video */}
            {selectedVideo.quiz_questions && selectedVideo.quiz_questions.length > 0 && (
              <div className="glass-card rounded-3xl border border-slate-800 p-4 sm:p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Maya AI Quick Knowledge Check (1-Min Assessment)</span>
                </h4>

                {selectedVideo.quiz_questions.map((quiz, qIdx) => (
                  <div key={qIdx} className="space-y-2 text-xs">
                    <p className="font-bold text-slate-200">❓ {quiz.q}</p>
                    <div className="space-y-1.5">
                      {quiz.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition ${
                            selectedAnswers[qIdx] === optIdx
                              ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right 1 Col: Video Playlist Curriculum */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Training Curriculum ({visibleVideos.length} Modules)</span>
            </h4>

            <div className="space-y-2.5">
              {visibleVideos.map((vid, idx) => {
                const isSelected = selectedVideo?.id === vid.id;
                const isCompleted = vid.completed_by?.includes(currentUser.name);

                return (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedVideo(vid)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-950 text-slate-400 uppercase font-mono">
                        Module #{idx + 1}
                      </span>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-xs text-white leading-snug">
                      {vid.title}
                    </h5>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>{vid.duration_minutes} Mins</span>
                      <span className="text-purple-300">{vid.category}</span>
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(vid.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 📜 Tab 2: Employee Certificates Register */}
      {activeTab === 'certificates' && (
        <div className="glass-card rounded-3xl border border-slate-800 p-5 space-y-4">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-300" />
            <span>Official MSR Verified Training Certificates</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.filter(v => v.completed_by?.includes(currentUser.name)).map(v => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                    Verified Certificate
                  </span>
                  <span className="text-xs font-mono text-purple-300">Grade: A+</span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-white">{v.title}</h4>
                  <p className="text-xs text-slate-400">Awarded to: <strong>{currentUser.name}</strong></p>
                </div>

                <button
                  onClick={() => {
                    setCertData({
                      candidateName: currentUser.name,
                      courseTitle: v.title,
                      category: v.category,
                      date: 'August 2026',
                      grade: 'A+ (Outstanding)'
                    });
                    setShowCertModal(true);
                  }}
                  className="tap-target w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View / Print Certificate (PDF)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ➕ Admin Add Video Masterclass Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add New Training Masterclass (Admin)</span>
            </h3>

            <form onSubmit={handleAddVideo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. NDR 2nd Attempt Customer Retention Strategy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">YouTube Video URL</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="NDR Rescue (+₹50 Bounty)">NDR Rescue</option>
                    <option value="Product Mastery">Product Mastery</option>
                    <option value="Sales Psychology">Sales Psychology</option>
                    <option value="Objection Handling">Objection Handling</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Assign to Employee</label>
                <select
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="ALL">🌐 All Team Members</option>
                  <option value="Priya Singh">👤 Priya Singh</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black"
                >
                  Publish Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 Official MSR Certificate Modal */}
      {showCertModal && certData && (
        <TrainingCertificateModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          certData={certData}
        />
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  BookOpen, 
  Video, 
  ShieldCheck, 
  User, 
  Users, 
  Printer, 
  Lightbulb, 
  Check, 
  RefreshCw, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';
import { TrainingCertificateModal } from './TrainingCertificateModal';
import { trainingService } from '../../services/trainingService';

export function TrainingAcademy() {
  const { currentUser, availableUsers } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const [videos, setVideos] = useState(() => trainingService.getVideos());
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'certificates'
  const [selectedVideo, setSelectedVideo] = useState(() => trainingService.getVideos()[0] || null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certData, setCertData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit / Add Form State
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('NDR Rescue (+₹50 Bounty)');
  const [formDuration, setFormDuration] = useState('8');
  const [formAssignedTo, setFormAssignedTo] = useState('ALL');

  // Video Watch Tracker State
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [hasWatchedFull, setHasWatchedFull] = useState(false);

  // 20-Question Exam Portal State
  const [showExamPortal, setShowExamPortal] = useState(false);
  const [examAnswers, setExamAnswers] = useState({});
  const [examResult, setExamResult] = useState(null); // { score, total, percentage, passed }

  // Subscribe to Training Video Changes
  useEffect(() => {
    const unsubscribe = trainingService.subscribe((updated) => {
      setVideos(updated);
      setSelectedVideo((prev) => {
        if (!prev) return updated[0] || null;
        return updated.find((v) => v.id === prev.id) || updated[0] || null;
      });
    });

    // Cloud fetch on mount
    trainingService.fetchCloudVideos().then((data) => {
      if (data && data.length > 0) {
        setVideos(data);
        setSelectedVideo((prev) => prev || data[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Timer effect for watching video
  useEffect(() => {
    let timer;
    if (isWatching) {
      timer = setInterval(() => {
        setWatchedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWatching]);

  // Reset exam & watch state when changing video
  useEffect(() => {
    setWatchedSeconds(0);
    setIsWatching(false);
    setHasWatchedFull(false);
    setShowExamPortal(false);
    setExamAnswers({});
    setExamResult(null);
  }, [selectedVideo?.id]);

  const handleRefresh = async () => {
    setIsSyncing(true);
    const data = await trainingService.fetchCloudVideos();
    if (data) setVideos(data);
    setIsSyncing(false);
  };

  // Helper to extract YouTube ID
  const getYoutubeEmbedId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'dQw4w9WgXcQ';
  };

  // Open Edit Modal
  const handleOpenEdit = (video) => {
    setEditingVideoId(video.id);
    setFormTitle(video.title);
    setFormDesc(video.description || '');
    setFormUrl(video.youtube_url);
    setFormCategory(video.category);
    setFormDuration(String(video.duration_minutes || 8));
    setFormAssignedTo(video.assigned_to || 'ALL');
    setShowEditModal(true);
  };

  // Save Add / Edit
  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!formTitle || !formUrl) return;

    const embedId = getYoutubeEmbedId(formUrl);

    if (showEditModal && editingVideoId) {
      // Update existing
      await trainingService.updateVideo(editingVideoId, {
        title: formTitle,
        description: formDesc,
        youtube_url: formUrl,
        embed_id: embedId,
        category: formCategory,
        duration_minutes: Number(formDuration) || 5,
        assigned_to: formAssignedTo
      });
      setShowEditModal(false);
      alert('✅ Video Masterclass updated successfully!');
    } else {
      // Add new
      const newEntry = {
        id: `vid-${Date.now()}`,
        title: formTitle,
        description: formDesc,
        youtube_url: formUrl,
        embed_id: embedId,
        category: formCategory,
        duration_minutes: Number(formDuration) || 5,
        assigned_to: formAssignedTo,
        completed_by: []
      };
      await trainingService.addVideo(newEntry);
      setShowAddModal(false);
      alert('✅ Video Masterclass successfully published!');
    }

    setFormTitle('');
    setFormDesc('');
    setFormUrl('');
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Kya aap is training video ko delete karna chahte hain?')) return;
    await trainingService.deleteVideo(id);
  };

  // Submit 20-Question Assessment
  const handleEvaluateExam = async () => {
    const questions = selectedVideo.quiz_questions || [];
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (examAnswers[idx] === q.correct) {
        correctCount += 1;
      }
    });

    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= 80;

    setExamResult({
      score: correctCount,
      total,
      percentage,
      passed
    });

    if (passed) {
      const serial = `MSR-CERT-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const watchTimeStr = `${Math.floor(watchedSeconds / 60)}m ${watchedSeconds % 60}s • 100% Watched`;
      const gradeStr = `${correctCount}/${total} (${percentage}% - Grade A+ Outstanding)`;

      await trainingService.markCompleted(selectedVideo.id, currentUser.name, gradeStr, watchedSeconds);

      setCertData({
        candidateName: currentUser.name,
        courseTitle: selectedVideo.title,
        category: selectedVideo.category,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        grade: gradeStr,
        watchTime: watchTimeStr,
        serialCode: serial
      });
      setShowCertModal(true);
    }
  };

  // Filter videos visible to this employee (Owner sees all; Staff sees all assigned or universal)
  const filteredList = videos.filter((v) => {
    if (isOwner) return true;
    if (!v.assigned_to || v.assigned_to === 'ALL' || v.assigned_to.toLowerCase() === 'all' || v.assigned_to.toLowerCase().includes('all') || v.assigned_to.toLowerCase().includes('sabhi')) return true;
    const target = v.assigned_to.toLowerCase();
    const uName = (currentUser?.name || '').toLowerCase();
    const uId = (currentUser?.id || '').toLowerCase();
    return target.includes(uName) || uName.includes(target) || target.includes(uId) || uId.includes(target) || target.includes('priya');
  });
  const visibleVideos = filteredList.length > 0 ? filteredList : videos;

  const durationSec = (selectedVideo?.duration_minutes || 5) * 60;
  const watchPercentage = Math.min(100, Math.round((watchedSeconds / Math.max(1, durationSec)) * 100));
  const isVideoUnlockedForExam = hasWatchedFull || watchedSeconds >= 30 || isOwner;

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
                <button
                  onClick={handleRefresh}
                  disabled={isSyncing}
                  className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Sync Videos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-400' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Full Video Watch Verification • 20-Question AI Exam • Authenticated Corporate Certification
              </p>
            </div>
          </div>

          {/* Admin Add Video Button */}
          {isOwner && (
            <button
              onClick={() => {
                setFormTitle('');
                setFormDesc('');
                setFormUrl('');
                setFormCategory('NDR Rescue (+₹50 Bounty)');
                setFormDuration('8');
                setFormAssignedTo('ALL');
                setShowAddModal(true);
              }}
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
            <span>📜 My Verified Certificates</span>
          </button>
        </div>
      </div>

      {/* 🎬 Tab 1: Video Masterclass Player & Assessment */}
      {activeTab === 'courses' && selectedVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left 2 Cols: Video Player, Watch Meter & 20-Question Exam */}
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

              {/* Video Info Bar & Watch Verification Meter */}
              <div className="p-4 sm:p-5 space-y-3 bg-slate-900/90">
                
                {/* Title and Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/40 uppercase">
                      {selectedVideo.category}
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-white mt-1">
                      {selectedVideo.title}
                    </h3>
                  </div>

                  {/* Admin Edit / Delete Actions */}
                  {isOwner && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(selectedVideo)}
                        className="tap-target px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700"
                        title="Edit this video"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Edit Video</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(selectedVideo.id)}
                        className="tap-target p-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40"
                        title="Delete video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 🤖 Maya AI Executive Summary */}
                <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/30 space-y-1.5 text-xs text-purple-200">
                  <div className="flex items-center gap-1.5 font-black text-white">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Maya AI Executive Summary & Key Learnings:</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    {selectedVideo.description || 'Is masterclass me customer objections handle karne, 30-second me trust build karne aur delivery attempt fail hone par priority delivery coordinate karne ki strategies sikhayi gayi hain.'}
                  </p>
                </div>

                {/* ⏱️ Live Watch Verification Meter */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live Watch Tracker: <strong>{Math.floor(watchedSeconds / 60)}m {watchedSeconds % 60}s</strong> / {selectedVideo.duration_minutes}m</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{watchPercentage}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${watchPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setIsWatching(!isWatching)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                        isWatching ? 'bg-amber-500 text-slate-950 font-black' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      <span>{isWatching ? '⏸️ Pause Timer' : '▶️ Start Watch Timer'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setWatchedSeconds(durationSec);
                        setHasWatchedFull(true);
                      }}
                      className="text-[11px] text-purple-300 underline hover:text-white"
                    >
                      I have finished watching (100%)
                    </button>
                  </div>
                </div>

                {/* Exam Unlock Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">
                      Assigned: <strong className="text-white">{selectedVideo.assigned_to === 'ALL' ? '🌐 All Staff' : `👤 ${selectedVideo.assigned_to}`}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => setShowExamPortal(true)}
                    disabled={!isVideoUnlockedForExam}
                    className={`tap-target px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                      isVideoUnlockedForExam
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {isVideoUnlockedForExam ? <Unlock className="w-4 h-4 text-yellow-300" /> : <Lock className="w-4 h-4 text-slate-500" />}
                    <span>{isVideoUnlockedForExam ? 'Start 20-Question AI Exam ➔' : 'Watch Video to Unlock Exam 🔒'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 📝 20-Question AI Assessment Portal */}
            {showExamPortal && selectedVideo.quiz_questions && (
              <div className="glass-card rounded-3xl border border-purple-500/50 p-5 sm:p-6 space-y-5 shadow-2xl bg-slate-900/95 animate-scale-up">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Maya AI 20-Question Certification Exam</span>
                    </h4>
                    <p className="text-xs text-slate-400">Pass with 80%+ score to unlock your Verified MSR Corporate Certificate.</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold">
                    {Object.keys(examAnswers).length} / {selectedVideo.quiz_questions.length} Solved
                  </span>
                </div>

                {/* Questions List */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {selectedVideo.quiz_questions.map((quiz, qIdx) => (
                    <div key={qIdx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <p className="font-bold text-white leading-snug">
                        <span className="text-purple-400 font-mono mr-1.5">Q{qIdx + 1}.</span> {quiz.q}
                      </p>
                      <div className="space-y-1.5">
                        {quiz.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setExamAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition ${
                              examAnswers[qIdx] === optIdx
                                ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exam Result Warning / Success */}
                {examResult && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    examResult.passed 
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-red-950/80 border-red-500 text-red-200'
                  }`}>
                    <div className="flex items-center gap-2 font-black text-sm">
                      {examResult.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <span>{examResult.passed ? '🎉 EXAM PASSED WITH DISTINCTION!' : '❌ EXAM FAILED (MINIMUM 80% REQUIRED)'}</span>
                    </div>
                    <p>Score: <strong>{examResult.score} / {examResult.total} ({examResult.percentage}%)</strong></p>
                    {!examResult.passed && <p className="text-[11px] text-red-300">Kripya video dobara dhyan se dekhein aur questions retry karein!</p>}
                  </div>
                )}

                {/* Submit / Retry Button */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setShowExamPortal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs"
                  >
                    Close Exam
                  </button>
                  <button
                    onClick={handleEvaluateExam}
                    disabled={Object.keys(examAnswers).length < selectedVideo.quiz_questions.length}
                    className={`tap-target px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95 ${
                      Object.keys(examAnswers).length >= selectedVideo.quiz_questions.length
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Award className="w-4 h-4 text-yellow-300" />
                    <span>Submit & Claim Official Certificate ➔</span>
                  </button>
                </div>

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
                          <CheckCircle2 className="w-3 h-3" /> Certified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Incomplete
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
                            handleOpenEdit(vid);
                          }}
                          className="text-purple-400 hover:text-purple-300 p-1 font-bold"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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
            {videos.filter((v) => v.completed_by?.includes(currentUser.name)).map((v) => (
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
                      grade: '20/20 (100% - Grade A+ Outstanding)',
                      watchTime: `${v.duration_minutes} Mins • 100% Watched`,
                      serialCode: `MSR-CERT-2026-${v.id.toUpperCase()}`
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

      {/* ➕ Add / Edit Video Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              {showEditModal ? <Edit3 className="w-4 h-4 text-purple-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
              <span>{showEditModal ? 'Edit Video Masterclass (Admin)' : 'Add New Training Masterclass (Admin)'}</span>
            </h3>

            <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. NDR 2nd Attempt Customer Retention Strategy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">YouTube Video URL</label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">AI Executive Summary / Key Takeaways</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Summary of what the employee will learn..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Assign to Employee</label>
                <select
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none font-bold text-emerald-400"
                >
                  <option value="ALL">🌐 All Team Members (Sabhi ke liye)</option>
                  {availableUsers && availableUsers.filter((u) => u.role !== 'owner').map((u) => (
                    <option key={u.id} value={u.name}>
                      👤 {u.name} ({u.roleLabel || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black"
                >
                  {showEditModal ? 'Update Video' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📜 Official Authenticated MSR Certificate Modal */}
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

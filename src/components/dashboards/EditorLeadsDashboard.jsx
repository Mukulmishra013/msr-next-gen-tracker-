// Video Editor & Daily Leads Scouting Dashboard
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Video, 
  UserPlus, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  ExternalLink,
  Target,
  Clock,
  Send
} from 'lucide-react';

export function EditorLeadsDashboard() {
  const { currentUser } = useAuth();
  const { msrLeads, videos, incentives, addLead, addVideo, updateVideoStatus } = useAppData();

  // New Lead Form State
  const [leadForm, setLeadForm] = useState({
    lead_name: '',
    phone: '+91',
    category: 'Social Media Marketing',
    deal_amount: 20000
  });

  // New Video Form State
  const [videoForm, setVideoForm] = useState({
    client_name: '',
    type: 'reel',
    link: ''
  });
  const [showAddVideo, setShowAddVideo] = useState(false);

  // Filter today's leads sourced by this user
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayLeads = msrLeads.filter(
    (l) => l.sourced_by === currentUser.id && l.date === todayStr
  );
  const leadTarget = 10;
  const leadCount = userTodayLeads.length;
  const progressPercent = Math.min(100, Math.round((leadCount / leadTarget) * 100));

  // Live incentive
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const totalIncentive = userIncentives.reduce((sum, item) => sum + item.amount, 0);

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!leadForm.lead_name || !leadForm.phone) return;
    addLead(leadForm, currentUser);
    setLeadForm({
      lead_name: '',
      phone: '+91',
      category: 'Social Media Marketing',
      deal_amount: 20000
    });
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!videoForm.client_name) return;
    addVideo(videoForm, currentUser);
    setVideoForm({ client_name: '', type: 'reel', link: '' });
    setShowAddVideo(false);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Stats & Daily 10-Lead Quota Ring */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Daily 10-Lead Quota Card */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">Daily Lead Prospecting Quota</h3>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {leadCount}/{leadTarget} Aaj Done
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Har din 10 Gorakhpur business leads find karein. Targets achieve karne par Maya HR streak bonus reward milta hai!
          </p>

          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
              <span>Progress: {progressPercent}%</span>
              <span>{leadTarget - leadCount > 0 ? `${leadTarget - leadCount} Leads remaining today` : 'Quota Achieved! 🎉'}</span>
            </div>
          </div>
        </div>

        {/* Live Incentive Counter */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Live Incentive</span>
            <Flame className="w-4 h-4 text-amber-400 animate-bounce-subtle" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">₹{totalIncentive.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-amber-300 font-semibold mt-0.5">Includes 8% Growth Bonus</p>
          </div>
        </div>

      </div>

      {/* Two Column Section: Quick Add Lead & Video Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Quick Lead Prospecting Form */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-white">Add New Business Lead</h3>
            </div>
            <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-md font-bold">
              Instant Sync
            </span>
          </div>

          <form onSubmit={handleAddLead} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business / Owner Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Gold Gym Medical Road"
                value={leadForm.lead_name}
                onChange={(e) => setLeadForm({ ...leadForm, lead_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Deal (₹)</label>
                <input
                  type="number"
                  value={leadForm.deal_amount}
                  onChange={(e) => setLeadForm({ ...leadForm, deal_amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Service Needed</label>
              <select
                value={leadForm.category}
                onChange={(e) => setLeadForm({ ...leadForm, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Social Media Marketing">Social Media Marketing</option>
                <option value="Reels Shoot & Editing">Reels Shoot & Editing</option>
                <option value="Google Ads / Meta Ads">Google Ads / Meta Ads</option>
                <option value="Website & SEO">Website & SEO</option>
              </select>
            </div>

            <button
              type="submit"
              className="tap-target w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Lead Log Karein (+1 Quota)</span>
            </button>
          </form>
        </div>

        {/* Video Production Pipeline */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-400" />
              <h3 className="font-extrabold text-sm text-white">Video Editing Pipeline</h3>
            </div>
            <button
              onClick={() => setShowAddVideo(!showAddVideo)}
              className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Video</span>
            </button>
          </div>

          {/* Add Video Form Drawer */}
          {showAddVideo && (
            <form onSubmit={handleAddVideo} className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client / Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amparo Shilajit Reel #3"
                  value={videoForm.client_name}
                  onChange={(e) => setVideoForm({ ...videoForm, client_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Format Type</label>
                  <select
                    value={videoForm.type}
                    onChange={(e) => setVideoForm({ ...videoForm, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="reel">Instagram Reel</option>
                    <option value="short">YouTube Short</option>
                    <option value="fb_video">Facebook Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preview / Drive Link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={videoForm.link}
                    onChange={(e) => setVideoForm({ ...videoForm, link: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="tap-target w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30"
              >
                Save to Pipeline
              </button>
            </form>
          )}

          {/* Videos List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {videos.map((vid) => (
              <div key={vid.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-white">{vid.client_name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{vid.type} • {vid.date}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      vid.status === 'posted'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : vid.status === 'done'
                        ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {vid.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  {vid.link ? (
                    <a
                      href={vid.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <span>Drive / Video Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">Link not pasted</span>
                  )}

                  <div className="flex gap-1.5">
                    {vid.status === 'editing' && (
                      <button
                        onClick={() => updateVideoStatus(vid.id, 'done')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                      >
                        Mark Done
                      </button>
                    )}
                    {vid.status === 'done' && (
                      <button
                        onClick={() => updateVideoStatus(vid.id, 'posted')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                      >
                        Mark Posted 🎉
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

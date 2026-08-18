// Modern Header Component with Maya AGI Indicator, Desktop Navigation & Profile
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, MapPin, Zap, Flame, LogOut, GraduationCap, LayoutDashboard, Calendar, Banknote } from 'lucide-react';

export function Header({ onOpenGps, onOpenMaya, onOpenRoleModal, activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'training', label: 'MSR Academy 🎓', icon: GraduationCap, highlight: true },
    { id: 'maya_agent_hub', label: 'Maya AI', icon: Sparkles },
    { id: 'attendance', label: 'Haaziri', icon: Calendar },
    { id: 'payroll', label: isOwner ? 'Payroll' : 'Meri Salary', icon: Banknote }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Maya AGI Badge */}
        <div 
          onClick={() => setActiveTab && setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-emerald-500/10 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-emerald-400 text-base sm:text-lg tracking-wider">
              M
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">MSR Next Gen</h1>
              <span className="bg-purple-950/80 text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1 hidden xs:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                Maya AGI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Smart Agency Ops Suite</p>
          </div>
        </div>

        {/* 💻 Center Desktop Top Nav */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab && setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
                    : item.highlight
                    ? 'bg-purple-950/60 text-purple-200 hover:bg-purple-900/80 border border-purple-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.highlight && !isActive ? 'text-yellow-300' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Profile Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Direct MSR Academy Quick Button (Mobile & Small Desktop) */}
          <button
            onClick={() => setActiveTab && setActiveTab('training')}
            className={`tap-target px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-md md:hidden ${
              activeTab === 'training'
                ? 'bg-purple-600 text-white shadow-purple-600/30'
                : 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200'
            }`}
            title="MSR Video Masterclass Academy"
          >
            <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">MSR Academy</span>
          </button>

          {/* Daily Streak Counter */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce-subtle" />
            <span>{currentUser.streak || 7} Days</span>
          </div>

          {/* GPS Haaziri Quick Button */}
          <button
            onClick={onOpenGps}
            className="tap-target px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            title="GPS Check-in"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Haaziri</span>
          </button>

          {/* Maya AI Assistant Button */}
          <button
            onClick={onOpenMaya}
            className="tap-target px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
            <span className="hidden sm:inline">Maya AI</span>
          </button>

          {/* Role Pill & Switcher */}
          <button
            onClick={onOpenRoleModal}
            className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition active:scale-95"
            title="Switch Active Role"
          >
            <span className="text-base">{currentUser.avatar || '👤'}</span>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-100 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{currentUser.role?.replace('_', ' ')}</p>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition active:scale-95"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}

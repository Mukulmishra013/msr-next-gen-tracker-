// Ergonomic Mobile-First Bottom Navigation Bar
import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  PhoneCall, 
  MapPin, 
  Bot, 
  Banknote,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function BottomNav({ activeTab, setActiveTab }) {
  const { currentUser } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard
    },
    {
      id: 'training',
      label: 'MSR Academy',
      icon: GraduationCap
    },
    {
      id: 'maya_agent_hub',
      label: 'Maya AI',
      icon: Bot,
      highlight: true
    },
    {
      id: 'attendance',
      label: 'Haaziri',
      icon: Calendar
    },
    {
      id: 'payroll',
      label: isOwner ? 'Payroll' : 'Meri Salary',
      icon: Banknote
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-1.5 py-1 sm:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`tap-target flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.highlight && isActive ? 'text-purple-400 animate-pulse' : ''}`} />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

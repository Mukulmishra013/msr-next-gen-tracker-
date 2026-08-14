// Ergonomic Mobile-First Bottom Navigation Bar
import React from 'react';
import { 
  LayoutDashboard, 
  PhoneCall, 
  MapPin, 
  Bot, 
  Banknote,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function BottomNav({ activeTab, setActiveTab }) {
  const { currentUser } = useAuth();
  const isOwner = currentUser.role === 'owner';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'work',
      label: currentUser.role === 'content_calling' ? 'Calls' :
             currentUser.role === 'editor_leads' ? 'Videos/Leads' :
             currentUser.role === 'field_executive' ? 'Visits' : 'Operations',
      icon: PhoneCall
    },
    {
      id: 'maya_agent_hub',
      label: 'Maya A2A',
      icon: Bot,
      highlight: true
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: MapPin
    },
    {
      id: 'payroll',
      label: isOwner ? 'Payroll & UPI' : 'Incentives',
      icon: Banknote
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 sm:hidden">
      <div className="flex items-center justify-around">
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
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

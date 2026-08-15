// Main Application Shell - MSR Next Gen Tracker & Maya AGI
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { AgentProvider } from './context/AgentContext';

import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { AgentNudgeBanner } from './components/agents/AgentNudgeBanner';
import { MayaChatDrawer } from './components/agents/MayaChatDrawer';
import { MayaAgentHub } from './components/agents/MayaAgentHub';
import { GpsCheckInModal } from './components/attendance/GpsCheckInModal';
import { AttendanceHistory } from './components/attendance/AttendanceHistory';
import { UpiPaymentModal } from './components/payroll/UpiPaymentModal';
import { SalaryBreakdownCard } from './components/payroll/SalaryBreakdownCard';

import { ContentCallingDashboard } from './components/dashboards/ContentCallingDashboard';
import { EditorLeadsDashboard } from './components/dashboards/EditorLeadsDashboard';
import { FieldExecutiveDashboard } from './components/dashboards/FieldExecutiveDashboard';
import { OwnerDashboard } from './components/dashboards/OwnerDashboard';
import { CustomRoleDashboard } from './components/dashboards/CustomRoleDashboard';

function MainApp() {
  const { isAuthenticated, currentUser } = useAuth();
  const { dbLoading } = useAppData();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals state
  const [isGpsOpen, setIsGpsOpen] = useState(false);
  const [isMayaChatOpen, setIsMayaChatOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedPayrollItem, setSelectedPayrollItem] = useState(null);

  // If not authenticated, render dedicated Firebase Phone Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  // Render role-specific main view for 'dashboard' or 'work' tab
  const renderDashboardView = () => {
    switch (currentUser.role) {
      case 'content_calling':
        return <ContentCallingDashboard onOpenChat={() => setIsMayaChatOpen(true)} />;
      case 'editor_leads':
        return <EditorLeadsDashboard onOpenChat={() => setIsMayaChatOpen(true)} />;
      case 'field_executive':
        return <FieldExecutiveDashboard onOpenChat={() => setIsMayaChatOpen(true)} />;
      case 'owner':
        return (
          <OwnerDashboard
            onOpenUpiModal={(item) => setSelectedPayrollItem(item)}
            onOpenChat={() => setIsMayaChatOpen(true)}
          />
        );
      default:
        return <CustomRoleDashboard onOpenChat={() => setIsMayaChatOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenGps={() => setIsGpsOpen(true)}
        onOpenMaya={() => setIsMayaChatOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        
        {/* Psychological Motivational Nudge Banner */}
        <AgentNudgeBanner onOpenChat={() => setIsMayaChatOpen(true)} />

        {/* Desktop Tab Selector */}
        <div className="hidden sm:flex items-center gap-2 pb-2 border-b border-slate-800/80">
          {[
            { id: 'dashboard', label: '📊 Command Dashboard' },
            { id: 'maya_agent_hub', label: '🧠 Maya A2A Graph Hub' },
            { id: 'attendance', label: '📍 GPS Haaziri & Geofence' },
            { id: 'payroll', label: currentUser.role === 'owner' ? '💸 UPI Payroll & Growth Pool' : '💰 Incentives & Salary' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Router */}
        {activeTab === 'dashboard' || activeTab === 'work' ? (
          renderDashboardView()
        ) : activeTab === 'maya_agent_hub' ? (
          <MayaAgentHub onOpenChat={() => setIsMayaChatOpen(true)} />
        ) : activeTab === 'attendance' ? (
          <div className="space-y-4 pb-20">
            <div className="flex justify-end">
              <button
                onClick={() => setIsGpsOpen(true)}
                className="tap-target px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <span>📍 Naya GPS Check-in Karein</span>
              </button>
            </div>
            <AttendanceHistory />
          </div>
        ) : activeTab === 'payroll' ? (
          <div className="space-y-4 pb-20">
            <SalaryBreakdownCard onOpenUpiModal={(item) => setSelectedPayrollItem(item)} />
          </div>
        ) : null}

      </main>

      {/* Mobile Ergonomic Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Floating Modals & Drawers */}
      <GpsCheckInModal isOpen={isGpsOpen} onClose={() => setIsGpsOpen(false)} />
      <MayaChatDrawer isOpen={isMayaChatOpen} onClose={() => setIsMayaChatOpen(false)} />
      <RoleSwitcher isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
      <UpiPaymentModal
        isOpen={!!selectedPayrollItem}
        onClose={() => setSelectedPayrollItem(null)}
        payrollItem={selectedPayrollItem}
      />

    </div>
  );
}

import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppDataProvider>
          <AgentProvider>
            <MainApp />
          </AgentProvider>
        </AppDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

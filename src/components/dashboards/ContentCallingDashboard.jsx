// Telecaller, Maya AI HR Duty Manager (Daily 10 Tasks), Incentive Engine & Shiprocket Center
import React, { useState, useMemo, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { supervisorAudit } from '../../services/supervisorAudit';
import { adminTaskService } from '../../services/adminTaskService';
import { ShopifyCustomersDirectory } from '../admin/ShopifyCustomersDirectory';
import { telemetryTracker } from '../../services/telemetryTracker';
import { notificationService } from '../../services/notificationService';
import { mayaSupervisorAgent } from '../../services/mayaSupervisorAgent';
import { 
  PhoneCall, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  TrendingUp, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Send, 
  Clock, 
  PackageCheck,
  Copy,
  ExternalLink,
  X,
  Phone,
  Monitor,
  Smartphone,
  Edit3,
  Save,
  Upload,
  FileSpreadsheet,
  Bot,
  Play,
  Volume2,
  FileText,
  Zap,
  RotateCw,
  Truck,
  Ban,
  Search,
  RefreshCw,
  Users,
  Repeat,
  ShoppingBag,
  Award,
  ListTodo,
  Check,
  Lightbulb,
  ArrowRight,
  Eye,
  Calendar,
  Trophy,
  Star,
  Home,
  Building2,
  Compass
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { StaffAttendanceCalendarModal } from '../attendance/StaffAttendanceCalendarModal';
import { GpsCheckInModal } from '../attendance/GpsCheckInModal';
import { getOfficeLocation, getStaffWorkMode } from '../../services/geolocation';

function ProductImageBadge({ productName, size = 'md' }) {
  const isShilajit = productName?.toLowerCase()?.includes('shilajit') || productName?.toLowerCase()?.includes('gummies');
  const isSunscreen = productName?.toLowerCase()?.includes('sunscreen') || productName?.toLowerCase()?.includes('smilika');
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12 sm:w-14 sm:h-14';

  if (isShilajit) {
    return (
      <div className="relative group flex-shrink-0">
        <img 
          src="/assets/amparo_shilajit.jpg" 
          alt="Amparo Shilajit Gummies" 
          className={`${dim} rounded-2xl object-cover border-2 border-amber-500/60 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform`}
        />
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[8px] font-black px-1 py-0.2 rounded uppercase shadow-sm">Gold</span>
      </div>
    );
  }
  if (isSunscreen) {
    return (
      <div className="relative group flex-shrink-0">
        <img 
          src="/assets/smilika_sunscreen.jpg" 
          alt="Smilika Sunscreen Lotion" 
          className={`${dim} rounded-2xl object-cover border-2 border-cyan-500/60 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform`}
        />
        <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-black text-[8px] font-black px-1 py-0.2 rounded uppercase shadow-sm">SPF50</span>
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/40 flex items-center justify-center text-lg shadow-md flex-shrink-0`}>
      🌿
    </div>
  );
}

export function ContentCallingDashboard({ onOpenChat, initialSubTab }) {
  const { currentUser } = useAuth();
  const { 
    amparoCalls, 
    setAmparoCalls, 
    attendance = [],
    incentives, 
    updateCallStatus, 
    updateCallPhone,
    recordAttendanceCheckIn,
    claimTelecallerTaskIncentive,
    triggerAiCall,
    triggerBatchAiCalls,
    mayaConfig,
    syncBolnaExecutions,
    bolnaExecutions
  } = useAppData();

  const [activeCallTab, setActiveCallTab] = useState(initialSubTab || 'daily_duty');

  useEffect(() => {
    if (initialSubTab) {
      setActiveCallTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSopModal, setShowSopModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [punchingAttendance, setPunchingAttendance] = useState(false);
  const [activeWhatsappOrder, setActiveWhatsappOrder] = useState(null);
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [editingPhoneVal, setEditingPhoneVal] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyPhoneSuccess, setCopyPhoneSuccess] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [isSyncingSr, setIsSyncingSr] = useState(false);
  const [isSyncingAi, setIsSyncingAi] = useState(false);

  // 1-Click WFH Attendance Punch Handler
  const handleDirectWfhPunch = async () => {
    if (!currentUser) return;
    setPunchingAttendance(true);
    try {
      const office = getOfficeLocation();
      const coords = { lat: office.lat, lng: office.lng };
      const res = await recordAttendanceCheckIn(currentUser, coords);
      supervisorAudit.clearUserWarnings(currentUser.id);
      try {
        sounds.playCelebrate();
      } catch (e) {}
      alert(`🎉 Haaziri Lag Gayi: PRESENT (Work From Home) ✅\nTime: ${res.check_in_time}\nDaily Base Pay Secure Ho Gayi Hai!`);
    } catch (e) {
      alert('Attendance Error: ' + e.message);
    } finally {
      setPunchingAttendance(false);
    }
  };

  // Autonomous Maya HR & Supervisor Watchdog Alerts & Shift/Break Logic
  const [activeSupervisorWarnings, setActiveSupervisorWarnings] = useState(() => {
    return supervisorAudit.getActiveWarnings(currentUser?.id || 'usr_priya_telecaller');
  });
  const [breakStatus, setBreakStatus] = useState(() => {
    return supervisorAudit.getStaffBreakStatus(currentUser?.id || 'usr_priya_telecaller');
  });
  const [staffDutyStatus, setStaffDutyStatus] = useState(() => {
    return supervisorAudit.getStaffDutyStatus(currentUser?.id || 'usr_priya_telecaller');
  });
  const [shiftInfo, setShiftInfo] = useState(() => supervisorAudit.getShiftInfo());

  useEffect(() => {
    // Initial activity log on login
    supervisorAudit.recordActivity(currentUser?.id || 'usr_priya_telecaller', currentUser?.name || 'Telecaller', 'LOGIN_PORTAL');

    const runWatchdog = () => {
      supervisorAudit.runAutonomousAudit({
        user: currentUser,
        amparoCalls,
        attendance,
        incentives
      });
      setActiveSupervisorWarnings(supervisorAudit.getActiveWarnings(currentUser?.id || 'usr_priya_telecaller'));
      setBreakStatus(supervisorAudit.getStaffBreakStatus(currentUser?.id || 'usr_priya_telecaller'));
      setStaffDutyStatus(supervisorAudit.getStaffDutyStatus(currentUser?.id || 'usr_priya_telecaller'));
      setShiftInfo(supervisorAudit.getShiftInfo());
    };

    runWatchdog();

    // Periodic watchdog audit every 10 seconds (for live break countdown and idle checking)
    const interval = setInterval(runWatchdog, 10000);

    const unsub = supervisorAudit.subscribe(() => {
      runWatchdog();
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [currentUser, amparoCalls, incentives]);

  // Personal Attendance Sheet & Calendar Modal State
  const [showMyCalendarModal, setShowMyCalendarModal] = useState(false);

  // Admin Assigned Extra Tasks & Missions
  const [adminAssignedTasks, setAdminAssignedTasks] = useState(() => {
    return adminTaskService.getTasksForUser(currentUser?.id || 'usr_priya_telecaller');
  });

  useEffect(() => {
    const unsubTasks = adminTaskService.subscribe(() => {
      setAdminAssignedTasks(adminTaskService.getTasksForUser(currentUser?.id || 'usr_priya_telecaller'));
    });
    return () => unsubTasks();
  }, [currentUser]);

  const handleClaimAdminTask = (task) => {
    const userId = currentUser?.id || 'usr_priya_telecaller';
    const userName = currentUser?.name || 'Priya Singh';
    const res = adminTaskService.completeTask(task.id, userId, userName);
    if (res.success) {
      try {
        playCoinDrop();
      } catch (e) {}
      alert(`🎉 BINGO! Extra Task "${task.title}" completed! +₹${res.bounty || 0} Bonus Reward unlocked!`);
      setAdminAssignedTasks(adminTaskService.getTasksForUser(userId));
    } else {
      alert(res.error || 'Task completion error');
    }
  };

  const handleDismissSupervisorWarning = (warningId) => {
    supervisorAudit.recordActivity(currentUser?.id || 'usr_priya_telecaller', currentUser?.name || 'Telecaller', 'ACKNOWLEDGE_WARNING');
    supervisorAudit.dismissWarning(warningId);
    setActiveSupervisorWarnings(supervisorAudit.getActiveWarnings(currentUser?.id || 'usr_priya_telecaller'));
  };

  const handleToggleBreak = () => {
    const userId = currentUser?.id || 'usr_priya_telecaller';
    const userName = currentUser?.name || 'Priya Singh';
    if (breakStatus.isOnBreak) {
      supervisorAudit.endBreak(userId, userName);
    } else {
      if (breakStatus.isQuotaExhausted || breakStatus.remainingSec <= 0) {
        alert('⚠️ Aaj ka total 40-minute break quota khatam ho chuka hai! Ab aur break allowed nahi hai.');
        return;
      }
      const res = supervisorAudit.startBreak(userId, userName);
      if (!res.success) {
        alert(res.message);
      }
    }
    setBreakStatus(supervisorAudit.getStaffBreakStatus(userId));
  };

  // Customer 360° AI Intelligence & Action Hub State
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [detailActiveTab, setDetailActiveTab] = useState('ai_audit');
  const [detailWaMessage, setDetailWaMessage] = useState('');

  // AI Calling States & Direct Dial Modal
  const [callingOrderId, setCallingOrderId] = useState(null);
  const [isBatchCalling, setIsBatchCalling] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState(null);
  const [selectedTranscriptCall, setSelectedTranscriptCall] = useState(null);
  const [aiCallMessage, setAiCallMessage] = useState('');
  const [aiModalOrder, setAiModalOrder] = useState(null);
  const [aiModalPhone, setAiModalPhone] = useState('');
  const [aiModalPurpose, setAiModalPurpose] = useState('ORDER_CONFIRMATION');

  // Intercept Android hardware/browser back button & Escape key so modal closes instead of app exiting
  useEffect(() => {
    if (!selectedCustomerDetail) return;
    window.history.pushState({ modal: 'customer_360' }, '');
    const handlePopState = () => {
      setSelectedCustomerDetail(null);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedCustomerDetail(null);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCustomerDetail]);

  // 🔄 Courier NDR Re-Attempt & Reschedule Modal State
  const [ndrModalOrder, setNdrModalOrder] = useState(null);
  const [ndrReattemptDate, setNdrReattemptDate] = useState(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  });
  const [ndrComments, setNdrComments] = useState('Customer requested re-attempt delivery, please deliver on priority.');
  const [ndrAlternatePhone, setNdrAlternatePhone] = useState('');
  const [ndrAddressUpdate, setNdrAddressUpdate] = useState('');
  const [ndrSubmitting, setNdrSubmitting] = useState(false);

  // Dedicated 947+ Historical Shipments Archive States
  const [archiveList, setArchiveList] = useState(() => {
    try {
      const saved = localStorage.getItem('msr_sr_archive');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState('ALL');
  const [callDateFilter, setCallDateFilter] = useState('ALL');

  // 🔔 Push Notification & Maya Supervisor Real-Time Directive State
  const [notifPermission, setNotifPermission] = useState(() => typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');
  const [liveGuidance, setLiveGuidance] = useState(() => mayaSupervisorAgent.getSupervisorGuidance(currentUser.id));
  const [liveTelemetry, setLiveTelemetry] = useState(() => telemetryTracker.getLiveProductivityStats(currentUser.id, 20));

  useEffect(() => {
    mayaSupervisorAgent.init();
    const unsub1 = mayaSupervisorAgent.subscribe(() => {
      setLiveGuidance(mayaSupervisorAgent.getSupervisorGuidance(currentUser.id));
    });
    const unsub2 = telemetryTracker.subscribe(() => {
      setLiveTelemetry(telemetryTracker.getLiveProductivityStats(currentUser.id, 20));
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [currentUser.id]);

  const handleEnableAlerts = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(granted);
    if (granted) {
      notificationService.playBroadcastChime();
    }
  };

  const handleFetchArchive = async () => {
    setIsArchiveLoading(true);
    setAiCallMessage('⚡ Shiprocket se All 947 Historical Shipments fetch ho rahe hain...');
    try {
      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fetchArchive: true })
      });
      const data = await res.json();
      if (data.success && data.archive) {
        setArchiveList(data.archive);
        localStorage.setItem('msr_sr_archive', JSON.stringify(data.archive));
        setAiCallMessage(`✅ SUCCESS: ${data.archive.length} Historical Shipments Archive me load ho gaye!`);
      } else {
        throw new Error(data.message || 'Archive fetch failed');
      }
    } catch (err) {
      setAiCallMessage(`❌ Archive Error: ${err.message}`);
    } finally {
      setIsArchiveLoading(false);
      setTimeout(() => setAiCallMessage(''), 5000);
    }
  };

  // Stats & Performance - Anti-Fraud Delivery Verified Incentives
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const approvedIncentives = userIncentives.filter((i) => i.status === 'approved_paid' || i.paid === true);
  const pendingIncentives = userIncentives.filter((i) => i.status === 'pending_delivery');

  const totalApprovedIncentive = approvedIncentives.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalPendingIncentive = pendingIncentives.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  // 📦 Anti-Confusion Logistics Classifier: Separate Actionable NDR vs Warehouse Office Return
  const isOfficeReturningRto = (c) => {
    if (!c) return false;
    const statusLower = String(c.status || '').toLowerCase();
    const notesLower = String(c.notes || '').toLowerCase();
    return (
      statusLower === 'rto_lost' ||
      statusLower.includes('rto in transit') ||
      statusLower.includes('rto delivered') ||
      statusLower.includes('rto_initiated') ||
      statusLower.includes('returned') ||
      notesLower.includes('rto in transit') ||
      notesLower.includes('rto delivered') ||
      notesLower.includes('returning to origin') ||
      notesLower.includes('3rd attempt') ||
      notesLower.includes('rto initiated') ||
      notesLower.includes('fkl_lko_bts') ||
      notesLower.includes('rto ndr')
    );
  };

  const isActionableNdr = (c) => {
    if (!c) return false;
    if (isOfficeReturningRto(c)) return false;
    if (c.status === 'delivered' || c.status === 'confirmed' || c.status === 'rto_saved') return false;
    const statusLower = String(c.status || '').toLowerCase();
    const notesLower = String(c.notes || '').toLowerCase();
    return (
      c.urgent_rto === true ||
      c.call_type === 'RTO Rescue' ||
      statusLower === 'rto_attempted' ||
      statusLower.includes('ndr') ||
      statusLower.includes('undelivered') ||
      notesLower.includes('ndr') ||
      notesLower.includes('1st attempt') ||
      notesLower.includes('2nd attempt') ||
      notesLower.includes('customer not available')
    );
  };

  const confirmedCalls = amparoCalls.filter((c) => c.status === 'confirmed' || c.status === 'rto_saved').length;
  const urgentCount = amparoCalls.filter(isActionableNdr).length;
  const officeRtoCount = amparoCalls.filter(isOfficeReturningRto).length;
  const pendingCount = amparoCalls.filter((c) => c.status === 'pending_confirmation' && !isActionableNdr(c) && !isOfficeReturningRto(c) && c.call_type !== 'Old Customer Feedback').length;
  const oldCustomersCount = amparoCalls.filter((c) => (c.call_type === 'Old Customer Feedback' || c.status === 'delivered') && !isActionableNdr(c) && !isOfficeReturningRto(c)).length;
  const fakeCancelledCount = amparoCalls.filter((c) => c.status === 'rto_lost' || c.ai_decision === 'fake_order' || c.ai_decision === 'cancelled').length;
  const aiCallsCount = amparoCalls.filter((c) => c.call_source === 'ai_agent' || c.recording_url || c.transcript || (c.notes && c.notes.includes('[AI_LOG]'))).length;

  const [dutyBatch, setDutyBatch] = useState(0);

  // 🎯 Maya AI HR: Dynamic Generation of 10 Daily Duty Targets (Batch Controlled)
  const daily10Tasks = useMemo(() => {
    const rtoList = amparoCalls.filter(isActionableNdr);
    const oldList = amparoCalls.filter((c) => (c.call_type === 'Old Customer Feedback' || c.status === 'delivered') && !isActionableNdr(c) && !isOfficeReturningRto(c));
    const pendingList = amparoCalls.filter((c) => c.status === 'pending_confirmation' && !isActionableNdr(c) && !isOfficeReturningRto(c) && c.call_type !== 'Old Customer Feedback');

    const rtoSlice = rtoList.slice(dutyBatch * 4, dutyBatch * 4 + 4).map((c) => ({
      ...c,
      task_type: 'RTO_RESCUE',
      task_title: '🚨 Urgent RTO Rescue',
      incentive_amount: 50,
      badge_color: 'bg-red-600',
      ai_tip: `Parcel delivery attempt fail hui hai. Customer se confirm karein ki delivery boy aaj re-attempt deliver karwa de (+₹50 Live Incentive)!`
    }));

    const oldSlice = oldList.slice(dutyBatch * 4, dutyBatch * 4 + 4).map((c) => ({
      ...c,
      task_type: 'OLD_CUSTOMER_REORDER',
      task_title: '🌿 Customer Feedback & Re-Order',
      incentive_amount: 30,
      badge_color: 'bg-teal-600',
      ai_tip: `Purane customer se results puchiye aur ₹50 OFF coupon (AMPARO50) dekar repeat order book karein (+₹30 Incentive)!`
    }));

    const pendingSlice = pendingList.slice(dutyBatch * 2, dutyBatch * 2 + 2).map((c) => ({
      ...c,
      task_type: 'ORDER_CONFIRMATION',
      task_title: '⏳ COD Order Confirmation',
      incentive_amount: 20,
      badge_color: 'bg-amber-600',
      ai_tip: `Naya order dispatch confirm karke complete address & COD cash payment ready rakhne ko bolein (+₹20 Incentive)!`
    }));

    const combined = [...rtoSlice, ...oldSlice, ...pendingSlice];
    if (combined.length < 10 && amparoCalls.length >= 10) {
      const remaining = amparoCalls.filter(c => !combined.some(t => t.id === c.id)).slice(0, 10 - combined.length).map(c => ({
        ...c,
        task_type: c.urgent_rto ? 'RTO_RESCUE' : (c.status === 'delivered' ? 'OLD_CUSTOMER_REORDER' : 'ORDER_CONFIRMATION'),
        task_title: c.urgent_rto ? '🚨 Urgent RTO Rescue' : (c.status === 'delivered' ? '🌿 Customer Feedback' : '⏳ Order Confirmation'),
        incentive_amount: c.urgent_rto ? 50 : (c.status === 'delivered' ? 30 : 20),
        badge_color: c.urgent_rto ? 'bg-red-600' : (c.status === 'delivered' ? 'bg-teal-600' : 'bg-amber-600'),
        ai_tip: 'Customer se sampark karein aur order verify karein.'
      }));
      return [...combined, ...remaining];
    }
    return combined.slice(0, 10);
  }, [amparoCalls, dutyBatch]);

  // Determine completed tasks in the batch
  const completedDutyTasks = daily10Tasks.filter((task) => {
    return Boolean(
      task.is_claimed || 
      task.incentive_status === 'pending_delivery' || 
      task.handled_by === currentUser.name || 
      task.call_source === 'telecaller_manual' ||
      task.status === 'rto_saved' ||
      incentives.some(i => (i.order_id === task.id || i.order_id === task.shopify_order_id) && (i.user_id === currentUser.id || i.userName === currentUser.name))
    );
  });

  const completedDutyTasksCount = completedDutyTasks.length;
  
  const dutyIncentiveEarned = completedDutyTasks.reduce((sum, task) => {
    return sum + Number(task.incentive_amount || 40);
  }, 0);

  const sortedCalls = [...amparoCalls].sort((a, b) => {
    const timeA = new Date(a.created_at || a.date || 0).getTime();
    const timeB = new Date(b.created_at || b.date || 0).getTime();
    if (timeA && timeB && timeA !== timeB) return timeB - timeA;
    return (b.urgent_rto ? 1 : 0) - (a.urgent_rto ? 1 : 0);
  });
  
  const filteredCalls = sortedCalls.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.customer_name || '').toLowerCase().includes(q);
      const matchOrder = (c.shopify_order_id || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      const matchProd = (c.product || '').toLowerCase().includes(q);
      const matchAwb = (c.shiprocket_shipment_id || '').toLowerCase().includes(q);
      if (!matchName && !matchOrder && !matchPhone && !matchProd && !matchAwb) return false;
    }

    if (callDateFilter !== 'ALL') {
      const now = new Date();
      const callDate = new Date(c.created_at || c.date || now);
      const isToday = callDate.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = callDate.toDateString() === yesterday.toDateString();
      const is7Days = (now - callDate) <= 7 * 24 * 60 * 60 * 1000;

      if (callDateFilter === 'TODAY' && !isToday) return false;
      if (callDateFilter === 'YESTERDAY' && !isYesterday) return false;
      if (callDateFilter === '7DAYS' && !is7Days) return false;
    }

    if (activeCallTab === 'daily_duty') return true;
    if (activeCallTab === 'urgent_rto') {
      return isActionableNdr(c);
    }
    if (activeCallTab === 'office_rto') {
      return isOfficeReturningRto(c);
    }
    if (activeCallTab === 'pending') {
      return c.status === 'pending_confirmation' && !isActionableNdr(c) && !isOfficeReturningRto(c) && c.call_type !== 'Old Customer Feedback';
    }
    if (activeCallTab === 'old_customers') {
      return (c.call_type === 'Old Customer Feedback' || c.status === 'delivered') && !isActionableNdr(c) && !isOfficeReturningRto(c);
    }
    if (activeCallTab === 'ai_confirmed') {
      return c.status === 'confirmed' || c.status === 'rto_saved';
    }
    if (activeCallTab === 'ai_fake_cancelled') {
      return c.status === 'rto_lost' || c.ai_decision === 'fake_order' || c.ai_decision === 'cancelled' || isOfficeReturningRto(c);
    }
    if (activeCallTab === 'ai_history') {
      return Boolean(c.recording_url || c.transcript || c.call_source === 'ai_agent' || (c.notes && c.notes.includes('[AI_LOG]')));
    }
    return true;
  });

  // 🔄 Handle Courier NDR Re-Attempt / Reschedule Action directly with Shiprocket
  const handleSubmitNdrAction = async (actionType = 're-attempt') => {
    if (!ndrModalOrder) return;
    setNdrSubmitting(true);
    try {
      const res = await fetch('/api/shiprocket-ndr-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awb: ndrModalOrder.shiprocket_shipment_id,
          orderId: ndrModalOrder.shopify_order_id,
          action: actionType,
          deferred_date: ndrReattemptDate,
          comments: ndrComments,
          phone: ndrAlternatePhone || ndrModalOrder.phone,
          address: ndrAddressUpdate || undefined,
          telecallerName: currentUser.name || 'Telecaller'
        })
      });
      const data = await res.json();
      if (data.success) {
        if (actionType === 're-attempt') {
          claimTelecallerTaskIncentive(ndrModalOrder.id, 50, '🚨 RTO Rescued & Re-Attempt Scheduled', currentUser);
          try { playCoinDrop(); } catch(e) {}
        }
        alert(`🎉 SHIPROCKET SUCCESS:\n${data.message}`);
        setNdrModalOrder(null);
      } else {
        alert(`⚠️ Shiprocket Update Notice:\n${data.message}`);
      }
    } catch (err) {
      alert('Action error: ' + err.message);
    } finally {
      setNdrSubmitting(false);
    }
  };

  // Handle Maya AI Call Click
  const handleAiCallButtonClick = (call, forcedPurpose = null) => {
    const isRto = Boolean(
      call.urgent_rto || 
      call.call_type === 'RTO Rescue' || 
      (call.notes && (call.notes.includes('UNDELIVERED') || call.notes.includes('RTO')))
    );
    const isOldCust = Boolean(
      !isRto && (call.call_type === 'Old Customer Feedback' || call.status === 'delivered')
    );
    const purpose = forcedPurpose || (isRto ? 'RTO_RESCUE' : (isOldCust ? 'OLD_CUSTOMER_FEEDBACK' : 'ORDER_CONFIRMATION'));

    setAiModalPurpose(purpose);
    const cleanDigits = String(call.phone || '').replace(/\D/g, '');
    const isMasked = cleanDigits.length < 10 || String(call.phone || '').includes('xxx');

    if (isMasked) {
      setAiModalOrder(call);
      setAiModalPhone('');
    } else {
      executeAiCall(call, call.phone, purpose);
    }
  };

  // Execute Maya AI Phone Call (Zero Incentive for Telecaller)
  const executeAiCall = async (call, phoneToUse, purposeToUse = null) => {
    const cleanDigits = String(phoneToUse || '').replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      alert('Kripya valid 10-digit mobile number enter karein.');
      return;
    }

    const formattedPhone = `+91${cleanDigits}`;
    setCallingOrderId(call.id || call.shopify_order_id);
    setAiCallMessage('');

    await updateCallPhone(call.id, cleanDigits);

    const isRto = Boolean(
      call.urgent_rto || 
      call.call_type === 'RTO Rescue' || 
      (call.notes && (call.notes.includes('UNDELIVERED') || call.notes.includes('RTO')))
    );
    const isOldCust = Boolean(
      !isRto && (call.call_type === 'Old Customer Feedback' || call.status === 'delivered')
    );
    const purpose = purposeToUse || (isRto ? 'RTO_RESCUE' : (isOldCust ? 'OLD_CUSTOMER_FEEDBACK' : 'ORDER_CONFIRMATION'));

    try {
      const res = await triggerAiCall({
        id: call.id,
        shopify_order_id: call.shopify_order_id,
        phone: formattedPhone,
        customer_name: call.customer_name && call.customer_name !== 'Verified Buyer' ? call.customer_name : 'Customer',
        product_name: call.product || 'Amparo Shilajit Gummies',
        order_amount: call.amount || 449,
        delivery_address: call.city || (call.notes && call.notes.includes('City:') ? call.notes.split('City:')[1]?.split('|')[0]?.trim() : 'India'),
        delivery_timeline: call.delivery_timeline || (call.courier_name ? `${call.courier_name} कूरियर से ${call.expected_delivery_date || 'तीन से पाँच दिन में'}` : 'तीन से पाँच दिन में'),
        courier_name: call.courier_name || 'कूरियर पार्टनर',
        expected_delivery_date: call.expected_delivery_date || 'तीन से पाँच दिन में',
        combo_product: 'Smilika SPF 50 Sunscreen',
        combo_discount: 'एक सौ रुपये की छूट',
        customer_type: purpose === 'OLD_CUSTOMER_FEEDBACK' ? 'OLD_CUSTOMER' : 'NEW_CUSTOMER',
        call_purpose: purpose,
        is_rto: isRto,
        urgent_rto: isRto,
        discount_value: mayaConfig?.enableDiscounts ? (isRto ? mayaConfig.rtoDiscountText : mayaConfig.vipDiscountText) : 'कोई अतिरिक्त छूट नहीं',
        coupon_code: mayaConfig?.enableDiscounts ? (isRto ? mayaConfig.rtoCouponCode : mayaConfig.vipCouponCode) : ''
      });

      setAmparoCalls((prev) =>
        prev.map((c) => (c.id === call.id ? { ...c, call_source: 'ai_agent', ai_dialed: true } : c))
      );
      setAiModalOrder(null);
      const purposeLabel = purpose === 'OLD_CUSTOMER_FEEDBACK' ? '🌿 Feedback & Repeat Sales' : (isRto ? '🚨 Urgent RTO Rescue' : '📦 Order Confirmation');
      setAiCallMessage(`🤖 Maya AI calling ${call.customer_name} (${formattedPhone}) [Type: ${purposeLabel} | Note: AI call use karne par telecaller incentive auto-reduce hokar ₹20 AI-Assist ho jata hai]`);
      setTimeout(() => setAiCallMessage(''), 6000);
    } catch (err) {
      alert(`AI Call Error: ${err.message}`);
    } finally {
      setCallingOrderId(null);
    }
  };

  // 1-Click Batch AI Calling
  const handleTriggerBatchAiCalls = async (mode = 'pending') => {
    let targetQueue = [];
    if (mode === 'old_customers') {
      targetQueue = amparoCalls.filter(
        (c) => c.call_type === 'Old Customer Feedback' || c.status === 'confirmed' || c.status === 'delivered'
      );
      if (!window.confirm(`Kya aap ${targetQueue.length} Purane Customers par Maya AI se Feedback & Re-Order Campaign start karna chahte hain?`)) return;
    } else {
      targetQueue = amparoCalls.filter(
        (c) => c.status === 'pending_confirmation' || c.urgent_rto
      );
      if (!window.confirm(`Kya aap ${targetQueue.length} pending orders par Maya AI se Auto-Calling start karna chahte hain?`)) return;
    }

    if (targetQueue.length === 0) {
      alert('Is campaign me koi target orders nahi hain.');
      return;
    }

    setIsBatchCalling(true);
    try {
      const res = await triggerBatchAiCalls(targetQueue);
      alert(`⚡ SUCCESS: ${res.total_triggered || targetQueue.length} Calls Maya AI ne start kar di hain! Live results update hote rahenge.`);
    } catch (err) {
      alert(`Batch Calling Error: ${err.message}`);
    } finally {
      setIsBatchCalling(false);
    }
  };

  // Sync Live Shiprocket Orders
  const handleSyncShiprocket = async () => {
    setIsSyncingSr(true);
    setAiCallMessage('⚡ Shiprocket live orders fetch ho rahe hain...');
    try {
      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveSync: true })
      });
      const data = await res.json();
      if (data.success && data.orders) {
        setAmparoCalls(data.orders);
        setAiCallMessage(`✅ SUCCESS: ${data.orders.length} Shiprocket orders live synchronize ho gaye!`);
      } else {
        throw new Error(data.message || 'Sync error');
      }
    } catch (e) {
      setAiCallMessage(`❌ Sync Error: ${e.message}`);
    } finally {
      setIsSyncingSr(false);
      setTimeout(() => setAiCallMessage(''), 5000);
    }
  };

  // 1-Click Sync Bolna AI Call History, Recordings & Transcripts
  const handleSyncAiHistory = async () => {
    setIsSyncingAi(true);
    setAiCallMessage('⚡ Bolna AI se live recordings, transcripts aur status fetch ho rahe hain...');
    try {
      const res = await syncBolnaExecutions();
      if (res.success) {
        setAiCallMessage(`⚡ SUCCESS: ${res.count || 0} Maya AI calls, audio recordings & transcripts synchronized!`);
      } else {
        setAiCallMessage(`⚠️ Sync Notice: ${res.error || 'Check Bolna API connectivity'}`);
      }
    } catch (e) {
      setAiCallMessage(`❌ AI Sync Error: ${e.message}`);
    } finally {
      setIsSyncingAi(false);
      setTimeout(() => setAiCallMessage(''), 5000);
    }
  };

  // Open Full Customer 360° AI Audit & Action Modal
  const handleOpenCustomer360 = (order) => {
    setSelectedCustomerDetail(order);
    setDetailActiveTab('ai_audit');
    const msg = generateAiWhatsappText(order);
    setDetailWaMessage(msg);
  };

  // Generate Professional Sales Expert AI WhatsApp Message
  const generateAiWhatsappText = (order) => {
    const custName = order.customer_name && order.customer_name !== 'Verified Buyer' ? order.customer_name : 'Customer';
    const orderId = order.shopify_order_id ? `#${order.shopify_order_id.replace('#', '')}` : '#AmparoOrder';
    const amount = order.amount || 449;
    const product = order.product || 'Amparo Pure Shilajit Gummies';

    if (order.urgent_rto) {
      return `Namaste ${custName} Ji!

Mai *Amparo Store* Support se baat kar raha hoon.

Aapka parcel *${product}* (${orderId}) courier delivery attempt me pending ho gaya hai.

💵 *COD Amount:* ₹${amount} (Free Shipping)

👉 Kripya *YES* ya *CONFIRM* reply karein taaki hum delivery boy ko bolkar aaj hi aapke address par priority deliver karwa dein.

Dhanyawad!
*Team Amparo Store* 🌿`;
    }

    if (order.call_type === 'Old Customer Feedback' || order.status === 'confirmed') {
      return `Namaste ${custName} Ji!

*Amparo Store* se special VIP customer connect! 🌿

Aapne pehle *${product}* order kiya tha. Aaj hamare loyal customers ke liye *₹50 OFF* coupon (*AMPARO50*) active hai.

Kya aapke liye agla pack Cash on Delivery book kar dein?

*Team Amparo Store* ✨`;
    }

    return `Namaste ${custName} Ji!

*Amparo Store* me aapka order receive ho gaya hai!

📦 *Product:* ${product}
🆔 *Order ID:* ${orderId}
💵 *Amount to Pay (COD):* ₹${amount}

Aapka parcel dispatch ho raha hai. Kripya delivery confirm karne ke liye *CONFIRM* reply karein.

Dhanyawad!
*Team Amparo Store* 🌿`;
  };

  const handleOpenWhatsappModal = (call) => {
    const msg = generateAiWhatsappText(call);
    const cleanDigits = String(call.phone || '').replace(/\D/g, '');
    const valid10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    setActiveWhatsappOrder(call);
    setTargetPhone(valid10);
    setCustomWaMessage(msg);
    setCopySuccess(false);
    setCopyPhoneSuccess(false);
  };

  const handleSavePhoneInline = async (callId) => {
    const cleanDigits = editingPhoneVal.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length === 10) {
      await updateCallPhone(callId, cleanDigits);
    }
    setEditingPhoneId(null);
  };

  // 1. WhatsApp Web Direct (PC/Laptop)
  const handleOpenWhatsAppWeb = async () => {
    const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      alert('Kripya 10-digit customer mobile number enter karein!');
      return;
    }
    
    if (activeWhatsappOrder && cleanDigits.length === 10) {
      await updateCallPhone(activeWhatsappOrder.id, cleanDigits);
    }

    const fullPhone = `91${cleanDigits}`;
    const encoded = encodeURIComponent(customWaMessage);
    const url = `https://web.whatsapp.com/send?phone=${fullPhone}&text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 2. WhatsApp Mobile App
  const handleOpenWhatsAppApp = async () => {
    const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      alert('Kripya 10-digit customer mobile number enter karein!');
      return;
    }

    if (activeWhatsappOrder && cleanDigits.length === 10) {
      await updateCallPhone(activeWhatsappOrder.id, cleanDigits);
    }

    const fullPhone = `91${cleanDigits}`;
    const encoded = encodeURIComponent(customWaMessage);
    const url = `https://wa.me/${fullPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customWaMessage);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(targetPhone);
    setCopyPhoneSuccess(true);
    setTimeout(() => setCopyPhoneSuccess(false), 2500);
  };

  // Handle CSV file upload with real phone numbers
  const handleCsvFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);
    setImportStatus('CSV read ho rahi hai...');

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) throw new Error('CSV file me orders nahi hain.');

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const parsedOrders = [];

      for (let i = 1; i < lines.length; i++) {
        const rawCols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (rawCols.length < 2) continue;
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = (rawCols[idx] || '').trim().replace(/^["']|["']$/g, '');
        });
        parsedOrders.push(row);
      }

      setImportStatus(`${parsedOrders.length} orders match ho rahe hain...`);

      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvOrders: parsedOrders })
      });

      const data = await res.json();
      if (data.success && data.orders) {
        setAmparoCalls(data.orders);
        setImportStatus(`✅ SUCCESS! ${data.orders.length} Real Orders load ho gaye!`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportStatus('');
        }, 1500);
      } else {
        throw new Error(data.message || 'Import error.');
      }
    } catch (err) {
      setImportStatus(`❌ Error: ${err.message}`);
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* 👑 Maya AI HR & Operations Manager Morning Duty Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950 border border-purple-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Left: 3D Maya Avatar + Greeting */}
          <div className="flex items-start sm:items-center gap-4 flex-1">
            <div className="relative group flex-shrink-0">
              <img 
                src="/assets/maya_avatar.jpg" 
                alt="Maya AI Voice Executive" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-purple-400/70 shadow-xl shadow-purple-500/30 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                AI Active
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Maya AI Co-Pilot (Groq 70B)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 animate-bounce-subtle" />
                  🔥 3-Day Win Streak (1.2x Boost)
                </span>
              </div>
              
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Namaste {currentUser.name}! 🚀 Ready to Crush Today's Targets?
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Maya AI ne live orders analyze karke aapke liye <strong className="text-emerald-400">10 High-Incentive Tasks</strong> ready kiye hain. 
                <strong className="text-red-400"> 4 Urgent RTOs (+₹50/call)</strong>, 
                <strong className="text-teal-400"> 4 Re-Orders (+₹30/call)</strong> aur 
                <strong className="text-amber-400"> 2 Confirmations (+₹20/call)</strong>!
              </p>
            </div>
          </div>

          {/* Right: Gamified Level & XP Progress Card */}
          <div className="flex items-center gap-3 w-full lg:w-auto self-stretch lg:self-auto">
            
            {/* 3D Sales Trophy Mini Badge */}
            <div className="hidden sm:flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 shadow-lg">
              <img 
                src="/assets/sales_trophy.jpg" 
                alt="Sales Champion Trophy" 
                className="w-12 h-12 rounded-xl object-cover border border-amber-400/60 shadow-md shadow-amber-500/30"
              />
              <span className="text-[9px] font-black text-amber-300 uppercase mt-1">Level 3</span>
            </div>

            {/* Daily Target & Incentive Gauge */}
            <div className="bg-slate-950/90 border border-purple-500/50 rounded-2xl p-4 flex-1 lg:min-w-[220px] text-center space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Today's 10 Duty Targets:
                </span>
                <span className="text-emerald-400 font-mono font-black">{completedDutyTasksCount} / 10</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(5, (completedDutyTasksCount / 10) * 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Daily Incentive Earned:</span>
                <span className="text-base font-black font-mono text-emerald-400">₹{dutyIncentiveEarned}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 flex-wrap border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setActiveCallTab('ai_live_feed')}
            className={`tap-target px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 ${
              activeCallTab === 'ai_live_feed'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>🤖 AI Call Live Feed & Insights</span>
          </button>

          <button
            onClick={() => setActiveCallTab('shopify_customers')}
            className={`tap-target px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 ${
              activeCallTab === 'shopify_customers'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>👥 All Shopify Customers</span>
          </button>

          <button
            onClick={() => setActiveCallTab('daily_duty')}
            className={`tap-target px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 ${
              activeCallTab === 'daily_duty'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ListTodo className="w-4 h-4 text-yellow-300" />
            <span>📋 Today's 10 Duty Tasks</span>
          </button>

          <button
            onClick={() => setActiveCallTab('all')}
            className={`tap-target px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              activeCallTab !== 'daily_duty' && activeCallTab !== 'master_archive' && activeCallTab !== 'ai_live_feed' && activeCallTab !== 'shopify_customers'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>⚡ Live Calling Queue ({amparoCalls.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveCallTab('master_archive');
              if (archiveList.length === 0) handleFetchArchive();
            }}
            className={`tap-target px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              activeCallTab === 'master_archive'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>📜 947+ Shiprocket Archive {archiveList.length > 0 ? `(${archiveList.length})` : ''}</span>
          </button>

          <button
            onClick={handleSyncShiprocket}
            disabled={isSyncingSr}
            className="tap-target px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncingSr ? 'animate-spin' : ''}`} />
            <span>Sync Live Orders</span>
          </button>

          <button
            onClick={handleSyncAiHistory}
            disabled={isSyncingAi}
            className="tap-target px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border border-purple-500/50 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-950/40"
            title="Fetch live recordings, transcripts and AI decisions directly from Bolna"
          >
            <Bot className={`w-3.5 h-3.5 text-purple-400 ${isSyncingAi ? 'animate-spin' : ''}`} />
            <span>{isSyncingAi ? 'Syncing...' : '🔄 Sync AI Calls & Audio'}</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="tap-target px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          {/* ☕ 40-Min Flexible Break Wallet Button */}
          <button
            onClick={handleToggleBreak}
            disabled={!breakStatus.isOnBreak && (breakStatus.isQuotaExhausted || breakStatus.remainingSec <= 0)}
            className={`tap-target px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md ${
              breakStatus.isOnBreak
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white animate-pulse'
                : breakStatus.isQuotaExhausted || breakStatus.remainingSec <= 0
                ? 'bg-slate-900 border border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                : 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200'
            }`}
          >
            <span>{breakStatus.isOnBreak ? '☕' : (breakStatus.isQuotaExhausted || breakStatus.remainingSec <= 0 ? '🔒' : '☕')}</span>
            <span>
              {breakStatus.isOnBreak
                ? `On Break (${Math.floor(breakStatus.remainingSec / 60)}m ${breakStatus.remainingSec % 60}s)`
                : (breakStatus.isQuotaExhausted || breakStatus.remainingSec <= 0)
                ? 'Break Limit (0m left)'
                : `Break (${Math.floor(breakStatus.remainingSec / 60)}m left)`}
            </span>
          </button>

          {/* 🕒 Shift Hours Indicator Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Shift: 11 AM - 5 PM</span>
          </div>
        </div>
      </div>

      {/* 🏖️ Admin Staff Status Paused / Leave Banner */}
      {staffDutyStatus !== 'ACTIVE' && (
        <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/60 text-indigo-100 flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏖️</span>
            <div>
              <h4 className="font-extrabold text-sm text-white">
                Work Status: {staffDutyStatus === 'LEAVE' ? 'On Leave / Chhutti' : 'Shift Paused by Admin Mukul Mishra'}
              </h4>
              <p className="text-xs text-indigo-200">
                Aapka work session admin dwara paused set hai. Maya AI Watchdog is waqt dormant hai aur koi inactivity notice nahi bhejega.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ☕ Active 40-Minute Break Mode Banner */}
      {breakStatus.isOnBreak && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 to-slate-900 border border-amber-500/80 text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-scale-up">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-black/40 border border-amber-500/40 shrink-0">
              <span className="text-xl">☕</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-black">
                  Break Mode Active
                </span>
                <span className="font-extrabold text-sm text-white">
                  40-Minute Official Lunch / Tea Break
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Remaining Time: <strong className="text-amber-300 font-mono text-sm">{Math.floor(breakStatus.remainingSec / 60)}m {breakStatus.remainingSec % 60}s</strong> • Maya AI Supervisor warnings paused hain.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleBreak}
            className="tap-target px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>End Break & Resume Work ➔</span>
          </button>
        </div>
      )}

      {/* 🛡️ Maya AI Supervisor Live Guidance & Strict Attendance Box */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-xl shadow-md">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>Maya AI Supervisor Live HR & Calling Guidance</span>
                </h4>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  attendance.some(a => (a.user_id === currentUser?.id || a.employee_name?.toLowerCase() === currentUser?.name?.toLowerCase()) && a.status === 'present')
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                }`}>
                  {attendance.some(a => (a.user_id === currentUser?.id || a.employee_name?.toLowerCase() === currentUser?.name?.toLowerCase()) && a.status === 'present')
                    ? '✅ WFH Attendance: PRESENT'
                    : '🚨 WFH Haaziri Missing (Salary Cut Risk)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Shift 11:00 AM - 05:00 PM • Strict Attendance & Daily Base Pay Rules Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* 📅 View My Attendance Sheet & Calendar Button */}
            <button
              onClick={() => setShowMyCalendarModal(true)}
              className="tap-target px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>📅 Meri Attendance Sheet</span>
            </button>

            {/* 🏠 1-Click WFH Attendance Punch Button */}
            {(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayRecord = attendance.find(
                a => (a.user_id === currentUser?.id || a.employee_name?.toLowerCase() === currentUser?.name?.toLowerCase()) &&
                     (a.date === todayStr || a.status === 'present')
              );
              const isPresent = Boolean(todayRecord && todayRecord.status === 'present');

              return !isPresent ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDirectWfhPunch}
                    disabled={punchingAttendance}
                    className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/40 transition active:scale-95 animate-bounce-subtle disabled:opacity-50"
                  >
                    <Home className="w-4 h-4" />
                    <span>{punchingAttendance ? 'Punching...' : '🏠 1-Click WFH Attendance'}</span>
                  </button>
                  <button
                    onClick={() => setIsGpsModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    title="Open Full GPS Options"
                  >
                    <Compass className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl px-3.5 py-1.5 shadow-lg shadow-emerald-950/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-300">PRESENT ✅</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-200 bg-emerald-900/60 px-1.5 py-0.2 rounded border border-emerald-500/40 flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-emerald-400 inline" />
                        <span>{todayRecord?.check_in_time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-400/80 font-semibold">
                      🏠 Work From Home Shift Active
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 🌟 Maya AI Real-Time Dynamic Directive & Alert Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* Dynamic Directive Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-950 to-slate-950 border border-purple-500/40 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Bot className="w-4 h-4 text-purple-400 animate-bounce" />
                <span>Maya AI Live HR Supervisor:</span>
              </span>
              {liveGuidance && (
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Target: {liveGuidance.targetFocus} (+₹{liveGuidance.incentiveBoost})
                </span>
              )}
            </div>

            <p className="text-slate-200 leading-relaxed font-medium">
              {liveGuidance ? liveGuidance.adviceHindi : (
                urgentCount > 0
                  ? `🚨 ${urgentCount} Urgent NDR Orders queue me hain (+₹50 bounty per saved order). Customer ko call karke kal ke liye Re-Attempt schedule karein!`
                  : '🎉 All urgent NDR calls processed! Continue with regular orders & repeat customer feedback.'
              )}
            </p>

            {/* 20m Telemetry Meter */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span>20m Clicks: <strong className="text-white font-mono">{liveTelemetry.clickCountInLast20Min}</strong></span>
              <span>Productivity: <strong className="text-emerald-400 font-mono">{liveTelemetry.productivityScore}%</strong></span>
              <span>Idle: <strong className={liveTelemetry.idleMinutes > 15 ? 'text-red-400' : 'text-slate-300'}>{liveTelemetry.idleMinutes}m</strong></span>
            </div>
          </div>

          {/* Audio Alerts & Voice Notification Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-lg flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Objection Pro-Tip:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">11 AM - 5 PM Shift</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Jab customer bole "Delivery boy ka call nahi aaya", toh boliye: <em className="text-white">"Maine courier supervisor ko priority delivery instruction daal di hai, kal dopahar tak parcel mil jayega."</em>
              </p>
            </div>

            {/* Notification Permission Button */}
            {!notifPermission ? (
              <button
                onClick={handleEnableAlerts}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 animate-bounce-subtle"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>🔔 Enable Loud Sound & Push Alerts</span>
              </button>
            ) : (
              <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-[11px] text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Loud Audio Chime Alerts Active</span>
                </span>
                <button
                  onClick={() => {
                    notificationService.playBroadcastChime();
                    notificationService.sendLocalNotification({
                      title: '🔔 Test Notification',
                      body: 'MSR Tracker sound alert perfectly working!'
                    });
                  }}
                  className="text-[10px] bg-emerald-900/80 px-2.5 py-1 rounded-lg text-emerald-200 hover:bg-emerald-800 transition font-mono shadow"
                >
                  🔊 Test Sound Chime
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 🚨 Autonomous Maya AI HR & Supervisor Live Warning Alert Bar */}
      {activeSupervisorWarnings.length > 0 && (
        <div className="space-y-2">
          {activeSupervisorWarnings.map((warn) => (
            <div 
              key={warn.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-scale-up ${
                warn.severity === 'high'
                  ? 'bg-red-950/90 border-red-500/80 text-red-100 shadow-red-950/50'
                  : 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-950/50'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/50 border border-white/20">
                      Maya AI Supervisor Notice
                    </span>
                    <span className="font-extrabold text-xs text-white">{warn.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200 font-medium">{warn.reason}</p>
                  {warn.actionRequired && (
                    <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                      ⚡ Action Required: {warn.actionRequired}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDismissSupervisorWarning(warn.id)}
                className="tap-target px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-200 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Acknowledge & Start Work ➔</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Call Feedback Alert Bar */}
      {aiCallMessage && (
        <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/40 animate-scale-up">
          <Bot className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>{aiCallMessage}</span>
        </div>
      )}

      {/* 👑 Admin Assigned Extra Tasks & Special Missions Banner */}
      {adminAssignedTasks.length > 0 && (
        <div className="space-y-3">
          {adminAssignedTasks.map((task) => {
            const isDone = (task.completedBy || []).some((c) => c.userId === (currentUser?.id || 'usr_priya_telecaller'));
            return (
              <div 
                key={task.id}
                className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl transition animate-scale-up ${
                  isDone
                    ? 'bg-slate-950/80 border-slate-800 opacity-90'
                    : task.priority === 'urgent'
                    ? 'bg-gradient-to-r from-red-950/90 via-slate-950 to-slate-900 border-red-500/80 shadow-red-950/40'
                    : 'bg-gradient-to-r from-emerald-950/90 via-purple-950/80 to-slate-900 border-emerald-500/70 shadow-emerald-950/40'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2.5 rounded-2xl bg-black/50 border border-white/15 shrink-0">
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-black">
                        👑 Admin Mission
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        task.priority === 'urgent'
                          ? 'bg-red-950 border-red-500/50 text-red-300'
                          : 'bg-purple-950 border border-purple-500/50 text-purple-300'
                      }`}>
                        {task.priority === 'urgent' ? '🔥 High Priority' : '⚡ Special Target'}
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-300">
                        Deadline: {task.deadline}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-white leading-snug">{task.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{task.description}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                  <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono font-black text-sm">
                    +₹{task.rewardBounty} Bounty
                  </span>

                  {isDone ? (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed!</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimAdminTask(task)}
                      className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Mark Done & Claim Bounty ➔</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Caller KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="glass-card p-3.5 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Live Incentive</span>
            <Flame className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
          </div>
          <p className="text-xl font-black text-emerald-400 mt-1">₹{totalApprovedIncentive.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">+₹{totalPendingIncentive} (Pending Delivery)</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Urgent RTOs</span>
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <p className="text-xl font-black text-white mt-1">{urgentCount}</p>
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">+₹50 per saved</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Old Customers</span>
            <Repeat className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{oldCustomersCount}</p>
          <p className="text-[10px] text-teal-300 font-semibold mt-0.5">+₹30 per re-order</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Pending Calls</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">+₹20 per confirm</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Maya AI Calls</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{aiCallsCount}</p>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Autonomous</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{confirmedCalls}</p>
          <p className="text-[10px] text-blue-300 font-semibold mt-0.5">Dispatched</p>
        </div>
      </div>

      {/* VIEW 0: 🤖 MAYA AI LIVE CONVERSATION FEED & TELECALLER ACTION ADVISORY */}
      {activeCallTab === 'ai_live_feed' && (
        <div className="glass-card rounded-3xl border border-purple-500/50 p-4 sm:p-6 space-y-5">
          
          {/* Header & Sync Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>Maya AI Live Conversation Feed & Telecaller Action Hub</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer se kya-kya baat hui, live audio recording, speaker dialogue aur next action — telecaller yahan se soch-samajh kar immediate action le sakte hain.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleSyncAiHistory}
                disabled={isSyncingAi}
                className="tap-target px-3.5 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-500/60 text-purple-200 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/40 transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncingAi ? 'animate-spin' : ''}`} />
                <span>{isSyncingAi ? 'Syncing...' : '🔄 Live Sync AI Calls'}</span>
              </button>
            </div>
          </div>

          {/* AI Intelligence Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
              <span className="text-[10px] font-bold uppercase text-purple-300">Total Unique AI Calls</span>
              <p className="text-xl font-black text-white mt-0.5">{(bolnaExecutions && bolnaExecutions.length > 0 ? bolnaExecutions : amparoCalls.filter(c => c.call_source === 'ai_agent' || c.transcript || c.recording_url)).length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase text-emerald-300">🟢 Confirmed (Ready to Ship)</span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{(bolnaExecutions && bolnaExecutions.length > 0 ? bolnaExecutions.filter(c => c.status === 'confirmed' || c.ai_decision === 'confirmed') : amparoCalls.filter(c => c.status === 'confirmed' || c.ai_decision === 'confirmed')).length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <span className="text-[10px] font-bold uppercase text-amber-300">🟠 Rescheduled (Follow-up)</span>
              <p className="text-xl font-black text-amber-400 mt-0.5">{(bolnaExecutions && bolnaExecutions.length > 0 ? bolnaExecutions.filter(c => c.status === 'rescheduled' || c.ai_decision === 'rescheduled') : amparoCalls.filter(c => c.status === 'rescheduled' || c.ai_decision === 'rescheduled')).length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30">
              <span className="text-[10px] font-bold uppercase text-red-300">🔴 Refused (RTO Saved)</span>
              <p className="text-xl font-black text-red-400 mt-0.5">{(bolnaExecutions && bolnaExecutions.length > 0 ? bolnaExecutions.filter(c => c.status === 'rto_lost' || c.ai_decision === 'cancelled' || c.ai_decision === 'fake_order') : amparoCalls.filter(c => c.status === 'rto_lost' || c.ai_decision === 'cancelled')).length}</p>
            </div>
          </div>

          {/* Live Feed Cards Stream */}
          <div className="space-y-4">
            {((bolnaExecutions && bolnaExecutions.length > 0) ? bolnaExecutions : sortedCalls.filter(c => c.recording_url || c.transcript || c.call_source === 'ai_agent' || (c.notes && c.notes.includes('[AI_LOG]')))).length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <Bot className="w-10 h-10 text-purple-400 mx-auto animate-bounce-subtle" />
                <h4 className="text-sm font-bold text-white">Abhi koi Maya AI Call Sync nahi hui hai</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upar <strong className="text-purple-300">"Live Sync AI Calls"</strong> dabayein ya kisi bhi customer ko <strong className="text-emerald-300">"Maya AI Call"</strong> lagayein. Call cut hote hi pura recording, transcript aur smart advice yahan live dikhega!
                </p>
                <button
                  onClick={handleSyncAiHistory}
                  className="tap-target px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Previous Bolna Calls Now</span>
                </button>
              </div>
            ) : (
              ((bolnaExecutions && bolnaExecutions.length > 0) ? bolnaExecutions : sortedCalls.filter(c => c.recording_url || c.transcript || c.call_source === 'ai_agent' || (c.notes && c.notes.includes('[AI_LOG]'))))
                .map((call) => {
                  const isConfirmed = call.status === 'confirmed' || call.ai_decision === 'confirmed';
                  const isRescheduled = call.status === 'rescheduled' || call.ai_decision === 'rescheduled';
                  const isCancelled = call.status === 'rto_lost' || call.ai_decision === 'fake_order' || call.ai_decision === 'cancelled';

                  return (
                    <div
                      key={call.id || call.shopify_order_id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-purple-500/50 transition shadow-xl space-y-3.5"
                    >
                      {/* Card Top: Customer Identity & Status Ribbon */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-base text-white">{call.customer_name}</span>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                              ₹{call.amount || 449} COD
                            </span>
                            <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-lg">
                              {call.shopify_order_id}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                            <a
                              href={`tel:${call.phone}`}
                              className="text-emerald-300 font-bold hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              {call.phone}
                            </a>
                            <span>•</span>
                            <span className="text-slate-300 truncate max-w-[260px]">
                              📦 {call.product}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {isConfirmed && (
                            <span className="px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>CONFIRMED & SHIP</span>
                            </span>
                          )}
                          {isRescheduled && (
                            <span className="px-3 py-1 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-300 font-extrabold text-xs flex items-center gap-1 shadow-sm">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>RESCHEDULED SLOT</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="px-3 py-1 rounded-xl bg-red-950/90 border border-red-500/50 text-red-300 font-extrabold text-xs flex items-center gap-1 shadow-sm">
                              <Ban className="w-3.5 h-3.5 text-red-400" />
                              <span>CANCELLED / FAKE</span>
                            </span>
                          )}
                          {!isConfirmed && !isRescheduled && !isCancelled && (
                            <span className="px-3 py-1 rounded-xl bg-purple-950/90 border border-purple-500/50 text-purple-300 font-bold text-xs">
                              🤖 Maya AI Logged
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 🎙️ Audio Recording & Duration Bar */}
                      {call.recording_url ? (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-300 flex items-center gap-1">
                              <Volume2 className="w-4 h-4 text-emerald-400" />
                              Live Call Audio Recording
                            </span>
                            {call.call_duration_seconds && (
                              <span className="font-mono text-slate-400 font-bold text-[11px]">
                                ⏱️ {call.call_duration_seconds}s Duration
                              </span>
                            )}
                          </div>
                          <audio
                            controls
                            src={call.recording_url}
                            className="w-full h-8 rounded-lg"
                          >
                            Your browser does not support audio element.
                          </audio>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>⚠️ Recording processing me hai. "Live Sync AI Calls" click karein.</span>
                        </div>
                      )}

                      {/* 💡 Maya AI Summary & What Customer Said */}
                      {call.ai_summary && (
                        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                          <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                            Maya AI Summary (Customer Se Kya Baat Hui):
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                            {call.ai_summary}
                          </p>
                        </div>
                      )}

                      {/* 💬 Speaker-by-Speaker Chat Dialogue Box */}
                      {call.transcript && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            Live Dialogue Conversation Transcript:
                          </span>
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 max-h-48 overflow-y-auto space-y-2">
                            {call.transcript.split('\n').filter(Boolean).map((line, idx) => {
                              const isMaya = line.toLowerCase().startsWith('assistant:') || line.toLowerCase().startsWith('maya:');
                              const isUser = line.toLowerCase().startsWith('user:') || line.toLowerCase().startsWith('customer:');
                              const cleanText = line.replace(/^(assistant|maya|user|customer):\s*/i, '').trim();

                              return (
                                <div
                                  key={idx}
                                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                >
                                  <span className="text-[9px] font-bold text-slate-400 mb-0.5">
                                    {isMaya ? '🟣 Maya (AI Executive)' : '🟢 Customer'}
                                  </span>
                                  <div
                                    className={`p-2 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                                      isUser
                                        ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-tr-none'
                                        : 'bg-purple-950/80 border border-purple-500/40 text-purple-100 rounded-tl-none'
                                    }`}
                                  >
                                    {cleanText}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 🧠 Smart Telecaller Action Advisory */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 flex items-start gap-2 text-xs">
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-cyan-300 font-bold">Recommended Human Telecaller Next Step:</strong>
                          <p className="text-slate-200 mt-0.5 leading-relaxed">
                            {isConfirmed
                              ? 'Customer ne order lene ki confirmation di hai. Neeche "Confirm Order" par click karein aur parcel Shiprocket/Delhivery ke sath dispatch karein.'
                              : isRescheduled
                              ? 'Customer ne delivery aage badhane ko kaha hai. WhatsApp template bhejkar customer ko schedule update de dein.'
                              : isCancelled
                              ? 'Customer ne mana kar diya hai. "Cancel Order" mark karein taki bina wajah RTO courier charge na lage.'
                              : 'Call status check karein ya customer ko direct manual call laga kar baat karein.'}
                          </p>
                        </div>
                      </div>

                      {/* ⚡ Instant Action Buttons Bar */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* 🟢 Confirm Button */}
                          <button
                            onClick={() => {
                              updateCallStatus(call.id, 'confirmed');
                              claimTelecallerTaskIncentive(call.id || call.shopify_order_id, 20, 'AI Supervise Confirmation', currentUser);
                              setAiCallMessage(`✅ ${call.customer_name} Confirmed! Telecaller Incentive (+₹20) Added!`);
                              setTimeout(() => setAiCallMessage(''), 4000);
                            }}
                            className="tap-target px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 transition active:scale-95 shadow-md shadow-emerald-600/30"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm & Ship (+₹20)</span>
                          </button>

                          {/* 🟠 Reschedule Button */}
                          <button
                            onClick={() => {
                              updateCallStatus(call.id, 'rescheduled');
                              setAiCallMessage(`🟠 ${call.customer_name} Rescheduled!`);
                              setTimeout(() => setAiCallMessage(''), 4000);
                            }}
                            className="tap-target px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1 transition active:scale-95"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Reschedule</span>
                          </button>

                          {/* 🔴 Cancel Button */}
                          <button
                            onClick={() => {
                              updateCallStatus(call.id, 'rto_lost');
                              setAiCallMessage(`🔴 ${call.customer_name} Cancelled!`);
                              setTimeout(() => setAiCallMessage(''), 4000);
                            }}
                            className="tap-target px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1 transition active:scale-95"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>

                          {/* 💬 WhatsApp Studio */}
                          <button
                            onClick={() => handleOpenWhatsappModal(call)}
                            className="tap-target px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* 👁️ 360 Audit Modal */}
                          <button
                            onClick={() => handleOpenCustomer360(call)}
                            className="tap-target px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-300" />
                            <span>360° Studio</span>
                          </button>

                          {/* 🤖 Re-Dial Maya */}
                          <button
                            onClick={() => handleAiCallButtonClick(call)}
                            className="tap-target px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition active:scale-95"
                          >
                            <Bot className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Re-Dial AI</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
            )}
          </div>

        </div>
      )}

      {/* VIEW: 👥 ALL SHOPIFY CUSTOMERS DIRECTORY */}
      {activeCallTab === 'shopify_customers' && (
        <ShopifyCustomersDirectory />
      )}

      {/* VIEW 1: 📋 MAYA AI DAILY 10 DUTY TASKS SECTION */}
      {activeCallTab === 'daily_duty' && (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl border border-purple-500/40 p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-yellow-300" />
                  <span>Maya AI Daily 10 Duty Targets (Assigned to {currentUser.name})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manual Call / WhatsApp karne par Live Cash Incentive claim karein.
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold font-mono">
                {completedDutyTasksCount} / 10 Completed
              </span>
            </div>

            {/* 10 Duty Tasks Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daily10Tasks.map((task, idx) => {
                const isClaimed = Boolean(
                  task.is_claimed || 
                  task.incentive_status === 'pending_delivery' || 
                  task.handled_by === currentUser.name || 
                  task.call_source === 'telecaller_manual' ||
                  incentives.some(i => (i.order_id === task.id || i.order_id === task.shopify_order_id) && i.user_id === currentUser.id)
                );
                const isDelivered = task.status === 'confirmed' || task.status === 'delivered';
                const cleanDigits = String(task.phone || '').replace(/\D/g, '');
                const isMasked = cleanDigits.length < 10 || String(task.phone || '').includes('xxx');
                const displayPhone = isMasked ? 'Enter Mobile' : task.phone;

                return (
                  <div
                    key={task.id || task.shopify_order_id || idx}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition relative space-y-3 overflow-hidden w-full max-w-full ${
                      isClaimed
                        ? (isDelivered ? 'bg-emerald-950/30 border-emerald-500/60' : 'bg-amber-950/20 border-amber-500/50')
                        : task.task_type === 'RTO_RESCUE'
                        ? 'bg-red-950/20 border-red-500/50 hover:border-red-400'
                        : task.task_type === 'OLD_CUSTOMER_REORDER'
                        ? 'bg-teal-950/20 border-teal-500/50 hover:border-teal-400'
                        : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Task Header */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                          #{idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[150px] sm:max-w-none ${task.badge_color}`}>
                          {task.task_title}
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-black font-mono shrink-0">
                        +₹{task.incentive_amount} Incentive
                      </span>
                    </div>

                    {/* Customer & Product Info with 3D Thumbnail */}
                    <div className="flex items-start gap-2.5 min-w-0 w-full">
                      <div className="shrink-0">
                        <ProductImageBadge productName={task.product || 'Amparo Shilajit Gummies'} size="md" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-white truncate max-w-[130px] sm:max-w-none">{task.customer_name}</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold shrink-0">₹{task.amount} ({task.shopify_order_id})</span>
                        </div>
                        <p className="text-[11px] text-purple-300 font-semibold truncate max-w-full">{task.product || 'Amparo Shilajit Gummies'}</p>

                        {/* Phone with Inline Edit */}
                        <div className="flex items-center gap-2 flex-wrap min-w-0 pt-0.5">
                          {editingPhoneId === task.id ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="tel"
                                autoFocus
                                value={editingPhoneVal}
                                onChange={(e) => setEditingPhoneVal(e.target.value)}
                                placeholder="Enter 10-digit number"
                                className="bg-slate-950 border border-emerald-500 rounded-lg px-2 py-0.5 text-xs font-mono text-emerald-300 w-32 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSavePhoneInline(task.id)}
                                className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPhoneId(task.id);
                                setEditingPhoneVal(isMasked ? '' : String(task.phone).replace(/\D/g, '').slice(-10));
                              }}
                              className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1 transition shrink-0 ${
                                isMasked
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              <Phone className="w-3 h-3 text-amber-400" />
                              <span>{displayPhone}</span>
                              <Edit3 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                            </button>
                          )}
                        </div>

                        {/* 🚚 Real Shiprocket Courier & Delivery Timeline Badge */}
                        <div className="flex items-center gap-1.5 text-[10px] flex-wrap pt-0.5">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold flex items-center gap-1 shrink-0">
                            <Truck className="w-3 h-3 text-blue-400" />
                            <span className="truncate max-w-[100px]">{task.courier_name || 'Shiprocket'}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-semibold flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>EDD: {task.expected_delivery_date || '3-5 दिन'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 💡 Maya AI Smart Calling Tip (Groq Llama 3.3) */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-[11px] text-purple-200 leading-relaxed flex items-start gap-1.5 min-w-0">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-300 shrink-0 mt-0.5" />
                      <span className="break-words">{task.ai_tip}</span>
                    </div>

                    {/* Action Buttons Matrix (Contained 2-Row Strict Grid Layout) */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 w-full">
                      
                      {/* Row 1: Calling & Outreach Tools (Strict 4-Column Grid) */}
                      <div className="grid grid-cols-4 gap-1.5 w-full">
                        <a
                          href={`tel:${task.phone}`}
                          className="tap-target w-full px-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">Call</span>
                        </a>

                        <button
                          onClick={() => handleOpenWhatsappModal(task)}
                          className="tap-target w-full px-1 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleOpenCustomer360(task)}
                          className="tap-target w-full px-1 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                          title="View 360° AI Call Recording, Full Transcript, WhatsApp & Actions"
                        >
                          <Eye className="w-3 h-3 text-purple-300 shrink-0" />
                          <span className="truncate">360°</span>
                        </button>

                        {/* Delegate to Maya AI Dial */}
                        <button
                          onClick={() => handleAiCallButtonClick(task, task.task_type)}
                          className="tap-target w-full px-1 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95"
                          title="Maya AI ko call karne dein"
                        >
                          <Bot className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">AI Dial</span>
                        </button>
                      </div>

                      {/* Row 2: Claim Incentive & Status Badge (Full Width Responsive) */}
                      <div className="pt-1 border-t border-slate-900 w-full">
                        {isClaimed && isDelivered ? (
                          <div className="w-full py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md">
                            <Check className="w-3.5 h-3.5" />
                            <span>✅ Delivered ({task.call_source === 'ai_agent' || task.ai_dialed ? '+₹20 AI' : `+₹${task.incentive_amount} Paid`})</span>
                          </div>
                        ) : isClaimed ? (
                          <div
                            className="w-full py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center justify-center gap-1 opacity-90 text-center"
                            title="Task Done! Customer ko delivery hone par yeh incentive automatic release ho jayega."
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">⏳ Done ({task.call_source === 'ai_agent' || task.ai_dialed ? '+₹20' : `+₹${task.incentive_amount}`} Pending Delivery)</span>
                          </div>
                        ) : task.call_source === 'ai_agent' || task.ai_dialed ? (
                          <button
                            onClick={() => claimTelecallerTaskIncentive(task.id || task.shopify_order_id, 20, task.task_title, currentUser)}
                            className="tap-target w-full py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center justify-center gap-1 shadow-md transition active:scale-95"
                          >
                            <Bot className="w-3.5 h-3.5 text-purple-400" />
                            <span>Claim AI-Assist (+₹20)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => claimTelecallerTaskIncentive(task.id || task.shopify_order_id, task.incentive_amount, task.task_title, currentUser)}
                            className="tap-target w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
                          >
                            <Award className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Done (Claim +₹{task.incentive_amount} Incentive)</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Batch Progress & Completion Celebration Bar */}
            {completedDutyTasksCount === 10 ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-purple-950/80 to-slate-900 border border-emerald-500/50 text-center space-y-3 shadow-xl">
                <Sparkles className="w-8 h-8 text-yellow-300 mx-auto animate-bounce" />
                <div>
                  <h4 className="text-base font-black text-white">
                    🎉 Shabaash {currentUser.name}! Batch #{dutyBatch + 1} ke Sabhi 10 Tasks Complete Ho Gaye!
                  </h4>
                  <p className="text-xs text-emerald-300 font-bold mt-1">
                    Is batch se total +₹{dutyIncentiveEarned} Live Incentive Escrow me claim ho chuka hai.
                  </p>
                </div>
                <button
                  onClick={() => setDutyBatch(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-purple-600/40 transition active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Agla 10 Tasks Batch #{dutyBatch + 2} Load Karein ➔</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2 text-xs text-slate-400 font-medium border-t border-slate-800">
                <span>Batch #{dutyBatch + 1} • <strong className="text-white">{10 - completedDutyTasksCount} tasks</strong> baaki hain</span>
                <span className="text-emerald-400 font-bold font-mono">Incentive: +₹{dutyIncentiveEarned} Earned</span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW 2: 📦 ALL ORDERS CENTER & SEARCH */}
      {activeCallTab !== 'daily_duty' && activeCallTab !== 'master_archive' && (
        <div className="glass-card rounded-3xl border border-slate-800 p-5 space-y-4">
          
          {/* Redesigned Clean Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-white tracking-wide">
                    Shiprocket Orders Center
                  </h3>
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {amparoCalls.length} Total Orders
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">1-Click Maya AI Calling, Audio Recordings, Re-Orders & Shopify Sync</p>
              </div>
            </div>

            {/* ⚡ 1-Click Telecaller Live Sync Button */}
            <button
              onClick={() => setShiprocketModalOpen(true)}
              className="tap-target self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              <span>⚡ Live Sync Shiprocket</span>
            </button>
          </div>

          {/* Search Bar & Date Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, order ID, or AWB tracking..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-auto">
              {[
                { id: 'ALL', label: 'All Time' },
                { id: 'TODAY', label: '📅 Today' },
                { id: 'YESTERDAY', label: 'Yesterday' },
                { id: '7DAYS', label: 'Last 7 Days' }
              ].map((df) => (
                <button
                  key={df.id}
                  onClick={() => setCallDateFilter(df.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    callDateFilter === df.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 border-t border-slate-800/60">
            {[
              { id: 'all', label: `All Orders (${amparoCalls.length})` },
              { id: 'urgent_rto', label: `🚨 Actionable NDR (${urgentCount})`, highlight: true },
              { id: 'office_rto', label: `🏢 Office Return (Gorakhpur Inbound) (${officeRtoCount})`, special: true },
              { id: 'pending', label: `⏳ Pending (${pendingCount})` },
              { id: 'old_customers', label: `🌿 Old Customers (${oldCustomersCount})` },
              { id: 'ai_history', label: `🎧 AI Logs & Audio (${aiCallsCount})` },
              { id: 'ai_confirmed', label: `🟢 Confirmed (${confirmedCalls})` },
              { id: 'ai_fake_cancelled', label: `🔴 Cancelled (${fakeCancelledCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCallTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeCallTab === tab.id
                    ? tab.highlight
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30 font-black'
                      : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Calls List */}
          <div className="space-y-3">
            {filteredCalls.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                <PackageCheck className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Is filter me koi orders nahi mile.</p>
              </div>
            ) : (
              filteredCalls.map((call) => {
                const isCallClaimed = Boolean(
                  call.is_claimed || 
                  call.incentive_status === 'pending_delivery' || 
                  call.handled_by === currentUser.name || 
                  call.call_source === 'telecaller_manual' ||
                  incentives.some(i => (i.order_id === call.id || i.order_id === call.shopify_order_id) && i.user_id === currentUser.id)
                );
                const isCallDelivered = call.status === 'confirmed' || call.status === 'delivered';
                const cleanDigits = String(call.phone || '').replace(/\D/g, '');
                const isMasked = cleanDigits.length < 10 || String(call.phone || '').includes('xxx');
                const displayPhone = isMasked ? 'Enter Mobile' : call.phone;
                const isCallingThis = callingOrderId === (call.id || call.shopify_order_id);
                const isOldCustomer = call.call_type === 'Old Customer Feedback' || call.status === 'confirmed' || call.status === 'delivered';

                return (
                  <div
                    key={call.id || call.shopify_order_id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition space-y-3 ${
                      call.status === 'calling_in_progress'
                        ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/30'
                        : call.urgent_rto
                        ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/30'
                        : isOldCustomer
                        ? 'bg-teal-950/20 border-teal-500/40'
                        : call.status === 'confirmed' || call.status === 'rto_saved'
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : call.status === 'rto_lost' || call.ai_decision === 'fake_order'
                        ? 'bg-red-950/20 border-red-900/60 opacity-80'
                        : 'bg-slate-950/60 border-slate-800'
                    } overflow-hidden w-full max-w-full`}
                  >
                    {/* 1. Header Badges & Customer Info */}
                    <div className="space-y-1.5 w-full min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {/* Status Badges */}
                        {call.status === 'calling_in_progress' && (
                          <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            MAYA CALLING...
                          </span>
                        )}
                        {isOfficeReturningRto(call) && (
                          <span className="bg-amber-950 text-amber-300 border border-amber-500/60 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Building2 className="w-3 h-3 text-amber-400" />
                            🏢 IN-TRANSIT TO GORAKHPUR OFFICE
                          </span>
                        )}
                        {!isOfficeReturningRto(call) && isActionableNdr(call) && (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1 shrink-0">
                            <RotateCw className="w-3 h-3" />
                            🚨 ACTIONABLE NDR (+₹50 BOUNTY)
                          </span>
                        )}
                        {isOldCustomer && (
                          <span className="bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Repeat className="w-3 h-3" />
                            OLD CUSTOMER
                          </span>
                        )}
                        {(call.status === 'confirmed' || call.status === 'rto_saved') && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Truck className="w-3 h-3" />
                            CONFIRMED
                          </span>
                        )}
                        {(call.status === 'rto_lost' || call.ai_decision === 'fake_order') && !isOfficeReturningRto(call) && (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Ban className="w-3 h-3" />
                            CANCEL
                          </span>
                        )}

                        <span className="font-extrabold text-sm text-white truncate max-w-[140px] sm:max-w-none">{call.customer_name}</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold shrink-0">₹{call.amount}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">({call.shopify_order_id})</span>

                        {/* 🚚 AWB Tracking Badge */}
                        {call.shiprocket_shipment_id && call.shiprocket_shipment_id !== 'N/A' && (
                          <span className="bg-blue-950/80 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Truck className="w-3 h-3 text-blue-400" />
                            AWB: {call.shiprocket_shipment_id}
                          </span>
                        )}

                        {/* 📅 Created Order Date Badge */}
                        {call.created_at && (
                          <span className="bg-slate-900 text-slate-300 border border-slate-700/80 text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            {new Date(call.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        )}

                        {call.call_source === 'ai_agent' && (
                          <span className="bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                            🤖 AI Verified
                          </span>
                        )}
                      </div>

                      {/* Phone & Product Row */}
                      <div className="flex items-center gap-2 flex-wrap min-w-0 pt-0.5">
                        {editingPhoneId === call.id ? (
                          <div className="flex items-center gap-1 bg-slate-900 border border-purple-500 rounded-lg p-0.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="tel"
                              value={editingPhoneVal}
                              onChange={(e) => setEditingPhoneVal(e.target.value)}
                              placeholder="10-digit number"
                              maxLength={10}
                              className="bg-transparent text-white font-mono text-xs px-1.5 py-0.5 focus:outline-none w-28"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEditedPhone(call.id)}
                              className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-500"
                              title="Save"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingPhoneId(null)}
                              className="bg-slate-700 text-slate-300 p-1 rounded hover:bg-slate-600"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPhoneId(call.id);
                              setEditingPhoneVal(isMasked ? '' : String(call.phone).replace(/\D/g, '').slice(-10));
                            }}
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1.5 transition shrink-0 ${
                              isMasked
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 hover:bg-amber-900'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{displayPhone}</span>
                            <Edit3 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                          </button>
                        )}

                        <p className="text-xs text-slate-300 font-medium truncate max-w-[200px] sm:max-w-md">{call.product}</p>
                      </div>

                      {/* AI Conversation Snippet / Notes */}
                      <div className="flex items-center gap-2 min-w-0 pt-0.5">
                        <p className="text-[11px] text-slate-400 truncate max-w-full">
                          {call.ai_summary ? `🤖 Maya: "${call.ai_summary}"` : call.notes}
                        </p>
                      </div>
                    </div>

                    {/* 2. Structured Action Command Strip (100% Strict Grid Contained) */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 w-full">
                      
                      {/* Row 1: Calling & Outreach Tools (Grid) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full">
                        {/* 🤖 Trigger Maya AI Call Button */}
                        <button
                          onClick={() => handleAiCallButtonClick(call, isOldCustomer ? 'OLD_CUSTOMER_FEEDBACK' : null)}
                          disabled={isCallingThis}
                          className={`tap-target w-full px-2 py-1.5 rounded-xl text-white font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-md transition active:scale-95 ${
                            isCallingThis
                              ? 'bg-purple-700 cursor-wait animate-pulse'
                              : isOldCustomer
                              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                          }`}
                        >
                          <Bot className={`w-3.5 h-3.5 text-yellow-300 shrink-0 ${isCallingThis ? 'animate-spin' : ''}`} />
                          <span className="truncate">{isCallingThis ? 'Calling...' : (isOldCustomer ? 'Re-Order' : 'Maya Call')}</span>
                        </button>

                        {/* 🔄 Courier NDR Re-Attempt OR 360° Audit */}
                        {isOfficeReturningRto(call) ? (
                          <button
                            onClick={() => handleOpenCustomer360(call)}
                            className="tap-target w-full px-2 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                          >
                            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">Office Return</span>
                          </button>
                        ) : isActionableNdr(call) ? (
                          <button
                            onClick={() => {
                              setNdrModalOrder(call);
                              setNdrAlternatePhone(String(call.phone || '').replace(/\D/g, '').slice(-10));
                              setNdrAddressUpdate('');
                            }}
                            className="tap-target w-full px-1.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-md transition active:scale-95"
                          >
                            <RotateCw className="w-3 h-3 animate-spin-slow shrink-0" />
                            <span className="truncate">Re-Attempt (+₹50)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCustomer360(call)}
                            className="tap-target w-full px-2 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                            <span className="truncate">360° Audit</span>
                          </button>
                        )}

                        {/* Manual Phone Call Link */}
                        <a
                          href={`tel:${call.phone}`}
                          className="tap-target w-full px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <PhoneCall className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">Manual</span>
                        </a>

                        {/* AI WhatsApp Trigger */}
                        <button
                          onClick={() => handleOpenWhatsappModal(call)}
                          className="tap-target w-full px-2 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </button>
                      </div>

                      {/* Row 2: Status Outcome & Incentive Claims (Strict 3-Column Grid) */}
                      <div className="grid grid-cols-3 gap-1.5 w-full pt-1 border-t border-slate-900">
                        <button
                          onClick={() => updateCallStatus(call.id, 'confirmed')}
                          className="tap-target w-full px-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">Confirm</span>
                        </button>

                        {isCallClaimed && isCallDelivered ? (
                          <div className="w-full px-1 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-md text-center">
                            <Check className="w-3 h-3 shrink-0" />
                            <span className="truncate">Delivered (+₹{call.urgent_rto ? 50 : 30})</span>
                          </div>
                        ) : isCallClaimed ? (
                          <div
                            className="w-full px-1 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-black flex items-center justify-center gap-1 opacity-90 text-center"
                          >
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">Pending</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => claimTelecallerTaskIncentive(call.id, call.urgent_rto ? 50 : (call.call_type === 'Old Customer Feedback' ? 30 : 20), call.urgent_rto ? '🚨 RTO Rescued' : 'Order Done', currentUser)}
                            className="tap-target w-full px-1 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{call.urgent_rto ? 'Save (+₹50)' : 'Claim Done'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => updateCallStatus(call.id, 'rto_lost')}
                          className="tap-target w-full px-1 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">Cancel</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 📜 DEDICATED 947+ HISTORICAL SHIPMENTS ARCHIVE (100% SEPARATE FROM ACTIVE DAILY WORK) */}
      {activeCallTab === 'master_archive' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h3 className="font-extrabold text-base text-white">Shiprocket Master Historical Shipments Archive</h3>
                </div>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  Shiprocket account ke pichle sabhi 947 shipments ka master database (Yeh data daily telecaller tasks me mix nahi hota).
                </p>
              </div>

              <button
                onClick={handleFetchArchive}
                disabled={isArchiveLoading}
                className="tap-target px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isArchiveLoading ? 'animate-spin' : ''}`} />
                <span>{isArchiveLoading ? 'Fetching 947 Shipments...' : 'Refresh Full 947 Archive'}</span>
              </button>
            </div>

            {/* Archive Search & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="Search AWB, Order ID, Product..."
                className="w-full sm:w-72 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: `All (${archiveList.length})` },
                  { id: 'DELIVERED', label: `Delivered (${archiveList.filter(s => String(s.status).toUpperCase().includes('DELIVERED') && !String(s.status).toUpperCase().includes('RTO')).length})` },
                  { id: 'RTO DELIVERED', label: `RTO Returned (${archiveList.filter(s => String(s.status).toUpperCase().includes('RTO')).length})` },
                  { id: 'PENDING', label: `Pending (${archiveList.filter(s => String(s.status).toUpperCase().includes('PENDING')).length})` },
                  { id: 'CANCELED', label: `Cancelled (${archiveList.filter(s => String(s.status).toUpperCase().includes('CANCEL')).length})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setArchiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      archiveFilter === f.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Archive Records Table / List */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            {archiveList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto animate-bounce-subtle" />
                <p className="text-sm font-bold text-slate-300">Historical Shipments Archive Abhi Load Nahi Hua Hai</p>
                <button
                  onClick={handleFetchArchive}
                  disabled={isArchiveLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <RefreshCw className={`w-4 h-4 ${isArchiveLoading ? 'animate-spin' : ''}`} />
                  <span>Fetch All 947 Shiprocket Shipments</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">AWB Tracking</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Courier</th>
                      <th className="p-3">Shipment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {archiveList
                      .filter((s) => {
                        if (archiveFilter !== 'ALL') {
                          const st = String(s.status).toUpperCase();
                          if (archiveFilter === 'DELIVERED') {
                            if (!st.includes('DELIVERED') || st.includes('RTO')) return false;
                          } else if (archiveFilter === 'RTO DELIVERED') {
                            if (!st.includes('RTO')) return false;
                          } else if (archiveFilter === 'PENDING') {
                            if (!st.includes('PENDING')) return false;
                          } else if (archiveFilter === 'CANCELED') {
                            if (!st.includes('CANCEL')) return false;
                          }
                        }
                        if (archiveSearch.trim()) {
                          const q = archiveSearch.toLowerCase();
                          const matchAwb = String(s.awb || '').toLowerCase().includes(q);
                          const matchOrd = String(s.order_id || '').toLowerCase().includes(q);
                          const matchProd = String(s.product || '').toLowerCase().includes(q);
                          const matchSt = String(s.status || '').toLowerCase().includes(q);
                          if (!matchAwb && !matchOrd && !matchProd && !matchSt) return false;
                        }
                        return true;
                      })
                      .slice(0, 150)
                      .map((s, idx) => {
                        const stUpper = String(s.status || '').toUpperCase();
                        const isDel = stUpper.includes('DELIVERED') && !stUpper.includes('RTO');
                        const isRto = stUpper.includes('RTO');
                        const isCanc = stUpper.includes('CANCEL');

                        return (
                          <tr key={s.id || idx} className="hover:bg-slate-800/40 transition text-slate-300">
                            <td className="p-3 text-slate-500 font-sans">{idx + 1}</td>
                            <td className="p-3 text-[11px] text-slate-400 font-sans">{s.created_at || 'Past Order'}</td>
                            <td className="p-3 font-bold text-white">#{s.order_id}</td>
                            <td className="p-3 text-blue-400 font-bold">{s.awb || 'N/A'}</td>
                            <td className="p-3 font-sans text-slate-200 max-w-[200px] truncate">{s.product}</td>
                            <td className="p-3 text-slate-400 font-sans">{s.courier || 'Shiprocket'}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 font-sans ${
                                  isDel
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                    : isRto
                                    ? 'bg-red-950 text-red-300 border border-red-500/40'
                                    : isCanc
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Maya AI Direct Dial Modal (If Phone Missing or Confirming) */}
      {aiModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Maya AI Voice Calling</h3>
                  <p className="text-[10px] text-slate-400">
                    Order: {aiModalOrder.customer_name} ({aiModalOrder.shopify_order_id})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAiModalOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Purpose Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">Calling Purpose:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiModalPurpose('ORDER_CONFIRMATION')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    aiModalPurpose === 'ORDER_CONFIRMATION'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  📦 Order Confirmation
                </button>
                <button
                  type="button"
                  onClick={() => setAiModalPurpose('OLD_CUSTOMER_FEEDBACK')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    aiModalPurpose === 'OLD_CUSTOMER_FEEDBACK'
                      ? 'bg-teal-600 text-white border-teal-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🌿 Feedback & Re-Order
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Customer Mobile Number to Dial:
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-400 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  autoFocus
                  maxLength={10}
                  value={aiModalPhone}
                  onChange={(e) => setAiModalPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 bg-slate-900 border border-purple-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Product: {aiModalOrder.product} (COD: ₹{aiModalOrder.amount})
              </p>
            </div>

            <button
              onClick={() => executeAiCall(aiModalOrder, aiModalPhone, aiModalPurpose)}
              disabled={callingOrderId !== null || aiModalPhone.length < 10}
              className="tap-target w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <Bot className="w-4 h-4 text-yellow-300" />
              <span>{callingOrderId ? 'Calling In Progress...' : '🚀 Start Maya AI Voice Call (₹0 Incentive)'}</span>
            </button>

          </div>
        </div>
      )}

      {/* 🌟 CUSTOMER 360° AI CALL AUDIT & ACTION HUB MODAL */}
      {selectedCustomerDetail && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-scale-up"
          onClick={() => setSelectedCustomerDetail(null)}
        >
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-purple-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base sm:text-lg text-white truncate max-w-[180px] sm:max-w-none">
                    {selectedCustomerDetail.customer_name || 'Customer'}
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg shrink-0">
                    ₹{selectedCustomerDetail.amount || 449} COD
                  </span>
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-lg shrink-0">
                    {selectedCustomerDetail.shopify_order_id}
                  </span>
                  {selectedCustomerDetail.status === 'confirmed' && (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
                      CONFIRMED
                    </span>
                  )}
                  {selectedCustomerDetail.status === 'rescheduled' && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
                      RESCHEDULED
                    </span>
                  )}
                  {selectedCustomerDetail.status === 'rto_lost' && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
                      CANCELLED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
                  <span className="flex items-center gap-1 text-emerald-300 font-bold shrink-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedCustomerDetail.phone || 'No Phone'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[280px]">
                    📦 {selectedCustomerDetail.product}
                  </span>
                </div>
              </div>

              {/* Prominent Red Close / Cut Button */}
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="tap-target px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-500/60 text-red-200 font-black text-xs flex items-center gap-1 shrink-0 transition active:scale-95 shadow-md shadow-red-950/50"
                title="Modal band karein (Close)"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>Cut (✕)</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setDetailActiveTab('ai_audit')}
                className={`tap-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  detailActiveTab === 'ai_audit'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-yellow-300" />
                <span>🎙️ AI Call & Transcript</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('whatsapp')}
                className={`tap-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  detailActiveTab === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                <span>💬 WhatsApp & Offers</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('logistics')}
                className={`tap-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  detailActiveTab === 'logistics'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-blue-300" />
                <span>📦 Courier & Address</span>
              </button>
            </div>

            {/* Tab Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">

              {/* TAB 1: AI CALL INTELLIGENCE & AUDIO RECORDING */}
              {detailActiveTab === 'ai_audit' && (
                <div className="space-y-4">
                  {/* Audio Recording Player */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        Live Maya AI Call Recording
                      </span>
                      {selectedCustomerDetail.call_duration_seconds && (
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          ⏱️ {selectedCustomerDetail.call_duration_seconds}s Duration
                        </span>
                      )}
                    </div>

                    {selectedCustomerDetail.recording_url ? (
                      <div className="pt-1">
                        <audio
                          controls
                          src={selectedCustomerDetail.recording_url}
                          className="w-full rounded-xl bg-slate-900"
                        >
                          Your browser does not support audio playback.
                        </audio>
                        <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                          <span>Status: 🟢 Recording Ready</span>
                          <a
                            href={selectedCustomerDetail.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Direct Audio Link
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl">
                        ⚠️ Audio recording processing me hai ya call abhi initiate nahi hui hai. Upar <strong className="text-purple-300">"Sync AI Calls"</strong> dabakar check karein.
                      </div>
                    )}
                  </div>

                  {/* AI Summary & Intent Card */}
                  {selectedCustomerDetail.ai_summary && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span>Maya AI Call Summary & Outcome:</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {selectedCustomerDetail.ai_summary}
                      </p>
                    </div>
                  )}

                  {/* Speaker-by-Speaker Transcript Viewer */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Full Conversation Transcript
                    </span>

                    {selectedCustomerDetail.transcript ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 max-h-64 overflow-y-auto">
                        {selectedCustomerDetail.transcript.split('\n').filter(Boolean).map((line, idx) => {
                          const isMaya = line.toLowerCase().startsWith('assistant:') || line.toLowerCase().startsWith('maya:');
                          const isUser = line.toLowerCase().startsWith('user:') || line.toLowerCase().startsWith('customer:');
                          const cleanText = line.replace(/^(assistant|maya|user|customer):\s*/i, '').trim();

                          return (
                            <div
                              key={idx}
                              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[10px] font-bold mb-0.5 text-slate-400">
                                {isMaya ? '🟣 Maya (AI Executive)' : '🟢 Customer'}
                              </span>
                              <div
                                className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                                  isUser
                                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-tr-none'
                                    : 'bg-purple-950/80 border border-purple-500/40 text-purple-100 rounded-tl-none'
                                }`}
                              >
                                {cleanText}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                        Is call ka transcript available nahi hai. Call lagane ke baad sync karein.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: WHATSAPP QUICK ACTIONS & OFFERS */}
              {detailActiveTab === 'whatsapp' && (
                <div className="space-y-4">
                  {/* Template Selectors */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300">Quick 1-Click Message Templates:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          const prod = selectedCustomerDetail.product || 'Amparo Shilajit Gummies';
                          const id = selectedCustomerDetail.shopify_order_id || '#Order';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\nAapka *Amparo Store* se order *${prod}* (${id}) successfully confirm ho gaya hai aur parcel fresh batch se dispatch kar diya gaya hai. 🌿\n\n💵 *COD Amount:* ₹${selectedCustomerDetail.amount || 449}\n🚚 *Delivery:* 3-5 Din me\n\nDhanyawad! Team Amparo Store 🌿`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        📦 Order Confirmed Notice
                      </button>

                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          const prod = selectedCustomerDetail.product || 'Amparo Shilajit Gummies';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\nAapki request par *${prod}* ki delivery *aaj shaam* ke liye schedule kar di gayi hai. Delivery boy aane se pehle call karega. 🚚\n\nKripya ₹${selectedCustomerDetail.amount || 449} cash ready rakhein. Dhanyawad! 🌿`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        🚚 Rescheduled (Shaam Tak)
                      </button>

                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\n*Amparo Store* se VIP Special Offer! 🎁\n\nAapke number par exclusive *₹50 OFF* coupon code *AMPARO50* activate ho gaya hai. Re-order ya parcel accept karne par direct discount milega.\n\nReply YES to book! 🌿`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        🎁 VIP Discount (AMPARO50)
                      </button>

                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\nAmparo Shilajit Gummies ka regular 60-90 din use karne par 3x stamina aur energy boost milta hai. Best results ke liye daily 1 gummy gun-gune paani ya doodh ke sath lein. 🌿\n\nKoi bhi help chahiye ho to hume message karein!`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        🌿 Ayurvedic Usage Guide
                      </button>
                    </div>
                  </div>

                  {/* Message Editor */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300">Message Preview:</span>
                    <textarea
                      rows={5}
                      value={detailWaMessage}
                      onChange={(e) => setDetailWaMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />
                  </div>

                  {/* WhatsApp Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const clean = String(selectedCustomerDetail.phone).replace(/\D/g, '').slice(-10);
                        const url = `https://web.whatsapp.com/send?phone=91${clean}&text=${encodeURIComponent(detailWaMessage)}`;
                        window.open(url, '_blank');
                      }}
                      className="tap-target py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-600/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send WhatsApp Web</span>
                    </button>

                    <button
                      onClick={() => {
                        const clean = String(selectedCustomerDetail.phone).replace(/\D/g, '').slice(-10);
                        const url = `https://wa.me/91${clean}?text=${encodeURIComponent(detailWaMessage)}`;
                        window.open(url, '_blank');
                      }}
                      className="tap-target py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send WhatsApp Mobile</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: LOGISTICS & ADDRESS */}
              {detailActiveTab === 'logistics' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Courier Partner</span>
                        <p className="font-extrabold text-white">{selectedCustomerDetail.courier_name || 'Shiprocket Partner'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Expected Delivery</span>
                        <p className="font-extrabold text-emerald-400">{selectedCustomerDetail.expected_delivery_date || '3-5 Days'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">AWB / Tracking</span>
                        <p className="font-mono font-bold text-blue-300">{selectedCustomerDetail.awb_code || 'Pending AWB'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Mode</span>
                        <p className="font-bold text-yellow-300">Cash on Delivery (₹{selectedCustomerDetail.amount || 449})</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Delivery Address / City</span>
                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        {selectedCustomerDetail.city || selectedCustomerDetail.notes || 'India'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Direct Action Bar */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    updateCallStatus(selectedCustomerDetail.id, 'confirmed');
                    setSelectedCustomerDetail(prev => ({ ...prev, status: 'confirmed' }));
                    setAiCallMessage(`✅ ${selectedCustomerDetail.customer_name} marked CONFIRMED!`);
                    setTimeout(() => setAiCallMessage(''), 4000);
                  }}
                  className="tap-target py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Order</span>
                </button>

                <button
                  onClick={() => {
                    updateCallStatus(selectedCustomerDetail.id, 'rescheduled');
                    setSelectedCustomerDetail(prev => ({ ...prev, status: 'rescheduled' }));
                    setAiCallMessage(`🟠 ${selectedCustomerDetail.customer_name} marked RESCHEDULED!`);
                    setTimeout(() => setAiCallMessage(''), 4000);
                  }}
                  className="tap-target py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>

                <button
                  onClick={() => {
                    updateCallStatus(selectedCustomerDetail.id, 'rto_lost');
                    setSelectedCustomerDetail(prev => ({ ...prev, status: 'rto_lost' }));
                    setAiCallMessage(`🔴 ${selectedCustomerDetail.customer_name} marked CANCELLED!`);
                    setTimeout(() => setAiCallMessage(''), 4000);
                  }}
                  className="tap-target py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedCustomerDetail(null);
                    setAiModalOrder(selectedCustomerDetail);
                    setAiModalPhone(String(selectedCustomerDetail.phone).replace(/\D/g, '').slice(-10));
                    setAiModalPurpose(selectedCustomerDetail.urgent_rto ? 'RTO_RESCUE' : 'ORDER_CONFIRMATION');
                  }}
                  className="tap-target py-2 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow-md shadow-purple-600/30"
                >
                  <Bot className="w-3.5 h-3.5 text-yellow-300" />
                  <span>🤖 Re-Dial Maya AI</span>
                </button>
              </div>

              {/* Bottom Sticky Return / Close Button */}
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="tap-target w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-black text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 shadow-md"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>Close & Return to Calling Queue (वापस जाएं ✕)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Import Orders & Real Phone Numbers</h3>
                  <p className="text-[10px] text-slate-400">Upload Shopify or Shiprocket exported CSV file</p>
                </div>
              </div>

              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
              <p className="text-xs text-slate-300 leading-relaxed">
                Shopify me **Orders ➔ Export** ya Shiprocket me **Orders ➔ Export** se download ki hui **`.csv` file** yahan select karein:
              </p>

              <label className="tap-target py-4 px-6 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 border-2 border-dashed border-emerald-500/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                <Upload className="w-8 h-8 text-emerald-400 animate-bounce-subtle" />
                <span className="text-xs font-bold text-white">Select `.csv` File from Laptop/Phone</span>
                <span className="text-[10px] text-emerald-400">Instant Unmasked Numbers Sync</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>

              {importStatus && (
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                  {importStatus}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowImportModal(false)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* WhatsApp Sender Modal (With Customer Number, Web Link & Mobile Link) */}
      {activeWhatsappOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Send WhatsApp to Customer</h3>
                  <p className="text-[10px] text-slate-400">{activeWhatsappOrder.customer_name}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveWhatsappOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Phone Field (Direct 10-Digit Input) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Customer Mobile Number (10 Digits):</span>
                {targetPhone && (
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copyPhoneSuccess ? 'Number Copied! ✅' : 'Copy'}</span>
                  </button>
                )}
              </label>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile (e.g. 9876543210)"
                  className="flex-1 bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Message Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>AI Sales Message (Ready to Send):</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copySuccess ? 'Text Copied! ✅' : 'Copy Text'}</span>
                </button>
              </label>

              <textarea
                rows={6}
                value={customWaMessage}
                onChange={(e) => setCustomWaMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            {/* Action Buttons (PC WhatsApp Web & Mobile App) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* WhatsApp Web Button for Laptop / PC */}
              <button
                type="button"
                onClick={handleOpenWhatsAppWeb}
                className="tap-target py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <Monitor className="w-4 h-4" />
                <span>Open WhatsApp Web (PC) ➔</span>
              </button>

              {/* WhatsApp App Button for Mobile */}
              <button
                type="button"
                onClick={handleOpenWhatsAppApp}
                className="tap-target py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in WhatsApp App ➔</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SOP Guide Modal */}
      {showSopModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">Telecaller SOP & Maya AI Calling Rules</h3>
              </div>
              <button
                onClick={() => setShowSopModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {`🤖 **Maya AI Voice Calling SOP Guidelines:**
1. **New Order Confirmation:** Maya confirms product, address & COD amount.
2. **🚨 RTO Rescue (+₹50 Incentive):** Maya coordinates courier re-attempt with buyers whose delivery attempt failed.
3. **🌿 Old Customer Re-Order (+₹30 Incentive):** Maya calls delivered customers for health feedback & books repeat purchases with ₹50 OFF coupon (AMPARO50).
4. **Incentive Rule:**
   • Telecaller khud manually call / WhatsApp karke Done karega ➔ Direct Live Cash Incentive added!
   • Maya AI auto-dial karegi ➔ ₹0 Telecaller incentive.`}
            </div>

            <button
              onClick={() => setShowSopModal(false)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Guide ➔
            </button>

          </div>
        </div>
      )}

      {/* 🔄 MODAL 6: COURIER NDR RE-ATTEMPT & RESCHEDULE (SHIPROCKET DIRECT ACTION) */}
      {ndrModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up my-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <RotateCw className="w-5 h-5 text-amber-400 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <span>Courier Delivery Re-Attempt Schedule</span>
                    <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono px-1.5 py-0.5 rounded">
                      +₹50 Bounty
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Directly send instruction to Shiprocket & Courier Partner</p>
                </div>
              </div>

              <button
                onClick={() => setNdrModalOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Details Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Order ID:</span>
                <span className="font-mono text-white font-bold">{ndrModalOrder.shopify_order_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Customer Name:</span>
                <span className="text-white font-bold">{ndrModalOrder.customer_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">AWB Tracking Code:</span>
                <span className="font-mono text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                  {ndrModalOrder.shiprocket_shipment_id || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Amount:</span>
                <span className="font-mono text-emerald-400 font-bold">₹{ndrModalOrder.amount} (COD)</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              
              {/* 1. Re-Attempt Date Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  📅 Re-Attempt Delivery Date:
                </label>
                <input
                  type="date"
                  value={ndrReattemptDate}
                  onChange={(e) => setNdrReattemptDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. Alternate Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  📞 Alternate Mobile Number (Optional):
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={ndrAlternatePhone}
                  onChange={(e) => setNdrAlternatePhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter alternate 10-digit number if given by buyer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 3. Address Update / Landmark */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  🏠 Updated Address / Landmark (Optional):
                </label>
                <input
                  type="text"
                  value={ndrAddressUpdate}
                  onChange={(e) => setNdrAddressUpdate(e.target.value)}
                  placeholder="e.g. Near Shiv Mandir, Gate No 2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 4. Instructions for Courier Delivery Boy */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  📝 Note for Delivery Boy / Courier Partner:
                </label>
                <textarea
                  rows={2}
                  value={ndrComments}
                  onChange={(e) => setNdrComments(e.target.value)}
                  placeholder="e.g. Customer verified, please call before delivery"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              {/* Mark Return (RTO) */}
              <button
                type="button"
                disabled={ndrSubmitting}
                onClick={() => handleSubmitNdrAction('rto')}
                className="tap-target px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5 text-red-400" />
                <span>Return to Origin (RTO)</span>
              </button>

              {/* Submit Courier Re-Attempt to Shiprocket */}
              <button
                type="button"
                disabled={ndrSubmitting}
                onClick={() => handleSubmitNdrAction('re-attempt')}
                className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ndrSubmitting ? 'animate-spin' : ''}`} />
                <span>{ndrSubmitting ? 'Submitting to Shiprocket...' : '⚡ Submit Re-Attempt (+₹50)'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📅 Personal Attendance Sheet & Calendar Modal */}
      {showMyCalendarModal && (
        <StaffAttendanceCalendarModal
          isOpen={showMyCalendarModal}
          user={currentUser}
          onClose={() => setShowMyCalendarModal(false)}
        />
      )}

      {/* 📍 GPS & WFH Check-In Modal */}
      {isGpsModalOpen && (
        <GpsCheckInModal
          isOpen={isGpsModalOpen}
          onClose={() => setIsGpsModalOpen(false)}
        />
      )}

    </div>
  );
}

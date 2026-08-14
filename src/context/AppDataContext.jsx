// Application Data Context - Single Source of Truth with Real-time A2A Graph Handoffs
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MOCK_AMPARO_CALLS,
  MOCK_MSR_LEADS,
  MOCK_VIDEOS,
  MOCK_FIELD_VISITS,
  MOCK_ATTENDANCE,
  MOCK_REVENUE_LOG,
  MOCK_INCENTIVES,
  MOCK_PAYROLL
} from '../data/mockData';
import { agentMesh } from '../services/agentGraph';
import { checkGeofence } from '../services/geolocation';
import confetti from 'canvas-confetti';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [amparoCalls, setAmparoCalls] = useState(() => {
    const s = localStorage.getItem('msr_amparo_calls');
    return s ? JSON.parse(s) : MOCK_AMPARO_CALLS;
  });

  const [msrLeads, setMsrLeads] = useState(() => {
    const s = localStorage.getItem('msr_leads');
    return s ? JSON.parse(s) : MOCK_MSR_LEADS;
  });

  const [videos, setVideos] = useState(() => {
    const s = localStorage.getItem('msr_videos');
    return s ? JSON.parse(s) : MOCK_VIDEOS;
  });

  const [fieldVisits, setFieldVisits] = useState(() => {
    const s = localStorage.getItem('msr_field_visits');
    return s ? JSON.parse(s) : MOCK_FIELD_VISITS;
  });

  const [attendance, setAttendance] = useState(() => {
    const s = localStorage.getItem('msr_attendance');
    return s ? JSON.parse(s) : MOCK_ATTENDANCE;
  });

  const [revenueLog, setRevenueLog] = useState(() => {
    const s = localStorage.getItem('msr_revenue');
    return s ? JSON.parse(s) : MOCK_REVENUE_LOG;
  });

  const [incentives, setIncentives] = useState(() => {
    const s = localStorage.getItem('msr_incentives');
    return s ? JSON.parse(s) : MOCK_INCENTIVES;
  });

  const [payroll, setPayroll] = useState(() => {
    const s = localStorage.getItem('msr_payroll');
    return s ? JSON.parse(s) : MOCK_PAYROLL;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('msr_amparo_calls', JSON.stringify(amparoCalls));
  }, [amparoCalls]);
  useEffect(() => {
    localStorage.setItem('msr_leads', JSON.stringify(msrLeads));
  }, [msrLeads]);
  useEffect(() => {
    localStorage.setItem('msr_videos', JSON.stringify(videos));
  }, [videos]);
  useEffect(() => {
    localStorage.setItem('msr_field_visits', JSON.stringify(fieldVisits));
  }, [fieldVisits]);
  useEffect(() => {
    localStorage.setItem('msr_attendance', JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem('msr_incentives', JSON.stringify(incentives));
  }, [incentives]);
  useEffect(() => {
    localStorage.setItem('msr_payroll', JSON.stringify(payroll));
  }, [payroll]);

  // Trigger celebration animation
  const triggerWinCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // --- Calling / Amparo Actions ---
  const updateCallStatus = (callId, newStatus, notes = '') => {
    setAmparoCalls((prev) =>
      prev.map((call) => {
        if (call.id === callId) {
          const updated = {
            ...call,
            status: newStatus,
            notes: notes || call.notes,
            urgent_rto: newStatus === 'rto_saved' || newStatus === 'rto_lost' ? false : call.urgent_rto
          };

          if (newStatus === 'rto_saved') {
            triggerWinCelebration();
            agentMesh.broadcastEvent('URGENT_RTO_DETECTED', { callId, status: 'SAVED' });
          }
          return updated;
        }
        return call;
      })
    );
  };

  // --- Lead Actions ---
  const addLead = (leadData, user) => {
    const newLead = {
      id: `lead_${Date.now()}`,
      sourced_by: user.id,
      date: new Date().toISOString().split('T')[0],
      status: 'new',
      converted_by: null,
      ...leadData
    };
    setMsrLeads((prev) => [newLead, ...prev]);
    agentMesh.broadcastEvent('LEAD_SOURCED', newLead);
    return newLead;
  };

  const convertLead = (leadId, convertedByUser, dealAmount = 20000) => {
    setMsrLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          return {
            ...lead,
            status: 'converted',
            converted_by: convertedByUser.id,
            deal_amount: Number(dealAmount)
          };
        }
        return lead;
      })
    );

    // Credit ₹400 deal incentive to user
    const newIncentive = {
      id: `inc_${Date.now()}`,
      user_id: convertedByUser.id,
      userName: convertedByUser.name,
      month: 'August 2026',
      type: 'msr_deal',
      amount: 400,
      title: `Deal Conversion Incentive (₹${dealAmount})`,
      paid: false
    };
    setIncentives((prev) => [newIncentive, ...prev]);

    triggerWinCelebration();
    agentMesh.broadcastEvent('LEAD_CONVERTED', {
      leadId,
      dealAmount,
      convertedBy: convertedByUser.name
    });
  };

  // --- Video Actions ---
  const addVideo = (videoData, user) => {
    const newVideo = {
      id: `vid_${Date.now()}`,
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      status: 'editing',
      ...videoData
    };
    setVideos((prev) => [newVideo, ...prev]);
    return newVideo;
  };

  const updateVideoStatus = (videoId, newStatus, link = '') => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          if (newStatus === 'done' || newStatus === 'posted') {
            triggerWinCelebration();
            agentMesh.broadcastEvent('VIDEO_DELIVERED', { videoId, status: newStatus });
          }
          return { ...v, status: newStatus, link: link || v.link };
        }
        return v;
      })
    );
  };

  // --- Field Visit Actions ---
  const logFieldVisit = (visitData, user, gpsCoordinates) => {
    const newVisit = {
      id: `fld_${Date.now()}`,
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      gps_lat: gpsCoordinates?.lat || 26.7588,
      gps_lng: gpsCoordinates?.lng || 83.3756,
      ...visitData
    };
    setFieldVisits((prev) => [newVisit, ...prev]);

    // If gym sale amount was collected, add field incentive
    if (visitData.type === 'gym_silajit' && Number(visitData.amount) > 0) {
      const comm = Math.round(Number(visitData.amount) * 0.05); // 5% commission
      setIncentives((prev) => [
        {
          id: `inc_${Date.now()}`,
          user_id: user.id,
          userName: user.name,
          month: 'August 2026',
          type: 'amparo_gym_sale',
          amount: comm,
          title: `Gym Silajit Batch Sale (${visitData.name})`,
          paid: false
        },
        ...prev
      ]);
    }

    triggerWinCelebration();
    agentMesh.broadcastEvent('FIELD_VISIT_LOGGED', newVisit);
    return newVisit;
  };

  // --- Attendance Check-in Action ---
  const recordAttendanceCheckIn = (user, gpsCoords) => {
    const geo = checkGeofence(gpsCoords.lat, gpsCoords.lng);
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // For field executives, any GPS check-in is valid with coordinates
    const isFieldRole = user.role === 'field_executive';
    const isPresent = isFieldRole || geo.withinGeofence;

    const newRecord = {
      id: `att_${Date.now()}`,
      user_id: user.id,
      userName: user.name,
      role: user.role,
      date: today,
      check_in_time: timeStr,
      check_in_lat: gpsCoords.lat,
      check_in_lng: gpsCoords.lng,
      within_geofence: isPresent,
      distance_meters: geo.distanceMeters,
      status: isPresent ? 'present' : 'outside_office'
    };

    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(a.user_id === user.id && a.date === today));
      return [newRecord, ...filtered];
    });

    if (!isPresent) {
      agentMesh.broadcastEvent('GEOFENCE_OUTSIDE_DETECTED', newRecord);
    } else {
      triggerWinCelebration();
    }

    return newRecord;
  };

  // --- Payroll Status Update (Manual UPI Payout Confirmation) ---
  const markPayrollPaid = (payrollId, utrNumber) => {
    setPayroll((prev) =>
      prev.map((item) => {
        if (item.id === payrollId) {
          return {
            ...item,
            payment_status: 'paid',
            paid_date: new Date().toLocaleDateString('en-IN'),
            utr_number: utrNumber || `UPI_${Date.now().toString().slice(-6)}`
          };
        }
        return item;
      })
    );
    triggerWinCelebration();
  };

  return (
    <AppDataContext.Provider
      value={{
        amparoCalls,
        msrLeads,
        videos,
        fieldVisits,
        attendance,
        revenueLog,
        incentives,
        payroll,
        updateCallStatus,
        addLead,
        convertLead,
        addVideo,
        updateVideoStatus,
        logFieldVisit,
        recordAttendanceCheckIn,
        markPayrollPaid,
        triggerWinCelebration
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
}

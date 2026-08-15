// Application Data Context - Live Supabase Sync & Real-time Subscriptions with Phone Updater
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
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { agentMesh } from '../services/agentGraph';
import { checkGeofence } from '../services/geolocation';
import confetti from 'canvas-confetti';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [amparoCalls, setAmparoCalls] = useState(MOCK_AMPARO_CALLS);
  const [msrLeads, setMsrLeads] = useState(MOCK_MSR_LEADS);
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [fieldVisits, setFieldVisits] = useState(MOCK_FIELD_VISITS);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [revenueLog, setRevenueLog] = useState(MOCK_REVENUE_LOG);
  const [incentives, setIncentives] = useState(MOCK_INCENTIVES);
  const [payroll, setPayroll] = useState(MOCK_PAYROLL);
  const [dbLoading, setDbLoading] = useState(true);

  // Trigger win celebration confetti
  const triggerWinCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // 1. Initial Data Fetch from Live Supabase
  useEffect(() => {
    async function loadSupabaseData() {
      if (!isSupabaseConfigured()) {
        setDbLoading(false);
        return;
      }

      try {
        setDbLoading(true);

        const [
          callsRes,
          leadsRes,
          videosRes,
          visitsRes,
          attRes,
          revRes,
          incRes,
          payRes
        ] = await Promise.all([
          supabase.from('amparo_calls').select('*').order('created_at', { ascending: false }),
          supabase.from('msr_leads').select('*').order('created_at', { ascending: false }),
          supabase.from('videos').select('*').order('created_at', { ascending: false }),
          supabase.from('field_visits').select('*').order('created_at', { ascending: false }),
          supabase.from('attendance').select('*').order('created_at', { ascending: false }),
          supabase.from('revenue_log').select('*').limit(1),
          supabase.from('incentive_ledger').select('*').order('created_at', { ascending: false }),
          supabase.from('payroll').select('*').order('created_at', { ascending: false })
        ]);

        if (callsRes.data && callsRes.data.length > 0) {
          const parsedCalls = callsRes.data.map((c) => {
            let meta = {};
            if (c.notes && c.notes.includes('[AI_LOG]')) {
              try {
                const match = c.notes.match(/\[AI_LOG\](.*?)\[\/AI_LOG\]/s);
                if (match && match[1]) {
                  meta = JSON.parse(match[1]);
                }
              } catch (e) {}
            }
            return {
              ...c,
              recording_url: meta.recording_url || c.recording_url || null,
              transcript: meta.transcript || c.transcript || null,
              ai_summary: meta.ai_summary || c.ai_summary || null,
              ai_decision: meta.ai_decision || c.ai_decision || null,
              call_duration_seconds: meta.call_duration || c.call_duration_seconds || null,
              call_source: meta.call_source || (meta.recording_url ? 'ai_agent' : c.call_source),
              action_required: meta.action_required || c.action_required || null,
              bolna_call_id: meta.bolna_call_id || c.bolna_call_id || null
            };
          });
          setAmparoCalls(parsedCalls);
        } else {
          await supabase.from('amparo_calls').insert(
            MOCK_AMPARO_CALLS.map(({ id, ...rest }) => rest)
          );
        }

        if (leadsRes.data && leadsRes.data.length > 0) {
          setMsrLeads(leadsRes.data);
        } else {
          await supabase.from('msr_leads').insert(
            MOCK_MSR_LEADS.map(({ id, ...rest }) => rest)
          );
        }

        if (videosRes.data && videosRes.data.length > 0) {
          setVideos(videosRes.data);
        }

        if (visitsRes.data && visitsRes.data.length > 0) {
          setFieldVisits(visitsRes.data);
        }

        if (attRes.data && attRes.data.length > 0) {
          setAttendance(attRes.data);
        }

        if (revRes.data && revRes.data.length > 0) {
          setRevenueLog(revRes.data[0]);
        }

        if (incRes.data && incRes.data.length > 0) {
          setIncentives(incRes.data);
        }

        if (payRes.data && payRes.data.length > 0) {
          setPayroll(payRes.data);
        }
      } catch (err) {
        console.warn('Supabase initial fetch fallback to local store:', err);
      } finally {
        setDbLoading(false);
      }
    }

    loadSupabaseData();

    // 2. Real-time Subscription to Live Database Changes
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('msr_realtime_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'amparo_calls' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setAmparoCalls((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setAmparoCalls((prev) =>
                prev.map((c) => (c.id === payload.new.id ? payload.new : c))
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Update Call Status
  const updateCallStatus = async (callId, newStatus, notes = '') => {
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

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('amparo_calls')
          .update({
            status: newStatus,
            notes: notes || undefined,
            urgent_rto: newStatus === 'rto_saved' || newStatus === 'rto_lost' ? false : undefined
          })
      } catch (e) {}
    }
  };

  // Claim Telecaller Task Incentive (Manual Completion with Live Incentive Credit)
  const claimTelecallerTaskIncentive = async (callId, amount, taskTitle, user) => {
    const newInc = {
      id: `inc_${Date.now()}`,
      user_id: user?.id || 'telecaller_1',
      userName: user?.name || 'Telecaller',
      month: 'August 2026',
      type: 'amparo_calling',
      amount: Number(amount || 50),
      title: taskTitle || 'Task Completed (Manual Call)',
      paid: false,
      created_at: new Date().toISOString()
    };

    setIncentives((prev) => [newInc, ...prev]);

    setAmparoCalls((prev) =>
      prev.map((c) => {
        if (c.id === callId || c.shopify_order_id === callId) {
          return {
            ...c,
            status: taskTitle.includes('RTO') ? 'rto_saved' : 'confirmed',
            handled_by: user?.name || 'Telecaller',
            call_source: 'telecaller_manual',
            urgent_rto: false,
            notes: `✅ Manually Completed by ${user?.name || 'Telecaller'} (+₹${amount} Incentive Claimed)`
          };
        }
        return c;
      })
    );

    triggerWinCelebration();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('incentive_ledger').insert({
          user_id: user?.id || 'telecaller_1',
          userName: user?.name || 'Telecaller',
          month: 'August 2026',
          type: 'amparo_calling',
          amount: Number(amount || 50),
          title: taskTitle || 'Task Completed (Manual Call)',
          paid: false
        });

        await supabase.from('amparo_calls').update({
          status: taskTitle.includes('RTO') ? 'rto_saved' : 'confirmed',
          handled_by: user?.name || 'Telecaller',
          urgent_rto: false,
          notes: `✅ Manually Completed by ${user?.name || 'Telecaller'} (+₹${amount} Incentive Claimed)`
        }).or(`id.eq.${callId},shopify_order_id.eq.${callId}`);
      } catch (e) {
        console.error('Error claiming incentive in Supabase:', e);
      }
    }
  };

  // Trigger Single AI Voice Call via Bolna.ai Netlify Function
  const triggerAiCall = async (orderData) => {
    // 1. Optimistic UI update
    setAmparoCalls((prev) =>
      prev.map((c) =>
        c.id === orderData.id || c.shopify_order_id === orderData.shopify_order_id
          ? { ...c, status: 'calling_in_progress', call_source: 'ai_agent', notes: '🤖 Maya AI Call Initiated...' }
          : c
      )
    );

    try {
      const res = await fetch('/api/bolna-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate AI call');
      }

      const executionId = data.data?.execution_id || data.execution_id;
      if (executionId) {
        // Real-Time Execution Poller (Fetches audio, transcript & intent directly from Bolna)
        const targetId = orderData.id || orderData.shopify_order_id;
        let attempts = 0;
        const maxAttempts = 15;
        const poller = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await fetch(`/api/bolna-status?execution_id=${executionId}`);
            const statusJson = await statusRes.json();
            if (statusJson.success && statusJson.data) {
              const exec = statusJson.data;
              const statusStr = (exec.status || '').toLowerCase();
              const recUrl = exec.recording_url || exec.telephony_data?.recording_url || `https://api.bolna.ai/recordings/call/${executionId}`;
              
              let transText = '';
              if (typeof exec.transcript === 'string') transText = exec.transcript;
              else if (Array.isArray(exec.transcript)) transText = exec.transcript.map(t => `${t.speaker || t.role}: ${t.text || t.message}`).join('\n');
              else if (Array.isArray(exec.conversation_transcript)) transText = exec.conversation_transcript.map(t => `${t.role || t.speaker}: ${t.content || t.message || t.text}`).join('\n');

              const summaryText = exec.summary || exec.call_summary || '';
              const lower = (transText + ' ' + summaryText).toLowerCase();

              let aiDec = 'confirmed';
              let finalSt = orderData.call_purpose === 'RTO_RESCUE' ? 'rto_saved' : 'confirmed';
              if (lower.includes('cancel') || lower.includes('nahi chahiye') || lower.includes('mat bhejo')) {
                aiDec = 'cancelled';
                finalSt = 'rto_lost';
              } else if (lower.includes('reschedule') || lower.includes('baad mein')) {
                aiDec = 'rescheduled';
                finalSt = 'rescheduled';
              }

              if (statusStr === 'completed' || transText || exec.conversation_time || attempts >= maxAttempts) {
                clearInterval(poller);
                const callMeta = {
                  recording_url: recUrl,
                  transcript: transText || 'Call completed successfully.',
                  ai_summary: summaryText || `Maya AI Call Finished (${aiDec.toUpperCase()})`,
                  ai_decision: aiDec,
                  call_duration: Math.round(Number(exec.conversation_duration || exec.duration || 0)),
                  call_source: 'ai_agent',
                  completed_at: new Date().toISOString(),
                  bolna_call_id: executionId
                };

                const notesPayload = `[AI_LOG]${JSON.stringify(callMeta)}[/AI_LOG]`;

                setAmparoCalls(prev => prev.map(c => (c.id === targetId || c.shopify_order_id === targetId) ? {
                  ...c,
                  status: finalSt,
                  recording_url: recUrl,
                  transcript: transText || 'Call completed.',
                  ai_summary: summaryText || `Maya AI: ${aiDec.toUpperCase()}`,
                  ai_decision: aiDec,
                  call_source: 'ai_agent',
                  notes: notesPayload
                } : c));

                if (isSupabaseConfigured()) {
                  if (orderData.id) {
                    await supabase.from('amparo_calls').update({ status: finalSt, notes: notesPayload }).eq('id', orderData.id);
                  } else {
                    await supabase.from('amparo_calls').update({ status: finalSt, notes: notesPayload }).eq('shopify_order_id', orderData.shopify_order_id);
                  }
                }
              }
            }
          } catch (e) {}
          if (attempts >= maxAttempts) clearInterval(poller);
        }, 4000);
      }

      return data;
    } catch (err) {
      console.error('Error triggering AI call:', err);
      // Revert status if error
      setAmparoCalls((prev) =>
        prev.map((c) =>
          c.id === orderData.id || c.shopify_order_id === orderData.shopify_order_id
            ? { ...c, status: 'pending_confirmation', notes: `Call error: ${err.message}` }
            : c
        )
      );
      throw err;
    }
  };

  // Trigger Batch AI Calls for array of orders
  const triggerBatchAiCalls = async (ordersList) => {
    if (!ordersList || ordersList.length === 0) return { total_triggered: 0 };

    const orderIds = new Set(ordersList.map((o) => o.id || o.shopify_order_id));
    setAmparoCalls((prev) =>
      prev.map((c) =>
        orderIds.has(c.id) || orderIds.has(c.shopify_order_id)
          ? { ...c, status: 'calling_in_progress', call_source: 'ai_agent', notes: '🤖 Maya AI Batch Call Initiated...' }
          : c
      )
    );

    try {
      const res = await fetch('/api/bolna-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_orders: ordersList })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to trigger batch AI calls');
      }
      return data;
    } catch (err) {
      console.error('Error in batch AI call:', err);
      throw err;
    }
  };

  // Update Single Call Phone Number Permanently in Supabase DB
  const updateCallPhone = async (callId, newPhone) => {
    const cleanDigits = String(newPhone).replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) return;
    const formatted = `+91${cleanDigits}`;

    setAmparoCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, phone: formatted } : c))
    );

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('amparo_calls')
          .update({ phone: formatted })
          .eq('id', callId);
      } catch (e) {
        console.error('Error updating phone in DB:', e);
      }
    }
  };

  // --- Lead Actions ---
  const addLead = async (leadData, user) => {
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

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('msr_leads').insert({
          lead_name: leadData.lead_name,
          phone: leadData.phone,
          category: leadData.category,
          deal_amount: leadData.deal_amount,
          status: 'new'
        });
      } catch (e) {}
    }

    return newLead;
  };

  const convertLead = async (leadId, convertedByUser, dealAmount = 20000) => {
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

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('msr_leads')
          .update({ status: 'converted', deal_amount: Number(dealAmount) })
          .eq('id', leadId);
      } catch (e) {}
    }
  };

  // --- Video Actions ---
  const addVideo = async (videoData, user) => {
    const newVideo = {
      id: `vid_${Date.now()}`,
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      status: 'editing',
      ...videoData
    };
    setVideos((prev) => [newVideo, ...prev]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('videos').insert({
          client_name: videoData.client_name,
          type: videoData.type,
          link: videoData.link,
          status: 'editing'
        });
      } catch (e) {}
    }
    return newVideo;
  };

  const updateVideoStatus = async (videoId, newStatus, link = '') => {
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

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('videos').update({ status: newStatus, link: link || undefined }).eq('id', videoId);
      } catch (e) {}
    }
  };

  // --- Field Visit Actions ---
  const logFieldVisit = async (visitData, user, gpsCoordinates) => {
    const newVisit = {
      id: `fld_${Date.now()}`,
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      gps_lat: gpsCoordinates?.lat || 26.7588,
      gps_lng: gpsCoordinates?.lng || 83.3756,
      ...visitData
    };
    setFieldVisits((prev) => [newVisit, ...prev]);

    if (visitData.type === 'gym_silajit' && Number(visitData.amount) > 0) {
      const comm = Math.round(Number(visitData.amount) * 0.05);
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

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('field_visits').insert({
          name: visitData.name,
          type: visitData.type,
          location: visitData.location,
          amount: visitData.amount,
          payment_status: visitData.payment_status,
          payment_mode: visitData.payment_mode,
          outcome: visitData.outcome,
          gps_lat: gpsCoordinates?.lat || 26.7588,
          gps_lng: gpsCoordinates?.lng || 83.3756
        });
      } catch (e) {}
    }

    return newVisit;
  };

  // --- Attendance Check-in Action ---
  const recordAttendanceCheckIn = async (user, gpsCoords) => {
    const geo = checkGeofence(gpsCoords.lat, gpsCoords.lng);
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

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

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('attendance').insert({
          date: today,
          check_in_time: timeStr,
          check_in_lat: gpsCoords.lat,
          check_in_lng: gpsCoords.lng,
          within_geofence: isPresent,
          distance_meters: geo.distanceMeters,
          status: isPresent ? 'present' : 'outside_office'
        });
      } catch (e) {}
    }

    return newRecord;
  };

  // --- Payroll Status Update ---
  const markPayrollPaid = async (payrollId, utrNumber) => {
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

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('payroll')
          .update({
            payment_status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            utr_number: utrNumber || `UPI_${Date.now().toString().slice(-6)}`
          })
          .eq('id', payrollId);
      } catch (e) {}
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        amparoCalls,
        setAmparoCalls,
        msrLeads,
        videos,
        fieldVisits,
        attendance,
        revenueLog,
        incentives,
        payroll,
        dbLoading,
        updateCallStatus,
        updateCallPhone,
        claimTelecallerTaskIncentive,
        triggerAiCall,
        triggerBatchAiCalls,
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

// Agent-to-Agent (A2A) LangGraph-style Mesh Orchestrator & Event Network
import { awardAgentXp, appendAgentMemory } from './agentEvolution';

export class AgentGraphNetwork {
  constructor() {
    this.listeners = new Set();
    this.activeSynapses = []; // Tracks live pulsing lines between nodes for UI
    this.history = [];
  }

  // Subscribe to live graph events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.history.unshift(event);
    if (this.history.length > 50) this.history.pop();
    this.listeners.forEach((cb) => {
      try {
        cb(event, this.activeSynapses);
      } catch (err) {
        console.error('Graph listener error:', err);
      }
    });
  }

  /**
   * Triggers a synaptic message between two or more agent nodes
   */
  async dispatchSynapse({ fromAgent, toAgent, actionType, payload, summaryHinglish }) {
    const synapseId = `syn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const synapse = {
      id: synapseId,
      from: fromAgent,
      to: toAgent,
      actionType,
      payload,
      summaryHinglish,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    this.activeSynapses.push(synapse);
    this.notify({ type: 'SYNAPSE_START', synapse });

    // Award XP to sender agent
    awardAgentXp(fromAgent, 15, `Dispatched: ${actionType}`);

    // Simulate Agent processing delay & synapse flash
    setTimeout(() => {
      synapse.status = 'completed';
      awardAgentXp(toAgent, 20, `Processed: ${actionType}`);

      appendAgentMemory({
        agentId: toAgent,
        type: 'A2A_TRANSMISSION',
        content: `[${fromAgent.toUpperCase()} ➔ ${toAgent.toUpperCase()}]: ${summaryHinglish}`
      });

      this.notify({ type: 'SYNAPSE_COMPLETE', synapse });

      // Clean up active synapse from visual graph after 3.5s
      setTimeout(() => {
        this.activeSynapses = this.activeSynapses.filter((s) => s.id !== synapseId);
        this.notify({ type: 'SYNAPSE_CLEARED', synapseId });
      }, 3500);
    }, 1200);

    return synapse;
  }

  /**
   * Broadcast an operational event to the entire Agent Mesh (Consensus)
   */
  broadcastEvent(eventType, eventData) {
    switch (eventType) {
      case 'LEAD_CONVERTED':
        this.dispatchSynapse({
          fromAgent: 'ops_manager',
          toAgent: 'finance_auditor',
          actionType: 'AUDIT_COMMISSION',
          payload: eventData,
          summaryHinglish: `Naya deal convert hua! Finance Agent ₹400 incentive credit calculate kar raha hai.`
        });
        setTimeout(() => {
          this.dispatchSynapse({
            fromAgent: 'finance_auditor',
            toAgent: 'hr_culture',
            actionType: 'CELEBRATE_WIN',
            payload: eventData,
            summaryHinglish: `Incentive verified! HR Agent team ko motivation badge award kar raha hai.`
          });
        }, 1500);
        break;

      case 'URGENT_RTO_DETECTED':
        this.dispatchSynapse({
          fromAgent: 'ops_manager',
          toAgent: 'ops_manager',
          actionType: 'PRIORITIZE_CALL_QUEUE',
          payload: eventData,
          summaryHinglish: `High-risk RTO detect hua! Telecaller queue me sabse upar red alert set kiya gaya.`
        });
        break;

      case 'FIELD_VISIT_LOGGED':
        this.dispatchSynapse({
          fromAgent: 'ops_manager',
          toAgent: 'finance_auditor',
          actionType: 'VERIFY_GPS_PROOF',
          payload: eventData,
          summaryHinglish: `Field Executive ne visit log ki. GPS proof verify kiya gaya.`
        });
        break;

      case 'GEOFENCE_OUTSIDE_DETECTED':
        this.dispatchSynapse({
          fromAgent: 'hr_culture',
          toAgent: 'ops_manager',
          actionType: 'AUDIT_ATTENDANCE_FLAG',
          payload: eventData,
          summaryHinglish: `Check-in geofence se 200m bahar paya gaya. Supportive check-in scheduled.`
        });
        break;

      case 'VIDEO_DELIVERED':
        this.dispatchSynapse({
          fromAgent: 'ops_manager',
          toAgent: 'hr_culture',
          actionType: 'VIDEO_STREAK_PROGRESS',
          payload: eventData,
          summaryHinglish: `Editor ne naya video publish kiya! Daily editing target me progress update hui.`
        });
        break;

      default:
        this.notify({ type: 'EVENT_LOGGED', eventType, eventData });
    }
  }
}

export const agentMesh = new AgentGraphNetwork();

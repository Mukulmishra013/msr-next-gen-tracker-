// Agent Evolution, Experience Points (XP), Levels & Long-Term Memory Engine

const STORAGE_KEY_AGENT_EVOLUTION = 'msr_maya_agent_evolution_v1';
const STORAGE_KEY_AGENT_MEMORIES = 'msr_maya_agent_memories_v1';

export const INITIAL_AGENTS_STATE = {
  ops_manager: {
    id: 'ops_manager',
    name: 'Maya Ops Director',
    role: 'Operations & Task Master',
    avatar: '⚡',
    level: 2,
    xp: 240,
    xpToNextLevel: 500,
    specialty: 'Task allocation, Urgent RTO triage & daily throughput',
    status: 'online',
    stats: { tasksAssigned: 42, rtoTriaged: 18, bottlenecksResolved: 7 },
    personalityTrait: 'Energetic, decisive, structured with warm Hinglish tone',
  },
  hr_culture: {
    id: 'hr_culture',
    name: 'Maya HR & Morale',
    role: 'Culture & Empathy Coach',
    avatar: '💖',
    level: 2,
    xp: 310,
    xpToNextLevel: 500,
    specialty: 'Attendance audits, burnout prevention, gamified streaks',
    status: 'online',
    stats: { checkInsAudited: 68, streaksCelebrated: 14, motivationPushes: 29 },
    personalityTrait: 'Empathetic, celebratory, vigilant about team well-being',
  },
  finance_auditor: {
    id: 'finance_auditor',
    name: 'Maya Finance Sage',
    role: 'Growth Pool & Incentive Auditor',
    avatar: '💰',
    level: 3,
    xp: 560,
    xpToNextLevel: 1000,
    specialty: '8% Growth bonus, GPS-backed deal verification, UPI reconciliation',
    status: 'online',
    stats: { dealsAudited: 31, incentivesCalculated: 12, payrollsPrepared: 4 },
    personalityTrait: 'Precise, mathematically transparent, 100% trustworthy',
  },
  growth_coach: {
    id: 'growth_coach',
    name: 'Maya Performance Mentor',
    role: 'Agency Growth & Strategy Lead',
    avatar: '🚀',
    level: 1,
    xp: 180,
    xpToNextLevel: 250,
    specialty: 'Weekly executive summaries, conversion rate optimization',
    status: 'online',
    stats: { reportsGenerated: 8, tipsDelivered: 19 },
    personalityTrait: 'Visionary, strategic, data-grounded cheerleader',
  }
};

/**
 * Load agent evolution state from LocalStorage or default
 */
export function getAgentEvolutionState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_AGENT_EVOLUTION);
    return data ? JSON.parse(data) : INITIAL_AGENTS_STATE;
  } catch (e) {
    return INITIAL_AGENTS_STATE;
  }
}

/**
 * Save updated evolution state
 */
export function saveAgentEvolutionState(state) {
  try {
    localStorage.setItem(STORAGE_KEY_AGENT_EVOLUTION, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save agent evolution state', e);
  }
}

/**
 * Award XP to an agent when an action or operational event happens
 */
export function awardAgentXp(agentId, xpAmount, reason = '') {
  const state = getAgentEvolutionState();
  const agent = state[agentId];
  if (!agent) return null;

  agent.xp += xpAmount;
  let leveledUp = false;

  while (agent.xp >= agent.xpToNextLevel) {
    agent.xp -= agent.xpToNextLevel;
    agent.level += 1;
    agent.xpToNextLevel = Math.round(agent.xpToNextLevel * 1.5);
    leveledUp = true;
  }

  saveAgentEvolutionState(state);

  // Store memory log of XP gain
  appendAgentMemory({
    agentId,
    type: leveledUp ? 'LEVEL_UP' : 'XP_GAIN',
    content: leveledUp
      ? `${agent.name} LEVEL UP ho kar Level ${agent.level} ban gaye! 🎉 (${reason})`
      : `${agent.name} ko +${xpAmount} XP mila: ${reason}`,
    timestamp: new Date().toISOString()
  });

  return { agent, leveledUp };
}

/**
 * Long-term shared episodic memory
 */
export function getAgentMemories() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_AGENT_MEMORIES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function appendAgentMemory(entry) {
  try {
    const memories = getAgentMemories();
    const newEntry = {
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      ...entry
    };
    memories.unshift(newEntry);
    // Keep last 100 memories
    const truncated = memories.slice(0, 100);
    localStorage.setItem(STORAGE_KEY_AGENT_MEMORIES, JSON.stringify(truncated));
    return newEntry;
  } catch (e) {
    console.warn('Memory store failed', e);
    return null;
  }
}

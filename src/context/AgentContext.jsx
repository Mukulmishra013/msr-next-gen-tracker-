// Agent Context - Manages Multi-Agent Mesh, Evolution XP, and Live Chat
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAgentEvolutionState,
  getAgentMemories,
  awardAgentXp
} from '../services/agentEvolution';
import { agentMesh } from '../services/agentGraph';
import { callAgentAi } from '../services/aiAgents';
import { mayaBridge } from '../services/mayaAgiBridge';

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const [agents, setAgents] = useState(getAgentEvolutionState);
  const [memories, setMemories] = useState(getAgentMemories);
  const [activeSynapses, setActiveSynapses] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('ops_manager');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'agent',
      agentId: 'ops_manager',
      agentName: 'Maya Ops Director',
      agentAvatar: '⚡',
      text: 'Namaste team! Main Maya Ops Director hoon. Aaj ka calling queue, lead quota, aur urgent RTOs live monitor ho rahe hain. Koi bhi madad ya query ho to yahan direct puchiye!',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Subscribe to A2A Graph events
  useEffect(() => {
    const unsubscribe = agentMesh.subscribe((event, synapses) => {
      setActiveSynapses([...synapses]);
      setAgents(getAgentEvolutionState());
      setMemories(getAgentMemories());
    });

    // Initialize Maya AGI handshake (in background)
    mayaBridge.initHandshake();

    return () => unsubscribe();
  }, []);

  // Send message to selected agent
  const sendMessageToAgent = async (userText, contextData = {}) => {
    if (!userText.trim()) return;

    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await callAgentAi({
        agentId: selectedAgentId,
        userMessage: userText,
        contextData
      });

      const currentAgent = agents[selectedAgentId] || agents.ops_manager;

      const agentReply = {
        id: `msg_a_${Date.now()}`,
        sender: 'agent',
        agentId: selectedAgentId,
        agentName: currentAgent.name,
        agentAvatar: currentAgent.avatar,
        text: response,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, agentReply]);
      setAgents(getAgentEvolutionState());
      setMemories(getAgentMemories());
    } catch (err) {
      console.error('Agent chat error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setChatMessages([]);
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        memories,
        activeSynapses,
        selectedAgentId,
        setSelectedAgentId,
        chatMessages,
        isThinking,
        sendMessageToAgent,
        clearChat
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgents must be used within an AgentProvider');
  return context;
}

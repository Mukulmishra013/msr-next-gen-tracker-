// Admin Extra Task & Special Mission Dispatcher Service
// Allows Admin Mukul Mishra to assign custom priority tasks to All Staff or specific Telecallers

import { supervisorAudit } from './supervisorAudit';

const TASKS_STORAGE_KEY = 'msr_admin_assigned_tasks';

class AdminTaskService {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error('AdminTask listener error:', e);
      }
    });
  }

  getTasks() {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'task_init_1',
        title: '🎯 Special Calling Target: Recover 5 High-Value Shilajit COD Orders',
        description: 'Aaj ke urgent RTO queue me se kam se kam 5 customers ko call karke delivery confirm karwayein.',
        rewardBounty: 50,
        priority: 'urgent',
        targetStaff: 'ALL',
        targetStaffName: 'All Team Members',
        createdBy: 'Mukul Mishra',
        createdAt: Date.now() - 3600000,
        deadline: 'Today by 04:30 PM',
        completedBy: []
      }
    ];
  }

  getTasksForUser(userId) {
    const all = this.getTasks();
    return all.filter((t) => t.targetStaff === 'ALL' || t.targetStaff === userId);
  }

  createTask({
    title,
    description,
    rewardBounty = 0,
    priority = 'normal',
    targetStaff = 'ALL',
    targetStaffName = 'All Team Members',
    deadline = 'Today by 05:00 PM',
    createdBy = 'Mukul Mishra'
  }) {
    const all = this.getTasks();
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      description,
      rewardBounty: Number(rewardBounty) || 0,
      priority, // 'normal' | 'high' | 'urgent' | 'bounty'
      targetStaff,
      targetStaffName,
      deadline,
      createdBy,
      createdAt: Date.now(),
      completedBy: []
    };

    const updated = [newTask, ...all];
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    // Add Audit Log
    supervisorAudit.addAuditLog({
      type: 'TASK_ASSIGNED',
      severity: 'info',
      staffName: targetStaffName,
      message: `👑 Admin ${createdBy} ne New Extra Task assign kiya: "${title}" (Target: ${targetStaffName} • Bounty: +₹${rewardBounty})`
    });

    this.notify({ type: 'TASK_CREATED', task: newTask });
    return newTask;
  }

  completeTask(taskId, userId, userName, note = '') {
    const all = this.getTasks();
    const task = all.find((t) => t.id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    const alreadyDone = (task.completedBy || []).some((c) => c.userId === userId);
    if (alreadyDone) {
      return { success: false, error: 'Aapne yeh task pehle hi complete kar liya hai!' };
    }

    const completionRecord = {
      userId,
      userName,
      completedAt: Date.now(),
      note
    };

    task.completedBy = [...(task.completedBy || []), completionRecord];

    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}

    // Record telecaller activity
    supervisorAudit.recordActivity(userId, userName, 'EXTRA_TASK_COMPLETED');

    // Add audit log
    supervisorAudit.addAuditLog({
      type: 'TASK_COMPLETED',
      severity: 'info',
      staffName: userName,
      userId,
      message: `🎉 ${userName} ne Admin Extra Task complete kiya: "${task.title}" (+₹${task.rewardBounty} Bounty Claimed)!`
    });

    this.notify({ type: 'TASK_COMPLETED', taskId, userId });
    return { success: true, bounty: task.rewardBounty };
  }

  deleteTask(taskId) {
    const all = this.getTasks();
    const updated = all.filter((t) => t.id !== taskId);
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    this.notify({ type: 'TASK_DELETED', taskId });
  }
}

export const adminTaskService = new AdminTaskService();

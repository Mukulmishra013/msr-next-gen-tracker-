// Admin Control Center: Comprehensive Multi-Employee Management, Scalable Telecaller Profiles, Work Mode (WFH/Office) & Custom Incentive Rules
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { getStaffWorkMode, setStaffWorkMode } from '../../services/geolocation';
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Plus, 
  X, 
  CheckCircle2, 
  Phone, 
  Mail, 
  CreditCard,
  Key,
  Lock,
  Eye,
  Calendar,
  DollarSign,
  Home,
  Building2,
  Award,
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { StaffAttendanceCalendarModal } from '../attendance/StaffAttendanceCalendarModal';

export function EmployeeManagement() {
  const { availableUsers, addCustomRoleUser, updateUserProfile, deleteUser, switchUserRole, currentUser } = useAuth();
  const { attendance } = useAppData();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewCalendarUser, setViewCalendarUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '+91',
    email: '',
    role: 'content_calling',
    roleLabel: 'Content & Telecalling Closer',
    joining_date: new Date().toISOString().split('T')[0],
    work_mode: 'WFH',
    base_salary: 15000,
    incentive_rto: 50,
    incentive_repeat: 30,
    incentive_confirm: 20,
    upi_id: '',
    password: 'msr' + Math.floor(1000 + Math.random() * 9000)
  });

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    await addCustomRoleUser({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      role: formData.role,
      roleLabel: formData.roleLabel,
      joining_date: formData.joining_date,
      work_mode: formData.work_mode,
      base_salary: Number(formData.base_salary) || 15000,
      incentive_rto: Number(formData.incentive_rto) || 50,
      incentive_repeat: Number(formData.incentive_repeat) || 30,
      incentive_confirm: Number(formData.incentive_confirm) || 20,
      upi_id: formData.upi_id.trim(),
      password: formData.password.trim() || 'msr123'
    });

    setSuccessMsg(`🚀 Employee "${formData.name}" successfully created! Work Mode: ${formData.work_mode === 'WFH' ? 'Work From Home' : 'Office On-Site'} | Login Password: ${formData.password}`);
    setTimeout(() => setSuccessMsg(''), 6000);
    setFormData({
      name: '',
      phone: '+91',
      email: '',
      role: 'content_calling',
      roleLabel: 'Content & Telecalling Closer',
      joining_date: new Date().toISOString().split('T')[0],
      work_mode: 'WFH',
      base_salary: 15000,
      incentive_rto: 50,
      incentive_repeat: 30,
      incentive_confirm: 20,
      upi_id: '',
      password: 'msr' + Math.floor(1000 + Math.random() * 9000)
    });
    setShowAddForm(false);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    await updateUserProfile(editingUser.id, {
      name: editingUser.name,
      phone: editingUser.phone,
      email: editingUser.email,
      role: editingUser.role,
      roleLabel: editingUser.roleLabel,
      joining_date: editingUser.joining_date,
      work_mode: editingUser.work_mode,
      base_salary: Number(editingUser.base_salary) || 15000,
      incentive_rto: Number(editingUser.incentive_rto) || 50,
      incentive_repeat: Number(editingUser.incentive_repeat) || 30,
      incentive_confirm: Number(editingUser.incentive_confirm) || 20,
      upi_id: editingUser.upi_id,
      password: editingUser.password
    });

    setSuccessMsg(`✅ Profile & Salary updated for "${editingUser.name}"!`);
    setTimeout(() => setSuccessMsg(''), 4000);
    setEditingUser(null);
  };

  const handleDeleteEmployee = (userId, name) => {
    if (window.confirm(`Kya aap sach me "${name}" ka profile delete karna chahte hain?`)) {
      deleteUser(userId);
      setSuccessMsg(`Employee "${name}" deleted.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleToggleWorkMode = (user) => {
    const currentMode = getStaffWorkMode(user.id) || user.work_mode || 'WFH';
    const newMode = currentMode === 'WFH' ? 'OFFICE' : 'WFH';
    setStaffWorkMode(user.id, newMode);
    updateUserProfile(user.id, { work_mode: newMode });
    setSuccessMsg(`📍 ${user.name} ka Work Mode "${newMode === 'WFH' ? '🏠 Work From Home (No GPS Lock)' : '🏢 Office On-Site (500m Geofence)'}" set ho gaya!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-800 p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Employee & Scalable Telecaller Department Profiles</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin Mukul Mishra Control: Add multiple telecallers, set joining dates, toggle WFH vs Office, customize salary & per-order incentives.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? '❌ Close Form' : '+ Naya Telecaller / Staff Add Karein'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ➕ Add New Employee Form */}
      {showAddForm && (
        <form onSubmit={handleCreateEmployee} className="p-5 rounded-3xl bg-slate-950/90 border border-emerald-500/40 space-y-4 animate-scale-up shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-black text-sm text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Naye Employee / Telecaller Ka Complete Profile Setup</span>
            </h4>
            <span className="text-[10px] text-slate-400">Scalable Multi-Staff Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Singh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile / WhatsApp No *</label>
              <input
                type="text"
                required
                placeholder="+919876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="priya@msragency.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">📅 Joining Date *</label>
              <input
                type="date"
                required
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Work Mode Toggle (WFH vs Office) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">📍 Work Mode *</label>
              <select
                value={formData.work_mode}
                onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="WFH">🏠 Work From Home (WFH - No GPS Lock)</option>
                <option value="OFFICE">🏢 Office On-Site (500m Geofence Lock)</option>
              </select>
            </div>

            {/* Base Monthly Salary */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">💵 Base Monthly Salary (₹) *</label>
              <input
                type="number"
                required
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Incentive: RTO Rescue */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">🚨 RTO Rescue Incentive (₹/order)</label>
              <input
                type="number"
                value={formData.incentive_rto}
                onChange={(e) => setFormData({ ...formData, incentive_rto: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-yellow-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Incentive: Old Repeat */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">🌿 Re-Order Incentive (₹/order)</label>
              <input
                type="number"
                value={formData.incentive_repeat}
                onChange={(e) => setFormData({ ...formData, incentive_repeat: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-teal-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Incentive: Confirmation */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">📦 Confirmation Incentive (₹/order)</label>
              <input
                type="number"
                value={formData.incentive_confirm}
                onChange={(e) => setFormData({ ...formData, incentive_confirm: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-purple-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">💸 UPI ID (For 1-Tap Payroll)</label>
              <input
                type="text"
                placeholder="priya@okaxis"
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">🔑 Staff Login Password</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Role Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department Role</label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const r = e.target.value;
                  let label = 'Telecaller & Order Confirmation';
                  if (r === 'field_executive') label = 'Field Agent & Doctor Liaison';
                  if (r === 'editor') label = 'Video Editor & Graphic Designer';
                  setFormData({ ...formData, role: r, roleLabel: label });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="content_calling">📞 Content & Telecalling Specialist</option>
                <option value="field_executive">🚗 Field Executive & B2B Liaison</option>
                <option value="editor">🎬 Video Editor & Graphic Designer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
            >
              🚀 Create Employee Account
            </button>
          </div>
        </form>
      )}

      {/* 👥 Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableUsers.map((user) => {
          const isOwner = user.role === 'owner';
          const workMode = getStaffWorkMode(user.id) || user.work_mode || (isOwner ? 'OFFICE' : 'WFH');
          const isWfh = workMode === 'WFH';
          const userAttendance = attendance.filter(a => a.user_id === user.id || a.employee_name?.toLowerCase() === user.name?.toLowerCase());
          const presentDays = userAttendance.filter(a => a.status === 'present').length;

          return (
            <div
              key={user.id}
              className={`p-5 rounded-3xl border transition space-y-4 shadow-xl ${
                isOwner
                  ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/40'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top User Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-2xl shadow-md">
                    {user.avatar || (isOwner ? '👑' : '👩‍💼')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {isOwner && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">Super Admin</span>}
                    </h4>
                    <p className="text-[11px] text-slate-400">{user.roleLabel || user.role}</p>
                    <p className="text-[10px] font-mono text-purple-300 mt-0.5">
                      📅 Joined: {user.joining_date || '2026-08-01'}
                    </p>
                  </div>
                </div>

                {/* Work Mode Badge & Quick Toggle */}
                {!isOwner && (
                  <button
                    onClick={() => handleToggleWorkMode(user)}
                    className={`px-2.5 py-1 rounded-xl border text-[11px] font-black flex items-center gap-1 shadow-sm transition active:scale-95 ${
                      isWfh
                        ? 'bg-blue-950/80 border-blue-500/50 text-blue-300 hover:bg-blue-900'
                        : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
                    }`}
                    title="Click to toggle Work Mode"
                  >
                    {isWfh ? <Home className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                    <span>{isWfh ? '🏠 WFH (No GPS)' : '🏢 Office On-Site'}</span>
                  </button>
                )}
              </div>

              {/* Salary & Incentive Metrics */}
              {!isOwner && (
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Base Salary</span>
                    <p className="text-xs font-black text-emerald-400 font-mono mt-0.5">₹{user.base_salary?.toLocaleString('en-IN') || 15000}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">RTO Bounty</span>
                    <p className="text-xs font-black text-yellow-300 font-mono mt-0.5">+₹{user.incentive_rto || 50}/order</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Haaziri Present</span>
                    <p className="text-xs font-black text-teal-300 font-mono mt-0.5">{presentDays} Days</p>
                  </div>
                </div>
              )}

              {/* Login Credential Info */}
              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{user.phone}</span>
                </span>
                <span className="flex items-center gap-1 font-mono text-amber-300">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Pass: {user.password || 'msr123'}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                {!isOwner ? (
                  <>
                    <button
                      onClick={() => setViewCalendarUser(user)}
                      className="tap-target px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                    >
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>📅 View Attendance Sheet</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                        title="Edit Profile & Salary"
                      >
                        <Edit3 className="w-4 h-4 text-emerald-400" />
                      </button>

                      <button
                        onClick={() => handleDeleteEmployee(user.id, user.name)}
                        className="p-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold transition"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-purple-300 font-bold">
                    Super Admin Profile • Full Agency Governance
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 📝 Edit Employee Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Edit Profile & Salary: {editingUser.name}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={editingUser.joining_date || '2026-08-01'}
                    onChange={(e) => setEditingUser({ ...editingUser, joining_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Work Mode</label>
                  <select
                    value={editingUser.work_mode || 'WFH'}
                    onChange={(e) => setEditingUser({ ...editingUser, work_mode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="WFH">🏠 Work From Home (WFH)</option>
                    <option value="OFFICE">🏢 Office On-Site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Base Salary (₹)</label>
                  <input
                    type="number"
                    value={editingUser.base_salary || 15000}
                    onChange={(e) => setEditingUser({ ...editingUser, base_salary: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">RTO Incentive (₹)</label>
                  <input
                    type="number"
                    value={editingUser.incentive_rto || 50}
                    onChange={(e) => setEditingUser({ ...editingUser, incentive_rto: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-yellow-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow-md transition active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📅 Staff Attendance Calendar Modal */}
      {viewCalendarUser && (
        <StaffAttendanceCalendarModal
          isOpen={Boolean(viewCalendarUser)}
          user={viewCalendarUser}
          onClose={() => setViewCalendarUser(null)}
        />
      )}

    </div>
  );
}

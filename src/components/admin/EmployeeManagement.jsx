// Admin Control Center: Employee Management & Profile Creator
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Key
} from 'lucide-react';

export function EmployeeManagement() {
  const { availableUsers, addCustomRoleUser, currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91',
    email: '',
    role: 'content_calling',
    roleLabel: 'Telecaller & Order Confirmation',
    base_salary: 15000,
    upi_id: '',
    tempPassword: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    addCustomRoleUser({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      role: formData.role,
      roleLabel: formData.roleLabel,
      base_salary: Number(formData.base_salary) || 15000,
      upi_id: formData.upi_id.trim()
    });

    setSuccessMsg(`Employee "${formData.name}" successfully created!`);
    setTimeout(() => setSuccessMsg(''), 3000);
    setFormData({
      name: '',
      phone: '+91',
      email: '',
      role: 'content_calling',
      roleLabel: 'Telecaller & Order Confirmation',
      base_salary: 15000,
      upi_id: '',
      tempPassword: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Employee & Team Profile Management</span>
          </h3>
          <p className="text-xs text-slate-400">
            Admin Access: Mukul Mishra ({currentUser.phone}) — Add, assign roles & set salary for real employees.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Naya Employee Add Karein</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Employee Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreateEmployee} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider">
              Naye Employee Ki Details Bharein
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (Login ke liye) *</label>
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="employee@msrnextgen.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Department *</label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const r = e.target.value;
                  const labels = {
                    content_calling: 'Telecaller & Order Confirmation',
                    editor_leads: 'Video Editor & Lead Scout',
                    field_executive: 'Field Executive & Gym Visits',
                    owner: 'Co-Director / Admin',
                    media_buyer: 'Media Buyer / Ads Manager',
                    graphic_designer: 'Graphic Designer'
                  };
                  setFormData({ ...formData, role: r, roleLabel: labels[r] || r });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="content_calling">📞 Content Calling / Telecaller</option>
                <option value="editor_leads">🎬 Video Editor & Lead Scout</option>
                <option value="field_executive">🛵 Field Executive / Gym Visits</option>
                <option value="media_buyer">📈 Media Buyer / Ads Manager</option>
                <option value="graphic_designer">🎨 Graphic Designer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Base Salary (₹)</label>
              <input
                type="number"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">UPI ID (Salary Payout ke liye)</label>
              <input
                type="text"
                placeholder="name@okaxis"
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="tap-target w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition active:scale-95"
          >
            Save Employee Profile & Grant Login Access ✅
          </button>
        </form>
      )}

      {/* Active Employees Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Role</th>
              <th className="p-3">Contact (Login ID)</th>
              <th className="p-3">Base Salary</th>
              <th className="p-3">UPI ID</th>
              <th className="p-3">Access Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {availableUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <span className="text-xl">{user.avatar || '👤'}</span>
                  <div>
                    <p>{user.name}</p>
                    {user.id === 'usr_admin_mukul' && (
                      <span className="text-[9px] bg-amber-950 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/30">
                        SUPER ADMIN
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-slate-300">
                  <span className="font-semibold text-emerald-400">{user.roleLabel || user.role}</span>
                </td>
                <td className="p-3 font-mono text-slate-300">
                  <p>{user.phone}</p>
                  {user.email && <p className="text-[10px] text-slate-400">{user.email}</p>}
                </td>
                <td className="p-3 font-semibold text-white">
                  ₹{user.base_salary ? user.base_salary.toLocaleString('en-IN') : 'N/A'}
                </td>
                <td className="p-3 font-mono text-slate-400">
                  {user.upi_id || 'Not set'}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    {user.role === 'owner' ? 'Full Admin' : 'Staff Access'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

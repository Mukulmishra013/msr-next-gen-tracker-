// Quick Role Switcher & Custom Role Creator Modal
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Plus, X, Shield, Sparkles } from 'lucide-react';

export function RoleSwitcher({ isOpen, onClose }) {
  const { currentUser, availableUsers, switchUserRole, addCustomRoleUser } = useAuth();
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91',
    role: 'media_buyer',
    roleLabel: 'Media Buyer / Ads Manager',
    base_salary: 16000,
    upi_id: ''
  });

  if (!isOpen) return null;

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    addCustomRoleUser(formData);
    setShowAddCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Select Active Role</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Info */}
        <div className="my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="text-2xl">{currentUser.avatar || '👤'}</div>
          <div>
            <p className="text-xs text-slate-400">Current Login:</p>
            <p className="text-sm font-bold text-white">{currentUser.name} ({currentUser.roleLabel || currentUser.role})</p>
          </div>
        </div>

        {/* Existing Roles List */}
        {!showAddCustom ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {availableUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUserRole(user.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{user.avatar || '👤'}</span>
                    <div>
                      <p className="font-bold text-sm text-white">{user.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{user.roleLabel || user.role}</p>
                    </div>
                  </div>
                  {isSelected && <UserCheck className="w-5 h-5 text-emerald-400" />}
                </button>
              );
            })}

            <button
              onClick={() => setShowAddCustom(true)}
              className="tap-target w-full mt-3 rounded-xl border border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Naya Custom Role Add Karein</span>
            </button>
          </div>
        ) : (
          /* Create Custom Role Form */
          <form onSubmit={handleCreateRole} className="space-y-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Neha Gupta"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title / Designation</label>
              <input
                type="text"
                required
                placeholder="e.g. Media Buyer / Graphic Designer"
                value={formData.roleLabel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roleLabel: e.target.value,
                    role: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Base Salary (₹)</label>
                <input
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">UPI ID (Payouts)</label>
                <input
                  type="text"
                  placeholder="name@okaxis"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                Save Role
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

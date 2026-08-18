import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  ShieldCheck, 
  Key, 
  Lock, 
  Store, 
  Trash2, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { StaffUser, StoreProfile } from '../types';

interface StaffManagementProps {
  staff: StaffUser[];
  stores: StoreProfile[];
  onCreateStaff: (staff: StaffUser) => void;
  onUpdateStaff: (staff: StaffUser) => void;
  onDeleteStaff: (staffId: string) => void;
}

export const StaffManagementView: React.FC<StaffManagementProps> = ({
  staff,
  stores,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [revealedPinId, setRevealedPinId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'cashier'>('cashier');
  const [pin, setPin] = useState('');
  const [assignedStores, setAssignedStores] = useState<string[]>([stores[0]?.id || 'store_01']);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;

    const newStaff: StaffUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      pin,
      assignedStores,
      active: true,
      lastLogin: undefined
    };

    onCreateStaff(newStaff);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('cashier');
    setPin('');
    setAssignedStores([stores[0]?.id || 'store_01']);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Staff Accounts & POS Login Authorization</h1>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
              posUsers Collection
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage PIN logins for billing cashiers on tablet registers, and assign Manager/Admin credentials for back-office access.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Registered POS & Back-Office Staff</h2>
          <span className="text-xs text-slate-400">{staff.length} active users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Name & Email</th>
                <th className="py-3 px-4">Role & Access Level</th>
                <th className="py-3 px-4">POS Quick PIN</th>
                <th className="py-3 px-4">Assigned Stores</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staff.map((user) => {
                const isPinRevealed = revealedPinId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : user.role === 'manager'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-800 tracking-wider">
                          {isPinRevealed ? user.pin : '••••'}
                        </span>
                        <button
                          onClick={() => setRevealedPinId(isPinRevealed ? null : user.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Toggle PIN Visibility"
                        >
                          {isPinRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.assignedStores.map((stId) => {
                          const store = stores.find(s => s.id === stId);
                          return (
                            <span key={stId} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                              {store ? store.code : stId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {user.lastLogin ? (
                        new Date(user.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                      ) : (
                        'Never'
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => onUpdateStaff({ ...user, active: !user.active })}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          user.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}
                      >
                        {user.active ? 'ACTIVE' : 'SUSPENDED'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setConfirmDeleteId(user.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Revoke Staff Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Provision New POS Staff Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Iyer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.pos@store.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role / Privilege</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="cashier">Cashier (POS Checkout Only)</option>
                    <option value="manager">Store Manager</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">4-Digit POS PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="e.g. 4921"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Authorized Store Locations</label>
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {stores.map((s) => (
                    <label key={s.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedStores.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedStores([...assignedStores, s.id]);
                          } else {
                            setAssignedStores(assignedStores.filter(id => id !== s.id));
                          }
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-slate-800 font-medium">{s.name} ({s.code})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Revoke Staff Account?</h3>
            </div>
            <p className="text-xs text-slate-600">
              This staff member will be immediately logged out of all connected tablet POS registers.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStaff(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

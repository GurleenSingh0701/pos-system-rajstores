import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Customer, LoyaltyConfig } from '../types';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  programs: LoyaltyConfig[];
  onUpdate: (customer: Customer) => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  programs,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    gstin: customer.gstin || '',
    loyaltyProgramId: customer.loyaltyProgramId || ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...customer,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      gstin: formData.gstin,
      loyaltyProgramId: formData.loyaltyProgramId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Edit Customer</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
            <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Loyalty Program</label>
            <select value={formData.loyaltyProgramId} onChange={e => setFormData({...formData, loyaltyProgramId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">None</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold">
            <Save className="w-4 h-4" />
            <span>Update Customer</span>
          </button>
        </form>
      </div>
    </div>
  );
};

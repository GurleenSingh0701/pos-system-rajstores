import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Customer } from '../types';

interface BulkAssignCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onAssign: (customerIds: string[]) => void;
  programName: string;
}

export const BulkAssignCustomersModal: React.FC<BulkAssignCustomersModalProps> = ({
  isOpen,
  onClose,
  customers,
  onAssign,
  programName
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onAssign(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Bulk Assign to {programName}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 max-h-96 overflow-y-auto space-y-2">
          {customers.map(c => (
            <div key={c.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
              <input 
                type="checkbox" 
                checked={selectedIds.includes(c.id)}
                onChange={e => {
                  if (e.target.checked) setSelectedIds([...selectedIds, c.id]);
                  else setSelectedIds(selectedIds.filter(id => id !== c.id));
                }}
              />
              <span className="text-sm">{c.name} ({c.phone})</span>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-slate-100">
          <button 
            onClick={handleSubmit}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            <span>Assign {selectedIds.length} Customers</span>
          </button>
        </div>
      </div>
    </div>
  );
};

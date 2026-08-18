import React, { useState } from 'react';
import { X, Save, Edit } from 'lucide-react';
import { LoyaltyConfig } from '../types';

interface EditLoyaltyProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: LoyaltyConfig;
  onUpdate: (program: LoyaltyConfig) => void;
}

export const EditLoyaltyProgramModal: React.FC<EditLoyaltyProgramModalProps> = ({
  isOpen,
  onClose,
  program,
  onUpdate
}) => {
  const [name, setName] = useState(program.name);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Edit Program Name</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <button 
            onClick={() => {
              onUpdate({...program, name});
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

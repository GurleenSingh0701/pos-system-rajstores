import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface CreateLoyaltyProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreateLoyaltyProgramModal: React.FC<CreateLoyaltyProgramModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Create New Program</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input 
            type="text" 
            placeholder="Program Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <button 
            onClick={() => {
              onCreate(name || 'New Program');
              setName('');
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>
      </div>
    </div>
  );
};

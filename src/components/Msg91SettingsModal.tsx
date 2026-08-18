import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import { Msg91Credentials } from '../types';

interface Msg91SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: Msg91Credentials;
  onSave: (creds: Msg91Credentials) => void;
}

export const Msg91SettingsModal: React.FC<Msg91SettingsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSave
}) => {
  const [creds, setCreds] = useState<Msg91Credentials>(credentials);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCreds(prev => ({ ...prev, connectionStatus: 'connected', lastTestedAt: new Date().toISOString() }));
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">MSG91 WhatsApp Setup</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Auth Key</label>
            <input 
              type="password" 
              value={creds.authKey}
              onChange={e => setCreds({...creds, authKey: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Enter MSG91 Auth Key"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Sender ID</label>
            <input 
              type="text" 
              value={creds.senderId}
              onChange={e => setCreds({...creds, senderId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Enter Sender ID"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Template ID</label>
            <input 
              type="text" 
              value={creds.templateId}
              onChange={e => setCreds({...creds, templateId: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Enter Template ID"
            />
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleTest}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg text-xs font-semibold"
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button 
              onClick={() => onSave(creds)}
              className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold"
            >
              <Save className="w-3 h-3" />
              <span>Save & Close</span>
            </button>
          </div>
          
          {creds.connectionStatus === 'connected' && (
            <div className="flex items-center text-emerald-600 bg-emerald-50 p-2 rounded text-xs font-semibold border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Connected Successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

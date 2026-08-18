import React from 'react';

export const WhatsAppSettings: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h3 className="font-bold">WhatsApp Integration Settings</h3>
      <input type="text" placeholder="Meta Access Token" className="w-full p-2 border rounded" />
      <input type="text" placeholder="Phone Number ID" className="w-full p-2 border rounded" />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded">Save Credentials</button>
    </div>
  );
};

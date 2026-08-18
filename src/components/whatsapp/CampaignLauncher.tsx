import React, { useState } from 'react';

export const CampaignLauncher: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h3 className="font-bold">Campaign Dispatch Hub</h3>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`p-2 ${step === s ? 'bg-indigo-100' : 'bg-slate-100'} rounded`}>Step {s}</div>
        ))}
      </div>
      <p>Campaign launching steps will go here.</p>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Plus, Smartphone, Save } from 'lucide-react';
import { WhatsAppTemplate } from '../../types';

export const TemplateBuilder: React.FC = () => {
  const [template, setTemplate] = useState<WhatsAppTemplate>({
    name: 'order_update_v1',
    category: 'UTILITY',
    language: 'en_US',
    bodyText: 'Hello {{1}}, your order {{2}} has been confirmed.',
    status: 'PENDING',
    sampleVariables: { '{{1}}': 'John', '{{2}}': '12345' }
  });

  const validateTemplate = (name: string) => /^[a-z0-9_]+$/.test(name);
  
  const validateBody = (text: string) => {
    // Check for trailing spaces inside brackets: {{ 1 }}
    const trailingSpaces = /\{\{\s+\d+\s*\}\}|\{\{\s*\d+\s+\}\}/.test(text);
    // Check sequential: {{1}} before {{2}}
    const vars = text.match(/\{\{(\d+)\}\}/g) || [];
    let isSequential = true;
    for (let i = 0; i < vars.length; i++) {
        const num = parseInt(vars[i].match(/\d+/)![0]);
        if (num !== i + 1) isSequential = false;
    }
    return !trailingSpaces && isSequential;
  };

  const isBodyValid = validateBody(template.bodyText);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold">Template Configuration</h3>
        <input
          type="text"
          value={template.name}
          onChange={e => setTemplate({...template, name: e.target.value})}
          className={`w-full p-2 border rounded ${!validateTemplate(template.name) ? 'border-red-500' : 'border-slate-300'}`}
          placeholder="template_name"
        />
        <select className="w-full p-2 border rounded" value={template.category} onChange={e => setTemplate({...template, category: e.target.value as any})}>
          <option value="MARKETING">MARKETING</option>
          <option value="UTILITY">UTILITY</option>
          <option value="AUTHENTICATION">AUTHENTICATION</option>
        </select>
        <textarea
          value={template.bodyText}
          onChange={e => setTemplate({...template, bodyText: e.target.value})}
          className="w-full h-40 p-2 border rounded"
        />
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded">
          <Save className="w-4 h-4" /> <span>Save & Submit for Approval</span>
        </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl flex justify-center items-start">
        <div className="w-72 h-[500px] bg-white rounded-3xl p-4 shadow-xl">
          <div className="bg-[#075E54] text-white p-2 rounded-t-lg text-sm">WhatsApp</div>
          <div className="bg-[#DCF8C6] p-3 rounded-b-lg mt-2 text-sm">
            {template.bodyText.replace(/\{\{\d+\}\}/g, (match) => template.sampleVariables[match] || match)}
          </div>
        </div>
      </div>
    </div>
  );
};

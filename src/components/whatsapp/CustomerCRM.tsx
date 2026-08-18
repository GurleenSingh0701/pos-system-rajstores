import React, { useState } from 'react';
import { Customer } from '../../types';

export const CustomerCRM: React.FC = () => {
  const [customers] = useState<Customer[]>([
    { id: '1', name: 'John Doe', phone: '+919999999999', loyaltyPointsBalance: 100, totalSpend: 500, totalVisits: 2, status: 'active', zohoContactId: 'z1' },
  ]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-bold mb-4">Customer Contact CRM</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Phone</th>
            <th className="text-left p-2">Loyalty Points</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.loyaltyPointsBalance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

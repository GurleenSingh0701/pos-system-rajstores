import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Gift, 
  Receipt, 
  Calendar, 
  FileText, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building,
  Plus,
  Edit,
  Tag,
  RefreshCw
} from 'lucide-react';
import { Customer, LoyaltyLedgerEntry, LoyaltyConfig } from '../types';
import { NewCustomerModal } from './NewCustomerModal';
import { EditCustomerModal } from './EditCustomerModal';

interface CustomerManagementProps {
  customers: Customer[];
  loyaltyLedger: LoyaltyLedgerEntry[];
  programs: LoyaltyConfig[];
  onCreateCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onSyncContacts: () => void;
  isSyncing: boolean;
}

export const CustomerManagementView: React.FC<CustomerManagementProps> = ({
  customers,
  loyaltyLedger,
  programs,
  onCreateCustomer,
  onUpdateCustomer,
  onSyncContacts,
  isSyncing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contactTypeFilter, setContactTypeFilter] = useState<'all' | 'customer' | 'vendor'>('all');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (contactTypeFilter === 'vendor') return matchesSearch && c.contactType === 'vendor';
    if (contactTypeFilter === 'customer') return matchesSearch && (c.contactType === 'customer' || !c.contactType);
    return matchesSearch;
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerLedger = loyaltyLedger.filter(e => e.customerId === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programs={programs}
        onCreate={onCreateCustomer}
      />
      {selectedCustomer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={selectedCustomer}
          programs={programs}
          onUpdate={onUpdateCustomer}
        />
      )}

      {/* Header & Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Customer Directory & Purchasing Insights</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              Synced from Zoho Contacts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Differentiate between customers and vendors, view loyalty balances, and inspect past POS purchase histories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            {customers.filter(c => c.contactType !== 'vendor').length} Customers | {customers.filter(c => c.contactType === 'vendor').length} Vendors
          </div>
          <button
            onClick={onSyncContacts}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync from Zoho'}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Directory on left, Customer details drawer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Directory Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search customers by name, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Tabs for Customer vs Vendor */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setContactTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${contactTypeFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setContactTypeFilter('customer')}
                className={`px-2.5 py-1 rounded-md transition-colors ${contactTypeFilter === 'customer' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Customers
              </button>
              <button
                onClick={() => setContactTypeFilter('vendor')}
                className={`px-2.5 py-1 rounded-md transition-colors ${contactTypeFilter === 'vendor' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Vendors
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Contact Name & Type</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Loyalty / Spend</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.map((c) => {
                  const isSelected = selectedCustomerId === c.id;
                  const isVendor = c.contactType === 'vendor';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">{c.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isVendor ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isVendor ? 'Vendor' : 'Customer'}
                          </span>
                        </div>
                        {c.gstin && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">GST: {c.gstin}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700">{c.phone}</div>
                        {c.email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{c.email}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">₹{c.totalSpend.toLocaleString('en-IN')}</div>
                        <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                          {c.loyaltyPointsBalance} pts
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <ChevronRight className={`w-4 h-4 inline-block ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer Details & History Drawer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCustomer ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              {/* Customer Profile Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Zoho Contact #{selectedCustomer.zohoContactId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedCustomer.name}</h3>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-1 flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full hover:bg-indigo-100"
                >
                  <span>Program: {programs.find(p => p.id === selectedCustomer.loyaltyProgramId)?.name || 'None Assigned'}</span>
                  <Edit className="w-3 h-3" />
                </button>
                <div className="text-xs text-slate-500 space-y-0.5 mt-2">
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.gstin && (
                    <div className="flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">GSTIN: {selectedCustomer.gstin}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium block">Loyalty Points Available</span>
                  <div className="text-xl font-bold text-purple-600 mt-1">
                    {selectedCustomer.loyaltyPointsBalance} pts
                  </div>
                  <span className="text-[10px] text-slate-400">Worth ₹{(selectedCustomer.loyaltyPointsBalance * 0.5).toFixed(0)} at checkout</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium block">Lifetime Purchases</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    ₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">{selectedCustomer.totalVisits} Invoices on File</span>
                </div>
              </div>

              {/* Loyalty Activity Log for Customer */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Points & Purchase Activity
                </h4>

                {customerLedger.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-400 text-xs">
                    No recent loyalty activity recorded for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {customerLedger.map((entry) => (
                      <div key={entry.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">{entry.notes || 'POS Checkout'}</span>
                          <span className={`font-bold ${entry.points > 0 ? 'text-emerald-600' : 'text-purple-600'}`}>
                            {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                          <span>{entry.billId || 'Manual adjustment'}</span>
                          <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>Select any customer from the table to view their loyalty audit trail and purchase statistics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Gift, 
  Settings, 
  Search, 
  Clock, 
  Save, 
  AlertTriangle, 
  Check, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Layers,
  Edit,
  Users
} from 'lucide-react';
import { LoyaltyConfig, LoyaltyLedgerEntry, Customer, StoreItem } from '../types';
import { EditLoyaltyProgramModal } from './EditLoyaltyProgramModal';
import { CreateLoyaltyProgramModal } from './CreateLoyaltyProgramModal';
import { BulkAssignCustomersModal } from './BulkAssignCustomersModal';

interface LoyaltyManagementProps {
  programs: LoyaltyConfig[];
  ledger: LoyaltyLedgerEntry[];
  customers: Customer[];
  items: StoreItem[];
  onUpdatePrograms: (programs: LoyaltyConfig[]) => void;
  onAddProgram: (name: string) => void;
  onBulkAssign: (programId: string, customerIds: string[]) => void;
}

export const LoyaltyManagementView: React.FC<LoyaltyManagementProps> = ({
  programs,
  ledger,
  customers,
  items,
  onUpdatePrograms,
  onAddProgram,
  onBulkAssign
}) => {
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyConfig>(programs[0]);
  const [formState, setFormState] = useState<LoyaltyConfig>(programs[0]);

  const zohoCategories = Array.from(new Set(items.map(it => it.category || 'Uncategorized')));

  // Ensure all zohoCategories are present in formState.categoryMultipliers
  const currentMultipliers: Record<string, number> = { ...(formState.categoryMultipliers || {}) };
  zohoCategories.forEach((cat: string) => {
    if (currentMultipliers[cat] === undefined) {
      currentMultipliers[cat] = 1.0;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmRiskModal, setConfirmRiskModal] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);

  const linkedCustomers = customers.filter(c => c.loyaltyProgramId === selectedProgram.id);
  const filteredLedger = ledger.filter(entry => {
    // Only show ledger for selected program (assuming entry has programId or implicitly by customer)
    // For now filtering by ledger entries associated with customers in this program
    const customerInProgram = customers.find(c => c.phone === entry.customerPhone)?.loyaltyProgramId === selectedProgram.id;
    const matchesSearch = entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.customerPhone.includes(searchTerm) ||
                          (entry.billId && entry.billId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || entry.type === selectedType;
    return customerInProgram && matchesSearch && matchesType;
  });

  const totalPointsIssued = ledger.filter(e => {
    const customerInProgram = customers.find(c => c.phone === e.customerPhone)?.loyaltyProgramId === selectedProgram.id;
    return customerInProgram && e.type === 'earned';
  }).reduce((acc, e) => acc + e.points, 0);

  const totalPointsRedeemed = Math.abs(ledger.filter(e => {
    const customerInProgram = customers.find(c => c.phone === e.customerPhone)?.loyaltyProgramId === selectedProgram.id;
    return customerInProgram && e.type === 'redeemed';
  }).reduce((acc, e) => acc + e.points, 0));
  
  const activeLoyaltyLiability = (totalPointsIssued - totalPointsRedeemed) * selectedProgram.rupeeValuePerPoint;

  const handleSaveAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.rupeeValuePerPoint !== selectedProgram.rupeeValuePerPoint || formState.pointsPerRupeeSpent !== selectedProgram.pointsPerRupeeSpent) {
      setConfirmRiskModal(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
    onUpdatePrograms(programs.map(p => p.id === formState.id ? formState : p));
    setSaveSuccess(true);
    setConfirmRiskModal(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <EditLoyaltyProgramModal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        program={selectedProgram}
        onUpdate={(updatedProg) => {
          onUpdatePrograms(programs.map(p => p.id === updatedProg.id ? updatedProg : p));
          setSelectedProgram(updatedProg);
          setFormState(updatedProg);
        }}
      />
      <CreateLoyaltyProgramModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onAddProgram}
      />
      <BulkAssignCustomersModal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        customers={customers.filter(c => c.loyaltyProgramId !== selectedProgram.id)}
        onAssign={(ids) => onBulkAssign(selectedProgram.id, ids)}
        programName={selectedProgram.name}
      />
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Loyalty Program Configuration & Ledger</h1>
            <select 
              value={selectedProgram.id}
              onChange={e => {
                const prog = programs.find(p => p.id === e.target.value)!;
                setSelectedProgram(prog);
                setFormState(prog);
              }}
              className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200"
            >
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button
              onClick={() => setIsEditNameModalOpen(true)}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-semibold"
            >
              + New
            </button>
            <button
              onClick={() => setIsBulkAssignModalOpen(true)}
              className="px-2 py-0.5 bg-slate-600 text-white rounded-full text-xs font-semibold"
            >
              <Users className="w-4 h-4 inline mr-1" />
              Bulk Assign
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {linkedCustomers.length} Customers enrolled in {selectedProgram.name}.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Rules Synced with POS Registers!</span>
          </div>
        )}
      </div>

      {/* Financial Liability Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Points Earned</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">+{totalPointsIssued.toLocaleString('en-IN')} pts</div>
          <p className="text-[11px] text-slate-400 mt-1">Issued across customer checkout invoices</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Points Redeemed</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">-{totalPointsRedeemed.toLocaleString('en-IN')} pts</div>
          <p className="text-[11px] text-slate-400 mt-1">₹{(totalPointsRedeemed * formState.rupeeValuePerPoint).toLocaleString('en-IN')} discount redeemed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Financial Liability</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{activeLoyaltyLiability.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400 mt-1">At ₹{selectedProgram.rupeeValuePerPoint}/point redemption value</p>
        </div>
      </div>

      {/* Rules Configuration & Category Multipliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: Core Rules (7 cols) */}
        <form onSubmit={handleSaveAttempt} className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>Program Earning & Redemption Policy</span>
            </h2>
            <span className="text-[11px] text-slate-400">Last updated: {new Date(selectedProgram.updatedAt).toLocaleDateString()}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 1. Earn Rule */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Earn Rate (Points per ₹ spent)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1.00"
                  value={formState.pointsPerRupeeSpent}
                  onChange={(e) => setFormState({ ...formState, pointsPerRupeeSpent: parseFloat(e.target.value) || 0.05 })}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                1 pt for every ₹{(1 / formState.pointsPerRupeeSpent).toFixed(0)} spent at checkout.
              </p>
            </div>

            {/* 2. Redemption Value */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Redemption Value (₹ per Point)</label>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="5.00"
                  value={formState.rupeeValuePerPoint}
                  onChange={(e) => setFormState({ ...formState, rupeeValuePerPoint: parseFloat(e.target.value) || 0.50 })}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                100 points = ₹{(100 * formState.rupeeValuePerPoint).toFixed(0)} direct discount.
              </p>
            </div>

            {/* 3. Min Redemption Threshold */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Minimum Balance to Redeem</label>
              <input
                type="number"
                min="0"
                step="10"
                value={formState.minRedemptionPoints}
                onChange={(e) => setFormState({ ...formState, minRedemptionPoints: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500">Customer cannot redeem until reaching this balance.</p>
            </div>

            {/* 4. Max % of Bill */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Max Bill Discount Cap (%)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formState.maxDiscountPercentageOfBill}
                  onChange={(e) => setFormState({ ...formState, maxDiscountPercentageOfBill: parseInt(e.target.value) || 50 })}
                  className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-mono font-bold"
                />
                <span className="text-slate-500 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-400">Protects margin on high-ticket sales.</p>
            </div>

            {/* 5. Expiry policy */}
            <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">Points Expiry Window (Months)</label>
                <span className="text-xs text-indigo-600 font-bold">{formState.pointsExpiryMonths} Months</span>
              </div>
              <input
                type="range"
                min={3}
                max={36}
                step={3}
                value={formState.pointsExpiryMonths}
                onChange={(e) => setFormState({ ...formState, pointsExpiryMonths: parseInt(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500">
                Points will expire automatically after {formState.pointsExpiryMonths} months of inactivity.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Publish Rules to POS</span>
            </button>
          </div>
        </form>

        {/* Category Bonus Multipliers (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Percent className="w-4 h-4 text-purple-600" />
              <span>Category Bonus Multipliers</span>
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.isCategoryMultiplierEnabled}
                onChange={(e) => setFormState({ ...formState, isCategoryMultiplierEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <p className="text-xs text-slate-500">
            Boost customer loyalty point earnings on high-margin product categories automatically.
          </p>

          <div className="space-y-3">
            {Object.entries(currentMultipliers).map(([category, multiplier]) => (
              <div key={category} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">{category}</span>
                <div className="flex items-center space-x-2">
                  <select
                    disabled={!formState.isCategoryMultiplierEnabled}
                    value={multiplier}
                    onChange={(e) => {
                      const newMultipliers = {
                        ...currentMultipliers,
                        [category]: parseFloat(e.target.value)
                      };
                      setFormState({ ...formState, categoryMultipliers: newMultipliers });
                    }}
                    className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-purple-700 disabled:opacity-50"
                  >
                    <option value={1.0}>1.0x (Standard)</option>
                    <option value={1.2}>1.2x (+20% bonus)</option>
                    <option value={1.5}>1.5x (+50% bonus)</option>
                    <option value={2.0}>2.0x (Double Points!)</option>
                    <option value={3.0}>3.0x (Triple Points!)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-100 text-[11px] text-purple-900 space-y-1">
            <span className="font-bold">✨ POS Real-Time Calculation:</span>
            <p>
              When a customer purchases items across multiple categories in one bill, the POS engine calculates exact weighted points automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Loyalty Ledger (Audit Trail) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Customer Loyalty Transaction Ledger (Read-Only Audit)</h2>
            <p className="text-xs text-slate-500">Every points transaction is recorded directly from POS checkout receipts</p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by customer, phone, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-64 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All Types</option>
              <option value="earned">Earned Only</option>
              <option value="redeemed">Redeemed Only</option>
              <option value="adjusted">Adjustments</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Customer Name</th>
                <th className="py-2.5 px-4">Phone Number</th>
                <th className="py-2.5 px-4">Transaction Type</th>
                <th className="py-2.5 px-4">Points Delta</th>
                <th className="py-2.5 px-4">New Balance</th>
                <th className="py-2.5 px-4">Bill Ref & Total</th>
                <th className="py-2.5 px-4">Notes / Multiplier</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No ledger transactions matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{entry.customerName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{entry.customerPhone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          entry.type === 'earned'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : entry.type === 'redeemed'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {entry.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-bold ${entry.points > 0 ? 'text-emerald-600' : 'text-purple-600'}`}>
                      {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{entry.balanceAfter} pts</td>
                    <td className="py-3 px-4">
                      {entry.billId ? (
                        <div>
                          <span className="font-mono text-indigo-600 font-semibold">{entry.billId}</span>
                          {entry.billAmount && (
                            <span className="text-slate-400 ml-1.5 text-[11px]">(₹{entry.billAmount})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Manual Entry</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{entry.notes || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Financial Rule Modification */}
      {confirmRiskModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Update Loyalty Financial Policy?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modifying the point conversion rate (<strong>₹{formState.rupeeValuePerPoint}/pt</strong>) or earn ratio directly impacts the monetary liability of existing and future customer balances across all connected POS registers.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmRiskModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Review Again
              </button>
              <button
                onClick={executeSave}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Confirm & Sync POS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

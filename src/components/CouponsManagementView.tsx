import React, { useState } from 'react';
import { 
  TicketPercent, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Check, 
  Calendar, 
  TrendingUp, 
  Share2, 
  Sparkles, 
  AlertCircle,
  Copy,
  Users,
  Edit,
  Tag
} from 'lucide-react';
import { Coupon, Customer } from '../types';

interface CouponsManagementProps {
  coupons: Coupon[];
  categories: string[];
  customers: Customer[];
  onCreateCoupon: (coupon: Coupon) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  onBulkAssignCoupon: (customerIds: string[], couponId: string) => void;
}

export const CouponsManagementView: React.FC<CouponsManagementProps> = ({
  coupons,
  categories,
  customers,
  onCreateCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
  onBulkAssignCoupon
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWhatsAppBroadcastModal, setShowWhatsAppBroadcastModal] = useState<Coupon | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Edit Coupon Modal State
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDiscountType, setEditDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [editDiscountValue, setEditDiscountValue] = useState<number>(15);
  const [editMaxDiscount, setEditMaxDiscount] = useState<number>(500);
  const [editMinBill, setEditMinBill] = useState<number>(1500);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editUsageLimit, setEditUsageLimit] = useState<number>(500);
  const [editBroadcastEligible, setEditBroadcastEligible] = useState<boolean>(true);
  const [editApplicableCategories, setEditApplicableCategories] = useState<string[]>([]);

  // Bulk Assign to Customers Modal State
  const [assigningCoupon, setAssigningCoupon] = useState<Coupon | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [assignSuccessMsg, setAssignSuccessMsg] = useState(false);

  // New Coupon Form State
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [maxDiscount, setMaxDiscount] = useState<number>(500);
  const [minBillValue, setMinBillValue] = useState<number>(1500);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [isBroadcastEligible, setIsBroadcastEligible] = useState<boolean>(true);
  const [newApplicableCategories, setNewApplicableCategories] = useState<string[]>([]);

  // WhatsApp Broadcast Template Preview State
  const [broadcastTargetGroup, setBroadcastTargetGroup] = useState<string>('all_active');
  const [broadcastSentSuccess, setBroadcastSentSuccess] = useState(false);

  // Analytics Summaries
  const totalDiscountsGiven = coupons.reduce((acc, c) => acc + c.totalDiscountGiven, 0);
  const totalSalesDriven = coupons.reduce((acc, c) => acc + c.associatedSalesVolume, 0);
  const totalRedemptions = coupons.reduce((acc, c) => acc + c.usedCount, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newCoupon: Coupon = {
      id: `cp_${Date.now()}`,
      code: newCode.toUpperCase().replace(/\s+/g, ''),
      description: newDesc,
      discountType,
      discountValue,
      maxDiscountAmount: discountType === 'percentage' ? maxDiscount : undefined,
      minBillValue,
      startDate,
      endDate,
      totalUsageLimit: usageLimit,
      customerUsageLimit: 1,
      usedCount: 0,
      totalDiscountGiven: 0,
      associatedSalesVolume: 0,
      applicableCategories: newApplicableCategories,
      isActive: true,
      isWhatsAppBroadcastEligible: isBroadcastEligible,
      createdAt: new Date().toISOString()
    };

    onCreateCoupon(newCoupon);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editCode.trim()) return;

    const updatedCoupon: Coupon = {
      ...editingCoupon,
      code: editCode.toUpperCase().replace(/\s+/g, ''),
      description: editDesc,
      discountType: editDiscountType,
      discountValue: editDiscountValue,
      maxDiscountAmount: editDiscountType === 'percentage' ? editMaxDiscount : undefined,
      minBillValue: editMinBill,
      startDate: editStartDate,
      endDate: editEndDate,
      totalUsageLimit: editUsageLimit,
      applicableCategories: editApplicableCategories,
      isWhatsAppBroadcastEligible: editBroadcastEligible
    };

    onUpdateCoupon(updatedCoupon);
    setEditingCoupon(null);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditCode(coupon.code);
    setEditDesc(coupon.description);
    setEditDiscountType(coupon.discountType);
    setEditDiscountValue(coupon.discountValue);
    setEditMaxDiscount(coupon.maxDiscountAmount || 500);
    setEditMinBill(coupon.minBillValue);
    setEditStartDate(coupon.startDate);
    setEditEndDate(coupon.endDate);
    setEditUsageLimit(coupon.totalUsageLimit || 500);
    setEditBroadcastEligible(coupon.isWhatsAppBroadcastEligible ?? true);
    setEditApplicableCategories(coupon.applicableCategories || []);
  };

  const resetForm = () => {
    setNewCode('');
    setNewDesc('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setMaxDiscount(500);
    setMinBillValue(1500);
    setNewApplicableCategories([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendWhatsAppBroadcast = () => {
    setBroadcastSentSuccess(true);
    setTimeout(() => {
      setBroadcastSentSuccess(false);
      setShowWhatsAppBroadcastModal(null);
    }, 2500);
  };

  const filteredCustomersForAssign = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.phone.includes(customerSearchTerm) ||
    (c.email && c.email.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  );

  const handleExecuteBulkAssign = () => {
    if (!assigningCoupon || selectedCustomerIds.length === 0) return;
    onBulkAssignCoupon(selectedCustomerIds, assigningCoupon.id);
    setAssignSuccessMsg(true);
    setTimeout(() => {
      setAssignSuccessMsg(false);
      setAssigningCoupon(null);
      setSelectedCustomerIds([]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Coupon & Promo Code Management</h1>
            <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
              WhatsApp Broadcast Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create store promo codes, configure min-bill rules, track redemption conversion, and distribute instant WhatsApp alerts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      {/* Conversion & Revenue Impact Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Sales Generated</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalSalesDriven.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Revenue influenced by active promo campaigns</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Redemptions</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{totalRedemptions.toLocaleString('en-IN')} checkouts</div>
          <p className="text-[11px] text-slate-400 mt-1">Applied across registered POS registers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Discounts Given</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">₹{totalDiscountsGiven.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400 mt-1">Effective marketing discount cost: {((totalDiscountsGiven / (totalSalesDriven || 1)) * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Coupons Directory & Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Active & Historical Promo Codes</h2>
          <span className="text-xs text-slate-400">{coupons.length} total codes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Coupon Code & Details</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Eligibility & Min Bill</th>
                <th className="py-3 px-4">Validity Range</th>
                <th className="py-3 px-4">Usage / Cap</th>
                <th className="py-3 px-4">Sales Driven</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.endDate) < new Date();

                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/80">
                    {/* Code & Description */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-slate-400 hover:text-indigo-600"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 max-w-xs">{coupon.description}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {(!coupon.applicableCategories || coupon.applicableCategories.length === 0) ? (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-emerald-200">
                            All Items (Global)
                          </span>
                        ) : (
                          coupon.applicableCategories.map(cat => (
                            <span key={cat} className="bg-purple-50 text-purple-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-purple-200">
                              {cat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-indigo-700">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} FLAT OFF`}
                      </div>
                      {coupon.maxDiscountAmount && (
                        <div className="text-[10px] text-slate-400">Max Cap: ₹{coupon.maxDiscountAmount}</div>
                      )}
                    </td>

                    {/* Min Bill */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Min. ₹{coupon.minBillValue}</div>
                      <div className="text-[10px] text-slate-400">1 use / customer</div>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">
                        {coupon.startDate} to {coupon.endDate}
                      </div>
                      {isExpired && (
                        <span className="text-[10px] text-red-500 font-semibold">Expired</span>
                      )}
                    </td>

                    {/* Usage */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {coupon.usedCount} / {coupon.totalUsageLimit || '∞'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ₹{coupon.totalDiscountGiven.toLocaleString('en-IN')} disbursed
                      </div>
                    </td>

                    {/* Sales Volume */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-600">
                        ₹{coupon.associatedSalesVolume.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Active Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onUpdateCoupon({ ...coupon, isActive: !coupon.isActive })}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          coupon.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {coupon.isActive ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setAssigningCoupon(coupon);
                            setSelectedCustomerIds([]);
                            setCustomerSearchTerm('');
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Assign to Customers"
                        >
                          <Users className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Coupon & Categories"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {coupon.isWhatsAppBroadcastEligible && (
                          <button
                            onClick={() => setShowWhatsAppBroadcastModal(coupon)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Distribute via WhatsApp Business Broadcast"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setConfirmDeleteId(coupon.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Edit Promo Code: {editingCoupon.code}</h3>
              <button
                onClick={() => setEditingCoupon(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Mode</label>
                  <select
                    value={editDiscountType}
                    onChange={(e) => setEditDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {editDiscountType === 'percentage' ? 'Discount %' : 'Flat ₹'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
                {editDiscountType === 'percentage' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Max Cap (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={editMaxDiscount}
                      onChange={(e) => setEditMaxDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                )}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Bill (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editMinBill}
                    onChange={(e) => setEditMinBill(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Applicable Categories Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Applicable Categories</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (editApplicableCategories.length === categories.length) {
                        setEditApplicableCategories([]);
                      } else {
                        setEditApplicableCategories([...categories]);
                      }
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    {editApplicableCategories.length === categories.length ? 'Deselect All' : 'Select All Categories'}
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1">
                  <div className="text-[11px] text-slate-500 mb-1 font-medium">
                    {editApplicableCategories.length === 0 ? '✨ Applicable to All Items / All Categories' : `Selected: ${editApplicableCategories.join(', ')}`}
                  </div>
                  {categories.map(cat => {
                    const isChecked = editApplicableCategories.includes(cat);
                    return (
                      <label key={cat} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-slate-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditApplicableCategories([...editApplicableCategories, cat]);
                            } else {
                              setEditApplicableCategories(editApplicableCategories.filter(c => c !== cat));
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-slate-800 font-medium">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">WhatsApp Broadcast Eligible</span>
                </div>
                <input
                  type="checkbox"
                  checked={editBroadcastEligible}
                  onChange={(e) => setEditBroadcastEligible(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Assign Coupon Modal */}
      {assigningCoupon && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-sm">Assign "{assigningCoupon.code}" to Customers</h3>
              </div>
              <button
                onClick={() => setAssigningCoupon(null)}
                className="text-indigo-100 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers by name or phone..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-3 text-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Select Contacts ({selectedCustomerIds.length} selected)</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCustomerIds.length === filteredCustomersForAssign.length) {
                      setSelectedCustomerIds([]);
                    } else {
                      setSelectedCustomerIds(filteredCustomersForAssign.map(c => c.id));
                    }
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  {selectedCustomerIds.length === filteredCustomersForAssign.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50">
                {filteredCustomersForAssign.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No contacts found</div>
                ) : (
                  filteredCustomersForAssign.map(c => {
                    const isChecked = selectedCustomerIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center justify-between p-2 rounded hover:bg-white cursor-pointer border border-transparent hover:border-slate-200">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setSelectedCustomerIds(prev =>
                                e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id)
                              );
                            }}
                            className="rounded text-indigo-600"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">{c.name}</span>
                            <span className="text-[10px] text-slate-500">{c.phone}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.contactType === 'vendor' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {c.contactType === 'vendor' ? 'Vendor' : 'Customer'}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {assignSuccessMsg ? (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Promo code assigned successfully!</span>
                </div>
              ) : (
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssigningCoupon(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={selectedCustomerIds.length === 0}
                    onClick={handleExecuteBulkAssign}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    Assign to {selectedCustomerIds.length} Contact(s)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Create New Store Promo Code</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              {/* Promo Code & Description */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Mode</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Customer Banner</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% off on orders above ₹1,500"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              {/* Discount Value & Max Cap */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {discountType === 'percentage' ? 'Discount %' : 'Flat ₹'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  />
                </div>

                {discountType === 'percentage' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Max Cap (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Bill Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minBillValue}
                    onChange={(e) => setMinBillValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Applicable Categories Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Applicable Categories</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (newApplicableCategories.length === categories.length) {
                        setNewApplicableCategories([]);
                      } else {
                        setNewApplicableCategories([...categories]);
                      }
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    {newApplicableCategories.length === categories.length ? 'Deselect All' : 'Select All Categories'}
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1">
                  <div className="text-[11px] text-slate-500 mb-1 font-medium">
                    {newApplicableCategories.length === 0 ? '✨ Applicable to All Items / All Categories' : `Selected: ${newApplicableCategories.join(', ')}`}
                  </div>
                  {categories.map(cat => {
                    const isChecked = newApplicableCategories.includes(cat);
                    return (
                      <label key={cat} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-slate-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewApplicableCategories([...newApplicableCategories, cat]);
                            } else {
                              setNewApplicableCategories(newApplicableCategories.filter(c => c !== cat));
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-slate-800 font-medium">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Broadcast toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">WhatsApp Broadcast Eligible</span>
                  <span className="text-[11px] text-slate-500">Allow instant distribution to opted-in customers</span>
                </div>
                <input
                  type="checkbox"
                  checked={isBroadcastEligible}
                  onChange={(e) => setIsBroadcastEligible(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Publish Coupon to POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Broadcast Campaign Modal */}
      {showWhatsAppBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-bold text-sm">WhatsApp Business Broadcast Campaign</h3>
              </div>
              <button
                onClick={() => setShowWhatsAppBroadcastModal(null)}
                className="text-emerald-100 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Customer Audience</label>
                <select
                  value={broadcastTargetGroup}
                  onChange={(e) => setBroadcastTargetGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                >
                  <option value="all_active">All Active Customers (5 contacts synced from Zoho)</option>
                  <option value="vip_members">High-Spenders / VIP Loyalty Members (3 contacts)</option>
                  <option value="recent_buyers">Shopped in Last 14 Days (4 contacts)</option>
                </select>
              </div>

              {/* WhatsApp Message Preview Bubble */}
              <div className="bg-slate-100 p-4 rounded-xl space-y-2 border border-slate-200">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                  Message Template Preview (Meta Cloud API Approved)
                </span>
                <div className="bg-emerald-50 border border-emerald-200 text-slate-800 p-3.5 rounded-lg text-xs leading-relaxed font-sans shadow-xs">
                  <p className="font-bold text-emerald-900 mb-1">🌟 Exclusive Special Offer from Urban Atelier!</p>
                  <p className="text-slate-700">
                    Hello <span className="text-indigo-600 font-mono font-semibold">{"{{customer_name}}"}</span>, enjoy special savings on your next boutique visit:
                  </p>
                  <div className="my-2 p-2 bg-white rounded border border-dashed border-emerald-300 font-mono font-bold text-center text-indigo-700 text-sm">
                    USE CODE: {showWhatsAppBroadcastModal.code}
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Valid for {showWhatsAppBroadcastModal.description}. Show this code at POS checkout before {showWhatsAppBroadcastModal.endDate}.
                  </p>
                </div>
              </div>

              {broadcastSentSuccess ? (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Broadcast Dispatched to Meta WhatsApp Cloud API!</span>
                </div>
              ) : (
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppBroadcastModal(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsAppBroadcast}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Send Broadcast Alert</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Coupon Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Delete Promo Code?</h3>
            </div>
            <p className="text-xs text-slate-600">
              This promo code will be immediately deactivated and removed across all connected POS registers. Existing invoice histories will remain intact.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCoupon(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

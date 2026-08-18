import React from 'react';
import { 
  TrendingUp, 
  Receipt, 
  Gift, 
  TicketPercent, 
  RefreshCw, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers,
  Store,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SalesSummary, IntegrationStatus, StoreProfile, Coupon, LoyaltyLedgerEntry } from '../types';

interface DashboardProps {
  salesTimeline: SalesSummary[];
  integrationStatus: IntegrationStatus;
  stores: StoreProfile[];
  selectedStoreId: string;
  coupons: Coupon[];
  loyaltyLedger: LoyaltyLedgerEntry[];
  onTriggerSync: () => void;
  isSyncing: boolean;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  salesTimeline,
  integrationStatus,
  stores,
  selectedStoreId,
  coupons,
  loyaltyLedger,
  onTriggerSync,
  isSyncing,
  onNavigateTab
}) => {
  // Aggregate sales calculations
  const totalRevenue = salesTimeline.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalInvoices = salesTimeline.reduce((acc, curr) => acc + curr.invoiceCount, 0);
  const averageTicket = totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0;
  const totalLoyaltyIssued = salesTimeline.reduce((acc, curr) => acc + curr.loyaltyPointsIssued, 0);
  const totalLoyaltyRedeemed = salesTimeline.reduce((acc, curr) => acc + curr.loyaltyPointsRedeemed, 0);
  const totalCouponDiscounts = salesTimeline.reduce((acc, curr) => acc + curr.couponDiscounts, 0);

  const activeStoreObj = stores.find(s => s.id === selectedStoreId);
  const activeCouponsCount = coupons.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header Banner & Live Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">
              {activeStoreObj ? `${activeStoreObj.name} Control Center` : 'Consolidated Business Overview'}
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
              Zoho Books Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time back-office dashboard, consolidated invoices, loyalty liability & integration health.
          </p>
        </div>

        {/* Sync Status Badge & Action */}
        <div className="flex items-center space-x-3 self-start lg:self-auto">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 font-medium">Zoho Synced:</span>
              <span className="font-semibold text-slate-800">12:45 PM Today</span>
            </div>
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Zoho Now'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Weekly Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>+18.4% vs last week</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Zoho invoice verified sales across {totalInvoices} bills</p>
        </div>

        {/* Average Bill Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg. Ticket Value</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">₹{averageTicket.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs text-blue-600 font-semibold mt-1">
              <span>{totalInvoices} Completed POS Checkouts</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Median basket across fashion & lifestyle items</p>
        </div>

        {/* Loyalty Points Metrics */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Loyalty Burn / Earn</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{totalLoyaltyIssued.toLocaleString('en-IN')} pts</div>
            <div className="flex items-center text-xs text-purple-700 font-medium mt-1">
              <span>{totalLoyaltyRedeemed.toLocaleString('en-IN')} pts redeemed (₹{(totalLoyaltyRedeemed * 0.5).toLocaleString('en-IN')})</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigateTab('loyalty')}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-2 block"
          >
            Manage rules & ledger →
          </button>
        </div>

        {/* Coupons & Promotions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Coupons & Promos</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TicketPercent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{activeCouponsCount} Active</div>
            <div className="flex items-center text-xs text-amber-700 font-semibold mt-1">
              <span>₹{totalCouponDiscounts.toLocaleString('en-IN')} discount given</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigateTab('coupons')}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-2 block"
          >
            Create WhatsApp promo →
          </button>
        </div>
      </div>

      {/* Main Breakdown Section: Daily Sales Graph & Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Bar Chart Visualizer */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weekly Revenue & Bill Volume (Zoho Invoices)</h2>
              <p className="text-xs text-slate-500">Day-by-day sales breakdown synced with Zoho Books journal</p>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Aug 10 - Aug 16, 2026
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {salesTimeline.map((item, index) => {
              const maxRev = 90000;
              const percentage = Math.min(100, Math.round((item.totalRevenue / maxRev) * 100));
              const isToday = item.period.includes('Today');

              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-semibold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {item.period} {isToday && <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded text-[10px]">Active</span>}
                    </span>
                    <div className="space-x-3 text-right">
                      <span className="text-slate-500">{item.invoiceCount} bills</span>
                      <span className="font-bold text-slate-900">₹{item.totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isToday ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Health & Quick Hub */}
        <div className="space-y-4">
          {/* Zoho Books Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  ZB
                </div>
                <span className="font-bold text-xs text-slate-800">Zoho Books Cloud</span>
              </div>
              <span className="flex items-center text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span>Org ID:</span>
                <span className="font-mono text-slate-800">{integrationStatus.zohoBooks.organizationId}</span>
              </div>
              <div className="flex justify-between">
                <span>Org Name:</span>
                <span className="font-medium text-slate-800 truncate max-w-[140px]">{integrationStatus.zohoBooks.organizationName}</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Poll Cycle:</span>
                <span className="text-slate-800">Every 15 min</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('sync')}
              className="mt-3 w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 block"
            >
              View Sync Logs & Retry Failed →
            </button>
          </div>

          {/* WhatsApp Meta Coexistence Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  WA
                </div>
                <span className="font-bold text-xs text-slate-800">WhatsApp Business</span>
              </div>
              <span className="flex items-center text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Coexistence Ready
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span>Sender Number:</span>
                <span className="font-medium text-slate-800">{integrationStatus.whatsapp.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Daily e-Bill Usage:</span>
                <span className="font-medium text-slate-800">148 / 10,000 sent</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('coupons')}
              className="mt-3 w-full text-center text-xs font-semibold text-emerald-600 hover:text-emerald-800 block"
            >
              Broadcast Promo Code via WhatsApp →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Loyalty Transactions Ledger */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Customer Loyalty Activity</h2>
            <p className="text-xs text-slate-500">Live points earned and redeemed at store checkout registers</p>
          </div>
          <button
            onClick={() => onNavigateTab('loyalty')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Full Ledger ({loyaltyLedger.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Points</th>
                <th className="py-2.5 px-3">Balance</th>
                <th className="py-2.5 px-3">Invoice Ref</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loyaltyLedger.slice(0, 4).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{entry.customerName}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{entry.customerPhone}</td>
                  <td className="py-2.5 px-3">
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
                  <td className={`py-2.5 px-3 font-bold ${entry.points > 0 ? 'text-emerald-600' : 'text-purple-600'}`}>
                    {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">{entry.balanceAfter} pts</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-600">{entry.billId || 'N/A'}</td>
                  <td className="py-2.5 px-3 text-slate-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

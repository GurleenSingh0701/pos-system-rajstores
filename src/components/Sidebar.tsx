import React from 'react';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Package, 
  Tag, 
  Gift, 
  TicketPercent, 
  Users, 
  UserCheck, 
  Settings, 
  Store,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Send,
  Receipt
} from 'lucide-react';
import { StoreProfile, IntegrationStatus } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stores: StoreProfile[];
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
  integrationStatus: IntegrationStatus;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stores,
  selectedStoreId,
  setSelectedStoreId,
  integrationStatus,
  onQuickSync,
  isSyncing
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'items', label: 'Item Management', icon: Package, badge: 'Enrichment' },
    { id: 'labels', label: 'Label Designer', icon: Tag, badge: 'WYSIWYG' },
    { id: 'loyalty', label: 'Loyalty Program', icon: Gift },
    { id: 'coupons', label: 'Coupons & Promos', icon: TicketPercent },
    { id: 'invoices', label: 'Invoices & Credit Notes', icon: Receipt },
    { section: 'WhatsApp' },
    { id: 'whatsapp_templates', label: 'Template Builder', icon: MessageSquare, sub: true },
    { id: 'whatsapp_crm', label: 'Customer Groups', icon: Users, sub: true },
    { id: 'whatsapp_campaigns', label: 'Campaign Launcher', icon: Send, sub: true },
    { id: 'whatsapp_settings', label: 'WhatsApp Settings', icon: Settings, sub: true },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'sync', label: 'Sync & Integrations', icon: RefreshCw, badge: integrationStatus.zohoBooks.failedSyncCount > 0 ? 'Alert' : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">POS Admin Hub</h1>
            <p className="text-xs text-slate-400">Back-Office & Zoho Control</p>
          </div>
        </div>

        {/* Store Selector */}
        <div className="mt-4">
          <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-1.5">
            Active Store Scope
          </label>
          <div className="relative">
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer pr-8"
            >
              <option value="all">🌐 Consolidated (All Stores)</option>
              {stores.map((st) => (
                <option key={st.id} value={st.id}>
                  🏬 {st.name} ({st.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          if ('section' in item) {
            return (
              <div key={item.section} className="text-[10px] font-bold text-slate-500 uppercase px-3 mt-4 mb-1">
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                item.sub ? 'pl-8' : ''
              } ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    item.badge === 'Alert'
                      ? 'bg-red-500/20 text-red-300'
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>


      {/* Sync Health & Quick Action Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-300">Shared DB Live</span>
            </div>
            <span className="text-[10px] text-slate-400">Zoho Connected</span>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1 mb-2.5">
            <div className="flex justify-between">
              <span>Catalog items:</span>
              <span className="font-semibold text-slate-200">{integrationStatus.zohoBooks.itemsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Sync queue:</span>
              <span className="font-semibold text-emerald-400">0 pending</span>
            </div>
          </div>

          <button
            onClick={onQuickSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isSyncing ? 'Syncing Catalog...' : 'Sync Zoho Catalog'}</span>
          </button>
        </div>

        {/* User Role Card */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
              AD
            </div>
            <span className="truncate text-slate-300 font-medium">Administrator</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400" title="Admin Privileges Active" />
        </div>
      </div>
    </aside>
  );
};

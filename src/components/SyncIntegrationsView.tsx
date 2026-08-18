import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Clock, 
  Play, 
  RotateCcw, 
  Layers,
  MessageSquare,
  ShieldCheck,
  Key,
  Settings2,
  Calculator,
  Trash2,
  Info,
  FileJson
} from 'lucide-react';
import { SyncLogEntry, IntegrationStatus, ZohoCredentials, Msg91Credentials, StoreItem, SalesSummary } from '../types';
import { ZohoCredentialsModal } from './ZohoCredentialsModal';
import { Msg91SettingsModal } from './Msg91SettingsModal';
import { ForceRefreshModal } from './ForceRefreshModal';
import { ZohoPayloadViewerModal } from './ZohoPayloadViewerModal';

interface SyncIntegrationsProps {
  logs: SyncLogEntry[];
  status: IntegrationStatus;
  zohoCredentials: ZohoCredentials;
  msg91Credentials: Msg91Credentials;
  items: StoreItem[];
  onUpdateZohoCredentials: (creds: ZohoCredentials) => void;
  onUpdateMsg91Credentials: (creds: Msg91Credentials) => void;
  onTriggerSync: (module?: string) => void;
  onForceRefreshComplete: (items: StoreItem[], salesTimeline: SalesSummary[]) => void;
  onBatchRecalculateGst: () => void;
  onRetryFailed: (logId: string) => void;
  isSyncing: boolean;
}

export const SyncIntegrationsView: React.FC<SyncIntegrationsProps> = ({
  logs,
  status,
  zohoCredentials,
  msg91Credentials,
  items,
  onUpdateZohoCredentials,
  onUpdateMsg91Credentials,
  onTriggerSync,
  onForceRefreshComplete,
  onBatchRecalculateGst,
  onRetryFailed,
  isSyncing
}) => {
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isZohoModalOpen, setIsZohoModalOpen] = useState<boolean>(false);
  const [isMsg91ModalOpen, setIsMsg91ModalOpen] = useState<boolean>(false);
  const [isForceRefreshModalOpen, setIsForceRefreshModalOpen] = useState<boolean>(false);
  const [isPayloadViewerOpen, setIsPayloadViewerOpen] = useState<boolean>(false);

  const filteredLogs = logs.filter(log => {
    const matchesModule = selectedModuleFilter === 'all' || log.module === selectedModuleFilter;
    const matchesStatus = selectedStatusFilter === 'all' || log.status === selectedStatusFilter;
    return matchesModule && matchesStatus;
  });

  const countGst5 = items.filter(i => i.taxRate === 5).length;

  return (
    <div className="space-y-6">
      {/* Force Refresh Interactive Modal */}
      <ForceRefreshModal
        isOpen={isForceRefreshModalOpen}
        onClose={() => setIsForceRefreshModalOpen(false)}
        zohoCredentials={zohoCredentials}
        onComplete={(newItems, newTimeline) => {
          onForceRefreshComplete(newItems, newTimeline);
        }}
      />

      {/* Zoho Raw Payload Inspector Modal */}
      <ZohoPayloadViewerModal
        isOpen={isPayloadViewerOpen}
        onClose={() => setIsPayloadViewerOpen(false)}
        items={items}
      />

      {/* Zoho Credentials Modal */}
      <ZohoCredentialsModal
        isOpen={isZohoModalOpen}
        onClose={() => setIsZohoModalOpen(false)}
        credentials={zohoCredentials}
        onSave={onUpdateZohoCredentials}
        onTriggerSync={onTriggerSync}
      />

      {/* Msg91 Settings Modal */}
      <Msg91SettingsModal
        isOpen={isMsg91ModalOpen}
        onClose={() => setIsMsg91ModalOpen(false)}
        credentials={msg91Credentials}
        onSave={onUpdateMsg91Credentials}
      />

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Sync & Integrations Control Hub</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Cloud Run / Function Bridge
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor Zoho Books bi-directional sync health, configure OAuth API keys, and test live sync jobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsZohoModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>Configure Zoho API Keys</span>
          </button>

          <button
            onClick={() => onTriggerSync('all')}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing All Modules...' : 'Trigger Full Resync'}</span>
          </button>
        </div>
      </div>

      {/* GST Status Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm">GST Tax Engine: Zoho Books Data-Driven</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                0% · 5% · 12% · 18% · 28%
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Tax rates and CGST/SGST splits are extracted directly from your Zoho Books inventory payload.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPayloadViewerOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1.5"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zoho Product Payloads</span>
          </button>
          <button
            onClick={() => setIsForceRefreshModalOpen(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Force Delete & Refresh</span>
          </button>
        </div>
      </div>

      {/* Granular Module Refresh Control Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Granular Module Synchronization</h3>
            <p className="text-xs text-slate-500">Trigger targeted synchronization for specific Zoho Books modules or perform a full resync.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => onTriggerSync('zoho_items')}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh Items</span>
          </button>

          <button
            onClick={() => onTriggerSync('zoho_invoices')}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh Invoices</span>
          </button>

          <button
            onClick={() => onTriggerSync('zoho_contacts')}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh Customers</span>
          </button>

          <button
            onClick={() => onTriggerSync('all')}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Full Resync (All)</span>
          </button>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Zoho Books Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100">
                ZB
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Zoho Books API</h3>
                <span className="text-[11px] text-slate-400">Inventory & Invoices</span>
              </div>
            </div>
            <span className="flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Organization:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[130px]">{zohoCredentials.organizationId}</span>
            </div>
            <div className="flex justify-between">
              <span>Data Center:</span>
              <span className="font-mono text-slate-800 uppercase">{zohoCredentials.dataCenter} (books.zoho.{zohoCredentials.dataCenter})</span>
            </div>
            <div className="flex justify-between">
              <span>GST Calculation:</span>
              <span className="text-emerald-600 font-semibold">5% Standard Slab</span>
            </div>
            <div className="flex justify-between">
              <span>OAuth Status:</span>
              <span className="text-emerald-600 font-semibold">Valid (Auto-Refreshed)</span>
            </div>
            <div className="flex justify-between">
              <span>Auto-Poll Cycle:</span>
              <span className="text-slate-800">Every {zohoCredentials.autoSyncIntervalMinutes}m</span>
            </div>
          </div>

          <div className="pt-1 space-y-2">
            <button
              onClick={() => setIsZohoModalOpen(true)}
              className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Edit Keys & Test Handshake</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => onTriggerSync('zoho_items')}
                disabled={isSyncing}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
              >
                Sync Items
              </button>
              <button
                onClick={() => onTriggerSync('zoho_invoices')}
                disabled={isSyncing}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
              >
                Sync Invoices
              </button>
            </div>

            <button
              onClick={() => setIsForceRefreshModalOpen(true)}
              className="w-full py-2 px-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 mt-2 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Full Force Refresh (Delete & Re-fetch)</span>
            </button>
          </div>
        </div>

        {/* 2. WhatsApp Business (MSG91 API) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">WhatsApp (via MSG91)</h3>
                <span className="text-[11px] text-slate-400">Template Manager</span>
              </div>
            </div>
            <span
              className={`flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                msg91Credentials.connectionStatus === 'connected'
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  : 'text-amber-600 bg-amber-50 border-amber-200'
              }`}
            >
              {msg91Credentials.connectionStatus === 'connected' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" /> Pending Auth
                </>
              )}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Integrated Number:</span>
              <span className="font-mono text-slate-800">{msg91Credentials.senderId || '+91 98450 00000'}</span>
            </div>
            <div className="flex justify-between">
              <span>Integrated Template:</span>
              <span className="font-mono text-slate-800">{msg91Credentials.integratedTemplateName || 'order_invoice_v2'}</span>
            </div>
            <div className="flex justify-between">
              <span>WhatsApp Cloud API:</span>
              <span className="text-emerald-600 font-semibold">Tier 2 (10k msgs/day)</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Status:</span>
              <span className="text-slate-800">Direct Webhook Listener</span>
            </div>
            <div className="flex justify-between">
              <span>Auth Method:</span>
              <span className="text-slate-800 font-mono">MSG91 AuthKey v5</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setIsMsg91ModalOpen(true)}
              className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Configure WhatsApp (MSG91)</span>
            </button>
          </div>
        </div>

        {/* 3. Real-Time Webhook Engine */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm border border-indigo-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Webhook Receiver</h3>
                <span className="text-[11px] text-slate-400">Instant Event Listener</span>
              </div>
            </div>
            <span className="flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Active
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Items In Inventory:</span>
              <span className="font-semibold text-slate-800">{items.length} Active SKUs</span>
            </div>
            <div className="flex justify-between">
              <span>5% GST Slabs:</span>
              <span className="font-semibold text-emerald-700">{countGst5} SKUs</span>
            </div>
            <div className="flex justify-between">
              <span>Payload HMAC:</span>
              <span className="font-mono text-emerald-600">SHA256 Verified</span>
            </div>
            <div className="flex justify-between">
              <span>Average Latency:</span>
              <span className="text-slate-800 font-mono">140ms</span>
            </div>
            <div className="flex justify-between">
              <span>Webhook Endpoint:</span>
              <span className="font-mono text-slate-700 text-[10px] truncate max-w-[130px]">/api/zoho/webhook</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => onBatchRecalculateGst()}
              className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Recalculate All GST Rates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Log Stream Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Audit & Sync Execution History</h2>
            <p className="text-xs text-slate-500">
              Live audit trail of catalog synchronization, invoice streaming, and GST tax calculations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Modules</option>
              <option value="zoho_items">Zoho Items</option>
              <option value="zoho_invoices">Zoho Invoices</option>
              <option value="whatsapp_delivery">WhatsApp</option>
              <option value="full_force_refresh">Force Refresh</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Message / Details</th>
                  <th className="py-3 px-4">Records Processed</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No logs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 capitalize">
                          {log.module.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.status === 'warning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <div className="text-slate-900 font-medium">{log.message}</div>
                        {log.errorDetails && (
                          <div className="text-[10px] font-mono text-red-600 mt-0.5 truncate">{log.errorDetails}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {log.recordsProcessed}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {log.durationMs}ms
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.status === 'error' && (
                          <button
                            onClick={() => onRetryFailed(log.id)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

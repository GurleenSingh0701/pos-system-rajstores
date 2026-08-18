import React, { useState } from 'react';
import { 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Play, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle,
  Server,
  Lock,
  Save,
  Check
} from 'lucide-react';
import { ZohoCredentials } from '../types';
import { testZohoBooksConnection, ZohoTestResult } from '../zohoClient';

interface ZohoCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: ZohoCredentials;
  onSave: (creds: ZohoCredentials) => void;
  onTriggerSync?: (module?: string) => void;
}

export const ZohoCredentialsModal: React.FC<ZohoCredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSave,
  onTriggerSync
}) => {
  const [form, setForm] = useState<ZohoCredentials>({ ...credentials });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ZohoTestResult | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showHelperGuide, setShowHelperGuide] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testZohoBooksConnection(form);
      setTestResult(result);
      if (result.success) {
        setForm(prev => ({
          ...prev,
          connectionStatus: 'connected',
          lastTestedAt: new Date().toISOString(),
          lastTestMessage: result.message
        }));
      } else {
        setForm(prev => ({
          ...prev,
          connectionStatus: 'failed',
          lastTestMessage: result.message
        }));
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Failed to ping Zoho Books API.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Zoho Books API & OAuth 2.0 Credentials</h2>
              <p className="text-xs text-blue-100">Configure client credentials, organization ID, and test sync pipeline</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Quick Info & Developer Console Helper */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-start justify-between text-xs">
            <div className="space-y-1">
              <p className="font-bold text-blue-950 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 inline" />
                <span>Zoho OAuth 2.0 Self-Client Credentials</span>
              </p>
              <p className="text-blue-800 leading-relaxed">
                Enter your Zoho Developer Console credentials to authenticate item catalog imports, real-time inventory counts, and invoice pushes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelperGuide(!showHelperGuide)}
              className="text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1 shrink-0 ml-2 bg-blue-100/70 px-2.5 py-1 rounded-lg"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHelperGuide ? 'Hide Guide' : 'Setup Guide'}</span>
            </button>
          </div>

          {/* Collapsible Step-by-step Setup Guide */}
          {showHelperGuide && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5 animate-in slide-in-from-top-2">
              <h4 className="font-bold text-slate-900">How to get your Zoho API Keys in 3 steps:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                <li>
                  Open <a href="https://api-console.zoho.in/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold inline-flex items-center">Zoho API Console <ExternalLink className="w-3 h-3 ml-0.5" /></a> (or <a href="https://api-console.zoho.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold inline-flex items-center">zoho.com console <ExternalLink className="w-3 h-3 ml-0.5" /></a>).
                </li>
                <li>
                  Create a <strong>Server-based Application</strong> or <strong>Self Client</strong> to obtain your <strong>Client ID</strong> and <strong>Client Secret</strong>.
                </li>
                <li>
                  Under <em>Generate Code</em>, set Scope: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px] text-slate-900">ZohoBooks.fullaccess.all</code>, Duration: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px] text-slate-900">10 minutes</code>, and generate the <strong>Refresh Token</strong>.
                </li>
                <li>
                  Find your <strong>Organization ID</strong> in Zoho Books top right profile menu or settings URL.
                </li>
              </ol>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Organization ID */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Zoho Organization ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.organizationId}
                onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                placeholder="e.g. 60029381724"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Visible in Zoho Books Settings &gt; Organization Profile</span>
            </div>

            {/* Data Center / Domain */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Zoho Data Center (Region) <span className="text-red-500">*</span>
              </label>
              <select
                value={form.dataCenter}
                onChange={(e) => setForm({ ...form, dataCenter: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
              >
                <option value="in">India (books.zoho.in / accounts.zoho.in)</option>
                <option value="com">United States / Global (books.zoho.com)</option>
                <option value="eu">Europe (books.zoho.eu)</option>
                <option value="com.au">Australia (books.zoho.com.au)</option>
                <option value="com.cn">China (books.zoho.com.cn)</option>
                <option value="jp">Japan (books.zoho.jp)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Matches your Zoho account signup URL</span>
            </div>

            {/* Client ID */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                placeholder="1000.XXXXX..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Client Secret */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">
                  Client Secret <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={form.clientSecret}
                  onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
                  placeholder="Zoho Client Secret"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Refresh Token */}
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">
                OAuth 2.0 Refresh Token <span className="text-red-500">*</span>
              </label>
              <input
                type={showSecret ? 'text' : 'password'}
                required
                value={form.refreshToken}
                onChange={(e) => setForm({ ...form, refreshToken: e.target.value })}
                placeholder="1000.XXXXX.XXXXX..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Used by the background sync workers to continuously refresh access tokens automatically</span>
            </div>

            {/* Auto-Sync Polling Interval */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="font-semibold text-slate-800 block">Automated Catalog & Inventory Polling</label>
                <p className="text-[11px] text-slate-500">Periodically pulls updated stock levels and item prices from Zoho Books</p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={form.autoSyncIntervalMinutes}
                  onChange={(e) => setForm({ ...form, autoSyncIntervalMinutes: Number(e.target.value) })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
                >
                  <option value={5}>Every 5 minutes</option>
                  <option value={15}>Every 15 minutes (Recommended)</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every 1 hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Connection Diagnostic Result Box */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span>{testResult.message}</span>
              </div>

              {testResult.details && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 font-sans text-[11px]">
                  <div>
                    <span className="text-emerald-700 block">Organization:</span>
                    <span className="font-semibold">{testResult.details.organizationName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Currency:</span>
                    <span className="font-semibold">{testResult.details.currencyCode}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Endpoint:</span>
                    <span className="font-mono font-semibold">{testResult.details.dataCenterDomain}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Latency:</span>
                    <span className="font-mono font-semibold">{testResult.details.latencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Time Zone:</span>
                    <span className="font-semibold">{testResult.details.timeZone}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Edition:</span>
                    <span className="font-semibold">{testResult.details.planType}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Zoho API Handshake...' : 'Test Zoho Connection'}</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Apply Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

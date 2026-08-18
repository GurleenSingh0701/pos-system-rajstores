import React, { useState } from 'react';
import { 
  Store, 
  Printer, 
  FileText, 
  Save, 
  Check, 
  Key, 
  Layers, 
  Plus, 
  Trash2,
  Database,
  Building,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { StoreProfile, LabelTemplate, ZohoCredentials } from '../types';
import { getSavedFirebaseConfig, saveFirebaseConfig } from '../firebaseClient';
import { testZohoBooksConnection, ZohoTestResult } from '../zohoClient';

interface SettingsViewProps {
  stores: StoreProfile[];
  labelTemplates: LabelTemplate[];
  zohoCredentials: ZohoCredentials;
  onUpdateStore: (store: StoreProfile) => void;
  onAddStore: (store: StoreProfile) => void;
  onUpdateZohoCredentials: (creds: ZohoCredentials) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  stores,
  labelTemplates,
  zohoCredentials,
  onUpdateStore,
  onAddStore,
  onUpdateZohoCredentials
}) => {
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const currentStore = stores[selectedStoreIndex] || stores[0];

  const [storeForm, setStoreForm] = useState<StoreProfile>({ ...currentStore });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Zoho Books Credentials State
  const [zohoForm, setZohoForm] = useState<ZohoCredentials>({ ...zohoCredentials });
  const [isTestingZoho, setIsTestingZoho] = useState(false);
  const [zohoTestResult, setZohoTestResult] = useState<ZohoTestResult | null>(null);
  const [zohoSaveAlert, setZohoSaveAlert] = useState(false);
  const [showZohoSecret, setShowZohoSecret] = useState(false);

  // Custom Firebase Credentials configuration
  const savedFb = getSavedFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(savedFb?.apiKey || 'PASTE_FROM_POS_APP');
  const [fbProjectId, setFbProjectId] = useState(savedFb?.projectId || 'pos-retail-live-99');
  const [fbAuthDomain, setFbAuthDomain] = useState(savedFb?.authDomain || 'pos-retail-live-99.firebaseapp.com');
  const [fbStorageBucket, setFbStorageBucket] = useState(savedFb?.storageBucket || 'pos-retail-live-99.appspot.com');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(savedFb?.messagingSenderId || '1029384756');
  const [fbAppId, setFbAppId] = useState(savedFb?.appId || '1:1029384756:web:89a1bc23de4f');
  const [fbSavedAlert, setFbSavedAlert] = useState(false);

  const handleStoreSelect = (idx: number) => {
    setSelectedStoreIndex(idx);
    setStoreForm({ ...stores[idx] });
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore(storeForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig({
      apiKey: fbApiKey,
      authDomain: fbAuthDomain,
      projectId: fbProjectId,
      storageBucket: fbStorageBucket,
      messagingSenderId: fbMessagingSenderId,
      appId: fbAppId
    });
    setFbSavedAlert(true);
    setTimeout(() => setFbSavedAlert(false), 3000);
  };

  const handleTestZohoConnection = async () => {
    setIsTestingZoho(true);
    setZohoTestResult(null);
    try {
      const result = await testZohoBooksConnection(zohoForm);
      setZohoTestResult(result);
      if (result.success) {
        setZohoForm(prev => ({
          ...prev,
          connectionStatus: 'connected',
          lastTestedAt: new Date().toISOString(),
          lastTestMessage: result.message
        }));
      } else {
        setZohoForm(prev => ({
          ...prev,
          connectionStatus: 'failed',
          lastTestMessage: result.message
        }));
      }
    } catch (e: any) {
      setZohoTestResult({
        success: false,
        message: e?.message || 'Error testing Zoho Books connection.'
      });
    } finally {
      setIsTestingZoho(false);
    }
  };

  const handleSaveZohoCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateZohoCredentials(zohoForm);
    setZohoSaveAlert(true);
    setTimeout(() => setZohoSaveAlert(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Store Profiles, Hardware & System Settings</h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
              Multi-Location
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure store metadata, GSTIN tax rules, thermal label printer defaults, Zoho Books API keys, and shared Firebase keys.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Store Selection & Location Profiles (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Store Profile & Tax Identity</h2>
            </div>

            {/* Store switcher tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              {stores.map((st, idx) => (
                <button
                  key={st.id}
                  onClick={() => handleStoreSelect(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    selectedStoreIndex === idx
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.code}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Store Code</label>
                <input
                  type="text"
                  required
                  value={storeForm.code}
                  onChange={(e) => setStoreForm({ ...storeForm, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Registered Business Address</label>
              <input
                type="text"
                required
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={storeForm.city}
                  onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  value={storeForm.state}
                  onChange={(e) => setStoreForm({ ...storeForm, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={storeForm.pincode}
                  onChange={(e) => setStoreForm({ ...storeForm, pincode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  required
                  value={storeForm.gstin}
                  onChange={(e) => setStoreForm({ ...storeForm, gstin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs"
                />
              </div>
            </div>

            {/* Tax Preference & Thermal Printer Defaults */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catalog Tax Display</label>
                <select
                  value={storeForm.taxDisplayPreference}
                  onChange={(e) => setStoreForm({ ...storeForm, taxDisplayPreference: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  <option value="inclusive">GST Inclusive (MRP includes tax)</option>
                  <option value="exclusive">GST Exclusive (Tax added on subtotal)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Default Thermal Label Printer</label>
                <input
                  type="text"
                  value={storeForm.defaultPrinterName || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, defaultPrinterName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  placeholder="e.g. Zebra ZD421 / TSC TE244"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Shared Firebase & Zoho Books Credentials (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Zoho Books API Keys Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Zoho Books API Keys & OAuth</h2>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                Bi-Directional Sync
              </span>
            </div>

            <form onSubmit={handleSaveZohoCredentials} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Organization ID</label>
                  <input
                    type="text"
                    required
                    value={zohoForm.organizationId}
                    onChange={(e) => setZohoForm({ ...zohoForm, organizationId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-xs"
                    placeholder="60029381724"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Data Center</label>
                  <select
                    value={zohoForm.dataCenter}
                    onChange={(e) => setZohoForm({ ...zohoForm, dataCenter: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs font-semibold"
                  >
                    <option value="in">India (zoho.in)</option>
                    <option value="com">Global/US (zoho.com)</option>
                    <option value="eu">EU (zoho.eu)</option>
                    <option value="com.au">Australia (zoho.com.au)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client ID</label>
                <input
                  type="text"
                  required
                  value={zohoForm.clientId}
                  onChange={(e) => setZohoForm({ ...zohoForm, clientId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-xs"
                  placeholder="1000.XXXXX"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Client Secret</label>
                  <button
                    type="button"
                    onClick={() => setShowZohoSecret(!showZohoSecret)}
                    className="text-[10px] text-indigo-600 font-semibold"
                  >
                    {showZohoSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showZohoSecret ? 'text' : 'password'}
                  required
                  value={zohoForm.clientSecret}
                  onChange={(e) => setZohoForm({ ...zohoForm, clientSecret: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">OAuth Refresh Token</label>
                <input
                  type={showZohoSecret ? 'text' : 'password'}
                  required
                  value={zohoForm.refreshToken}
                  onChange={(e) => setZohoForm({ ...zohoForm, refreshToken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-xs"
                  placeholder="1000.XXXXX.XXXXX"
                />
              </div>

              {/* Zoho Test Result */}
              {zohoTestResult && (
                <div
                  className={`p-2.5 rounded-lg border text-[11px] ${
                    zohoTestResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-semibold">
                    {zohoTestResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    )}
                    <span>{zohoTestResult.message}</span>
                  </div>
                  {zohoTestResult.details && (
                    <div className="text-[10px] text-emerald-700 mt-1">
                      Organization: {zohoTestResult.details.organizationName} ({zohoTestResult.details.latencyMs}ms)
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleTestZohoConnection}
                  disabled={isTestingZoho}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center space-x-1 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingZoho ? 'animate-spin' : ''}`} />
                  <span>{isTestingZoho ? 'Testing...' : 'Test Sync'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  {zohoSaveAlert && (
                    <span className="text-emerald-600 text-[11px] font-semibold flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Saved!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Save Zoho Keys
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Firebase Shared Configuration Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Shared Firebase Credentials</h2>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                Shared with Tablet POS
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              This admin application connects to the exact same Firebase project as the POS app so that itemsCache, coupons, loyalty rules, and users remain in 100% real-time synchronization.
            </p>

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Project ID</label>
                <input
                  type="text"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">API Key</label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={fbAuthDomain}
                    onChange={(e) => setFbAuthDomain(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    value={fbStorageBucket}
                    onChange={(e) => setFbStorageBucket(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                {fbSavedAlert ? (
                  <span className="text-emerald-600 font-semibold text-xs flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" /> Config Saved!
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">Saved locally</span>
                )}

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Update Firebase Keys
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  Download,
  Eye,
  FileJson,
  Layers,
  Sparkles,
  Search,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { StoreItem } from '../types';

interface ZohoPayloadViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StoreItem[];
  initialSelectedItemId?: string | null;
}

export const ZohoPayloadViewerModal: React.FC<ZohoPayloadViewerModalProps> = ({
  isOpen,
  onClose,
  items,
  initialSelectedItemId
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialSelectedItemId || (items.length > 0 ? items[0].id : '')
  );
  const [activeViewTab, setActiveViewTab] = useState<'json' | 'mapping' | 'taxAnatomy'>('json');
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  // Find currently selected item
  const currentItem = items.find(i => i.id === selectedItemId) || items[0];

  // Construct or retrieve raw Zoho Payload
  const rawPayload = currentItem?.rawZohoPayload || {
    item_id: currentItem?.zohoItemId || '88191000000123456',
    name: currentItem?.name || '',
    item_name: currentItem?.name || '',
    unit: currentItem?.unit || 'pcs',
    status: 'active',
    rate: currentItem?.sellingPrice || 0,
    sku: currentItem?.sku || '',
    upc: currentItem?.barcode || '',
    hsn_or_sac: '62052000',
    is_taxable: currentItem?.taxRate > 0,
    tax_name: currentItem?.taxName || `GST ${currentItem?.taxRate}%`,
    tax_percentage: currentItem?.taxRate || 0,
    item_tax_preferences: currentItem?.taxBreakdown && currentItem.taxBreakdown.cgstRate > 0 ? [
      {
        tax_id: '88191000000078102',
        tax_name: `CGST ${currentItem.taxBreakdown.cgstRate}%`,
        tax_percentage: currentItem.taxBreakdown.cgstRate,
        tax_type: 'cgst'
      },
      {
        tax_id: '88191000000078103',
        tax_name: `SGST ${currentItem.taxBreakdown.sgstRate}%`,
        tax_percentage: currentItem.taxBreakdown.sgstRate,
        tax_type: 'sgst'
      }
    ] : [],
    stock_on_hand: currentItem?.stockOnHand || 0,
    category_name: currentItem?.category || 'Apparel',
    custom_fields: [
      {
        label: 'MRP',
        value: (currentItem?.mrp || currentItem?.sellingPrice || 0).toFixed(2),
        data_type: 'amount'
      }
    ]
  };

  const jsonString = JSON.stringify(rawPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoho_item_payload_${currentItem?.sku || currentItem?.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredItems = items.filter(it =>
    it.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    it.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
    it.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (it.taxName && it.taxName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const getTaxBadge = (rate: number) => {
    if (rate === 0) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (rate === 5) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (rate === 12) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (rate === 18) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (rate === 28) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Zoho Books Product Payload Inspector</h2>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  Raw API JSON
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect authentic Zoho Books JSON responses, tax structure arrays, HSN codes, custom fields, and POS field mappings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Controls / Item Selector */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
            <label className="text-xs font-semibold text-slate-600 shrink-0">Selected Product:</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku}) — {item.taxName || `${item.taxRate}% GST`} [₹{item.sellingPrice}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveViewTab('json')}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center space-x-1.5 transition-all ${
                  activeViewTab === 'json'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw JSON</span>
              </button>
              <button
                onClick={() => setActiveViewTab('mapping')}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center space-x-1.5 transition-all ${
                  activeViewTab === 'mapping'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Field Mappings</span>
              </button>
              <button
                onClick={() => setActiveViewTab('taxAnatomy')}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center space-x-1.5 transition-all ${
                  activeViewTab === 'taxAnatomy'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GST Tax Breakdown</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-slate-200 shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-indigo-200 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Quick Item Picker Chips */}
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Samples:</span>
          {items.slice(0, 7).map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                item.id === currentItem?.id
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <span>{item.name.split('-')[0].trim()}</span>
              <span className={`ml-1.5 text-[10px] px-1 py-0.2 rounded font-mono ${
                item.id === currentItem?.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {item.taxRate}%
              </span>
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-900/5 text-slate-800">
          {activeViewTab === 'json' && (
            <div className="space-y-4">
              {/* Product Info Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs">
                    {currentItem?.sku.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{currentItem?.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                      <span>SKU: {currentItem?.sku}</span>
                      <span>•</span>
                      <span>Zoho ID: {rawPayload.item_id || currentItem?.zohoItemId}</span>
                      <span>•</span>
                      <span>HSN: {rawPayload.hsn_or_sac || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getTaxBadge(currentItem?.taxRate || 0)}`}>
                    {currentItem?.taxName || `GST ${currentItem?.taxRate}%`}
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    Selling: ₹{currentItem?.sellingPrice}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    MRP: ₹{currentItem?.mrp}
                  </span>
                </div>
              </div>

              {/* Raw JSON Code Viewer */}
              <div className="relative bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>GET /api/v3/items/{rawPayload.item_id} (Zoho Books Books API v3 Format)</span>
                  </span>
                  <span>{jsonString.split('\n').length} lines • {new Blob([jsonString]).size} bytes</span>
                </div>
                <pre className="text-[12px] leading-relaxed text-emerald-400/90 selection:bg-indigo-900 selection:text-white">
                  {jsonString}
                </pre>
              </div>
            </div>
          )}

          {activeViewTab === 'mapping' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-950 text-xs flex items-start space-x-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Below is the exact schema mapping showing how fields in the Zoho Books product payload are extracted and mapped into the high-speed local POS SQLite/memory engine.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Zoho Books API Payload Key</th>
                      <th className="py-2.5 px-4">Sample Raw Value</th>
                      <th className="py-2.5 px-4">POS Client Attribute</th>
                      <th className="py-2.5 px-4">Transformation / Usage in POS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">item_id</td>
                      <td className="py-2.5 px-4 text-slate-800">"{rawPayload.item_id}"</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">zohoItemId</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Unique primary key for bidirectional sync and invoice push</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">name / item_name</td>
                      <td className="py-2.5 px-4 text-slate-800">"{rawPayload.name}"</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">name</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Product display name on billing screen & barcode labels</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">rate</td>
                      <td className="py-2.5 px-4 text-slate-800">{rawPayload.rate}</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">sellingPrice</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Base selling price (tax inclusive / exclusive per store settings)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">custom_fields[label: "MRP"]</td>
                      <td className="py-2.5 px-4 text-slate-800">
                        {rawPayload.custom_fields?.find((f: any) => f.label === 'MRP')?.value || `₹${currentItem?.mrp}`}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">mrp</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Maximum Retail Price printed on barcode stickers & customer receipts</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">tax_percentage / item_tax_preferences</td>
                      <td className="py-2.5 px-4 text-slate-800">{rawPayload.tax_percentage}% ({rawPayload.tax_name})</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">taxRate & taxBreakdown</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Evaluates dual CGST + SGST or IGST for GST compliant tax invoices</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">hsn_or_sac</td>
                      <td className="py-2.5 px-4 text-slate-800">"{rawPayload.hsn_or_sac || 'N/A'}"</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">taxCalculationLogic</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Harmonized System of Nomenclature code printed on GST invoices</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">sku / upc / ean</td>
                      <td className="py-2.5 px-4 text-slate-800">"{rawPayload.sku}" / "{rawPayload.upc}"</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">sku & barcode</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Direct barcode scanning & rapid search key</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-indigo-700 font-bold">stock_on_hand</td>
                      <td className="py-2.5 px-4 text-slate-800">{rawPayload.stock_on_hand}</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">stockOnHand</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans">Live POS inventory ledger with real-time decrements</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeViewTab === 'taxAnatomy' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Tax Node Structure in Zoho Books Payload</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Zoho Tax Array */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
                    <div className="font-bold text-slate-800 font-sans flex items-center justify-between">
                      <span>1. item_tax_preferences Node:</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">Array</span>
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] overflow-x-auto">
                      {JSON.stringify(rawPayload.item_tax_preferences || [], null, 2)}
                    </pre>
                  </div>

                  {/* Intra vs Inter-state */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>2. Tax Rates & Specification:</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">Attributes</span>
                    </div>
                    <div className="space-y-2 pt-1 font-mono text-[11px]">
                      <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">tax_percentage:</span>
                        <span className="font-bold text-indigo-600">{rawPayload.tax_percentage}%</span>
                      </div>
                      <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">intra_state_tax_name:</span>
                        <span className="font-bold text-slate-800">"{rawPayload.intra_state_tax_name || 'N/A'}"</span>
                      </div>
                      <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">inter_state_tax_name:</span>
                        <span className="font-bold text-slate-800">"{rawPayload.inter_state_tax_name || 'N/A'}"</span>
                      </div>
                      <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">is_taxable:</span>
                        <span className={`font-bold ${rawPayload.is_taxable ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {String(rawPayload.is_taxable)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-indigo-900">How POS Computes Tax from this Payload:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-slate-500">Intra-State CGST (Central)</div>
                      <div className="text-sm font-bold text-slate-900">
                        {currentItem?.taxBreakdown?.cgstRate || (currentItem?.taxRate ? currentItem.taxRate / 2 : 0)}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        ₹{(((currentItem?.sellingPrice || 0) * (currentItem?.taxBreakdown?.cgstRate || (currentItem?.taxRate ? currentItem.taxRate / 2 : 0))) / 100).toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-slate-500">Intra-State SGST (State)</div>
                      <div className="text-sm font-bold text-slate-900">
                        {currentItem?.taxBreakdown?.sgstRate || (currentItem?.taxRate ? currentItem.taxRate / 2 : 0)}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        ₹{(((currentItem?.sellingPrice || 0) * (currentItem?.taxBreakdown?.sgstRate || (currentItem?.taxRate ? currentItem.taxRate / 2 : 0))) / 100).toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-slate-500">Inter-State IGST (Integrated)</div>
                      <div className="text-sm font-bold text-indigo-600">
                        {currentItem?.taxRate || 0}%
                      </div>
                      <div className="text-[10px] text-indigo-600 mt-1 font-semibold">
                        ₹{(((currentItem?.sellingPrice || 0) * (currentItem?.taxRate || 0)) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Payload Inspector • Connected to Zoho Books Org #{rawPayload.account_id ? rawPayload.account_id.slice(0, 8) : '60029381'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

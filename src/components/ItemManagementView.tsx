import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Filter, 
  Tag, 
  Grid, 
  Check, 
  Edit3, 
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  Layers,
  Calculator,
  Info,
  HelpCircle,
  FileJson
} from 'lucide-react';
import { StoreItem, LabelTemplate } from '../types';
import { ZohoPayloadViewerModal } from './ZohoPayloadViewerModal';

interface ItemManagementProps {
  items: StoreItem[];
  labelTemplates: LabelTemplate[];
  onUpdateItemEnrichment: (itemId: string, enrichment: Partial<StoreItem>) => void;
  onSyncItem: (itemId: string) => void;
  onSyncAllCatalog: () => void;
  onBatchRecalculateGst?: () => void;
  isSyncing: boolean;
}

export const ItemManagementView: React.FC<ItemManagementProps> = ({
  items,
  labelTemplates,
  onUpdateItemEnrichment,
  onSyncItem,
  onSyncAllCatalog,
  onBatchRecalculateGst,
  isSyncing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [isPayloadViewerOpen, setIsPayloadViewerOpen] = useState<boolean>(false);
  const [selectedPayloadItemId, setSelectedPayloadItemId] = useState<string | null>(null);
  const [hoveredTaxItemId, setHoveredTaxItemId] = useState<string | null>(null);

  // Filter items
  const categories = Array.from(new Set(items.map(i => i.category)));
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.barcode.includes(searchTerm) ||
                          item.zohoItemId.includes(searchTerm);
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = pageSize === -1 ? 0 : (validCurrentPage - 1) * pageSize;
  const paginatedItems = pageSize === -1 ? filteredItems : filteredItems.slice(startIndex, startIndex + pageSize);

  const editingItem = items.find(i => i.id === editingItemId);

  // Pre-set color options for quick keys
  const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  return (
    <div className="space-y-6">
      {/* Header & Catalog Sync Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Item Management & POS Custom Enrichment</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {items.length} Active Items Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete active catalog fetched from Zoho Books inventory across all pages. Assign label templates and tablet POS quick-keys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedPayloadItemId(items[0]?.id || null);
              setIsPayloadViewerOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-all"
            title="Inspect raw Zoho Books product JSON payloads"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zoho Product Payloads</span>
          </button>

          <button
            onClick={onSyncAllCatalog}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-60 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing All Pages...' : 'Fetch All Active Items'}</span>
          </button>
        </div>
      </div>

      {/* Zoho Raw Payload Inspector Modal */}
      <ZohoPayloadViewerModal
        isOpen={isPayloadViewerOpen}
        onClose={() => setIsPayloadViewerOpen(false)}
        items={items}
        initialSelectedItemId={selectedPayloadItemId}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Item name, SKU, Barcode, or Zoho ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({items.filter(i => i.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-600 font-medium">Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={-1}>All ({filteredItems.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pricing & GST</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Assigned Label Template</th>
                <th className="py-3 px-4">POS Quick-Key</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No items found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const assignedTpl = labelTemplates.find(t => t.id === item.assignedLabelTemplateId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Variant */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        {item.sizeOrVariant && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.sizeOrVariant}</div>
                        )}
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">Zoho ID: {item.zohoItemId}</div>
                      </td>

                      {/* SKU & Barcode */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 font-medium">{item.sku}</div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">{item.barcode}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Pricing & GST */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">₹{item.sellingPrice.toLocaleString('en-IN')}</div>
                        <div className="text-[11px] text-slate-400 line-through">MRP: ₹{item.mrp.toLocaleString('en-IN')}</div>
                        
                        {/* Interactive GST Badge with Logic Tooltip */}
                        <div className="relative mt-1">
                          <button
                            type="button"
                            onClick={() => setHoveredTaxItemId(hoveredTaxItemId === item.id ? null : item.id)}
                            onMouseEnter={() => setHoveredTaxItemId(item.id)}
                            onMouseLeave={() => setHoveredTaxItemId(null)}
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                              item.taxRate === 0
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : item.taxRate === 5
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : item.taxRate === 12
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : item.taxRate === 18
                                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                : item.taxRate === 28
                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            <span>{item.taxName || (item.taxRate > 0 ? `GST ${item.taxRate}%` : '0% Tax')}</span>
                            <Info className="w-2.5 h-2.5 opacity-70" />
                          </button>

                          {/* Hover/Click Popover showing Tax Calculation Logic */}
                          {hoveredTaxItemId === item.id && (
                            <div className="absolute left-0 top-6 z-30 w-64 bg-slate-900 text-white rounded-xl p-3 shadow-xl text-left text-[11px] space-y-1.5 border border-slate-800 animate-in fade-in zoom-in-95 pointer-events-none">
                              <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                                <span className="font-bold text-indigo-400">{item.taxName || (item.taxRate > 0 ? `GST ${item.taxRate}%` : '0% Tax')}</span>
                                <span className="text-[10px] font-mono text-slate-400">Total: {item.taxRate}%</span>
                              </div>
                              <div className="text-[10px] text-slate-300 font-mono">
                                <strong>Logic:</strong> {item.taxCalculationLogic || `Zoho Books Rate: ${item.taxRate}%`}
                              </div>
                              {item.taxBreakdown && item.taxBreakdown.cgstRate > 0 && (
                                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] border-t border-slate-800 text-slate-300">
                                  <div>CGST: {item.taxBreakdown.cgstRate}% (₹{((item.sellingPrice * item.taxBreakdown.cgstRate) / 100).toFixed(1)})</div>
                                  <div>SGST: {item.taxBreakdown.sgstRate}% (₹{((item.sellingPrice * item.taxBreakdown.sgstRate) / 100).toFixed(1)})</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock on Hand */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                            item.stockOnHand < 10
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {item.stockOnHand} {item.unit}
                        </span>
                      </td>

                      {/* Assigned Template */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Tag className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-medium truncate max-w-[140px]">
                            {assignedTpl ? assignedTpl.name : 'Default Category Template'}
                          </span>
                        </div>
                      </td>

                      {/* POS Quick-Key */}
                      <td className="py-3 px-4">
                        {item.quickKeyEnabled ? (
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold"
                               style={{ borderColor: item.quickKeyColor || '#3B82F6', color: item.quickKeyColor || '#3B82F6' }}>
                            <Grid className="w-3 h-3" />
                            <span>Slot #{item.quickKeyPosition || 1}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Disabled</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedPayloadItemId(item.id);
                              setIsPayloadViewerOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Inspect Raw Zoho Books JSON Payload"
                          >
                            <FileJson className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(item.id)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Edit POS Enrichment Metadata"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSyncItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Resync with Zoho Books"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredItems.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{pageSize === -1 ? 1 : startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {pageSize === -1 ? filteredItems.length : Math.min(startIndex + pageSize, filteredItems.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{filteredItems.length}</span> active items
              {filteredItems.length !== items.length && ` (filtered from ${items.length} total)`}
            </div>

            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={validCurrentPage === 1}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-semibold"
                >
                  Previous
                </button>

                <span className="font-medium px-1">
                  Page {validCurrentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* POS Custom Fields Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Configure POS-Only Custom Fields</h3>
                <p className="text-xs text-slate-500 truncate max-w-sm">{editingItem.name}</p>
              </div>
              <button
                onClick={() => setEditingItemId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Item Info Summary */}
              <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 flex justify-between">
                <div>
                  <span className="text-[11px] text-indigo-700 font-semibold">SKU: {editingItem.sku}</span>
                  <div className="text-[11px] text-indigo-900 font-medium">Selling Price: ₹{editingItem.sellingPrice} (MRP: ₹{editingItem.mrp})</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500">Category</span>
                  <div className="font-semibold text-slate-800">{editingItem.category}</div>
                </div>
              </div>

              {/* 1. Label Template Assignment */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Default Price Tag / Barcode Template</span>
                </label>
                <select
                  value={editingItem.assignedLabelTemplateId || ''}
                  onChange={(e) => {
                    onUpdateItemEnrichment(editingItem.id, {
                      assignedLabelTemplateId: e.target.value || undefined
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Use Category Default Template</option>
                  {labelTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.widthMm}mm × {tpl.heightMm}mm)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  When printing barcode labels in bulk from this admin console or at POS receiving, this layout will be pre-selected.
                </p>
              </div>

              {/* 2. POS Quick-Key Configuration */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 flex items-center space-x-1.5">
                    <Grid className="w-3.5 h-3.5 text-indigo-600" />
                    <span>POS Tablet Quick-Key Hotkey</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.quickKeyEnabled || false}
                      onChange={(e) => {
                        onUpdateItemEnrichment(editingItem.id, {
                          quickKeyEnabled: e.target.checked
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {editingItem.quickKeyEnabled && (
                  <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Grid Slot Position (1 - 20)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={editingItem.quickKeyPosition || 1}
                          onChange={(e) => {
                            onUpdateItemEnrichment(editingItem.id, {
                              quickKeyPosition: parseInt(e.target.value) || 1
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Button Tag Color
                        </label>
                        <div className="flex items-center space-x-1.5 mt-1">
                          {colorOptions.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                onUpdateItemEnrichment(editingItem.id, { quickKeyColor: c });
                              }}
                              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                editingItem.quickKeyColor === c ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setEditingItemId(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

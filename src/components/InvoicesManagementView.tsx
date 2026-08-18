import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Printer, 
  Download, 
  X, 
  Building2,
  Calendar,
  User
} from 'lucide-react';
import { ZohoInvoice } from '../types';

interface InvoicesManagementViewProps {
  invoices: ZohoInvoice[];
  onSyncInvoices: () => void;
  isSyncing: boolean;
}

export const InvoicesManagementView: React.FC<InvoicesManagementViewProps> = ({
  invoices,
  onSyncInvoices,
  isSyncing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'credit_note'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<ZohoInvoice | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalInvoicesValue = invoices
    .filter(i => i.type === 'invoice')
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalCreditNotesValue = invoices
    .filter(i => i.type === 'credit_note')
    .reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6">
      {/* Receipt Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {selectedInvoice.type === 'credit_note' ? 'Credit Note Receipt' : 'Tax Invoice Receipt'}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Receipt Ticket Preview */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {/* Store Branding Header */}
                <div className="text-center pb-4 border-b border-dashed border-slate-200">
                  <h2 className="font-bold text-slate-900 text-base">Urban Atelier Retail Store</h2>
                  <p className="text-xs text-slate-500">Connaught Place, New Delhi • GSTIN: 07AABCU9603R1ZN</p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-1">Synced live from Zoho Books</p>
                </div>

                {/* Customer & Invoice Meta */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Customer / Billed To:</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.customerName}</span>
                    {selectedInvoice.customerPhone && (
                      <span className="block text-slate-500">{selectedInvoice.customerPhone}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Date & Status:</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.date}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase mt-1 ${
                      selectedInvoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      selectedInvoice.status === 'open' || selectedInvoice.status === 'unpaid' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>

                {/* Itemized Line Items Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Itemized Breakdown</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Item / SKU</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Rate</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 ? (
                          selectedInvoice.lineItems.map((li, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-900 block">{li.name}</span>
                                <span className="text-[10px] text-slate-400">{li.sku}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-medium">{li.quantity}</td>
                              <td className="py-2.5 px-3 text-right">₹{li.rate.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-right font-semibold">₹{li.itemTotal.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                              Line items aggregated from Zoho Books summary.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tax Breakdown Section */}
                {selectedInvoice.taxBreakdownList && selectedInvoice.taxBreakdownList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tax Breakdown (GST)</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
                      {selectedInvoice.taxBreakdownList.map((tb, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-600">
                          <span className="font-medium">{tb.taxName} ({tb.taxPercentage}%)</span>
                          <span className="font-semibold text-slate-900">₹{tb.taxAmount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Methods & References Section */}
                {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Method Breakdown & References</h4>
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 space-y-2 text-xs">
                      {selectedInvoice.payments.map((pm, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-indigo-100 shadow-2xs">
                          <div>
                            <span className="font-bold text-indigo-900 uppercase tracking-wide block">{pm.paymentMode}</span>
                            <span className="text-[10px] text-slate-500 block">Ref / Txn ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">{pm.referenceNumber || 'N/A'}</code></span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">₹{pm.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 block">{pm.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totals Summary */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{selectedInvoice.subTotal.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.taxTotal > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST / Tax Total</span>
                      <span>₹{selectedInvoice.taxTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount Given</span>
                      <span>-₹{selectedInvoice.discountTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.shippingCharge && selectedInvoice.shippingCharge > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping Charges</span>
                      <span>₹{selectedInvoice.shippingCharge.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.adjustment && selectedInvoice.adjustment !== 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Adjustment</span>
                      <span>₹{selectedInvoice.adjustment.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                    <span>{selectedInvoice.type === 'credit_note' ? 'Credit Note Total' : 'Invoice Total'}</span>
                    <span>₹{selectedInvoice.total.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.balance > 0 && (
                    <div className="flex justify-between text-amber-600 text-[11px] font-semibold pt-1">
                      <span>Outstanding Balance</span>
                      <span>₹{selectedInvoice.balance.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Synced from Zoho ID: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">{selectedInvoice.invoiceId}</code>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => alert(`Printing receipt ${selectedInvoice.invoiceNumber}...`)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Metrics Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Invoices & Credit Notes</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Zoho Books Live Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inspect all financial invoices and credit notes synchronized from Zoho Books, with itemized tax breakdowns and live receipt previews.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-4 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Invoices Value</span>
              <span className="font-bold text-slate-900">₹{totalInvoicesValue.toLocaleString()}</span>
            </div>
            <div className="border-r border-slate-200 h-6"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">Credit Notes</span>
              <span className="font-bold text-indigo-600">₹{totalCreditNotesValue.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={onSyncInvoices}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync from Zoho'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
              >
                All Documents
              </button>
              <button
                onClick={() => setTypeFilter('invoice')}
                className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'invoice' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Invoices
              </button>
              <button
                onClick={() => setTypeFilter('credit_note')}
                className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'credit_note' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Credit Notes
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="open">Open / Unpaid</option>
              <option value="void">Void</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Doc # & Type</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const isCreditNote = inv.type === 'credit_note';
                  return (
                    <tr 
                      key={inv.id} 
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCreditNote ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isCreditNote ? 'Credit Note' : 'Invoice'}
                          </span>
                          <span className="font-bold text-slate-900">{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{inv.customerName}</td>
                      <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'open' || inv.status === 'unpaid' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{inv.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(inv);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[11px] font-semibold transition-colors"
                        >
                          <span>View Receipt</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No invoices or credit notes found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Sync from Zoho" to load invoices and credit notes from your Zoho Books organization.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

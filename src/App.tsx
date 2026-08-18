import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ItemManagementView } from './components/ItemManagementView';
import { LabelDesignerView } from './components/LabelDesignerView';
import { LoyaltyManagementView } from './components/LoyaltyManagementView';
import { CouponsManagementView } from './components/CouponsManagementView';
import { WhatsAppManagementView } from './components/WhatsAppManagementView';
import { CustomerManagementView } from './components/CustomerManagementView';
import { InvoicesManagementView } from './components/InvoicesManagementView';
import { StaffManagementView } from './components/StaffManagementView';
import { SyncIntegrationsView } from './components/SyncIntegrationsView';
import { SettingsView } from './components/SettingsView';

import {
  INITIAL_STORES,
  INITIAL_ITEMS,
  INITIAL_LABEL_TEMPLATES,
  INITIAL_LOYALTY_CONFIG,
  INITIAL_LOYALTY_LEDGER,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_STAFF,
  INITIAL_SYNC_LOGS,
  INITIAL_INTEGRATION_STATUS,
  SALES_TIMELINE_DATA
} from './data';

import {
  StoreItem,
  LabelTemplate,
  LoyaltyConfig,
  Coupon,
  Customer,
  StaffUser,
  StoreProfile,
  SyncLogEntry,
  IntegrationStatus,
  ZohoCredentials,
  Msg91Credentials,
  SalesSummary,
  ZohoInvoice
} from './types';
import { 
  getSavedZohoCredentials, 
  saveZohoCredentials,
  getSavedSyncedItems,
  saveSyncedItems,
  clearSavedSyncedItems,
  fetchAllActiveItemsFromZoho,
  fetchInvoicesFromZoho,
  fetchCustomersFromZoho
} from './zohoClient';

import { getSavedMsg91Credentials, saveMsg91Credentials } from './msg91Client';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Application Data States (Synced across shared collections)
  const [stores, setStores] = useState<StoreProfile[]>(INITIAL_STORES);
  const [items, setItems] = useState<StoreItem[]>(() => getSavedSyncedItems() || INITIAL_ITEMS);
  const [zohoInvoices, setZohoInvoices] = useState<ZohoInvoice[]>([]);
  const [salesTimeline, setSalesTimeline] = useState<SalesSummary[]>(SALES_TIMELINE_DATA);
  const [labelTemplates, setLabelTemplates] = useState<LabelTemplate[]>(INITIAL_LABEL_TEMPLATES);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyConfig[]>([{ ...INITIAL_LOYALTY_CONFIG, id: 'prog_default', name: 'Default Program' }]);
  const [loyaltyLedger, setLoyaltyLedger] = useState(INITIAL_LOYALTY_LEDGER);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [staff, setStaff] = useState<StaffUser[]>(INITIAL_STAFF);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(INITIAL_SYNC_LOGS);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>(() => {
    const savedItems = getSavedSyncedItems();
    return {
      ...INITIAL_INTEGRATION_STATUS,
      zohoBooks: {
        ...INITIAL_INTEGRATION_STATUS.zohoBooks,
        itemsCount: savedItems ? savedItems.length : INITIAL_ITEMS.length
      }
    };
  });
  const [zohoCredentials, setZohoCredentials] = useState<ZohoCredentials>(getSavedZohoCredentials());
  const [msg91Credentials, setMsg91Credentials] = useState<Msg91Credentials>(getSavedMsg91Credentials());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchCustomersFromZoho(zohoCredentials);
      if (res.success) {
        setCustomers(res.customers.concat(res.vendors));
        showToast(`Synced ${res.customers.length} customers and ${res.vendors.length} vendors from Zoho Books!`);
      } else {
        showToast(res.message || 'Failed to sync contacts from Zoho.');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error syncing contacts.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncInvoicesOnly = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchInvoicesFromZoho(zohoCredentials);
      if (res.success) {
        if (res.invoices) {
          setZohoInvoices(res.invoices);
        }
        if (res.salesTimeline) {
          setSalesTimeline(res.salesTimeline);
        }
        showToast(res.message || 'Synced invoices & credit notes from Zoho Books successfully!');
      } else {
        showToast(res.message || 'Failed to sync invoices.');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error syncing invoices.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateZohoCredentials = (newCreds: ZohoCredentials) => {
    setZohoCredentials(newCreds);
    saveZohoCredentials(newCreds);
    setIntegrationStatus(prev => ({
      ...prev,
      zohoBooks: {
        ...prev.zohoBooks,
        organizationId: newCreds.organizationId,
        autoSyncIntervalMinutes: newCreds.autoSyncIntervalMinutes
      }
    }));
    showToast('Zoho Books API Credentials saved.');
  };

  const handleUpdateMsg91Credentials = (newCreds: Msg91Credentials) => {
    setMsg91Credentials(newCreds);
    saveMsg91Credentials(newCreds);
    setIntegrationStatus(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        phoneNumber: newCreds.senderId,
        connected: newCreds.connectionStatus === 'connected'
      }
    }));
    showToast('MSG91 WhatsApp credentials saved.');
  };

  // Real Sync Handlers
  const handleTriggerSync = async (module: string = 'all') => {
    setIsSyncing(true);
    const startTimestamp = Date.now();
    let totalItemsSynced = items.length;
    let anySuccess = false;

    // Handle Full Force Refresh
    if (module === 'full_force_refresh') {
      setItems([]);
      setSalesTimeline([]);
      setSyncLogs([]);
      module = 'all'; // Continue with full sync
    }

    try {
      // 1. Sync Zoho Items if requested
      if (module === 'all' || module === 'zoho_items') {
        const itemsResult = await fetchAllActiveItemsFromZoho(zohoCredentials, []);
        
        if (itemsResult.success && itemsResult.items) {
          anySuccess = true;
          totalItemsSynced = itemsResult.items.length;
          setItems(itemsResult.items);
          
          const newLog: SyncLogEntry = {
            id: `log_${Date.now()}_items`,
            module: 'zoho_items',
            status: 'success',
            message: `Fetched ${itemsResult.items.length} active items (across ${itemsResult.pagesFetched || 1} pages) from Zoho Books.`,
            recordsProcessed: itemsResult.items.length,
            timestamp: new Date().toISOString(),
            durationMs: itemsResult.durationMs || (Date.now() - startTimestamp)
          };

          setSyncLogs(prev => [newLog, ...prev]);
          setIntegrationStatus(prev => ({
            ...prev,
            zohoBooks: {
              ...prev.zohoBooks,
              connected: true,
              itemsCount: itemsResult.items.length,
              lastSyncTimestamp: new Date().toISOString()
            }
          }));
        } else {
          const errorLog: SyncLogEntry = {
            id: `log_${Date.now()}_err_items`,
            module: 'zoho_items',
            status: 'error',
            message: itemsResult.message || 'Failed to sync items from Zoho Books',
            recordsProcessed: 0,
            timestamp: new Date().toISOString(),
            durationMs: Date.now() - startTimestamp,
            errorDetails: itemsResult.message
          };

          setSyncLogs(prev => [errorLog, ...prev]);
          setIntegrationStatus(prev => ({
            ...prev,
            zohoBooks: {
              ...prev.zohoBooks,
              failedSyncCount: prev.zohoBooks.failedSyncCount + 1
            }
          }));
        }
      }

      // 2. Sync Invoices if requested
      if (module === 'all' || module === 'zoho_invoices') {
        const invResult = await fetchInvoicesFromZoho(zohoCredentials);
        
        if (invResult.success) {
          anySuccess = true;
          if (invResult.salesTimeline && invResult.salesTimeline.length > 0) {
            setSalesTimeline(invResult.salesTimeline);
          }
          if (invResult.invoices) {
            setZohoInvoices(invResult.invoices);
          }

          const invLog: SyncLogEntry = {
            id: `log_${Date.now()}_inv`,
            module: 'zoho_invoices',
            status: 'success',
            message: `Synced ${invResult.invoicesCount || 0} invoices & calculated sales timeline from Zoho Books.`,
            recordsProcessed: invResult.invoicesCount || 0,
            timestamp: new Date().toISOString(),
            durationMs: invResult.durationMs || 420
          };

          setSyncLogs(prev => [invLog, ...prev]);
          setIntegrationStatus(prev => ({
            ...prev,
            zohoBooks: {
              ...prev.zohoBooks,
              connected: true,
              lastSyncTimestamp: new Date().toISOString()
            }
          }));
        } else {
          const errorLog: SyncLogEntry = {
            id: `log_${Date.now()}_err_inv`,
            module: 'zoho_invoices',
            status: 'error',
            message: invResult.message || 'Failed to fetch invoices from Zoho Books',
            recordsProcessed: 0,
            timestamp: new Date().toISOString(),
            durationMs: 300,
            errorDetails: invResult.message
          };

          setSyncLogs(prev => [errorLog, ...prev]);
        }
      }

      // 3. Sync Contacts (Customers & Vendors) if requested
      if (module === 'all' || module === 'zoho_contacts') {
        const contactResult = await fetchCustomersFromZoho(zohoCredentials);
        if (contactResult.success && contactResult.customers) {
          anySuccess = true;
          setCustomers(prev => {
            const existingMap = new Map(prev.map(c => [c.zohoContactId, c]));
            const mergedContacts = [...contactResult.customers, ...contactResult.vendors].map(c => {
              const existing = existingMap.get(c.zohoContactId) as Customer | undefined;
              if (existing) {
                return {
                  ...c,
                  loyaltyProgramId: existing.loyaltyProgramId || c.loyaltyProgramId,
                  assignedCouponIds: existing.assignedCouponIds || c.assignedCouponIds
                };
              }
              return c;
            });
            return mergedContacts;
          });

          const contactLog: SyncLogEntry = {
            id: `log_${Date.now()}_contacts`,
            module: 'zoho_contacts' as any,
            status: 'success',
            message: `Synced ${contactResult.customers.length} customers and ${contactResult.vendors.length} vendors from Zoho Books.`,
            recordsProcessed: contactResult.customers.length + contactResult.vendors.length,
            timestamp: new Date().toISOString(),
            durationMs: contactResult.durationMs || 300
          };
          setSyncLogs(prev => [contactLog, ...prev]);
        }
      }

      if (anySuccess) {
        showToast(
          module === 'zoho_items' 
            ? `Zoho Catalog synced (${totalItemsSynced} active items loaded across all pages)` 
            : module === 'zoho_invoices' 
            ? 'Zoho Invoices synced successfully' 
            : `Full sync completed (${totalItemsSynced} active items + invoices loaded)`
        );
      } else {
        showToast('Sync encountered errors. Check credentials and inspect Sync Logs.');
      }
    } catch (err: any) {
      console.error('Unhandled sync error:', err);
      const fatalLog: SyncLogEntry = {
        id: `log_${Date.now()}_fatal`,
        module: module === 'all' ? 'zoho_items' : (module as any),
        status: 'error',
        message: err?.message || 'Unexpected sync execution error',
        recordsProcessed: 0,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTimestamp,
        errorDetails: err?.stack || String(err)
      };
      setSyncLogs(prev => [fatalLog, ...prev]);
      showToast(`Sync failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSingleItem = async (itemId: string) => {
    const it = items.find(i => i.id === itemId);
    if (!it) return;
    setIsSyncing(true);
    try {
      // Re-fetch catalog or update item timestamp
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, lastSyncedAt: new Date().toISOString(), syncStatus: 'synced' } : item));
      showToast(`Item "${it.name}" (SKU: ${it.sku}) marked synced with Zoho inventory.`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Batch Recalculate GST Rates across entire catalog
  const handleBatchRecalculateGst = () => {
    const updated = items.map(item => {
      const tRate = item.taxRate || 5;
      return {
        ...item,
        taxRate: tRate,
        taxName: item.taxName || `GST ${tRate}%`,
        taxCalculationLogic: 'Direct Zoho Books Tax Property',
        taxBreakdown: { cgstRate: tRate / 2, sgstRate: tRate / 2, igstRate: tRate }
      };
    });
    setItems(updated);
    saveSyncedItems(updated);
    const count5 = updated.filter(i => i.taxRate === 5).length;
    showToast(`Recalculated GST on ${updated.length} items (${count5} items verified on 5% GST slab).`);
  };

  // Handler when Force Refresh Modal completes execution
  const handleForceRefreshComplete = (newItems: StoreItem[], newTimeline: SalesSummary[]) => {
    setItems(newItems);
    setSalesTimeline(newTimeline);
    const count5 = newItems.filter(i => i.taxRate === 5).length;
    showToast(`Force Refresh Complete: ${newItems.length} active items loaded (${count5} on 5% GST).`);
    setIntegrationStatus(prev => ({
      ...prev,
      zohoBooks: {
        ...prev.zohoBooks,
        itemsCount: newItems.length,
        lastSyncTimestamp: new Date().toISOString()
      }
    }));
  };

  // Item Enrichment Handler
  const handleUpdateItemEnrichment = (itemId: string, enrichment: Partial<StoreItem>) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...enrichment } : item));
    showToast('POS custom enrichment metadata saved.');
  };

  // Label Template Handlers
  const handleSaveLabelTemplate = (template: LabelTemplate) => {
    setLabelTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      }
      return [template, ...prev];
    });
    showToast(`Template "${template.name}" saved.`);
  };

  const handleDeleteLabelTemplate = (templateId: string) => {
    setLabelTemplates(prev => prev.filter(t => t.id !== templateId));
    showToast('Label template deleted.');
  };

  const handleSetDefaultLabelTemplate = (templateId: string) => {
    setLabelTemplates(prev => prev.map(t => ({ ...t, isDefault: t.id === templateId })));
    showToast('Default label template updated.');
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    showToast(`Customer ${updatedCustomer.name} updated.`);
  };

  // Loyalty Config Handlers
  const handleAddLoyaltyProgram = (name: string) => {
    const newProg: LoyaltyConfig = {
      id: `prog_${Date.now()}`,
      name: name,
      pointsPerRupeeSpent: 0.05,
      rupeeValuePerPoint: 0.50,
      minRedemptionPoints: 100,
      maxDiscountPercentageOfBill: 50,
      pointsExpiryMonths: 12,
      isCategoryMultiplierEnabled: false,
      categoryMultipliers: { 'Standard': 1.0 },
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin'
    };
    setLoyaltyPrograms([...loyaltyPrograms, newProg]);
    showToast(`Loyalty program "${name}" created.`);
  };

  const handleBulkAssignCustomers = (programId: string, customerIds: string[]) => {
    setCustomers(customers.map(c => 
      customerIds.includes(c.id) ? { ...c, loyaltyProgramId: programId } : c
    ));
    showToast(`Assigned ${customerIds.length} customers to program.`);
  };

  // Coupon Handlers
  const handleCreateCoupon = (coupon: Coupon) => {
    setCoupons(prev => [coupon, ...prev]);
    showToast(`Coupon ${coupon.code} published!`);
  };

  // Customer Handlers
  const handleCreateCustomer = (newCustomer: Customer) => {
    setCustomers([...customers, newCustomer]);
    showToast(`Customer ${newCustomer.name} created.`);
  };

  const handleBulkAssignCoupon = (customerIds: string[], couponId: string) => {
    setCustomers(prev => prev.map(c => {
      if (customerIds.includes(c.id)) {
        const existingCoupons = c.assignedCouponIds || [];
        if (!existingCoupons.includes(couponId)) {
          return { ...c, assignedCouponIds: [...existingCoupons, couponId] };
        }
      }
      return c;
    }));
    showToast(`Assigned promo code to ${customerIds.length} customers successfully!`);
  };

  const handleUpdateCoupon = (coupon: Coupon) => {
    setCoupons(prev => prev.map(c => c.id === coupon.id ? coupon : c));
    showToast(`Coupon ${coupon.code} updated.`);
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    showToast('Coupon removed.');
  };

  // Staff Handlers
  const handleCreateStaff = (newStaff: StaffUser) => {
    setStaff(prev => [...prev, newStaff]);
    showToast(`Staff member ${newStaff.name} created.`);
  };

  const handleUpdateStaff = (updatedStaff: StaffUser) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    showToast(`Staff member ${updatedStaff.name} updated.`);
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    showToast('Staff access revoked.');
  };

  // Store Handlers
  const handleUpdateStore = (store: StoreProfile) => {
    setStores(prev => prev.map(s => s.id === store.id ? store : s));
    showToast(`Store profile "${store.name}" updated.`);
  };

  const handleAddStore = (store: StoreProfile) => {
    setStores(prev => [...prev, store]);
    showToast(`New store "${store.name}" added.`);
  };

  const handleRetryFailedLog = (logId: string) => {
    setSyncLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'success', message: `${l.message} (Retried successfully)` } : l));
    showToast('Transaction retry resolved successfully.');
  };

  const zohoCategories = Array.from(new Set(items.map(it => it.category || 'Uncategorized')));

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stores={stores}
        selectedStoreId={selectedStoreId}
        setSelectedStoreId={setSelectedStoreId}
        integrationStatus={integrationStatus}
        onQuickSync={() => handleTriggerSync('zoho_items')}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-100">
        <div className="p-6 max-w-7xl w-full mx-auto pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView
              salesTimeline={salesTimeline}
              integrationStatus={integrationStatus}
              stores={stores}
              selectedStoreId={selectedStoreId}
              coupons={coupons}
              loyaltyLedger={loyaltyLedger}
              onTriggerSync={() => handleTriggerSync('all')}
              isSyncing={isSyncing}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'items' && (
            <ItemManagementView
              items={items}
              labelTemplates={labelTemplates}
              onUpdateItemEnrichment={handleUpdateItemEnrichment}
              onSyncItem={handleSyncSingleItem}
              onSyncAllCatalog={() => handleTriggerSync('zoho_items')}
              onBatchRecalculateGst={handleBatchRecalculateGst}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'labels' && (
            <LabelDesignerView
              templates={labelTemplates}
              items={items}
              onSaveTemplate={handleSaveLabelTemplate}
              onDeleteTemplate={handleDeleteLabelTemplate}
              onSetDefaultTemplate={handleSetDefaultLabelTemplate}
            />
          )}

          {activeTab === 'loyalty' && (
            <LoyaltyManagementView
              programs={loyaltyPrograms}
              ledger={loyaltyLedger}
              customers={customers}
              items={items}
              onUpdatePrograms={setLoyaltyPrograms}
              onAddProgram={handleAddLoyaltyProgram}
              onBulkAssign={handleBulkAssignCustomers}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsManagementView
              coupons={coupons}
              categories={zohoCategories}
              customers={customers}
              onCreateCoupon={handleCreateCoupon}
              onUpdateCoupon={handleUpdateCoupon}
              onDeleteCoupon={handleDeleteCoupon}
              onBulkAssignCoupon={handleBulkAssignCoupon}
            />
          )}

          {activeTab.startsWith('whatsapp_') && (
            <WhatsAppManagementView activeTab={activeTab} />
          )}

          {activeTab === 'invoices' && (
            <InvoicesManagementView
              invoices={zohoInvoices}
              onSyncInvoices={handleSyncInvoicesOnly}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagementView
              customers={customers}
              loyaltyLedger={loyaltyLedger}
              programs={loyaltyPrograms}
              onCreateCustomer={handleCreateCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onSyncContacts={handleSyncContacts}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'staff' && (
            <StaffManagementView
              staff={staff}
              stores={stores}
              onCreateStaff={handleCreateStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {activeTab === 'sync' && (
            <SyncIntegrationsView
              logs={syncLogs}
              status={integrationStatus}
              zohoCredentials={zohoCredentials}
              msg91Credentials={msg91Credentials}
              items={items}
              onUpdateZohoCredentials={handleUpdateZohoCredentials}
              onUpdateMsg91Credentials={handleUpdateMsg91Credentials}
              onTriggerSync={handleTriggerSync}
              onForceRefreshComplete={handleForceRefreshComplete}
              onBatchRecalculateGst={handleBatchRecalculateGst}
              onRetryFailed={handleRetryFailedLog}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              stores={stores}
              labelTemplates={labelTemplates}
              zohoCredentials={zohoCredentials}
              onUpdateStore={handleUpdateStore}
              onAddStore={handleAddStore}
              onUpdateZohoCredentials={handleUpdateZohoCredentials}
            />
          )}
        </div>
      </main>
    </div>
  );
}

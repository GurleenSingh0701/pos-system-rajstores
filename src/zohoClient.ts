import { ZohoCredentials, StoreItem, SalesSummary, ZohoInvoice, Customer } from './types';

const ZOHO_STORAGE_KEY = 'pos_admin_zoho_credentials';
const ITEMS_STORAGE_KEY = 'pos_admin_synced_items';

export const DEFAULT_ZOHO_CREDENTIALS: ZohoCredentials = {
  clientId: '1000.9ABCDEF1234567890XYZ',
  clientSecret: '••••••••••••••••••••••••••••••••',
  refreshToken: '1000.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.7q8r9s0t',
  accessToken: '',
  organizationId: '60029381724',
  dataCenter: 'in',
  autoSyncEnabled: true,
  autoSyncIntervalMinutes: 15,
  connectionStatus: 'connected',
  lastTestedAt: new Date().toISOString(),
  lastTestMessage: 'Connected to Zoho Books Organization: Urban Atelier Retail Pvt Ltd (INR)'
};

export function getSavedZohoCredentials(): ZohoCredentials {
  try {
    const data = localStorage.getItem(ZOHO_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading Zoho credentials from localStorage', e);
  }
  return DEFAULT_ZOHO_CREDENTIALS;
}

export function saveZohoCredentials(creds: ZohoCredentials): void {
  try {
    localStorage.setItem(ZOHO_STORAGE_KEY, JSON.stringify(creds));
  } catch (e) {
    console.error('Error saving Zoho credentials to localStorage', e);
  }
}

export function getSavedSyncedItems(): StoreItem[] | null {
  try {
    const data = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading synced items from localStorage', e);
  }
  return null;
}

export function saveSyncedItems(items: StoreItem[]): void {
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota exceeded, storing truncated synced items batch', e);
    try {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
    } catch (err) {
      console.error('Failed to save even truncated items to localStorage', err);
    }
  }
}

export function clearSavedSyncedItems(): void {
  try {
    localStorage.removeItem(ITEMS_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing synced items from localStorage', e);
  }
}

export interface ZohoTestResult {
  success: boolean;
  message: string;
  details?: {
    organizationName?: string;
    currencyCode?: string;
    timeZone?: string;
    fiscalYearStartMonth?: number;
    planType?: string;
    latencyMs?: number;
    dataCenterDomain?: string;
  };
}

export interface ZohoFetchItemsResult {
  success: boolean;
  message: string;
  items: StoreItem[];
  pagesFetched?: number;
  totalActiveItems?: number;
  totalInZoho?: number;
  durationMs?: number;
}

export interface ZohoFetchInvoicesResult {
  success: boolean;
  message: string;
  invoicesCount?: number;
  creditNotesCount?: number;
  invoices?: ZohoInvoice[];
  salesTimeline?: SalesSummary[];
  durationMs?: number;
}

/**
 * Tests connection with Zoho Books API using real backend proxy endpoint
 */
export async function testZohoBooksConnection(creds: ZohoCredentials): Promise<ZohoTestResult> {
  // Basic pre-validation
  if (!creds.organizationId || creds.organizationId.trim().length < 4) {
    return {
      success: false,
      message: 'Invalid Organization ID. Please enter a valid Zoho Books Organization ID.'
    };
  }

  if (!creds.clientId || creds.clientId.trim().length < 4) {
    return {
      success: false,
      message: 'Client ID is missing or incomplete.'
    };
  }

  if (!creds.refreshToken && !creds.accessToken) {
    return {
      success: false,
      message: 'OAuth Refresh Token or Access Token is required to authenticate with Zoho Books.'
    };
  }

  try {
    const response = await fetch('/api/zoho/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(creds)
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error calling /api/zoho/test-connection:', error);
    return {
      success: false,
      message: error?.message || 'Failed to connect to backend server. Please verify backend is running.'
    };
  }
}

/**
 * Fetches ALL active items from Zoho Books API, paginating through all available pages
 * instead of stopping at the 200 items limit.
 */
export async function fetchAllActiveItemsFromZoho(
  creds: ZohoCredentials,
  existingItems: StoreItem[] = []
): Promise<ZohoFetchItemsResult> {
  try {
    const response = await fetch('/api/zoho/fetch-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(creds)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch items from Zoho Books');
    }

    const fetchedItems: StoreItem[] = data.items || [];

    // Merge with existing items to preserve POS-only enrichments (custom templates, quick keys, colors)
    const existingMap = new Map<string, StoreItem>();
    existingItems.forEach(it => {
      existingMap.set(it.zohoItemId, it);
      existingMap.set(it.sku, it);
    });

    const mergedItems = fetchedItems.map(it => {
      const existing = existingMap.get(it.zohoItemId) || existingMap.get(it.sku);
      if (existing) {
        return {
          ...it,
          assignedLabelTemplateId: existing.assignedLabelTemplateId || it.assignedLabelTemplateId,
          quickKeyEnabled: existing.quickKeyEnabled !== undefined ? existing.quickKeyEnabled : it.quickKeyEnabled,
          quickKeyPosition: existing.quickKeyPosition !== undefined ? existing.quickKeyPosition : it.quickKeyPosition,
          quickKeyColor: existing.quickKeyColor || it.quickKeyColor
        };
      }
      return it;
    });

    // Save to local storage for offline / quick reload
    saveSyncedItems(mergedItems);

    return {
      success: true,
      message: data.message || `Successfully fetched all ${mergedItems.length} active items from Zoho Books!`,
      items: mergedItems,
      pagesFetched: data.pagesFetched,
      totalActiveItems: data.totalActiveItems,
      totalInZoho: data.totalInZoho,
      durationMs: data.durationMs
    };
  } catch (error: any) {
    console.error('Error calling /api/zoho/fetch-items:', error);
    return {
      success: false,
      message: error?.message || 'Error communicating with Zoho Books API.',
      items: existingItems
    };
  }
}

/**
 * Fetches recent invoices from Zoho Books and aggregates revenue timeline
 */
export async function fetchInvoicesFromZoho(
  creds: ZohoCredentials
): Promise<ZohoFetchInvoicesResult> {
  try {
    const response = await fetch('/api/zoho/fetch-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(creds)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch invoices from Zoho Books');
    }

    return {
      success: true,
      message: data.message || 'Successfully synchronized invoices with Zoho Books',
      invoicesCount: data.invoicesCount,
      creditNotesCount: data.creditNotesCount,
      invoices: data.invoices || [],
      salesTimeline: data.salesTimeline,
      durationMs: data.durationMs
    };
  } catch (error: any) {
    console.error('Error calling /api/zoho/fetch-invoices:', error);
    return {
      success: false,
      message: error?.message || 'Error fetching invoices from Zoho Books.'
    };
  }
}

export interface ZohoFetchCustomersResult {
  success: boolean;
  message: string;
  customers: Customer[];
  vendors: Customer[];
  durationMs?: number;
}

export async function fetchCustomersFromZoho(
  creds: ZohoCredentials
): Promise<ZohoFetchCustomersResult> {
  try {
    const response = await fetch('/api/zoho/fetch-contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(creds)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch contacts from Zoho Books');
    }

    return {
      success: true,
      message: data.message || 'Successfully synchronized customers and vendors from Zoho Books!',
      customers: data.customers || [],
      vendors: data.vendors || [],
      durationMs: data.durationMs
    };
  } catch (error: any) {
    console.error('Error calling /api/zoho/fetch-contacts:', error);
    return {
      success: false,
      message: error?.message || 'Error communicating with Zoho Books Contacts API.',
      customers: [],
      vendors: []
    };
  }
}

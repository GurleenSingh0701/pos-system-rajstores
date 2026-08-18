export interface StoreItem {
  id: string;
  zohoItemId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  sellingPrice: number;
  mrp: number;
  stockOnHand: number;
  unit: string;
  taxRate: number; // e.g. 5 for 5% GST
  taxName: string;
  taxCalculationLogic?: string;
  taxBreakdown?: {
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
  };
  sizeOrVariant?: string;
  rawZohoPayload?: Record<string, any>;
  // POS-only custom enrichment fields:
  assignedLabelTemplateId?: string;
  quickKeyEnabled?: boolean;
  quickKeyPosition?: number; // 1-20
  quickKeyColor?: string;
  lastSyncedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface LabelTemplateElement {
  id: string;
  type: 'itemName' | 'price' | 'mrp' | 'barcode' | 'sku' | 'variant' | 'storeLogo' | 'customText' | 'qrCode';
  label: string;
  x: number; // percentage (0-100) or mm relative
  y: number; // percentage (0-100)
  fontSize: number; // pt/px
  fontWeight: 'normal' | 'bold' | '600' | '800';
  textAlign: 'left' | 'center' | 'right';
  customText?: string;
  prefix?: string;
  suffix?: string;
  showPrefix?: boolean;
  barcodeFormat?: 'CODE128' | 'EAN13' | 'UPC';
  width?: number;
  height?: number;
  visible: boolean;
}

export interface LabelTemplate {
  id: string;
  name: string;
  widthMm: number; // e.g. 50
  heightMm: number; // e.g. 25
  isDefault: boolean;
  assignedCategory?: string;
  elements: LabelTemplateElement[];
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyConfig {
  id: string;
  name: string;
  pointsPerRupeeSpent: number; // e.g., 0.05 (1 point per ₹20)
  rupeeValuePerPoint: number; // e.g., 0.5 (1 point = ₹0.50)
  minRedemptionPoints: number; // e.g., 100
  maxDiscountPercentageOfBill: number; // e.g., 50 (%)
  pointsExpiryMonths: number; // e.g., 12
  isCategoryMultiplierEnabled: boolean;
  categoryMultipliers: { [category: string]: number };
  updatedAt: string;
  updatedBy: string;
}

export interface LoyaltyLedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  balanceAfter: number;
  billId?: string;
  billAmount?: number;
  storeId: string;
  notes?: string;
  timestamp: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number; // e.g., ₹100 or 15%
  maxDiscountAmount?: number; // for percentage caps
  minBillValue: number;
  startDate: string;
  endDate: string;
  totalUsageLimit?: number;
  customerUsageLimit: number;
  usedCount: number;
  totalDiscountGiven: number;
  associatedSalesVolume: number;
  applicableCategories?: string[]; // empty = all
  isActive: boolean;
  isWhatsAppBroadcastEligible: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  zohoContactId: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  loyaltyPointsBalance: number;
  totalSpend: number;
  totalVisits: number;
  lastVisitDate: string;
  status: 'active' | 'inactive';
  loyaltyProgramId?: string;
  assignedCouponIds?: string[];
  contactType?: 'customer' | 'vendor';
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  pin: string; // 4 or 6 digit PIN
  assignedStores: string[];
  active: boolean;
  lastLogin?: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  gstin: string;
  taxDisplayPreference: 'inclusive' | 'exclusive';
  defaultPrinterName?: string;
  defaultLabelTemplateId?: string;
  logoUrl?: string;
}

export interface SyncLogEntry {
  id: string;
  module: 'zoho_items' | 'zoho_invoices' | 'zoho_contacts' | 'whatsapp' | 'bills_queue';
  status: 'success' | 'warning' | 'error';
  message: string;
  recordsProcessed: number;
  timestamp: string;
  durationMs: number;
  errorDetails?: string;
  retryCount?: number;
}

export interface SalesSummary {
  period: string; // e.g., '2026-08-16' or 'Week 33' or 'August 2026'
  totalRevenue: number;
  invoiceCount: number;
  averageBillValue: number;
  totalTax: number;
  loyaltyPointsIssued: number;
  loyaltyPointsRedeemed: number;
  couponDiscounts: number;
}

export interface IntegrationStatus {
  zohoBooks: {
    connected: boolean;
    organizationName: string;
    organizationId: string;
    lastSyncTimestamp: string;
    itemsCount: number;
    pendingQueueCount: number;
    failedSyncCount: number;
    autoSyncIntervalMinutes: number;
  };
  whatsapp: {
    connected: boolean;
    phoneNumber: string;
    wabaId: string;
    tier: string;
    coexistenceEnabled: boolean;
    dailyLimitUsed: number;
    dailyLimitTotal: number;
  };
  firebase: {
    connected: boolean;
    projectId: string;
    sharedDbMode: 'cloud' | 'local_fallback';
  };
}

export interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  organizationId: string;
  dataCenter: 'in' | 'com' | 'eu' | 'com.au' | 'com.cn' | 'jp';
  autoSyncEnabled: boolean;
  autoSyncIntervalMinutes: number;
  lastTestedAt?: string;
  connectionStatus: 'connected' | 'untested' | 'failed' | 'testing';
  lastTestMessage?: string;
}

export interface Msg91Credentials {
  authKey: string;
  templateId: string;
  senderId: string;
  connectionStatus: 'connected' | 'untested' | 'failed' | 'testing';
  lastTestedAt?: string;
  lastTestMessage?: string;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  headerType?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
  bodyText: string;
  footerText?: string;
  buttons?: Array<{ type: 'URL' | 'QUICK_REPLY'; text: string; url?: string }>;
  sampleVariables: Record<string, string>;
}

export interface WhatsAppWebhookEvent {
  id: string;
  timestamp: string;
  type: 'status_update' | 'inbound_message' | 'coexistence_sync';
  recipientId: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  messageText?: string;
  templateName?: string;
  rawPayload?: any;
}

export interface InvoiceLineItem {
  itemId: string;
  name: string;
  sku: string;
  quantity: number;
  rate: number;
  itemTotal: number;
  taxAmount: number;
  taxRate: number;
}

export interface InvoicePaymentRecord {
  paymentId?: string;
  paymentMode: string;
  amount: number;
  date: string;
  referenceNumber?: string;
}

export interface TaxBreakdownItem {
  taxName: string;
  taxPercentage: number;
  taxAmount: number;
}

export interface ZohoInvoice {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  date: string;
  dueDate?: string;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'void' | 'draft' | 'open';
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingCharge?: number;
  adjustment?: number;
  total: number;
  balance: number;
  type: 'invoice' | 'credit_note';
  lineItems: InvoiceLineItem[];
  payments: InvoicePaymentRecord[];
  taxBreakdownList: TaxBreakdownItem[];
  rawPayload?: Record<string, any>;
  syncedAt: string;
}


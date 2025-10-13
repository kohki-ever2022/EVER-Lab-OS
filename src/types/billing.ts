// src/types/billing.ts

export enum InvoiceStatus {
    Draft = 'Draft',
    Issued = 'Issued',
    Sent = 'Sent',
    Paid = 'Paid',
    Overdue = 'Overdue',
    Cancelled = 'Cancelled',
}

export enum PaymentMethod {
  Monthly = 'MONTHLY',
  Annual = 'ANNUAL',
  MultiMonth = 'MULTI_MONTH'
}

export enum PaymentCycle {
  CurrentMonth = 'CURRENT_MONTH',
  NextMonth = 'NEXT_MONTH',
  Immediate = 'IMMEDIATE'
}

export enum ChargeItemType {
  BaseRent = 'BASE_RENT',
  EquipmentUsage = 'EQUIPMENT_USAGE',
  DedicatedEquipment = 'DEDICATED_EQUIPMENT',
  Option = 'OPTION',
  Utility = 'UTILITY'
}

export interface ChargeItem {
  id: string;
  type: ChargeItemType;
  name: string;
  nameJP: string;
  nameEN: string;
  amount: number;
  paymentCycle: PaymentCycle;
  isTaxable: boolean;
  tenantId: string;
  equipmentId?: string;
  startDate: Date;
  endDate?: Date;
}

export interface TaxRate {
  id: string;
  effectiveDate: string;
  rate: number;
}

export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  period: string; // YYYY-MM
  issueDate: Date;
  dueDate: Date;
  fixedCosts: {
    facilityFee: number;
    storageFee: number;
  };
  variableCosts: {
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotalBeforeTax: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  mfPartnerId?: string;
  mfInvoiceId?: string;
  mfInvoiceUrl?: string;
  mfPdfUrl?: string;
  localPdfPath?: string;
}

export interface SpaceOccupyingLease {
    id: string;
    tenantId: string;
    equipmentId: string;
    monthlyFee: number;
    startDate: Date;
    endDate?: Date;
}

export interface MFConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
}
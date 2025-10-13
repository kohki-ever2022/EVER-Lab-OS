// src/types/inventory.ts
import { SDSSummary } from './qms';

// --- Enums ---
export enum OrderStatus {
  PendingApproval = 'PENDING_APPROVAL',
  Approved = 'APPROVED',
  Ordered = 'ORDERED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
  Rejected = 'REJECTED',
}

export enum InventoryType {
  General = 'general',
  Volume = 'volume',
  HazardousOrPoisonous = 'hazardous_poison',
  Unclassified = 'unclassified',
}

export enum PoisonousDesignation {
  None = 'NONE',
  Poison = 'POISON',
  Deleterious = 'DELETERIOUS',
  SpecifiedPoison = 'SPECIFIED_POISON',
}

export enum QuotationStatus {
  Requested = 'REQUESTED',
  Answered = 'ANSWERED',
  Ordered = 'ORDERED',
  Expired = 'EXPIRED',
}

export enum InquiryStatus {
  Sent = 'SENT',
  Answered = 'ANSWERED',
}

export enum ExpenseType {
    CapEx = 'CapEx',
    OpEx = 'OpEx',
}

// --- Interfaces ---

export interface Consumable {
  id: string;
  type: 'sales' | 'internal';
  nameJP: string;
  nameEN: string;
  categoryJP: string;
  categoryEN: string;
  stock: number;
  lowStockThreshold: number;
  price?: number;
  location?: string;
  isHazardous?: boolean;
  hazardousCategory?: string;
  designatedQuantity?: number;
  packageSize?: number;
  packageUnit?: 'mL' | 'L' | 'g' | 'kg';
  sdsId?: string;
  sdsSummaryCacheJP?: SDSSummary;
  sdsSummaryCacheEN?: SDSSummary;
  ownerCompanyId?: string;
  expiryDate?: string;
  manufacturer?: string;
  casNumber?: string;
  modelNumber?: string;
  lotNumber?: string;
  inventoryType: InventoryType;
  poisonousDesignation?: PoisonousDesignation;
  properStock?: number;
  isLocked?: boolean;
  lockDate?: Date;
}

export interface Order {
  id: string;
  userId: string;
  companyId: string;
  consumableId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderDate: Date;
  status: OrderStatus;
  projectId?: string;
}

export interface PurchaseOrderLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    expenseType: ExpenseType;
}

export interface PurchaseOrder {
  id: string;
  requesterId: string;
  companyId: string;
  orderDate: Date;
  status: OrderStatus;
  lines: PurchaseOrderLine[];
  projectId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  companyId: string;
}

export interface QuotationResponse {
  supplierId: string;
  answeredAt: Date;
  price?: number;
  deliveryDate?: Date;
  validUntil?: Date;
  storageCondition?: string;
  isHazardous?: boolean;
  hazardousCategory?: string;
  designatedQuantity?: number;
  packageSize?: number;
  packageUnit?: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  requesterId: string;
  companyId: string;
  productName: string;
  productDetails: string;
  quantity: number;
  supplierIds: string[];
  requestDate: Date;
  status: QuotationStatus;
  responses: QuotationResponse[];
  quotationToken: string;
  tokenExpiresAt: Date;
}

export interface InquiryResponse {
    supplierId: string;
    respondedAt: Date;
    message: string;
}

export interface Inquiry {
  id: string;
  requesterId: string;
  companyId: string;
  subject: string;
  message: string;
  supplierIds: string[];
  requestDate: Date;
  status: InquiryStatus;
  responses: InquiryResponse[];
  isRead: boolean;
}

export interface InventorySnapshot {
  id: string;
  snapshotDate: Date;
  period: string; // YYYY-MM
  consumables: {
    id: string;
    nameJP: string;
    nameEN: string;
    stock: number;
    unit: string;
    categoryJP: string;
    categoryEN: string;
    ownerCompanyId?: string;
  }[];
  createdBy: string;
  notes?: string;
}

export interface ConsumableNotification {
  id: string;
  consumableId: string;
  consumableName: string;
  consumableNameJP: string;
  consumableNameEN: string;
  location: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  reportedBy: string;
  reportedDate: Date;
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
  restockedDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'REPORTED' | 'ACKNOWLEDGED' | 'RESTOCKING' | 'COMPLETED';
  notes?: string;
}

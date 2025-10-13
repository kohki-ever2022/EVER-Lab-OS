// src/types/core.ts
// Most basic types with no other dependencies to prevent circular imports.

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export enum Language {
  JA = 'JA',
  EN = 'EN',
}

export enum RoleCategory {
  Facility = 'FACILITY',
  Tenant = 'TENANT',
  External = 'EXTERNAL',
}

export enum Role {
  FacilityDirector = 'FACILITY_DIRECTOR',
  LabManager = 'LAB_MANAGER',
  ProjectManager = 'PROJECT_MANAGER',
  Researcher = 'RESEARCHER',
  Supplier = 'SUPPLIER',
}

// --- View Types ---
export type View = AdminView | TenantView | SupplierView;

export type AdminView =
    | 'adminDashboard' | 'equipmentManagement' | 'billingManagement'
    | 'userManagement' | 'roleManagement' | 'settings' | 'auditLog'
    | 'maintenanceLog' | 'allInventoryViewer' | 'salesConsumablesManagement'
    | 'internalConsumablesManagement' | 'hazardousMaterialsDashboard'
    | 'labCalendarAdmin' | 'memos' | 'facilityDashboard' | 'compliance'
    | 'bsl2Checklist' | 'facilityLayout' | 'introductionsPipeline'
    | 'qmsDashboard' | 'cmmsDashboard' | 'coldChain' | 'dataPlatform'
    | 'tenantCrm' | 'legalDocsIp' | 'ehsDashboard' | 'budgeting'
    | 'wasteCompliance' | 'helpdesk' | 'allOrders' | 'inventoryLockManager'
    | 'facilityConsumableNotification' | 'co2IncubatorManagement' | 'manuals' | 'rules'
    | 'insuranceManagement' | 'monthlyReportGenerator' | 'training' | 'sdsManagement'
    | 'projectProgress' | 'projectGanttChart' | 'chat';

export type TenantView =
    | 'dashboard' | 'equipment' | 'reservations' | 'billing' | 'announcements'
    | 'profile' | 'memberManagement' | 'maintenanceStatus' | 'projects'
    | 'certificateManagement' | 'insuranceManagement' | 'labCalendarUser' | 'protocols'
    | 'sampleManagement' | 'billingSummary' | 'tasks' | 'training'
    | 'myTickets' | 'sdsManagement' | 'quotationList' | 'purchaseOrders'
    | 'inventoryList' | 'consumablesStore' | 'supplierInquiry'
    | 'reorderSuggestions' | 'supplierManagement' | 'favoriteConsumables'
    | 'facilityConsumableNotification' | 'manuals' | 'rules' | 'electronicLabNotebook'
    | 'projectProgress' | 'projectGanttChart' | 'chat';

export type SupplierView = 'dashboard' | 'profile' | 'supplierDashboard';

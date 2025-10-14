// src/contexts/AppProviders.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  MonthlyReport,
  BenchAssignment,
  InventorySnapshot,
  AuditLog,
  SystemSettings,
  Plan,
  EquipmentManual,
  SDS,
  EhsIncident,
  RegulatoryRequirement,
  InsuranceCertificate,
  Manual,
  LabRule,
  Qualification,
  UserCertification,
  Protocol,
  Invoice,
  Quotation,
  ConsumableNotification,
  CO2IncubatorTracking,
  Memo,
  WaitlistEntry,
} from '../types';
import { useDataAdapter } from './DataAdapterContext';
import { getMockData } from '../data/mockData';

// --- Admin Context ---
interface AdminContextValue {
  monthlyReports: MonthlyReport[];
  benchAssignments: BenchAssignment[];
  inventorySnapshots: InventorySnapshot[];
  setInventorySnapshots: React.Dispatch<React.SetStateAction<InventorySnapshot[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  equipmentManuals: EquipmentManual[];
}
const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const initialData = getMockData();

  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [benchAssignments, setBenchAssignments] = useState<BenchAssignment[]>(initialData.benchAssignments);
  const [inventorySnapshots, setInventorySnapshots] = useState<InventorySnapshot[]>(initialData.inventorySnapshots);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialData.auditLogs);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialData.systemSettings);
  const [plans, setPlans] = useState<Plan[]>(initialData.plans);
  const [equipmentManuals, setEquipmentManuals] = useState<EquipmentManual[]>(initialData.equipmentManuals);
  
  useEffect(() => {
    const unsub = adapter.subscribeToMonthlyReports(setMonthlyReports);
    return () => unsub();
  }, [adapter]);
  
  const value = useMemo(() => ({
    monthlyReports, benchAssignments, inventorySnapshots, setInventorySnapshots,
    auditLogs, setAuditLogs, systemSettings, setSystemSettings, plans, setPlans,
    equipmentManuals
  }), [monthlyReports, benchAssignments, inventorySnapshots, auditLogs, systemSettings, plans, equipmentManuals]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
export const useAdminContext = () => {
  const c = useContext(AdminContext);
  if (!c) throw new Error('useAdminContext must be inside AdminProvider');
  return c;
};

// --- QMS Context ---
interface QmsContextValue {
  sds: SDS[];
  ehsIncidents: EhsIncident[];
  regulatoryRequirements: RegulatoryRequirement[];
  insuranceCertificates: InsuranceCertificate[];
  manuals: Manual[];
  labRules: LabRule[];
  setLabRules: React.Dispatch<React.SetStateAction<LabRule[]>>;
  qualifications: Qualification[];
  userCertifications: UserCertification[];
  protocols: Protocol[];
}
const QmsContext = createContext<QmsContextValue | null>(null);

export const QmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const adapter = useDataAdapter();
    const initialData = getMockData();

    const [sds, setSds] = useState<SDS[]>([]);
    const [ehsIncidents, setEhsIncidents] = useState<EhsIncident[]>(initialData.ehsIncidents);
    const [regulatoryRequirements, setRegulatoryRequirements] = useState<RegulatoryRequirement[]>([]);
    const [insuranceCertificates, setInsuranceCertificates] = useState<InsuranceCertificate[]>([]);
    const [manuals, setManuals] = useState<Manual[]>(initialData.manuals);
    const [labRules, setLabRules] = useState<LabRule[]>(initialData.labRules);
    const [qualifications, setQualifications] = useState<Qualification[]>(initialData.qualifications);
    const [userCertifications, setUserCertifications] = useState<UserCertification[]>(initialData.userCertifications);
    const [protocols, setProtocols] = useState<Protocol[]>(initialData.protocols);

    useEffect(() => {
        const unsubSds = adapter.subscribeToSds(setSds);
        const unsubReqs = adapter.subscribeToRegulatoryRequirements(setRegulatoryRequirements);
        const unsubIns = adapter.subscribeToInsuranceCertificates(setInsuranceCertificates);
        return () => { unsubSds(); unsubReqs(); unsubIns(); };
    }, [adapter]);
    
    const value = useMemo(() => ({
        sds, ehsIncidents, regulatoryRequirements, insuranceCertificates, manuals,
        labRules, setLabRules, qualifications, userCertifications, protocols
    }), [sds, ehsIncidents, regulatoryRequirements, insuranceCertificates, manuals, labRules, qualifications, userCertifications, protocols]);

    return <QmsContext.Provider value={value}>{children}</QmsContext.Provider>;
};
export const useQmsContext = () => {
    const c = useContext(QmsContext);
    if (!c) throw new Error('useQmsContext must be inside QmsProvider');
    return c;
};

// --- Billing Context ---
interface BillingContextValue { invoices: Invoice[]; }
const BillingContext = createContext<BillingContextValue | null>(null);
export const BillingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // In a real app this would subscribe to invoices. For mock data, it's empty initially.
    const [invoices] = useState<Invoice[]>(getMockData().invoices);
    const value = useMemo(() => ({ invoices }), [invoices]);
    return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
};
export const useBillingContext = () => {
    const c = useContext(BillingContext);
    if (!c) throw new Error('useBillingContext must be inside BillingProvider');
    return c;
};

// --- Purchasing Context ---
interface PurchasingContextValue {
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
}
const PurchasingContext = createContext<PurchasingContextValue | null>(null);
export const PurchasingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [quotations, setQuotations] = useState<Quotation[]>(getMockData().quotations);
    const value = useMemo(() => ({ quotations, setQuotations }), [quotations]);
    return <PurchasingContext.Provider value={value}>{children}</PurchasingContext.Provider>;
};
export const usePurchasingContext = () => {
    const c = useContext(PurchasingContext);
    if (!c) throw new Error('usePurchasingContext must be inside PurchasingProvider');
    return c;
};

// --- Lab State Context ---
interface LabStateContextValue {
  consumableNotifications: ConsumableNotification[];
  setConsumableNotifications: React.Dispatch<React.SetStateAction<ConsumableNotification[]>>;
  co2IncubatorTrackingData: CO2IncubatorTracking[];
  setCo2IncubatorTrackingData: React.Dispatch<React.SetStateAction<CO2IncubatorTracking[]>>;
  memos: Memo[];
  waitlist: WaitlistEntry[];
  setWaitlist: React.Dispatch<React.SetStateAction<WaitlistEntry[]>>;
}
const LabStateContext = createContext<LabStateContextValue | null>(null);
export const LabStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialData = getMockData();
    const [consumableNotifications, setConsumableNotifications] = useState<ConsumableNotification[]>(initialData.consumableNotifications);
    const [co2IncubatorTrackingData, setCo2IncubatorTrackingData] = useState<CO2IncubatorTracking[]>(initialData.co2IncubatorTrackingData);
    const [memos] = useState<Memo[]>(initialData.memos);
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialData.waitlist);
    
    const value = useMemo(() => ({
        consumableNotifications, setConsumableNotifications,
        co2IncubatorTrackingData, setCo2IncubatorTrackingData,
        memos, waitlist, setWaitlist
    }), [consumableNotifications, co2IncubatorTrackingData, memos, waitlist]);

    return <LabStateContext.Provider value={value}>{children}</LabStateContext.Provider>;
};
export const useLabStateContext = () => {
    const c = useContext(LabStateContext);
    if (!c) throw new Error('useLabStateContext must be inside LabStateProvider');
    return c;
};

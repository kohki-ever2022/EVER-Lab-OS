// src/contexts/app/AdminContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import {
  MonthlyReport,
  BenchAssignment,
  InventorySnapshot,
  SystemSettings,
  Plan,
  EquipmentManual,
} from '../../types';
import { useDataAdapter } from '../DataAdapterContext';
import { getMockData } from '../../data/mockData';

export interface AdminContextValue {
  monthlyReports: MonthlyReport[];
  benchAssignments: BenchAssignment[];
  inventorySnapshots: InventorySnapshot[];
  setInventorySnapshots: React.Dispatch<
    React.SetStateAction<InventorySnapshot[]>
  >;
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  equipmentManuals: EquipmentManual[];
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const adapter = useDataAdapter();
  const initialData = getMockData();

  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [benchAssignments, setBenchAssignments] = useState<BenchAssignment[]>(
    initialData.benchAssignments
  );
  const [inventorySnapshots, setInventorySnapshots] = useState<
    InventorySnapshot[]
  >(initialData.inventorySnapshots);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(
    initialData.systemSettings
  );
  const [plans, setPlans] = useState<Plan[]>(initialData.plans);
  const [equipmentManuals, setEquipmentManuals] = useState<EquipmentManual[]>(
    initialData.equipmentManuals
  );

  useEffect(() => {
    adapter.getMonthlyReports().then((result) => {
      if (result.success) {
        setMonthlyReports(result.data);
      }
    });
  }, [adapter]);

  const value = useMemo(
    () => ({
      monthlyReports,
      benchAssignments,
      inventorySnapshots,
      setInventorySnapshots,
      systemSettings,
      setSystemSettings,
      plans,
      setPlans,
      equipmentManuals,
    }),
    [
      monthlyReports,
      benchAssignments,
      inventorySnapshots,
      systemSettings,
      plans,
      equipmentManuals,
    ]
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const c = useContext(AdminContext);
  if (!c) throw new Error('useAdminContext must be inside AdminProvider');
  return c;
};

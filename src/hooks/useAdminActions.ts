// src/hooks/useAdminActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useAdminContext, useLabStateContext } from '../contexts/AppProviders';
import { useAudit } from './useAudit';
import {
  Result,
  SystemSettings,
  Announcement,
  Company,
  Plan,
  MonthlyReport,
  ConsumableNotification,
} from '../types';
import { ValidationError } from '../utils/validation';

const simpleUUID = () =>
  `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAdminActions = () => {
  const adapter = useDataAdapter();
  const { setPlans, setSystemSettings } = useAdminContext();
  const { setConsumableNotifications } = useLabStateContext();
  const { addAuditLog } = useAudit();

  const addAnnouncement = useCallback(
    async (
      announcement: Omit<Announcement, 'id'>
    ): Promise<Result<Announcement, Error>> => {
      return await adapter.createAnnouncement(announcement);
    },
    [adapter]
  );

  const updateAnnouncement = useCallback(
    async (
      announcement: Announcement
    ): Promise<Result<Announcement, Error>> => {
      return await adapter.updateAnnouncement(announcement);
    },
    [adapter]
  );

  const deleteAnnouncement = useCallback(
    async (announcementId: string): Promise<Result<void, Error>> => {
      return await adapter.deleteAnnouncement(announcementId);
    },
    [adapter]
  );

  const updateSystemSettings = useCallback(
    async (
      settings: SystemSettings
    ): Promise<Result<SystemSettings, Error>> => {
      try {
        setSystemSettings(settings); // Mock implementation detail
        addAuditLog('SETTINGS_UPDATE', `System settings were updated.`);
        return { success: true, data: settings };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e : new Error(String(e)),
        };
      }
    },
    [setSystemSettings, addAuditLog]
  );

  const addCompany = useCallback(
    async (company: Omit<Company, 'id'>): Promise<Result<Company, Error>> => {
      return await adapter.createCompany(company);
    },
    [adapter]
  );

  const updateCompany = useCallback(
    async (company: Company): Promise<Result<Company, Error>> => {
      return await adapter.updateCompany(company);
    },
    [adapter]
  );

  const deleteCompany = useCallback(
    async (companyId: string): Promise<Result<void, Error>> => {
      return await adapter.deleteCompany(companyId);
    },
    [adapter]
  );

  const addPlan = useCallback(
    async (plan: Omit<Plan, 'id'>): Promise<Result<Plan, Error>> => {
      const newPlan = { ...plan, id: simpleUUID() };
      setPlans((prev) => [...prev, newPlan]);
      return { success: true, data: newPlan };
    },
    [setPlans]
  );

  const updatePlan = useCallback(
    async (plan: Plan): Promise<Result<Plan, Error>> => {
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
      return { success: true, data: plan };
    },
    [setPlans]
  );

  const addMonthlyReport = useCallback(
    async (
      report: Omit<MonthlyReport, 'id'>
    ): Promise<Result<MonthlyReport, Error>> => {
      return await adapter.createMonthlyReport(report);
    },
    [adapter]
  );

  const addConsumableNotification = useCallback(
    (
      notification: Omit<ConsumableNotification, 'id'>
    ): Result<ConsumableNotification, Error> => {
      try {
        const newNotification = { ...notification, id: simpleUUID() };
        setConsumableNotifications((prev) => [newNotification, ...prev]);
        return { success: true, data: newNotification };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e : new Error(String(e)),
        };
      }
    },
    [setConsumableNotifications]
  );

  const updateConsumableNotificationStatus = useCallback(
    (
      notificationId: string,
      status: ConsumableNotification['status']
    ): Result<void, Error> => {
      try {
        setConsumableNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  status,
                  ...(status === 'COMPLETED' && { restockedDate: new Date() }),
                }
              : n
          )
        );
        return { success: true, data: undefined };
      } catch (e) {
        return {
          success: false,
          error: e instanceof Error ? e : new Error(String(e)),
        };
      }
    },
    [setConsumableNotifications]
  );

  return useMemo(
    () => ({
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      updateSystemSettings,
      addCompany,
      updateCompany,
      deleteCompany,
      addPlan,
      updatePlan,
      addMonthlyReport,
      addConsumableNotification,
      updateConsumableNotificationStatus,
    }),
    [
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      updateSystemSettings,
      addCompany,
      updateCompany,
      deleteCompany,
      addPlan,
      updatePlan,
      addMonthlyReport,
      addConsumableNotification,
      updateConsumableNotificationStatus,
    ]
  );
};

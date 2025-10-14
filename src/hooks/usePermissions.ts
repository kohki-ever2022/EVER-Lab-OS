import { useMemo } from 'react';
import { ROLE_PERMISSIONS } from '../data/rolePermissions';
import { canAccessData as checkDataScope, canAccessAllTenants as checkAllTenantsAccess, filterByTenantAccess as filterData } from '../utils/tenantIsolation';
import { Role, RoleCategory } from '../types/core';
import { User } from '../types/user';
import { Resource, Action } from '../types/common';
import { useSessionContext } from '../contexts/SessionContext';

/**
 * Custom hook for checking user permissions.
 * This hook centralizes all permission logic for the currently logged-in user.
 * Components should use this hook to determine what actions the user is allowed to perform.
 * @returns An object containing functions for various permission checks.
 */
export const usePermissions = () => {
  const { currentUser } = useSessionContext();
  
  // useMemoを使用して、currentUserが変更された場合にのみ権限オブジェクトを再計算
  const permissionsData = useMemo(() => {
    if (!currentUser) {
      return {
        hasPermission: (resource: Resource, action: Action): boolean => false,
        canAccessData: (dataOwnerId: string, dataTenantId: string): boolean => false,
        canAccessAllTenants: (): boolean => false,
        filterByTenantAccess: <T>(data: T[]): T[] => [],
        canDeleteUser: (): boolean => false,
        canEditBilling: (): boolean => false,
        canManageMFSettings: (): boolean => false,
      };
    }

    const permissions = ROLE_PERMISSIONS.find(rp => rp.role === currentUser.role)?.permissions || [];
    
    const hasPermission = (resource: Resource, action: Action): boolean => {
      return permissions.some(p => 
        (p.resource === resource && p.action === action) || 
        (p.resource === resource && p.action === 'manage') // 'manage'は全アクションを包含する
      );
    };

    const canAccessData = (dataOwnerId: string, dataTenantId: string): boolean => {
      return checkDataScope(currentUser, dataOwnerId, dataTenantId);
    };

    const canAccessAllTenants = (): boolean => {
      return checkAllTenantsAccess(currentUser);
    };

    const filterByTenantAccess = <T extends { userId?: string; companyId?: string }>(data: T[]): T[] => {
      return filterData(data, currentUser);
    };
    
    const canDeleteUser = (): boolean => hasPermission('users', 'delete');
    const canEditBilling = (): boolean => hasPermission('billing', 'update');
    const canManageMFSettings = (): boolean => hasPermission('moneyforward', 'manage');

    return {
      hasPermission,
      canAccessData,
      canAccessAllTenants,
      filterByTenantAccess,
      canDeleteUser,
      canEditBilling,
      canManageMFSettings,
    };
  }, [currentUser]);

  return permissionsData;
};

export type PermissionsValue = ReturnType<typeof usePermissions>;
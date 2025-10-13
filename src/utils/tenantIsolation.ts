// src/utils/tenantIsolation.ts
import type { CurrentUser } from '../types/user';
import { Role, RoleCategory } from '../types/core';
import type { Equipment } from '../types/equipment';
import type { Consumable, Order, PurchaseOrder } from '../types/inventory';
import type { Project } from '../types/research';
import type { Reservation } from '../types/equipment';

/**
* テナント分離ユーティリティ
* 各関数は currentUser を引数として受け取る純粋関数です
*/

const isFacilityUser = (currentUser: CurrentUser | null) => 
    currentUser?.roleCategory === RoleCategory.Facility;

/**
 * データへのアクセス権限を確認します。
 * この関数は、データそのものに対するアクセス権をチェックします。
 */
export const canAccessData = (
  currentUser: CurrentUser | null,
  dataOwnerId: string,
  dataTenantId: string
): boolean => {
  if (!currentUser) {
    return false;
  }

  if (isFacilityUser(currentUser)) {
    return true;
  }
  
  if (currentUser.role === Role.ProjectManager) {
    return currentUser.companyId === dataTenantId;
  }
  
  if (currentUser.role === Role.Researcher || currentUser.role === Role.Supplier) {
    return currentUser.id === dataOwnerId;
  }
  
  return false;
};

/**
 * 現在のユーザーが全てのテナントのデータにアクセス可能かどうかを判断します。
 */
export const canAccessAllTenants = (currentUser: CurrentUser | null): boolean => {
  return isFacilityUser(currentUser);
};

/**
 * データリストを現在のユーザーのアクセス権限に基づいてフィルタリングします。
 * @param data - フィルタリング対象のデータ配列。各要素は `userId` と `companyId` を持つ必要があります。
 * @param currentUser - 現在のログインユーザーオブジェクト
 * @returns {T[]} フィルタリングされたデータの配列
 */
export const filterByTenantAccess = <T extends { userId?: string; companyId?: string }>(
  data: T[],
  currentUser: CurrentUser | null
): T[] => {
  if (!currentUser || canAccessAllTenants(currentUser)) {
    return data;
  }
  
  if (currentUser.role === Role.ProjectManager) {
    // ReservationのようなcompanyIdを持たないデータは、userIdベースでフィルタリングする必要があるが、
    // ここでは汎用性を保つためcompanyIdを持つデータのみを対象とする
    return data.filter(item => item.companyId === currentUser.companyId);
  }
  
  if (currentUser.role === Role.Researcher || currentUser.role === Role.Supplier) {
    return data.filter(item => item.userId === currentUser.id);
  }
  
  return [];
};
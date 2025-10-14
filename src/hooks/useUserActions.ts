// src/hooks/useUserActions.ts
import { useCallback, useMemo } from 'react';
// FIX: import from barrel file
import { User, Result, Role } from '../types';
import { ValidationError, validateEmail as validateEmailFormat, validatePassword } from '../utils/validation';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useSessionContext } from '../contexts/SessionContext';
import { usePermissions } from './usePermissions';
import { useAudit } from './useAudit';
import { useUserContext } from '../contexts/UserContext';

const escapeHtml = (unsafe: string): string => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

/**
 * Custom hook for managing user-related actions such as creating, updating, and deleting users.
 * It encapsulates permission checks, validation, and data adapter calls.
 * @returns An object containing functions for user management.
 */
export const useUserActions = () => {
    const adapter = useDataAdapter();
    const { users } = useUserContext();
    const { currentUser, isJapanese } = useSessionContext();
    const { hasPermission, canAccessData } = usePermissions();
    const { addAuditLog } = useAudit();
    
    /**
     * Adds a new user to the system.
     * @param user - The user data to create (without id).
     * @returns A Result object containing the new user or an error.
     */
    const addUser = useCallback(async (user: Omit<User, 'id'>): Promise<Result<User, ValidationError | Error>> => {
        try {
            if (!hasPermission('users', 'create')) {
                 throw new ValidationError('role', 'PERMISSION_DENIED', 'Permission denied to create this user.');
            }
            if (currentUser?.role === Role.LabManager && user.role === Role.FacilityDirector) {
                throw new ValidationError('role', 'PERMISSION_DENIED', 'Lab Managers cannot create Facility Directors.');
            }
            if (currentUser?.role === Role.ProjectManager && user.role !== Role.Researcher) {
                 throw new ValidationError('role', 'PERMISSION_DENIED', 'Project Managers can only create Researchers.');
            }
            
            if (user.name.length < 2) throw new ValidationError('name', 'TOO_SHORT', 'Name must be at least 2 characters.');
            validateEmailFormat(user.email);
            
            if (!user.password) {
                 throw new ValidationError('password', 'REQUIRED', 'Password is required.');
            }
            validatePassword(user.password);

            // FIX: Explicitly type userPayload to avoid type inference issue.
            const userPayload: Omit<User, 'id'> = { ...user, name: escapeHtml(user.name) };
            const result = await adapter.createUser(userPayload);

            if (result.success) {
                addAuditLog('USER_CREATE', `Created user '${result.data.name}' (${result.data.id})`);
            }
            
            return result;
        } catch (e) {
            return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [hasPermission, currentUser, adapter, addAuditLog]);

    /**
     * Updates an existing user's information.
     * @param user - The complete user object with updated data.
     * @returns A Result object containing the updated user or an error.
     */
    const updateUser = useCallback(async (user: User): Promise<Result<User, ValidationError | Error>> => {
        try {
            const originalUser = users.find(u => u.id === user.id);
            if (!originalUser) {
                throw new ValidationError('general', 'NOT_FOUND', 'User not found');
            }
            
            if (currentUser?.id !== user.id) { 
                if (!hasPermission('users', 'update') || !canAccessData(user.id, user.companyId)) {
                    throw new ValidationError('role', 'PERMISSION_DENIED', 'Permission denied to edit this user.');
                }
                if (currentUser?.role === Role.LabManager && originalUser.role === Role.FacilityDirector) {
                    throw new ValidationError('role', 'PERMISSION_DENIED', 'Lab Managers cannot edit Facility Directors.');
                }
            }

            if (user.name.length < 2) throw new ValidationError('name', 'TOO_SHORT', 'Name must be at least 2 characters.');
            validateEmailFormat(user.email);
            if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase() && u.id !== user.id)) {
                throw new ValidationError('email', 'EXISTS', 'Email already exists.');
            }
            if (user.password && user.password.length > 0) {
                validatePassword(user.password);
            }

            const updatedUser = { ...user, name: escapeHtml(user.name) };
            const result = await adapter.updateUser(updatedUser);

            if (result.success) {
                addAuditLog('USER_UPDATE', `Updated user '${updatedUser.name}' (${updatedUser.id})`);
            }
            return result;
        } catch(e) {
             return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [users, currentUser, hasPermission, canAccessData, adapter, addAuditLog]);

    /**
     * Deletes a user from the system.
     * @param userId - The ID of the user to delete.
     * @returns A Result object indicating success or failure.
     */
    const deleteUser = useCallback(async (userId: string): Promise<Result<void, Error>> => {
        try {
            if (!hasPermission('users', 'delete')) {
                throw new Error(isJapanese ? 'ユーザーを削除する権限がありません。' : 'You do not have permission to delete users.');
            }

            const userToDelete = users.find(u => u.id === userId);
            if (!userToDelete) {
                throw new Error("User not found.");
            }
            const result = await adapter.deleteUser(userId);
            if (result.success) {
                addAuditLog('USER_DELETE', `Deleted user '${userToDelete.name}' (${userId})`);
            }
            return result;
        } catch (e) {
            return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [hasPermission, isJapanese, users, adapter, addAuditLog]);

    return useMemo(() => ({
        addUser,
        updateUser,
        deleteUser,
    }), [addUser, updateUser, deleteUser]);
};
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Language, Role, RoleCategory, User, CurrentUser } from '../types';

export interface SessionContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  currentUser: CurrentUser | null;
  login: (user: User) => boolean;
  logout: () => void;
  isJapanese: boolean;
  isFacilityStaff: boolean;
  isTenantStaff: boolean;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Provides session-related state and actions to the application,
 * such as current user, language, and authentication methods.
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(Language.JA);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  
  const isJapanese = useMemo(() => language === Language.JA, [language]);

  const isFacilityStaff = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.roleCategory === RoleCategory.Facility;
  }, [currentUser]);

  const isTenantStaff = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.roleCategory === RoleCategory.Tenant;
  }, [currentUser]);

  const login = useCallback((userToLogin: User): boolean => {
    if (userToLogin) {
        const { password, ...currentUserData } = userToLogin;
        setCurrentUser(currentUserData);
        return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    currentUser,
    login,
    logout,
    isJapanese,
    isFacilityStaff,
    isTenantStaff,
  }), [language, setLanguage, currentUser, login, logout, isJapanese, isFacilityStaff, isTenantStaff]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/**
 * Hook to access the session context.
 * Provides current user, language, and auth functions.
 */
export const useSessionContext = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};
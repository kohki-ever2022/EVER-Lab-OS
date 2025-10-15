// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User } from '../types';
import { useDataAdapter } from './DataAdapterContext';

export interface UserContextValue {
  users: User[];
  loading: boolean;
}

const UsersDataContext = createContext<User[]>([]);
const UsersLoadingContext = createContext<boolean>(true);

export const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToUsers((data) => {
      setUsers(data);
      if (loading) setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => unsubscribe();
  }, [adapter]);

  return (
    <UsersDataContext.Provider value={users}>
      <UsersLoadingContext.Provider value={loading}>
        {children}
      </UsersLoadingContext.Provider>
    </UsersDataContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersDataContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export const useUsersLoading = () => {
  const context = useContext(UsersLoadingContext);
  if (context === undefined) {
    throw new Error('useUsersLoading must be used within a UserProvider');
  }
  return context;
};

/** @deprecated Use `useUsers` or `useUsersLoading` instead. */
export const useUserContext = (): UserContextValue => {
  const users = useUsers();
  const loading = useUsersLoading();
  return { users, loading };
};

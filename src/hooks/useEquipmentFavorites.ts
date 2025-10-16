// src/hooks/useEquipmentFavorites.ts
import { useCallback } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useUsers } from '../contexts/UserContext';
import { User } from '../types';

export const useEquipmentFavorites = () => {
  const adapter = useDataAdapter();
  const users = useUsers();

  const getFavorites = useCallback((userId: string): string[] => {
    if (!userId) return [];
    const user = users.find(u => u.id === userId);
    return user?.favoriteEquipmentIds || [];
  }, [users]);

  const isFavorite = useCallback((userId: string, equipmentId: string): boolean => {
    const favorites = getFavorites(userId);
    return favorites.includes(equipmentId);
  }, [getFavorites]);

  const updateUserFavorites = async (userId: string, newFavorites: string[]): Promise<void> => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    await adapter.updateUser({ ...user, favoriteEquipmentIds: newFavorites } as User);
    // Subscription in UserProvider handles UI update.
  };

  const toggleFavorite = useCallback(async (userId: string, equipmentId: string) => {
    if (!userId || !equipmentId) return;
    const favorites = getFavorites(userId);
    const isCurrentlyFavorite = favorites.includes(equipmentId);
    
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter(id => id !== equipmentId)
      : [...favorites, equipmentId];
      
    await updateUserFavorites(userId, newFavorites);
  }, [getFavorites, users, adapter]);

  return {
    getFavorites,
    isFavorite,
    toggleFavorite
  };
};

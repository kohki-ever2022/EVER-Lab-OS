// src/hooks/useFavorites.ts
import { useCallback } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useUsers } from '../contexts/UserContext';
import { User } from '../types';

export const useFavorites = () => {
  const adapter = useDataAdapter();
  const users = useUsers();

  const getFavorites = useCallback(
    (userId: string): string[] => {
      if (!userId) return [];
      const user = users.find((u) => u.id === userId);
      return user?.favoriteConsumableIds || [];
    },
    [users]
  );

  const isFavorite = useCallback(
    (userId: string, consumableId: string): boolean => {
      const favorites = getFavorites(userId);
      return favorites.includes(consumableId);
    },
    [getFavorites]
  );

  const updateUserFavorites = async (
    userId: string,
    newFavorites: string[]
  ): Promise<void> => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    await adapter.updateUser({
      ...user,
      favoriteConsumableIds: newFavorites,
    } as User);
    // Subscription in UserProvider handles UI update.
  };

  const addFavorite = useCallback(
    async (userId: string, consumableId: string) => {
      if (!userId || !consumableId) return;
      const favorites = getFavorites(userId);
      if (!favorites.includes(consumableId)) {
        await updateUserFavorites(userId, [...favorites, consumableId]);
      }
    },
    [getFavorites, users, adapter]
  );

  const removeFavorite = useCallback(
    async (userId: string, consumableId: string) => {
      if (!userId || !consumableId) return;
      const favorites = getFavorites(userId);
      if (favorites.includes(consumableId)) {
        await updateUserFavorites(
          userId,
          favorites.filter((id) => id !== consumableId)
        );
      }
    },
    [getFavorites, users, adapter]
  );

  const toggleFavorite = useCallback(
    async (userId: string, consumableId: string) => {
      if (!userId || !consumableId) return;
      const favorites = getFavorites(userId);
      const isCurrentlyFavorite = favorites.includes(consumableId);

      const newFavorites = isCurrentlyFavorite
        ? favorites.filter((id) => id !== consumableId)
        : [...favorites, consumableId];

      await updateUserFavorites(userId, newFavorites);
    },
    [getFavorites, users, adapter]
  );

  return {
    getFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
};

export type FavoritesValue = ReturnType<typeof useFavorites>;

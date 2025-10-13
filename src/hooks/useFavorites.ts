// src/hooks/useFavorites.ts
import { useState, useCallback } from 'react';

interface FavoriteStore {
  [userId: string]: string[];
}

export const useFavorites = () => {
  // ✅ Reactのstateで管理
  const [favoriteStore, setFavoriteStore] = useState<FavoriteStore>({});

  const getFavorites = useCallback((userId: string): string[] => {
    if (!userId) return [];
    return favoriteStore[userId] || [];
  }, [favoriteStore]);

  const isFavorite = useCallback((userId: string, consumableId: string): boolean => {
    const favorites = favoriteStore[userId] || [];
    return favorites.includes(consumableId);
  }, [favoriteStore]);

  const addFavorite = useCallback((userId: string, consumableId: string) => {
    if (!userId || !consumableId) return;
    
    setFavoriteStore(prev => {
      const favorites = prev[userId] || [];
      if (!favorites.includes(consumableId)) {
        return {
          ...prev,
          [userId]: [...favorites, consumableId]
        };
      }
      return prev;
    });
  }, []);

  const removeFavorite = useCallback((userId: string, consumableId: string) => {
    if (!userId || !consumableId) return;
    
    setFavoriteStore(prev => {
      const favorites = prev[userId] || [];
      return {
        ...prev,
        [userId]: favorites.filter(id => id !== consumableId)
      };
    });
  }, []);

  const toggleFavorite = useCallback((userId: string, consumableId: string) => {
    if (!userId || !consumableId) return;
    setFavoriteStore(prev => {
        const currentFavorites = prev[userId] || [];
        const isCurrentlyFavorite = currentFavorites.includes(consumableId);
        
        if (isCurrentlyFavorite) {
            return {
                ...prev,
                [userId]: currentFavorites.filter(id => id !== consumableId)
            };
        } else {
            return {
                ...prev,
                [userId]: [...currentFavorites, consumableId]
            };
        }
    });
  }, []);

  return {
    getFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };
};

export type FavoritesValue = ReturnType<typeof useFavorites>;

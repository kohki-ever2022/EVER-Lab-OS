import React, { useState, useEffect, useCallback } from 'react';
// FIX: import from barrel file
import { Consumable } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useConsumableContext } from '../../contexts/ConsumableContext';
import { useToast } from '../../contexts/ToastContext';
import { useInventoryActions } from '../../hooks/useInventoryActions';
import { useFavorites } from '../../hooks/useFavorites';
import { HeartIconFill } from '../common/Icons';
import { useTranslation } from '../../hooks/useTranslation';

const FavoriteConsumablesList: React.FC = () => {
    // FIX: Destructure 'isJapanese' from 'useTranslation' hook
    const { currentUser } = useSessionContext();
    const { consumables } = useConsumableContext();
    const { showToast } = useToast();
    const { addOrder } = useInventoryActions();
    const { getFavorites, toggleFavorite } = useFavorites();
    const { t, isJapanese } = useTranslation();

    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [orderingId, setOrderingId] = useState<string | null>(null);

    const favoriteItems = React.useMemo(() => {
        return consumables.filter(c => favoriteIds.includes(c.id));
    }, [consumables, favoriteIds]);

    const updateFavorites = useCallback(() => {
        if (currentUser) {
            setFavoriteIds(getFavorites(currentUser.id));
        }
    }, [currentUser, getFavorites]);

    useEffect(() => {
        updateFavorites();
    }, [currentUser, consumables, updateFavorites]);

    useEffect(() => {
        const initialQuantities: Record<string, number> = {};
        favoriteItems.forEach(item => {
            initialQuantities[item.id] = 1;
        });
        setQuantities(initialQuantities);
    }, [favoriteItems]);

    const handleToggleFavorite = (consumableId: string) => {
        if (currentUser) {
            toggleFavorite(currentUser.id, consumableId);
            updateFavorites(); // Re-fetch and update state
        }
    };

    const handleQuantityChange = (id: string, value: number) => {
        if (value >= 1) {
            setQuantities(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleOrder = async (item: Consumable) => {
        if (!currentUser) return;
        setOrderingId(item.id);
        const quantity = quantities[item.id] || 1;

        if (item.price === undefined) {
            showToast(t('itemCannotBePurchased'), 'error');
            setOrderingId(null);
            return;
        }

        const result = await addOrder({
            userId: currentUser.id,
            companyId: currentUser.companyId,
            consumableId: item.id,
            quantity: quantity,
            unitPrice: item.price,
        });

        if (result.success === false) {
            showToast(result.error.message, 'error');
        } else {
            showToast(t('orderPlacedSuccessfully'), 'success');
        }
        setOrderingId(null);
    };

    if (!currentUser) return null;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {t('favorites')}
            </h2>

            {favoriteItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">{t('noFavorites')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {favoriteItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{isJapanese ? item.nameJP : item.nameEN}</p>
                                <p className="text-sm text-gray-600">{t('stock')} {item.stock}</p>
                                {item.price !== undefined && <p className="text-sm font-semibold text-ever-purple">¥{item.price.toLocaleString()}</p>}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-4">
                                {item.type === 'sales' && item.price !== undefined && (
                                    <>
                                        <input
                                            type="number"
                                            value={quantities[item.id] || 1}
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                                            className="w-16 p-1 border rounded"
                                            min="1"
                                            disabled={orderingId === item.id}
                                        />
                                        <button 
                                            onClick={() => handleOrder(item)} 
                                            className="bg-ever-blue text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-gray-400"
                                            disabled={orderingId === item.id}
                                        >
                                            {orderingId === item.id ? t('ordering') : t('order')}
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleToggleFavorite(item.id)} className="p-2 rounded-full hover:bg-red-100 transition-colors" title={t('removeFromFavorites')}>
                                    <HeartIconFill />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoriteConsumablesList;

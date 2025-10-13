import React, { useState } from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useEquipmentContext } from '../contexts/EquipmentContext';
import { useToast } from '../contexts/ToastContext';
import { useEquipmentActions } from '../hooks/useEquipmentActions';

import { Equipment, EquipmentStatus } from '../types/equipment';

export const EquipmentManagement: React.FC = () => {
    const { equipment } = useEquipmentContext();
    const { isJapanese } = useSessionContext();
    const { showToast } = useToast();
    const { addEquipment, updateEquipment, deleteEquipment } = useEquipmentActions();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Equipment> | null>(null);

    const openModal = (item: Partial<Equipment> | null = null) => {
        setCurrentItem(item || { status: EquipmentStatus.Available, isReservable: true, rate: 0, imageUrl: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentItem) return;

        let result;
        if ('id' in currentItem && currentItem.id) {
            result = await updateEquipment(currentItem as Equipment);
        } else {
            result = await addEquipment(currentItem as Omit<Equipment, 'id'>);
        }
        
        if (result.success === false) {
            showToast(isJapanese ? `保存に失敗しました: ${result.error.message}` : `Failed to save: ${result.error.message}`, 'error');
        } else {
            showToast(isJapanese ? '機器情報を保存しました。' : 'Equipment information saved.', 'success');
            closeModal();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(isJapanese ? 'この機器を削除しますか？' : 'Are you sure you want to delete this equipment?')) {
            const result = await deleteEquipment(id);
            if (result.success === false) {
                showToast(isJapanese ? `削除に失敗しました: ${result.error.message}` : `Failed to delete: ${result.error.message}`, 'error');
            } else {
                showToast(isJapanese ? '機器を削除しました。' : 'Equipment deleted.', 'success');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;

        if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            finalValue = parseFloat(value) || 0;
        }
        
        setCurrentItem(prev => prev ? { ...prev, [name]: finalValue } : null);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-ever-black">
                    {isJapanese ? '機器マスタ管理' : 'Equipment Master Management'}
                </h2>
                <button
                    onClick={() => openModal()}
                    className="bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg"
                >
                    {isJapanese ? '新規機器追加' : 'Add New Equipment'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '機器名' : 'Name'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'カテゴリ' : 'Category'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '料金' : 'Rate'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'ステータス' : 'Status'}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '操作' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {equipment.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{isJapanese ? item.nameJP : item.nameEN}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{isJapanese ? item.categoryJP : item.categoryEN}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.rate} {isJapanese ? item.rateUnitJP : item.rateUnitEN}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">{isJapanese ? '編集' : 'Edit'}</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">{isJapanese ? '削除' : 'Delete'}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6">{currentItem.id ? (isJapanese ? '機器編集' : 'Edit Equipment') : (isJapanese ? '新規機器追加' : 'Add New Equipment')}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? '機器名 (日本語)' : 'Name (Japanese)'}</label>
                                    <input type="text" name="nameJP" value={currentItem.nameJP || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? '機器名 (英語)' : 'Name (English)'}</label>
                                    <input type="text" name="nameEN" value={currentItem.nameEN || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'カテゴリ (日本語)' : 'Category (Japanese)'}</label>
                                    <input type="text" name="categoryJP" value={currentItem.categoryJP || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'カテゴリ (英語)' : 'Category (English)'}</label>
                                    <input type="text" name="categoryEN" value={currentItem.categoryEN || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? '料金' : 'Rate'}</label>
                                    <input type="number" name="rate" value={currentItem.rate || 0} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? '料金単位 (日本語)' : 'Rate Unit (Japanese)'}</label>
                                    <input type="text" name="rateUnitJP" value={currentItem.rateUnitJP || ''} onChange={handleChange} placeholder="例: ¥/時間" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? '料金単位 (英語)' : 'Rate Unit (English)'}</label>
                                    <input type="text" name="rateUnitEN" value={currentItem.rateUnitEN || ''} onChange={handleChange} placeholder="e.g., ¥/hour" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'ステータス' : 'Status'}</label>
                                    <select name="status" value={currentItem.status || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                        {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">{isJapanese ? '画像URL' : 'Image URL'}</label>
                                    <input type="text" name="imageUrl" value={currentItem.imageUrl || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div className="col-span-2 flex items-center">
                                    <input type="checkbox" id="isReservable" name="isReservable" checked={currentItem.isReservable || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                    <label htmlFor="isReservable" className="ml-2 block text-sm text-gray-900">{isJapanese ? '予約可能' : 'Reservable'}</label>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h4 className="text-md font-medium text-gray-800 mb-2">{isJapanese ? 'メンテナンス設定' : 'Maintenance Settings'}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'PM間隔 (日)' : 'PM Interval (Days)'}</label>
                                        <input type="number" name="pmIntervalDays" value={currentItem.pmIntervalDays || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{isJapanese ? '最終PM日' : 'Last PM Date'}</label>
                                        <input type="date" name="lastPmDate" value={currentItem.lastPmDate || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{isJapanese ? '校正間隔 (日)' : 'Calibration Interval (Days)'}</label>
                                        <input type="number" name="calibrationIntervalDays" value={currentItem.calibrationIntervalDays || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{isJapanese ? '最終校正日' : 'Last Calibration Date'}</label>
                                        <input type="date" name="lastCalibrationDate" value={currentItem.lastCalibrationDate || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
                                <button type="submit" className="bg-ever-blue text-white font-bold py-2 px-4 rounded-lg">{isJapanese ? '保存' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

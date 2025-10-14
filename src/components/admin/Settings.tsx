import React, { useState } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useAdminContext } from '../../contexts/AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAdminActions } from '../../hooks/useAdminActions';

// FIX: import from barrel file
import { SystemSettings } from '../../types';

type SettingsTab = 'general' | 'billing' | 'notifications';

const Settings: React.FC = () => {
    const { isJapanese } = useSessionContext();
    const { systemSettings } = useAdminContext();
    const { updateSystemSettings } = useAdminActions();
    const { showToast } = useToast();
    const { hasPermission } = usePermissions();

    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [settings, setSettings] = useState<SystemSettings>(systemSettings);

    const canManageSettings = hasPermission('settings', 'manage');

    const handleSave = async () => {
        if (!canManageSettings) {
            showToast(isJapanese ? '設定を更新する権限がありません。' : 'You do not have permission to update settings.', 'error');
            return;
        }
        const result = await updateSystemSettings(settings);
        if (result.success === false) {
            showToast(isJapanese ? `保存に失敗しました: ${result.error.message}` : `Failed to save: ${result.error.message}`, 'error');
        } else {
            showToast(isJapanese ? '設定を保存しました。' : 'Settings saved successfully.', 'success');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">{isJapanese ? 'ラボ運営時間' : 'Lab Operating Hours'}</h3>
                <p className="mt-1 text-sm text-gray-500">{isJapanese ? 'ユーザーが機器を予約できる時間帯を設定します。' : 'Set the hours during which users can book equipment.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="labOpeningTime" className="block text-sm font-medium text-gray-700">{isJapanese ? '開始時間' : 'Opening Time'}</label>
                    <input type="time" id="labOpeningTime" name="labOpeningTime" value={settings.labOpeningTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                </div>
                <div>
                    <label htmlFor="labClosingTime" className="block text-sm font-medium text-gray-700">{isJapanese ? '終了時間' : 'Closing Time'}</label>
                    <input type="time" id="labClosingTime" name="labClosingTime" value={settings.labClosingTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{isJapanese ? 'ピーク料金設定' : 'Surge Pricing'}</h3>
                <p className="mt-1 text-sm text-gray-500">{isJapanese ? '需要が高い時間帯に割増料金を適用します。' : 'Apply a multiplier during high-demand hours.'}</p>
                <div className="mt-4 space-y-4">
                     <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="surgePricingEnabled" name="surgePricingEnabled" type="checkbox" checked={settings.surgePricingEnabled} onChange={handleInputChange} disabled={!canManageSettings} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="surgePricingEnabled" className="font-medium text-gray-700">{isJapanese ? 'ピーク料金を有効にする' : 'Enable surge pricing'}</label>
                        </div>
                    </div>
                    {settings.surgePricingEnabled && (
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                             <div>
                                <label htmlFor="surgeStartTime" className="block text-sm font-medium text-gray-700">{isJapanese ? '開始時間' : 'Start Time'}</label>
                                <input type="time" id="surgeStartTime" name="surgeStartTime" value={settings.surgeStartTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                            </div>
                            <div>
                                <label htmlFor="surgeEndTime" className="block text-sm font-medium text-gray-700">{isJapanese ? '終了時間' : 'End Time'}</label>
                                <input type="time" id="surgeEndTime" name="surgeEndTime" value={settings.surgeEndTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                            </div>
                             <div>
                                <label htmlFor="surgeMultiplier" className="block text-sm font-medium text-gray-700">{isJapanese ? '倍率' : 'Multiplier'}</label>
                                <input type="number" id="surgeMultiplier" name="surgeMultiplier" value={settings.surgeMultiplier} onChange={handleInputChange} step="0.1" min="1" disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    
    const renderBillingSettings = () => (
        <div className="text-center py-12 text-gray-500">
            <p>{isJapanese ? '請求関連の設定はここに表示されます。' : 'Billing settings will be displayed here.'}</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">{isJapanese ? 'システム設定' : 'System Settings'}</h2>
            <div className="bg-white rounded-lg shadow">
                 <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('general')} className={`${activeTab === 'general' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{isJapanese ? '一般' : 'General'}</button>
                        <button onClick={() => setActiveTab('billing')} className={`${activeTab === 'billing' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{isJapanese ? '請求' : 'Billing'}</button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'general' && renderGeneralSettings()}
                    {activeTab === 'billing' && renderBillingSettings()}
                </div>
                {canManageSettings && (
                     <div className="px-6 py-4 bg-gray-50 text-right rounded-b-lg">
                        <button onClick={handleSave} className="bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg">{isJapanese ? '設定を保存' : 'Save Settings'}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
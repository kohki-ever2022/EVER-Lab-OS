import React, { useState } from 'react';
import { useAdminContext } from '../../contexts/AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAdminActions } from '../../hooks/useAdminActions';
import { useTranslation } from '../../hooks/useTranslation';

// FIX: import from barrel file
import { SystemSettings } from '../../types';

type SettingsTab = 'general' | 'billing' | 'notifications';

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const { systemSettings } = useAdminContext();
    const { updateSystemSettings } = useAdminActions();
    const { showToast } = useToast();
    const { hasPermission } = usePermissions();

    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [settings, setSettings] = useState<SystemSettings>(systemSettings);

    const canManageSettings = hasPermission('settings', 'manage');

    const handleSave = async () => {
        if (!canManageSettings) {
            showToast(t('permissionDeniedUpdate'), 'error');
            return;
        }
        const result = await updateSystemSettings(settings);
        if (result.success === false) {
            showToast(`${t('saveFailed')}: ${result.error.message}`, 'error');
        } else {
            showToast(t('settingsSaveSuccess'), 'success');
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">{t('labOperatingHours')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('labOperatingHoursDesc')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="labOpeningTime" className="block text-sm font-medium text-gray-700">{t('openingTime')}</label>
                    <input type="time" id="labOpeningTime" name="labOpeningTime" value={settings.labOpeningTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                </div>
                <div>
                    <label htmlFor="labClosingTime" className="block text-sm font-medium text-gray-700">{t('closingTime')}</label>
                    <input type="time" id="labClosingTime" name="labClosingTime" value={settings.labClosingTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{t('surgePricing')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('surgePricingDesc')}</p>
                <div className="mt-4 space-y-4">
                     <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="surgePricingEnabled" name="surgePricingEnabled" type="checkbox" checked={settings.surgePricingEnabled} onChange={handleInputChange} disabled={!canManageSettings} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="surgePricingEnabled" className="font-medium text-gray-700">{t('enableSurgePricing')}</label>
                        </div>
                    </div>
                    {settings.surgePricingEnabled && (
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                             <div>
                                <label htmlFor="surgeStartTime" className="block text-sm font-medium text-gray-700">{t('startTime')}</label>
                                <input type="time" id="surgeStartTime" name="surgeStartTime" value={settings.surgeStartTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                            </div>
                            <div>
                                <label htmlFor="surgeEndTime" className="block text-sm font-medium text-gray-700">{t('endTime')}</label>
                                <input type="time" id="surgeEndTime" name="surgeEndTime" value={settings.surgeEndTime} onChange={handleTimeChange} disabled={!canManageSettings} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                            </div>
                             <div>
                                <label htmlFor="surgeMultiplier" className="block text-sm font-medium text-gray-700">{t('multiplier')}</label>
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
            <p>{t('billingSettingsPlaceholder')}</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">{t('systemSettings')}</h2>
            <div className="bg-white rounded-lg shadow">
                 <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('general')} className={`${activeTab === 'general' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('general')}</button>
                        <button onClick={() => setActiveTab('billing')} className={`${activeTab === 'billing' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('billing')}</button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'general' && renderGeneralSettings()}
                    {activeTab === 'billing' && renderBillingSettings()}
                </div>
                {canManageSettings && (
                     <div className="px-6 py-4 bg-gray-50 text-right rounded-b-lg">
                        <button onClick={handleSave} className="bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg">{t('saveSettings')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
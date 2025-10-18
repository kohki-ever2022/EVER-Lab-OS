// src/components/admin/Settings.tsx
import React, { useState } from 'react';
import { useAdminContext } from '../../contexts/AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAdminActions } from '../../hooks/useAdminActions';
import { useTranslation } from '../../hooks/useTranslation';
import GeneralSettings from './settings/GeneralSettings';
import { SystemSettings } from '../../types';

type SettingsTab = 'general' | 'billing';

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
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const renderBillingSettings = () => (
    <div className='text-center py-12 text-gray-500'>
      <p>{t('billingSettingsPlaceholder')}</p>
    </div>
  );

  return (
    <div>
      <h2 className='text-3xl font-bold mb-6 text-ever-black'>
        {t('systemSettings')}
      </h2>
      <div className='bg-white rounded-lg shadow'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8 px-6' aria-label='Tabs'>
            <button
              onClick={() => setActiveTab('general')}
              className={`${activeTab === 'general' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {t('general')}
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`${activeTab === 'billing' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {t('billing')}
            </button>
          </nav>
        </div>
        <div className='p-6'>
          {activeTab === 'general' && (
            <GeneralSettings
              settings={settings}
              canManageSettings={canManageSettings}
              onInputChange={handleInputChange}
              onTimeChange={handleTimeChange}
            />
          )}
          {activeTab === 'billing' && renderBillingSettings()}
        </div>
        {canManageSettings && (
          <div className='px-6 py-4 bg-gray-50 text-right rounded-b-lg'>
            <button
              onClick={handleSave}
              className='bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg'
            >
              {t('saveSettings')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

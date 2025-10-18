// src/components/admin/settings/GeneralSettings.tsx
import React from 'react';
import { SystemSettings } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';

interface Props {
  settings: SystemSettings;
  canManageSettings: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GeneralSettings: React.FC<Props> = ({
  settings,
  canManageSettings,
  onInputChange,
  onTimeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>
          {t('labOperatingHours')}
        </h3>
        <p className='mt-1 text-sm text-gray-500'>
          {t('labOperatingHoursDesc')}
        </p>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        <div>
          <label
            htmlFor='labOpeningTime'
            className='block text-sm font-medium text-gray-700'
          >
            {t('openingTime')}
          </label>
          <input
            type='time'
            id='labOpeningTime'
            name='labOpeningTime'
            value={settings.labOpeningTime}
            onChange={onTimeChange}
            disabled={!canManageSettings}
            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100'
          />
        </div>
        <div>
          <label
            htmlFor='labClosingTime'
            className='block text-sm font-medium text-gray-700'
          >
            {t('closingTime')}
          </label>
          <input
            type='time'
            id='labClosingTime'
            name='labClosingTime'
            value={settings.labClosingTime}
            onChange={onTimeChange}
            disabled={!canManageSettings}
            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100'
          />
        </div>
      </div>

      <div className='border-t border-gray-200 pt-6'>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>
          {t('surgePricing')}
        </h3>
        <p className='mt-1 text-sm text-gray-500'>{t('surgePricingDesc')}</p>
        <div className='mt-4 space-y-4'>
          <div className='flex items-start'>
            <div className='flex items-center h-5'>
              <input
                id='surgePricingEnabled'
                name='surgePricingEnabled'
                type='checkbox'
                checked={settings.surgePricingEnabled}
                onChange={onInputChange}
                disabled={!canManageSettings}
                className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
              />
            </div>
            <div className='ml-3 text-sm'>
              <label
                htmlFor='surgePricingEnabled'
                className='font-medium text-gray-700'
              >
                {t('enableSurgePricing')}
              </label>
            </div>
          </div>
          {settings.surgePricingEnabled && (
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
              <div>
                <label
                  htmlFor='surgeStartTime'
                  className='block text-sm font-medium text-gray-700'
                >
                  {t('surgeStartTime')}
                </label>
                <input
                  type='time'
                  id='surgeStartTime'
                  name='surgeStartTime'
                  value={settings.surgeStartTime}
                  onChange={onTimeChange}
                  disabled={!canManageSettings}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100'
                />
              </div>
              <div>
                <label
                  htmlFor='surgeEndTime'
                  className='block text-sm font-medium text-gray-700'
                >
                  {t('surgeEndTime')}
                </label>
                <input
                  type='time'
                  id='surgeEndTime'
                  name='surgeEndTime'
                  value={settings.surgeEndTime}
                  onChange={onTimeChange}
                  disabled={!canManageSettings}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100'
                />
              </div>
              <div>
                <label
                  htmlFor='surgeMultiplier'
                  className='block text-sm font-medium text-gray-700'
                >
                  {t('multiplier')}
                </label>
                <input
                  type='number'
                  id='surgeMultiplier'
                  name='surgeMultiplier'
                  value={settings.surgeMultiplier}
                  onChange={onInputChange}
                  step='0.1'
                  min='1'
                  disabled={!canManageSettings}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100'
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;

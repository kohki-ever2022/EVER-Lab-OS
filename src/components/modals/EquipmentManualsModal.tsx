import React from 'react';
import { useAdminContext } from '../../contexts/AppProviders';
import { Equipment, ManualType } from '../../types';
import {
  YoutubeIcon,
  PdfIcon,
  LinkIcon,
  ArrowRightIcon,
  getManualIcon,
} from '../common/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface EquipmentManualsModalProps {
  equipment: Equipment;
  onClose: () => void;
}

const EquipmentManualsModal: React.FC<EquipmentManualsModalProps> = ({
  equipment,
  onClose,
}) => {
  const { t, isJapanese } = useTranslation();
  const { equipmentManuals } = useAdminContext();

  const manuals =
    equipment.manualIds
      ?.map((id) => equipmentManuals.find((m) => m.id === id))
      .filter(Boolean) || [];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-lg modal-content'>
        <h3 className='text-xl font-bold mb-4'>
          {t('manualsFor')} {isJapanese ? equipment.nameJP : equipment.nameEN}
        </h3>

        {manuals.length > 0 ? (
          <div className='space-y-3 max-h-96 overflow-y-auto pr-2'>
            {manuals.map((manual) => (
              <a
                key={manual!.id}
                href={manual!.url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-4 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors'
              >
                {getManualIcon(manual!.type)}
                <div className='flex-1'>
                  <p className='font-semibold'>{manual!.name}</p>
                  <p className='text-sm text-gray-500'>
                    {t('version')}: {manual!.version}
                  </p>
                </div>
                <ArrowRightIcon className='w-5 h-5 text-gray-400 flex-shrink-0' />
              </a>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>{t('noManuals')}</p>
        )}

        <div className='flex justify-end mt-6'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300'
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentManualsModal;

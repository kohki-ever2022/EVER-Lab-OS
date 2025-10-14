import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  title: string;
  onClose: () => void;
}

const PlaceholderModal: React.FC<Props> = ({ title, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md modal-content">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">
          {t('underDevelopment')}
        </p>
        <div className="flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderModal;

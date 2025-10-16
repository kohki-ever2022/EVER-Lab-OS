// src/components/common/PromptModal.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { BaseModal } from './ConfirmModal'; // Import from ConfirmModal

interface Props {
  title: string;
  message: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  inputLabel?: string;
}

const PromptModal: React.FC<Props> = ({ title, message, onConfirm, onClose, confirmText, cancelText, inputLabel }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
      onClose();
    }
  };

  return (
    <BaseModal onClose={onClose}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      <div>
        <label className="block text-sm font-medium text-gray-700">{inputLabel || t('unlockReason')}</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ever-blue"
        />
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          {cancelText || t('cancel')}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-ever-blue text-white font-semibold rounded-lg hover:bg-ever-blue-dark transition-colors disabled:bg-gray-400"
        >
          {confirmText || t('confirm')}
        </button>
      </div>
    </BaseModal>
  );
};

export default PromptModal;
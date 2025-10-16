// src/components/common/ConfirmModal.tsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface BaseModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({ onClose, children }) => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md modal-content"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
);


interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<Props> = ({ title, message, onConfirm, onClose, confirmText, cancelText }) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal onClose={onClose}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          {cancelText || t('cancel')}
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          {confirmText || t('confirm')}
        </button>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;
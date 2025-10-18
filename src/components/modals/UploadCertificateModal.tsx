// src/components/modals/UploadCertificateModal.tsx
import React, { useState } from 'react';
import { Certificate } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { useComplianceActions } from '../../hooks/useComplianceActions';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  certificateToEdit?: Certificate;
  onClose: () => void;
}

const UploadCertificateModal: React.FC<Props> = ({
  certificateToEdit,
  onClose,
}) => {
  const { currentUser } = useSessionContext();
  const { t } = useTranslation();
  const { qualifications } = useQmsContext();
  const { addCertificate, updateCertificate } = useComplianceActions();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    certificateType: certificateToEdit?.certificateType || 'TRAINING',
    issueDate: certificateToEdit?.issueDate
      ? new Date(certificateToEdit.issueDate).toISOString().split('T')[0]
      : '',
    expiryDate: certificateToEdit?.expiryDate
      ? new Date(certificateToEdit.expiryDate).toISOString().split('T')[0]
      : '',
    notes: certificateToEdit?.notes || '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (!file && !certificateToEdit)) {
      showToast(t('selectFile'), 'error');
      return;
    }

    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const fileUrl = reader.result as string;
        await saveCertificate(fileUrl, file.name);
      };
    } else if (certificateToEdit) {
      await saveCertificate(
        certificateToEdit.fileUrl,
        certificateToEdit.fileName
      );
    }
  };

  const saveCertificate = async (fileUrl?: string, fileName?: string) => {
    if (!currentUser) return;

    const data = {
      userId: currentUser.id,
      companyId: currentUser.companyId,
      certificateType: formData.certificateType,
      issueDate: new Date(formData.issueDate),
      expiryDate: new Date(formData.expiryDate),
      notes: formData.notes,
      fileUrl,
      fileName,
      status: certificateToEdit?.status || 'Valid', // Simple status for now
    };

    const result = certificateToEdit
      ? await updateCertificate({
          ...data,
          id: certificateToEdit.id,
        } as Certificate)
      : await addCertificate(data as Omit<Certificate, 'id'>);

    if (result.success) {
      showToast(t('certificateSaved'), 'success');
      onClose();
    } else {
      showToast(t('certificateSaveFailed'), 'error');
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop'>
      <form
        onSubmit={handleSubmit}
        className='bg-white rounded-lg shadow-xl p-6 w-full max-w-lg modal-content max-h-[90vh] overflow-y-auto'
      >
        <h3 className='text-xl font-bold mb-4'>
          {certificateToEdit
            ? t('updateCertificate')
            : t('uploadNewCertificate')}
        </h3>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              {t('certificateType')}
            </label>
            <select
              name='certificateType'
              value={formData.certificateType}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
            >
              <option value='TRAINING'>Training</option>
              <option value='MYCOPLASMA'>Mycoplasma Test</option>
              <option value='OTHER'>Other</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              {t('issueDate')}
            </label>
            <input
              type='date'
              name='issueDate'
              value={formData.issueDate}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              {t('expiryDate')}
            </label>
            <input
              type='date'
              name='expiryDate'
              value={formData.expiryDate}
              onChange={handleChange}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              {t('certificateFile')}
            </label>
            <input
              type='file'
              onChange={handleFileChange}
              className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              required={!certificateToEdit}
            />
            {certificateToEdit?.fileName && (
              <p className='text-xs text-gray-500 mt-1'>
                {t('currentFile')} {certificateToEdit.fileName}
              </p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              {t('notes')}
            </label>
            <textarea
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
            ></textarea>
          </div>
        </div>
        <div className='mt-6 flex justify-end space-x-2'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
          >
            {t('cancel')}
          </button>
          <button
            type='submit'
            className='px-4 py-2 bg-ever-blue text-white rounded-md hover:bg-ever-blue-dark'
          >
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadCertificateModal;

import React, { useState, useMemo, useCallback } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { useUsers } from '../../contexts/UserContext';
import { useModalContext } from '../../contexts/ModalContext';
import { useCertificates } from '../../contexts/CertificateContext';
import { Certificate } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

const CertificateManagement: React.FC = () => {
  const { currentUser, isFacilityStaff } = useSessionContext();
  const { qualifications, userCertifications } = useQmsContext();
  const { certificates } = useCertificates();
  const users = useUsers();
  const { openModal } = useModalContext();
  const { t, isJapanese } = useTranslation();

  const [filter, setFilter] = useState<'all' | 'my' | 'expiring'>('my');

  const getStatus = useCallback(
    (expiryDate: Date) => {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      if (new Date(expiryDate) < now) {
        return { text: t('statusExpired'), color: 'bg-red-100 text-red-700' };
      } else if (new Date(expiryDate) <= thirtyDaysFromNow) {
        return {
          text: t('expiringSoon'),
          color: 'bg-yellow-100 text-yellow-700',
        };
      } else {
        return { text: t('valid'), color: 'bg-green-100 text-green-700' };
      }
    },
    [t]
  );

  const displayCertificates = useMemo(() => {
    let certs = isFacilityStaff
      ? certificates
      : certificates.filter((c) => c.userId === currentUser?.id);

    if (filter === 'my' && !isFacilityStaff) {
      certs = certs.filter((c) => c.userId === currentUser?.id);
    } else if (filter === 'expiring') {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      certs = certs.filter((c) => new Date(c.expiryDate) < thirtyDaysFromNow);
    }

    return certs
      .map((cert) => {
        const userCertification = userCertifications.find(
          (uc) =>
            uc.userId === cert.userId &&
            new Date(uc.expiresAt).getTime() ===
              new Date(cert.expiryDate).getTime()
        );
        const qualification = qualifications.find(
          (q) => q.id === userCertification?.qualificationId
        );
        const user = users.find((u) => u.id === cert.userId);
        return {
          ...cert,
          qualificationName: qualification
            ? isJapanese
              ? qualification.nameJP
              : qualification.nameEN
            : cert.certificateType,
          userName: user?.name || 'Unknown User',
          status: getStatus(new Date(cert.expiryDate)),
        };
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
  }, [
    certificates,
    qualifications,
    userCertifications,
    users,
    isJapanese,
    currentUser,
    filter,
    isFacilityStaff,
    getStatus,
  ]);

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-ever-black'>
          {t('certifications')}
        </h2>
        <button
          onClick={() => openModal({ type: 'uploadCertificate', props: {} })}
          className='bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg'
        >
          {t('uploadNew')}
        </button>
      </div>

      <div className='bg-white p-4 rounded-lg shadow-sm mb-6'>
        <div className='flex items-center space-x-4'>
          {isFacilityStaff && (
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {t('allCertificates')}
            </button>
          )}
          <button
            onClick={() => setFilter('my')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'my' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {t('myCertificates')}
          </button>
          <button
            onClick={() => setFilter('expiring')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'expiring' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {t('expiringOrExpired')}
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              {isFacilityStaff && (
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  {t('user')}
                </th>
              )}
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                {t('qualification')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                {t('expiryDate')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                {t('status')}
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {displayCertificates.map((cert) => (
              <tr key={cert.id}>
                {isFacilityStaff && (
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {cert.userName}
                  </td>
                )}
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-800'>
                  {cert.qualificationName}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                  {new Date(cert.expiryDate).toLocaleDateString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cert.status.color}`}
                  >
                    {cert.status.text}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button
                    onClick={() =>
                      openModal({
                        type: 'uploadCertificate',
                        props: {
                          certificateToEdit: certificates.find(
                            (c) => c.id === cert.id
                          ) as Certificate,
                        },
                      })
                    }
                    className='text-indigo-600 hover:text-indigo-900'
                  >
                    {t('viewRenew')}
                  </button>
                </td>
              </tr>
            ))}
            {displayCertificates.length === 0 && (
              <tr>
                <td
                  colSpan={isFacilityStaff ? 5 : 4}
                  className='text-center py-12 text-gray-500'
                >
                  {t('noCertsToDisplay')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificateManagement;

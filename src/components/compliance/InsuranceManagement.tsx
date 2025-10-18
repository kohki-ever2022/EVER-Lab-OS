import React, { useState } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { useComplianceActions } from '../../hooks/useComplianceActions';

import { InsuranceType, InsuranceCertificate } from '../../types';
import { CalendarEventType } from '../../types';
import { Role } from '../../types';
import {
  googleCalendarService,
  createCalendarEventFromSchedule,
} from '../../services/googleCalendarService';
import { useCompanyContext } from '../../contexts/CompanyContext';
import { useTranslation } from '../../hooks/useTranslation';

const InsuranceManagement: React.FC = () => {
  const { language, currentUser, isFacilityStaff } = useSessionContext();
  const { insuranceCertificates } = useQmsContext();
  const { companies } = useCompanyContext();
  const { showToast } = useToast();
  const { addInsuranceCertificate, updateInsuranceCertificate } =
    useComplianceActions();
  const { t, isJapanese } = useTranslation();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState<
    Partial<Omit<InsuranceCertificate, 'id'>>
  >({
    type: InsuranceType.Liability,
    status: 'PENDING',
  });
  const [file, setFile] = useState<File | null>(null);

  const myCertificates = insuranceCertificates
    .filter((c) => isFacilityStaff || c.tenantId === currentUser?.companyId)
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );

  const getCompanyName = (tenantId: string) => {
    const company = companies.find((c) => c.id === tenantId);
    return company ? (isJapanese ? company.nameJP : company.nameEN) : tenantId;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const insuranceTypeLabels = {
    [InsuranceType.Fire]: { key: 'insuranceTypeFire' },
    [InsuranceType.Liability]: { key: 'insuranceTypeLiability' },
    [InsuranceType.ProductLiability]: { key: 'insuranceTypeProductLiability' },
    [InsuranceType.WorkersCompensation]: { key: 'insuranceTypeWorkersComp' },
    [InsuranceType.Other]: { key: 'insuranceTypeOther' },
  };

  const handleSubmitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentUser ||
      !file ||
      !formData.insuranceCompany ||
      !formData.policyNumber ||
      !formData.coverageAmount ||
      !formData.startDate ||
      !formData.endDate
    )
      return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const fileUrl = reader.result as string;

      try {
        const newCertificateData: Omit<InsuranceCertificate, 'id'> = {
          tenantId: currentUser.companyId,
          type: formData.type!,
          insuranceCompany: formData.insuranceCompany!,
          policyNumber: formData.policyNumber!,
          coverageAmount: Number(formData.coverageAmount!),
          startDate: new Date(formData.startDate!),
          endDate: new Date(formData.endDate!),
          certificateUrl: fileUrl,
          uploadedDate: new Date(),
          uploadedBy: currentUser.id,
          status: 'PENDING',
          notes: formData.notes,
        };

        const insuranceTypeLabel = t(
          insuranceTypeLabels[newCertificateData.type].key as any
        );
        const companyName = getCompanyName(currentUser.companyId);

        const mainEvent = createCalendarEventFromSchedule(
          CalendarEventType.InsuranceRenewal,
          {
            jp: `【重要】${insuranceTypeLabel}更新期限: ${companyName}`,
            en: `[Important] ${insuranceTypeLabel} Renewal Deadline: ${companyName}`,
          },
          {
            jp: `保険会社: ${newCertificateData.insuranceCompany}\n証券番号: ${newCertificateData.policyNumber}\n補償額: ¥${newCertificateData.coverageAmount.toLocaleString()}\n\n※この日までに更新手続きを完了してください。`,
            en: `Insurance Company: ${newCertificateData.insuranceCompany}\nPolicy Number: ${newCertificateData.policyNumber}\nCoverage: ¥${newCertificateData.coverageAmount.toLocaleString()}\n\n※Please complete renewal by this date.`,
          },
          newCertificateData.endDate,
          480, // 8 hours for renewal task
          [newCertificateData.uploadedBy, 'user-lab-manager'],
          undefined,
          [129600, 43200, 10080, 0] // 90d, 30d, 7d, on the day
        );

        const syncResult = await googleCalendarService.createEvent(
          mainEvent,
          language
        );

        const addResult = await addInsuranceCertificate({
          ...newCertificateData,
          googleCalendarEventId: syncResult.success
            ? syncResult.googleCalendarEventId
            : undefined,
        });

        if (addResult.success === false) {
          showToast(
            `${t('certSaveFailed')}: ${addResult.error.message}`,
            'error'
          );
          return;
        }

        if (syncResult.success) {
          showToast(t('certUploadSuccessCalendar'), 'success');
        } else {
          showToast(t('certUploadWarningNoCalendar'), 'warning');
        }

        setShowUploadForm(false);
        setFormData({ type: InsuranceType.Liability, status: 'PENDING' });
        setFile(null);
      } catch (error) {
        console.error('Error uploading certificate:', error);
        showToast(t('errorOccurred'), 'error');
      }
    };
  };

  const handleCertificateRenewed = async (
    certificate: InsuranceCertificate,
    newCertificate: InsuranceCertificate
  ) => {
    try {
      if (certificate.googleCalendarEventId) {
        await googleCalendarService.deleteEvent(
          certificate.googleCalendarEventId
        );
      }

      const insuranceTypeLabel = t(
        insuranceTypeLabels[newCertificate.type].key as any
      );
      const company = companies.find((c) => c.id === newCertificate.tenantId);
      const companyName = company
        ? isJapanese
          ? company.nameJP
          : company.nameEN
        : t('tenant');

      const newEvent = createCalendarEventFromSchedule(
        CalendarEventType.InsuranceRenewal,
        {
          jp: `【重要】${insuranceTypeLabel}更新期限: ${companyName}`,
          en: `[Important] ${insuranceTypeLabel} Renewal Deadline: ${companyName}`,
        },
        {
          jp: `更新済み証明書\n保険会社: ${newCertificate.insuranceCompany}\n証券番号: ${newCertificate.policyNumber}\n補償額: ¥${newCertificate.coverageAmount.toLocaleString()}`,
          en: `Renewed Certificate\nInsurance Company: ${newCertificate.insuranceCompany}\nPolicy Number: ${newCertificate.policyNumber}\nCoverage: ¥${newCertificate.coverageAmount.toLocaleString()}`,
        },
        newCertificate.endDate,
        480,
        [newCertificate.uploadedBy, 'user-lab-manager'],
        newCertificate.id,
        [129600, 43200, 10080, 0]
      );

      const syncResult = await googleCalendarService.createEvent(
        newEvent,
        language
      );

      const updateResult = await updateInsuranceCertificate({
        ...newCertificate,
        googleCalendarEventId: syncResult.success
          ? syncResult.googleCalendarEventId
          : undefined,
      });

      if (updateResult.success === false) {
        showToast(
          `${t('certRenewFailed')}: ${updateResult.error.message}`,
          'error'
        );
        return;
      }

      if (syncResult.success) {
        showToast(t('certRenewSuccessCalendar'), 'success');
      } else {
        showToast(t('certRenewWarningNoCalendar'), 'warning');
      }
    } catch (error) {
      console.error('Error updating calendar for renewed certificate:', error);
    }
  };

  const handleVerify = async (cert: InsuranceCertificate) => {
    if (!isFacilityStaff || !currentUser) return;
    const result = await updateInsuranceCertificate({
      ...cert,
      status: 'VERIFIED',
      verifiedBy: currentUser.id,
      verifiedDate: new Date(),
    });
    if (result.success === false) {
      showToast(`${t('verifyFailed')}: ${result.error.message}`, 'error');
    } else {
      showToast(t('certVerified'), 'success');
    }
  };

  const getExpiryStatus = (endDate: Date) => {
    const now = new Date();
    const daysUntilExpiry = Math.floor(
      (new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        label: t('statusExpired'),
        color: 'bg-red-100 text-red-700',
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: 'expiring-soon',
        label: `${t('daysLeft')}${daysUntilExpiry}${t('daysLeftSuffix')}`,
        color: 'bg-orange-100 text-orange-700',
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        status: 'warning',
        label: `${t('daysLeft')}${daysUntilExpiry}${t('daysLeftSuffix')}`,
        color: 'bg-yellow-100 text-yellow-700',
      };
    }
    return {
      status: 'valid',
      label: t('valid'),
      color: 'bg-green-100 text-green-700',
    };
  };

  const statusConfig = {
    PENDING: { key: 'pending', color: 'bg-yellow-100 text-yellow-700' },
    VERIFIED: { key: 'statusVerified', color: 'bg-blue-100 text-blue-700' },
    EXPIRED: { key: 'statusExpired', color: 'bg-gray-200 text-gray-600' },
    REJECTED: {
      key: 'insuranceStatusRejected',
      color: 'bg-red-100 text-red-700',
    },
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>{t('insuranceManagement')}</h2>
        {currentUser?.roleCategory !== 'FACILITY' && (
          <button
            onClick={() => setShowUploadForm(true)}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            {t('uploadNew')}
          </button>
        )}
      </div>

      {showUploadForm && (
        <div className='bg-white p-6 rounded-lg shadow mb-6 border-2 border-blue-200'>
          <h3 className='text-lg font-bold mb-4'>{t('uploadInsuranceCert')}</h3>
          <form onSubmit={handleSubmitCertificate} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium'>
                  {t('insuranceType')}
                </label>
                <select
                  name='type'
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as InsuranceType,
                    })
                  }
                  className='w-full border rounded p-2 mt-1'
                >
                  {Object.entries(insuranceTypeLabels).map(
                    ([key, { key: tKey }]) => (
                      <option key={key} value={key}>
                        {t(tKey as any)}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium'>
                  {t('insuranceCompany')}
                </label>
                <input
                  type='text'
                  name='insuranceCompany'
                  value={formData.insuranceCompany || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insuranceCompany: e.target.value,
                    })
                  }
                  className='w-full border rounded p-2 mt-1'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium'>
                  {t('policyNumber')}
                </label>
                <input
                  type='text'
                  name='policyNumber'
                  value={formData.policyNumber || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, policyNumber: e.target.value })
                  }
                  className='w-full border rounded p-2 mt-1'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium'>
                  {t('coverageAmount')}
                </label>
                <input
                  type='number'
                  name='coverageAmount'
                  value={formData.coverageAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coverageAmount: parseFloat(e.target.value),
                    })
                  }
                  className='w-full border rounded p-2 mt-1'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium'>
                  {t('startDate')}
                </label>
                <input
                  type='date'
                  name='startDate'
                  value={formData.startDate?.toString().split('T')[0] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: new Date(e.target.value),
                    })
                  }
                  className='w-full border rounded p-2 mt-1'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium'>
                  {t('endDate')}
                </label>
                <input
                  type='date'
                  name='endDate'
                  value={formData.endDate?.toString().split('T')[0] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: new Date(e.target.value),
                    })
                  }
                  className='w-full border rounded p-2 mt-1'
                  required
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium'>
                {t('certFile')}
              </label>
              <input
                type='file'
                accept='.pdf'
                onChange={handleFileChange}
                className='w-full border rounded p-2 mt-1'
                required
              />
            </div>
            <div className='flex justify-end gap-2 mt-4'>
              <button
                type='button'
                onClick={() => setShowUploadForm(false)}
                className='px-4 py-2 border rounded hover:bg-gray-50'
              >
                {t('cancel')}
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                {t('upload')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='bg-white rounded-lg shadow overflow-x-auto'>
        <table className='min-w-full'>
          <thead className='bg-gray-50'>
            <tr>
              {isFacilityStaff && (
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  {t('tenant')}
                </th>
              )}
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                {t('insuranceType')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                {t('policyNumber')}
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
            {myCertificates.map((cert) => {
              const expiry = getExpiryStatus(cert.endDate);
              const statusConfigEntry = statusConfig[cert.status];
              const status =
                cert.status === 'EXPIRED'
                  ? expiry
                  : {
                      label: t(statusConfigEntry.key as any),
                      color: statusConfigEntry.color,
                    };
              return (
                <tr key={cert.id} className='hover:bg-gray-50'>
                  {isFacilityStaff && (
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {getCompanyName(cert.tenantId)}
                    </td>
                  )}
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    {t(insuranceTypeLabels[cert.type].key as any)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    {cert.policyNumber}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <div>{cert.endDate.toLocaleDateString()}</div>
                    <div className={`text-xs mt-1 font-medium ${expiry.color}`}>
                      {expiry.label}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <a
                      href={cert.certificateUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 mr-3'
                    >
                      {t('view')}
                    </a>
                    {isFacilityStaff && cert.status === 'PENDING' && (
                      <button
                        onClick={() => handleVerify(cert)}
                        className='text-green-600 hover:text-green-800'
                      >
                        {t('verify')}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsuranceManagement;

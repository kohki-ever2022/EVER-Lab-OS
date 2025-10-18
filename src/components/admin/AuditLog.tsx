import React from 'react';
import { useAuditContext } from '../../contexts/AppProviders';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from '../../hooks/useTranslation';

const AuditLog: React.FC = () => {
  const { auditLogs } = useAuditContext();
  const { t, isJapanese } = useTranslation();
  const { hasPermission } = usePermissions();

  if (!hasPermission('audit', 'read')) {
    return (
      <div>
        <h2 className='text-3xl font-bold mb-6 text-lab-blue-dark'>
          {t('auditLog')}
        </h2>
        <div className='bg-white p-6 rounded-lg shadow'>
          <p>{t('permissionDenied')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className='text-3xl font-bold mb-6 text-lab-blue-dark'>
        {t('auditLog')}
      </h2>
      <p className='mb-6 text-gray-600'>{t('auditLogDescription')}</p>
      <div className='bg-white rounded-lg shadow overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                {t('timestamp')}
              </th>
              <th
                scope='col'
                className='px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                {t('user')}
              </th>
              <th
                scope='col'
                className='px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                {t('actions')}
              </th>
              <th
                scope='col'
                className='px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                {t('details')}
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className='px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500'>
                  {new Date(log.timestamp).toLocaleString(
                    isJapanese ? 'ja-JP' : 'en-US'
                  )}
                </td>
                <td className='px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-900'>
                  {log.userName}
                </td>
                <td className='px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500'>
                  <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
                    {log.action}
                  </span>
                </td>
                <td className='px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500'>
                  {log.details}
                </td>
              </tr>
            ))}
            {auditLogs.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className='px-6 py-12 text-center text-gray-500'
                >
                  {t('noLogEntries')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;

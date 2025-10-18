import React, { useMemo } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUsers } from '../../contexts/UserContext';
import { useCompanyContext } from '../../contexts/CompanyContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Role } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

const MemberManagement: React.FC = () => {
  const { currentUser } = useSessionContext();
  const { t, isJapanese } = useTranslation();
  const users = useUsers();
  const { companies } = useCompanyContext();
  const { hasPermission } = usePermissions();

  const companyMembers = useMemo(() => {
    if (!currentUser) return [];
    return users.filter((u) => u.companyId === currentUser.companyId);
  }, [users, currentUser]);

  const canManage =
    hasPermission('users', 'manage') &&
    currentUser?.role === Role.ProjectManager;

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-ever-black'>
          {t('memberManagement')}
        </h2>
        {canManage && (
          <button className='bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg'>
            {t('addNewMember')}
          </button>
        )}
      </div>

      <div className='bg-white rounded-lg shadow overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('name')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('emailAddress')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('role')}
              </th>
              {canManage && (
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {companyMembers.map((user) => (
              <tr key={user.id}>
                <td className='px-6 py-4 whitespace-nowrap'>{user.name}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{user.email}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{user.role}</td>
                {canManage && (
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button className='text-indigo-600 hover:text-indigo-900 mr-4'>
                      {t('edit')}
                    </button>
                    <button className='text-red-600 hover:text-red-900'>
                      {t('delete')}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberManagement;

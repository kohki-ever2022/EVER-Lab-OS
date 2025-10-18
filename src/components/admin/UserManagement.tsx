import React, { useState } from 'react';
import { useUsers } from '../../contexts/UserContext';
import { useCompanyContext } from '../../contexts/CompanyContext';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useUserActions } from '../../hooks/useUserActions';
import { useTranslation } from '../../hooks/useTranslation';

import { User } from '../../types';
import { Role, RoleCategory, Result } from '../../types';

const UserManagement: React.FC = () => {
  const users = useUsers();
  const { companies } = useCompanyContext();
  const { t, isJapanese } = useTranslation();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();
  const { addUser, updateUser, deleteUser } = useUserActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canManageUsers = hasPermission('users', 'manage');

  const openModal = (user: Partial<User> | null = null) => {
    setCurrentUser(
      user || { role: Role.Researcher, roleCategory: RoleCategory.Tenant }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);

    let result: Result<User, Error>;
    if (currentUser.id) {
      result = await updateUser(currentUser as User);
    } else {
      result = await addUser(currentUser as Omit<User, 'id'>);
    }

    if (result.success === false) {
      showToast(result.error.message, 'error');
    } else {
      showToast(t('userSaved'), 'success');
      closeModal();
    }
    setIsSaving(false);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm(t('deleteUserConfirm'))) {
      const result = await deleteUser(userId);
      if (result.success === false) {
        showToast(result.error.message, 'error');
      } else {
        showToast(t('userDeleted'), 'success');
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  if (!canManageUsers) {
    return <div className='p-6'>{t('permissionDenied')}</div>;
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-ever-black'>
          {t('userManagement')}
        </h2>
        <button
          onClick={() => openModal()}
          className='bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg'
        >
          {t('addNewUser')}
        </button>
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
                {t('company')}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('role')}
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {users.map((user) => (
              <tr key={user.id}>
                <td className='px-6 py-4 whitespace-nowrap'>{user.name}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{user.email}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {
                    companies.find((c) => c.id === user.companyId)?.[
                      isJapanese ? 'nameJP' : 'nameEN'
                    ]
                  }
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>{user.role}</td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button
                    onClick={() => openModal(user)}
                    className='text-indigo-600 hover:text-indigo-900 mr-4'
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className='text-red-600 hover:text-red-900'
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && currentUser && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold mb-6'>
              {currentUser.id ? t('editUser') : t('addNewUser')}
            </h3>
            <form onSubmit={handleSave} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  {t('name')}
                </label>
                <input
                  type='text'
                  name='name'
                  value={currentUser.name || ''}
                  onChange={handleChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  {t('emailAddress')}
                </label>
                <input
                  type='email'
                  name='email'
                  value={currentUser.email || ''}
                  onChange={handleChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  {t('company')}
                </label>
                <select
                  name='companyId'
                  value={currentUser.companyId || ''}
                  onChange={handleChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
                  required
                >
                  <option value=''>{t('selectCompany')}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isJapanese ? c.nameJP : c.nameEN}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  {t('role')}
                </label>
                <select
                  name='role'
                  value={currentUser.role || ''}
                  onChange={handleChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm'
                  required
                >
                  {Object.values(Role).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mt-8 flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg disabled:opacity-50'
                  disabled={isSaving}
                >
                  {t('cancel')}
                </button>
                <button
                  type='submit'
                  className='bg-ever-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400'
                  disabled={isSaving}
                >
                  {isSaving ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

import React, { useState } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUserContext } from '../../contexts/UserContext';
import { useCompanyContext } from '../../contexts/CompanyContext';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useUserActions } from '../../hooks/useUserActions';

// FIX: import from barrel file
import { User } from '../../types';
// FIX: import from barrel file
import { Role, RoleCategory, Result } from '../../types';

export const UserManagement: React.FC = () => {
    const { users } = useUserContext();
    const { companies } = useCompanyContext();
    const { isJapanese } = useSessionContext();
    const { showToast } = useToast();
    const { hasPermission } = usePermissions();
    const { addUser, updateUser, deleteUser } = useUserActions();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const canManageUsers = hasPermission('users', 'manage');

    const openModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user || { role: Role.Researcher, roleCategory: RoleCategory.Tenant });
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
            showToast(isJapanese ? 'ユーザー情報が保存されました。' : 'User information saved.', 'success');
            closeModal();
        }
        setIsSaving(false);
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm(isJapanese ? 'このユーザーを削除しますか？' : 'Are you sure you want to delete this user?')) {
            const result = await deleteUser(userId);
            if (result.success === false) {
                showToast(result.error.message, 'error');
            } else {
                showToast(isJapanese ? 'ユーザーを削除しました。' : 'User deleted.', 'success');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentUser(prev => prev ? { ...prev, [name]: value } : null);
    };

    if (!canManageUsers) {
        return <div className="p-6">{isJapanese ? 'アクセス権がありません。' : 'Permission Denied.'}</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-ever-black">
                    {isJapanese ? 'ユーザー管理' : 'User Management'}
                </h2>
                <button
                    onClick={() => openModal()}
                    className="bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg"
                >
                    {isJapanese ? '新規ユーザー追加' : 'Add New User'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '名前' : 'Name'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'メール' : 'Email'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '企業' : 'Company'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '役割' : 'Role'}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '操作' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{companies.find(c => c.id === user.companyId)?.[isJapanese ? 'nameJP' : 'nameEN']}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">{isJapanese ? '編集' : 'Edit'}</button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">{isJapanese ? '削除' : 'Delete'}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6">{currentUser.id ? (isJapanese ? 'ユーザー編集' : 'Edit User') : (isJapanese ? '新規ユーザー追加' : 'Add New User')}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? '名前' : 'Name'}</label>
                                <input type="text" name="name" value={currentUser.name || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'メールアドレス' : 'Email'}</label>
                                <input type="email" name="email" value={currentUser.email || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'パスワード' : 'Password'}</label>

                                <input type="password" name="password" onChange={handleChange} placeholder={currentUser.id ? (isJapanese ? '変更する場合のみ入力' : 'Fill only to change') : ''} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required={!currentUser.id} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? '所属企業' : 'Company'}</label>
                                <select name="companyId" value={currentUser.companyId || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                                    <option value="">{isJapanese ? '選択してください' : 'Select a company'}</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{isJapanese ? c.nameJP : c.nameEN}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? '役割' : 'Role'}</label>
                                <select name="role" value={currentUser.role || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                                    {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg disabled:opacity-50" disabled={isSaving}>{isJapanese ? 'キャンセル' : 'Cancel'}</button>
                                <button type="submit" className="bg-ever-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400" disabled={isSaving}>
                                    {isSaving ? (isJapanese ? '保存中...' : 'Saving...') : (isJapanese ? '保存' : 'Save')}
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
import React, { useMemo } from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useUserContext } from '../contexts/UserContext';
import { useCompanyContext } from '../contexts/CompanyContext';
import { usePermissions } from '../hooks/usePermissions';
import { Role } from '../types/core';

export const MemberManagement: React.FC = () => {
    const { currentUser, isJapanese } = useSessionContext();
    const { users } = useUserContext();
    const { companies } = useCompanyContext();
    const { hasPermission } = usePermissions();

    const companyMembers = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => u.companyId === currentUser.companyId);
    }, [users, currentUser]);

    const companyName = useMemo(() => {
        const company = companies.find(c => c.id === currentUser?.companyId);
        return company ? (isJapanese ? company.nameJP : company.nameEN) : '';
    }, [companies, currentUser, isJapanese]);
    
    const canManage = hasPermission('users', 'manage') && currentUser?.role === Role.ProjectManager;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-ever-black">
                    {isJapanese ? 'メンバー管理' : 'Member Management'}
                </h2>
                {canManage && (
                    <button className="bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg">
                        {isJapanese ? '新規メンバー追加' : 'Add New Member'}
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '名前' : 'Name'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'メール' : 'Email'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '役割' : 'Role'}</th>
                            {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '操作' : 'Actions'}</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {companyMembers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                                {canManage && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">{isJapanese ? '編集' : 'Edit'}</button>
                                        <button className="text-red-600 hover:text-red-900">{isJapanese ? '削除' : 'Delete'}</button>
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

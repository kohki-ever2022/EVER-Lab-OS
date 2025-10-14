import React from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useAdminContext } from '../../contexts/AppProviders';
import { usePermissions } from '../../hooks/usePermissions';
// FIX: import from barrel file
import { Language } from '../../types';

const AuditLog: React.FC = () => {
    const { auditLogs } = useAdminContext();
    const { language } = useSessionContext();
    const { hasPermission } = usePermissions();
    const isJapanese = language === Language.JA;

    if (!hasPermission('audit', 'read')) {
        return (
            <div>
                <h2 className="text-3xl font-bold mb-6 text-lab-blue-dark">
                    {isJapanese ? '監査ログ' : 'Audit Log'}
                </h2>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p>{isJapanese ? 'このページにアクセスする権限がありません。' : 'You do not have permission to access this page.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-lab-blue-dark">
                {isJapanese ? '監査ログ' : 'Audit Log'}
            </h2>
            <p className="mb-6 text-gray-600">
                {isJapanese 
                    ? 'システム内での重要な操作とデータ変更の履歴です。' 
                    : 'History of important operations and data changes within the system.'}
            </p>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '日時' : 'Timestamp'}</th>
                            <th scope="col" className="px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '操作者' : 'User'}</th>
                            <th scope="col" className="px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'アクション' : 'Action'}</th>
                            <th scope="col" className="px-2 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '詳細' : 'Details'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {auditLogs.map(log => (
                            <tr key={log.id}>
                                <td className="px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString(isJapanese ? 'ja-JP' : 'en-US')}</td>
                                <td className="px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-900">{log.userName}</td>
                                <td className="px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-2 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
                            </tr>
                        ))}
                         {auditLogs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    {isJapanese ? 'ログエントリがありません。' : 'No log entries.'}
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
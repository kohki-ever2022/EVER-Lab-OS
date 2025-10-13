import React, { useMemo } from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useMaintenanceLogContext } from '../contexts/MaintenanceLogContext';
import { useEquipmentContext } from '../contexts/EquipmentContext';
import { useUserContext } from '../contexts/UserContext';
import { usePermissions } from '../hooks/usePermissions';

import { MaintenanceLog, MaintenanceLogStatus } from '../types/equipment';

export const MaintenanceLogViewer: React.FC = () => {
    const { maintenanceLogs } = useMaintenanceLogContext();
    const { equipment } = useEquipmentContext();
    const { users } = useUserContext();
    const { isJapanese } = useSessionContext();
    const { hasPermission } = usePermissions();

    const logsWithDetails = useMemo(() => {
        return maintenanceLogs.map(log => ({
            ...log,
            equipmentName: equipment.find(e => e.id === log.equipmentId)?.[isJapanese ? 'nameJP' : 'nameEN'] || 'N/A',
            reporterName: users.find(u => u.id === log.reportedByUserId)?.name || 'N/A',
        })).sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
    }, [maintenanceLogs, equipment, users, isJapanese]);
    
    const canManage = hasPermission('equipment', 'manage');

    const getStatusColor = (status: MaintenanceLogStatus) => {
        switch(status) {
            case MaintenanceLogStatus.Reported: return 'bg-red-100 text-red-800';
            case MaintenanceLogStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
            case MaintenanceLogStatus.Completed: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    if (!canManage) {
        return <div className="p-6">{isJapanese ? 'アクセス権がありません。' : 'Permission Denied.'}</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {isJapanese ? 'メンテナンスログ' : 'Maintenance Log'}
            </h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '機器' : 'Equipment'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '報告日' : 'Report Date'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '報告者' : 'Reporter'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '内容' : 'Notes'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'ステータス' : 'Status'}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '操作' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logsWithDetails.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{log.equipmentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.reportDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{log.reporterName}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.notes}>{log.notes}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900">{isJapanese ? '詳細' : 'Details'}</button>
                                </td>
                            </tr>
                        ))}
                         {logsWithDetails.length === 0 && (
                             <tr><td colSpan={6} className="text-center py-8 text-gray-500">{isJapanese ? 'メンテナンスログはありません。' : 'No maintenance logs found.'}</td></tr>
                         )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaintenanceLogViewer;

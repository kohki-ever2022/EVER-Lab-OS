import React, { useMemo } from 'react';
import { useMaintenanceLogContext } from '../../contexts/MaintenanceLogContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useUsers } from '../../contexts/UserContext';
import { useTranslation } from '../../hooks/useTranslation';

import { EquipmentStatus, MaintenanceLogStatus } from '../../types';

const MaintenanceStatus: React.FC = () => {
    const { t, isJapanese } = useTranslation();
    const { maintenanceLogs } = useMaintenanceLogContext();
    const equipment = useEquipment();
    const users = useUsers();
    
    const maintenanceEquipment = useMemo(() => {
        return equipment
            .filter(e => e.status === EquipmentStatus.Maintenance)
            .map(e => {
                const latestLog = maintenanceLogs
                    .filter(log => log.equipmentId === e.id && log.status !== MaintenanceLogStatus.Completed)
                    .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())[0];
                
                const reporter = latestLog ? users.find(u => u.id === latestLog.reportedByUserId) : null;

                return {
                    ...e,
                    latestLog,
                    reporterName: reporter?.name
                };
            });
    }, [equipment, maintenanceLogs, users]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {t('maintenanceStatus')}
            </h2>
            
            {maintenanceEquipment.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {maintenanceEquipment.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow border-l-4 border-yellow-500 p-6">
                            <h3 className="font-bold text-lg text-gray-800">{isJapanese ? item.nameJP : item.nameEN}</h3>
                            <p className="text-sm text-gray-500 mb-4">{item.location}</p>
                            
                            {item.latestLog ? (
                                <div className="bg-yellow-50 p-4 rounded-md">
                                    <p className="text-sm text-yellow-800 font-semibold">{t('latestReport')}</p>
                                    <p className="text-sm text-yellow-700 mt-1 italic">"{item.latestLog.notes}"</p>
                                    <p className="text-xs text-yellow-600 mt-2">
                                        {t('by')} {item.reporterName || 'N/A'} - {new Date(item.latestLog.reportDate).toLocaleDateString()}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">{t('noDetailedReport')}</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">{t('noMaintenanceEquipment')}</p>
                </div>
            )}
        </div>
    );
};

export default MaintenanceStatus;
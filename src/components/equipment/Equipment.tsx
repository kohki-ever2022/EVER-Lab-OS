import React, { useState, useMemo } from 'react';
import { Role, Language, View, NotificationType } from '../../types';
import { Equipment as EquipmentType, EquipmentStatus, ManualType } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUsers } from '../../contexts/UserContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useModalContext } from '../../contexts/ModalContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { useAdminContext } from '../../contexts/AppProviders';
import { YoutubeIcon, PdfIcon, LinkIcon, ArrowRightIcon, WarningIcon, getManualIcon, StarIcon } from '../common/Icons';
import { useTranslation } from '../../hooks/useTranslation';
import { useEquipmentFavorites } from '../../hooks/useEquipmentFavorites';


const StatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const { t } = useTranslation();

    const statusMap = {
        [EquipmentStatus.Available]: { 
            text: t('available'),
            color: 'bg-green-100 text-green-800', 
            dot: 'bg-green-500' 
        },
        [EquipmentStatus.InUse]: { 
            text: t('statusInUse'),
            color: 'bg-red-100 text-red-800', 
            dot: 'bg-red-500' 
        },
        [EquipmentStatus.Maintenance]: { 
            text: t('maintenance'),
            color: 'bg-yellow-100 text-yellow-800', 
            dot: 'bg-yellow-500' 
        },
        [EquipmentStatus.Calibration]: { 
            text: t('calibration'),
            color: 'bg-blue-100 text-blue-800', 
            dot: 'bg-blue-500' 
        },
    };

    const currentStatus = statusMap[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
            <span className={`w-2 h-2 mr-1.5 rounded-full ${currentStatus.dot}`}></span>
            {currentStatus.text}
        </span>
    );
};

const EquipmentCard: React.FC<{ equipment: EquipmentType }> = ({ equipment }) => {
    const { currentUser } = useSessionContext();
    const { t, isJapanese } = useTranslation();
    const { qualifications, userCertifications } = useQmsContext();
    const users = useUsers();
    const { openModal } = useModalContext();
    const { isFavorite, toggleFavorite } = useEquipmentFavorites();
    
    const isThisFavorite = currentUser ? isFavorite(currentUser.id, equipment.id) : false;

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentUser) {
            toggleFavorite(currentUser.id, equipment.id);
        }
    };

    const requiredQualId = equipment.requiredQualificationId;
    const userCertification = userCertifications.find(cert => 
        cert.userId === currentUser?.id &&
        (cert as any).qualificationId === requiredQualId &&
        new Date() < new Date(cert.expiresAt)
    );
    const userHasQualification = !requiredQualId || !!userCertification;
    const requiredQual = requiredQualId ? qualifications.find(q => q.id === requiredQualId) : null;
    
    const isCalibrationOverdue = equipment.nextCalibrationDate && new Date(equipment.nextCalibrationDate) < new Date();

    const isAvailableForBooking = equipment.isReservable && equipment.status === EquipmentStatus.Available && userHasQualification && !isCalibrationOverdue;

    const equipmentName = isJapanese ? equipment.nameJP : equipment.nameEN;
    const equipmentCategory = isJapanese ? equipment.categoryJP : equipment.categoryEN;
    const rateUnit = isJapanese ? equipment.rateUnitJP : equipment.rateUnitEN;
    const requiredQualName = requiredQual ? (isJapanese ? requiredQual.nameJP : requiredQual.nameEN) : '';
    const personInCharge = equipment.personInChargeUserId ? users.find(u => u.id === equipment.personInChargeUserId) : null;
    const locationDetails = isJapanese ? equipment.locationDetailsJP : equipment.locationDetailsEN;

    const getBookingButtonTitle = () => {
        if (!equipment.isReservable) return t('notReservable');
        if (isCalibrationOverdue) return t('calibrationOverdue');
        if (!userHasQualification) {
            if (!userCertification && requiredQualId) {
                const hasEverHadCert = userCertifications.some(c => c.userId === currentUser?.id && (c as any).qualificationId === requiredQualId);
                return hasEverHadCert ? t('certExpired') : t('noCert');
            }
            return t('noCert');
        }
        if (equipment.status !== EquipmentStatus.Available) return t('notAvailable');
        return '';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col relative">
             <button
                onClick={handleToggleFavorite}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10"
                title={isThisFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                aria-label={isThisFavorite ? t('removeFromFavorites') : t('addToFavorites')}
            >
                <StarIcon className={`w-6 h-6 ${isThisFavorite ? 'fill-yellow-400 stroke-yellow-500' : 'fill-transparent stroke-white'}`} />
            </button>
            <img src={equipment.imageUrl} alt={equipmentName} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <StatusBadge status={equipment.status} />
                <h3 className="text-lg font-bold text-ever-black mt-2">{equipmentName}</h3>
                <p className="text-sm text-gray-500">{equipmentCategory}</p>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p><span className="font-semibold">{t('rate')}:</span> {equipment.isReservable ? `${equipment.rate.toLocaleString()} ${rateUnit}` : t('notReservable')}</p>
                    <p><span className="font-semibold">{t('location')}:</span> {equipment.location} {locationDetails && `(${locationDetails})`}</p>
                    {requiredQual && (
                         <p className="text-xs text-yellow-600 font-semibold">{t('required')}: {requiredQualName}</p>
                    )}
                    {personInCharge && (
                        <p className="text-xs text-gray-600">{t('expert')}: {personInCharge.name}</p>
                    )}
                </div>
                <div className="mt-auto pt-4 space-y-2">
                    <div className="flex space-x-2">
                        {equipment.isReservable && <button onClick={() => openModal({ type: 'scheduleEquipment', props: { equipment } })} className="flex-1 bg-white hover:bg-gray-100 text-text-primary font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors text-sm">{t('schedule')}</button>}
                        <button onClick={() => openModal({ type: 'equipmentManuals', props: { equipment } })} className={`flex-1 font-semibold py-2 px-4 rounded-lg border transition-colors text-sm ${equipment.manualIds && equipment.manualIds.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-white hover:bg-gray-100 text-text-primary border-gray-300'}`}>{t('manualsAndInfo')}</button>
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => openModal({ type: 'bookEquipment', props: { equipment } })}
                            disabled={!isAvailableForBooking}
                            className={`w-full font-bold py-2 px-4 rounded-full transition-all duration-300 ${
                                isAvailableForBooking
                                ? 'bg-gradient-to-r from-ever-blue to-ever-purple text-white hover:shadow-lg' 
                                : `bg-gray-300 text-gray-500 ${!equipment.isReservable ? 'opacity-50' : 'cursor-not-allowed'}`
                            }`}
                             title={getBookingButtonTitle()}
                        >
                            {t('bookEquipment')}
                        </button>
                        <button 
                            onClick={() => openModal({ type: 'reportIssue', props: { equipment } })}
                            className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded-lg"
                            title={t("reportIssue")}
                        >
                            <WarningIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EquipmentTable: React.FC<{
    equipmentList: EquipmentType[];
    sortConfig: { key: keyof EquipmentType | 'name', direction: 'ascending' | 'descending' } | null;
    requestSort: (key: keyof EquipmentType | 'name') => void;
}> = ({ equipmentList, sortConfig, requestSort }) => {
    const { equipmentManuals } = useAdminContext();
    const { t, isJapanese } = useTranslation();

    const sortedEquipment = useMemo(() => {
        let sortableItems = [...equipmentList];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const key = (sortConfig.key === 'name' ? (isJapanese ? 'nameJP' : 'nameEN') : sortConfig.key) as keyof EquipmentType;
                
                const aVal = a[key];
                const bVal = b[key];

                if (aVal === undefined || aVal === null) return 1;
                if (bVal === undefined || bVal === null) return -1;
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
                }

                if (aVal < bVal) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [equipmentList, sortConfig, isJapanese]);

    const getSortIndicator = (key: keyof EquipmentType | 'name') => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            {t('equipmentName')}{getSortIndicator('name')}
                        </th>
                        <th onClick={() => requestSort('model')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            {t('modelProductCode')}{getSortIndicator('model')}
                        </th>
                        <th onClick={() => requestSort('manufacturer')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            {t('manufacturer')}{getSortIndicator('manufacturer')}
                        </th>
                        <th onClick={() => requestSort('rate')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            {t('priceFee')}{getSortIndicator('rate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('manuals')}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedEquipment.length > 0 ? sortedEquipment.map(eq => (
                        <tr key={eq.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{isJapanese ? eq.nameJP : eq.nameEN}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.model || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.manufacturer || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.isReservable ? `${eq.rate.toLocaleString()} ${isJapanese ? eq.rateUnitJP : eq.rateUnitEN}` : t('notReservable')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                    {(eq.manualIds || []).map(manualId => {
                                        const manual = equipmentManuals.find(m => m.id === manualId);
                                        if (!manual) return null;
                                        return (
                                            <a key={manual.id} href={manual.url} target="_blank" rel="noopener noreferrer" title={manual.name}>
                                                {getManualIcon(manual.type)}
                                            </a>
                                        );
                                    })}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                {t('noEquipmentToDisplay')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const Equipment: React.FC = () => {
    const equipment = useEquipment();
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [sortConfig, setSortConfig] = useState<{ key: keyof EquipmentType | 'name', direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    
    const requestSort = (key: keyof EquipmentType | 'name') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-ever-black">
                    {t('equipmentList')}
                </h2>
                <div>
                    <button onClick={() => setViewMode('grid')} className={`mr-2 p-2 rounded ${viewMode === 'grid' ? 'bg-ever-blue text-white' : 'bg-gray-200'}`}>Grid</button>
                    <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-ever-blue text-white' : 'bg-gray-200'}`}>Table</button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {equipment.map(eq => <EquipmentCard key={eq.id} equipment={eq} />)}
                </div>
            ) : (
                <EquipmentTable equipmentList={equipment} sortConfig={sortConfig} requestSort={requestSort} />
            )}
        </div>
    );
};

export default Equipment;

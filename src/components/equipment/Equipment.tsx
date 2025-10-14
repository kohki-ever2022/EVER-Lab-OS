import React, { useState, useMemo } from 'react';
// FIX: import from barrel file
import { Role, Language, View, NotificationType } from '../../types';
// FIX: import from barrel file
import { Equipment as EquipmentType, EquipmentStatus, ManualType } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUserContext } from '../../contexts/UserContext';
import { useEquipmentContext } from '../../contexts/EquipmentContext';
import { useModalContext } from '../../contexts/ModalContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { useAdminContext } from '../../contexts/AppProviders';
import { YoutubeIcon, PdfIcon, LinkIcon, ArrowRightIcon, WarningIcon } from '../common/Icons';

const getManualIcon = (type: ManualType) => {
    switch (type) {
        case ManualType.YouTube: return <YoutubeIcon className="w-6 h-6 text-red-600" />;
        case ManualType.PDF: return <PdfIcon className="w-6 h-6 text-red-800" />;
        case ManualType.ExternalLink: return <LinkIcon className="w-6 h-6 text-blue-600" />;
    }
}


const StatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const { language } = useSessionContext();
    const isJapanese = language === Language.JA;

    const statusMap = {
        [EquipmentStatus.Available]: { 
            text: isJapanese ? '利用可' : 'Available',
            color: 'bg-green-100 text-green-800', 
            dot: 'bg-green-500' 
        },
        [EquipmentStatus.InUse]: { 
            text: isJapanese ? '使用中' : 'In Use',
            color: 'bg-red-100 text-red-800', 
            dot: 'bg-red-500' 
        },
        [EquipmentStatus.Maintenance]: { 
            text: isJapanese ? 'メンテ中' : 'Maintenance',
            color: 'bg-yellow-100 text-yellow-800', 
            dot: 'bg-yellow-500' 
        },
        [EquipmentStatus.Calibration]: { 
            text: isJapanese ? '校正中' : 'Calibration',
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
    const { language, currentUser } = useSessionContext();
    const { qualifications, userCertifications } = useQmsContext();
    const { users } = useUserContext();
    const { openModal } = useModalContext();
    
    const isJapanese = language === Language.JA;

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
        if (!equipment.isReservable) return isJapanese ? 'この機器は予約不要です' : 'This equipment does not require reservation';
        if (isCalibrationOverdue) return isJapanese ? '校正期限切れのため予約不可' : 'Cannot book, calibration is overdue';
        if (!userHasQualification) {
            if (!userCertification && requiredQualId) {
                const hasEverHadCert = userCertifications.some(c => c.userId === currentUser?.id && (c as any).qualificationId === requiredQualId);
                return hasEverHadCert
                    ? (isJapanese ? '資格の有効期限が切れています' : 'Your certification has expired')
                    : (isJapanese ? '有効な資格がありません' : 'You lack the required certification');
            }
            return isJapanese ? '資格がありません' : 'Qualification required';
        }
        if (equipment.status !== EquipmentStatus.Available) return isJapanese ? '現在利用できません' : 'Currently unavailable';
        return '';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <img src={equipment.imageUrl} alt={equipmentName} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <StatusBadge status={equipment.status} />
                <h3 className="text-lg font-bold text-ever-black mt-2">{equipmentName}</h3>
                <p className="text-sm text-gray-500">{equipmentCategory}</p>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p><span className="font-semibold">{isJapanese ? '料金' : 'Rate'}:</span> {equipment.isReservable ? `${equipment.rate.toLocaleString()} ${rateUnit}` : (isJapanese ? '予約不要' : 'No Reservation')}</p>
                    <p><span className="font-semibold">{isJapanese ? '場所' : 'Location'}:</span> {equipment.location} {locationDetails && `(${locationDetails})`}</p>
                    {requiredQual && (
                         <p className="text-xs text-yellow-600 font-semibold">{isJapanese ? '必要資格' : 'Required'}: {requiredQualName}</p>
                    )}
                    {personInCharge && (
                        <p className="text-xs text-gray-600">{isJapanese ? '担当者' : 'Expert'}: {personInCharge.name}</p>
                    )}
                </div>
                <div className="mt-auto pt-4 space-y-2">
                    <div className="flex space-x-2">
                        {equipment.isReservable && <button onClick={() => openModal({ type: 'scheduleEquipment', props: { equipment } })} className="flex-1 bg-white hover:bg-gray-100 text-text-primary font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors text-sm">{isJapanese ? 'スケジュール' : 'Schedule'}</button>}
                        <button onClick={() => openModal({ type: 'equipmentManuals', props: { equipment } })} className={`flex-1 font-semibold py-2 px-4 rounded-lg border transition-colors text-sm ${equipment.manualIds && equipment.manualIds.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-white hover:bg-gray-100 text-text-primary border-gray-300'}`}>{isJapanese ? 'マニュアル & 情報' : 'Manuals & Info'}</button>
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
                            {isJapanese ? '予約する' : 'Book'}
                        </button>
                        <button 
                            onClick={() => openModal({ type: 'reportIssue', props: { equipment } })}
                            className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded-lg"
                            title={isJapanese ? "不具合を報告" : "Report Issue"}
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
    const { language } = useSessionContext();
    const isJapanese = language === Language.JA;

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
                            {isJapanese ? '機器名' : 'Equipment Name'}{getSortIndicator('name')}
                        </th>
                        <th onClick={() => requestSort('model')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            {isJapanese ? 'モデル / 製品コード' : 'Model / Product Code'}{getSortIndicator('model')}
                        </th>
                        <th onClick={() => requestSort('manufacturer')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            {isJapanese ? 'メーカー' : 'Manufacturer'}{getSortIndicator('manufacturer')}
                        </th>
                        <th onClick={() => requestSort('rate')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                            {isJapanese ? '価格 / 料金' : 'Price / Fee'}{getSortIndicator('rate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isJapanese ? 'マニュアル' : 'Manuals'}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedEquipment.length > 0 ? sortedEquipment.map(eq => (
                        <tr key={eq.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{isJapanese ? eq.nameJP : eq.nameEN}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.model || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.manufacturer || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.isReservable ? `${eq.rate.toLocaleString()} ${isJapanese ? eq.rateUnitJP : eq.rateUnitEN}` : (isJapanese ? '予約不要' : 'No Reservation')}</td>
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
                                {isJapanese ? '表示する機器はありません。' : 'No equipment to display.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const Equipment: React.FC = () => {
    const { equipment } = useEquipmentContext();
    const { isJapanese } = useSessionContext();
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
                    {isJapanese ? '機器一覧' : 'Equipment'}
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
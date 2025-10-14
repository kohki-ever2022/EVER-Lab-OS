import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { Role, Language } from '../../types/core';
import { Equipment as EquipmentType, EquipmentStatus, ReservationStatus, MaintenanceLogStatus, Usage, EquipmentManual, ManualType } from '../../types/equipment';
import { Protocol } from '../../types/research';
import { UserCertification } from '../../types/user';
import { NotificationType } from '../../types/common';
import { useSessionContext } from '../../contexts/SessionContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useReservationActions } from '../../hooks/useReservationActions';
import { useEquipmentActions } from '../../hooks/useEquipmentActions';
import { useBillingActions } from '../../hooks/useBillingActions';
import { useUserContext } from '../../contexts/UserContext';
import { useProjectContext } from '../../contexts/ProjectContext';
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
    const { qualifications, userCertifications, protocols } = useQmsContext();
    const { users } = useUserContext();
    const { projects } = useProjectContext();
    const { showToast } = useToast();
    const { addNotification } = useNotifications();
    const { addReservation, addToWaitlist } = useReservationActions();
    const { updateEquipment, addMaintenanceLog } = useEquipmentActions();
    const { calculateCostForUsage } = useBillingActions();

    const { openModal } = useModalContext();
    
    const isJapanese = language === Language.JA;
    
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [bookingStartTime, setBookingStartTime] = useState('');
    const [bookingEndTime, setBookingEndTime] = useState('');
    const [bookingProjectId, setBookingProjectId] = useState<string>('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [reportNotes, setReportNotes] = useState('');
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [bookingError, setBookingError] = useState<string | null>(null);

    useEffect(() => {
        if (isBookingModalOpen) {
            setBookingError(null);
            const now = new Date();
            now.setMinutes(now.getMinutes() + 5); // Start 5 mins from now
            now.setSeconds(0);
            now.setMilliseconds(0);
            const start = now.toISOString().slice(0, 16);

            const endDt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour duration
            const end = endDt.toISOString().slice(0, 16);

            setBookingStartTime(start);
            setBookingEndTime(end);
        }
    }, [isBookingModalOpen]);

    useEffect(() => {
        if (isBookingModalOpen && bookingStartTime && bookingEndTime && equipment && currentUser && calculateCostForUsage) {
            const start = new Date(bookingStartTime);
            const end = new Date(bookingEndTime);
            if (end > start) {
                const durationMinutes = (end.getTime() - start.getTime()) / 60000;
                const tempUsage: Usage = {
                    id: '',
                    userId: currentUser.id,
                    equipmentId: equipment.id,
                    reservationId: '',
                    durationMinutes: durationMinutes,
                    date: start,
                };
                const cost = calculateCostForUsage(tempUsage, equipment);
                setEstimatedCost(cost);
            } else {
                setEstimatedCost(0);
            }
        } else {
            setEstimatedCost(0);
        }
    }, [bookingStartTime, bookingEndTime, equipment, calculateCostForUsage, currentUser, isBookingModalOpen]);

    const requiredQualId = equipment.requiredQualificationId;
    const userCertification = userCertifications.find(cert => 
        cert.userId === currentUser?.id &&
        (cert as any).qualificationId === requiredQualId && // Mock data inconsistency
        new Date() < new Date(cert.expiresAt)
    );
    const userHasQualification = !requiredQualId || !!userCertification;
    const requiredQual = requiredQualId ? qualifications.find(q => q.id === requiredQualId) : null;
    
    const isCalibrationOverdue = equipment.nextCalibrationDate && new Date(equipment.nextCalibrationDate) < new Date();

    const isAvailableForBooking = equipment.isReservable && equipment.status === EquipmentStatus.Available && userHasQualification && !isCalibrationOverdue;

    const userProjects = projects.filter(p => p.companyId === currentUser?.companyId);

    const equipmentName = isJapanese ? equipment.nameJP : equipment.nameEN;
    const equipmentCategory = isJapanese ? equipment.categoryJP : equipment.categoryEN;
    const rateUnit = isJapanese ? equipment.rateUnitJP : equipment.rateUnitEN;
    const requiredQualName = requiredQual ? (isJapanese ? requiredQual.nameJP : requiredQual.nameEN) : '';
    const personInCharge = equipment.personInChargeUserId ? users.find(u => u.id === equipment.personInChargeUserId) : null;
    const locationDetails = isJapanese ? equipment.locationDetailsJP : equipment.locationDetailsEN;

    const handleBookingSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setBookingError(null);
        if (!currentUser || !bookingStartTime || !bookingEndTime || !addReservation) return;
        
        const result = await addReservation({
            userId: currentUser.id,
            equipmentId: equipment.id,
            projectId: bookingProjectId || undefined,
            startTime: new Date(bookingStartTime),
            endTime: new Date(bookingEndTime),
            status: ReservationStatus.AwaitingCheckIn,
            notes: bookingNotes,
        });

        if (result.success === false) {
            setBookingError(result.error.message);
        } else {
            setIsBookingModalOpen(false);
            setBookingNotes('');
            setBookingProjectId('');
        }
    };

    const handleAddToWaitlist = async () => {
        if (!bookingStartTime || !bookingEndTime || !addToWaitlist) return;
        const result = await addToWaitlist(equipment.id, new Date(bookingStartTime), new Date(bookingEndTime));
        if (result.success === false) {
            setBookingError(result.error.message);
            showToast(isJapanese ? '待機リストへの追加に失敗しました。' : 'Failed to add to waitlist.', 'error');
        } else {
            showToast(isJapanese ? '待機リストに追加しました。' : 'Added to waitlist.', 'success');
            setIsBookingModalOpen(false);
        }
    };

    const handleReportSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!reportNotes || !currentUser || !updateEquipment || !addMaintenanceLog || !addNotification) return;

        const updateResult = await updateEquipment({ ...equipment, status: EquipmentStatus.Maintenance });
        if (updateResult.success === false) {
            showToast(isJapanese ? `機器ステータスの更新に失敗しました: ${updateResult.error.message}` : `Failed to update equipment status: ${updateResult.error.message}`, 'error');
            return;
        }
    
        const logResult = await addMaintenanceLog({
            equipmentId: equipment.id,
            logType: 'Repair',
            status: MaintenanceLogStatus.Reported,
            reportedByUserId: currentUser.id,
            reportDate: new Date(),
            notes: reportNotes,
        });

        if (logResult.success === false) {
            showToast(isJapanese ? `メンテナンスログの追加に失敗しました: ${logResult.error.message}` : `Failed to add maintenance log: ${logResult.error.message}`, 'error');
            return;
        }

        const labAdmins = users.filter(u => u.role === Role.FacilityDirector || u.role === Role.LabManager);
        labAdmins.forEach(admin => {
            addNotification({
                recipientUserId: admin.id,
                type: NotificationType.EquipmentMalfunction,
                priority: 'HIGH',
                titleJP: '不具合報告',
                titleEN: 'Malfunction Report',
                messageJP: `【不具合報告】${equipment.nameJP}に問題が報告されました。`,
                messageEN: `[Malfunction Report] An issue has been reported for ${equipment.nameEN}.`
            })
        });

        showToast(isJapanese ? '不具合を報告しました。' : 'Issue reported successfully.', 'success');
        setIsReportModalOpen(false);
        setReportNotes('');
    };

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
                            onClick={() => setIsBookingModalOpen(true)}
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
                            onClick={() => setIsReportModalOpen(true)}
                            className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded-lg"
                            title={isJapanese ? "不具合を報告" : "Report Issue"}
                        >
                            <WarningIcon />
                        </button>
                    </div>
                </div>
            </div>

            {isBookingModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-full overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6 text-ever-black">{isJapanese ? '機器予約' : 'Book Equipment'}</h3>
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? '開始日時' : 'Start Time'}</label>
                                <input type="datetime-local" value={bookingStartTime} onChange={e => setBookingStartTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? '終了日時' : 'End Time'}</label>
                                <input type="datetime-local" value={bookingEndTime} onChange={e => setBookingEndTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                             <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium text-gray-700">{isJapanese ? '概算料金' : 'Estimated Cost'}</span>
                                    <span className="text-2xl font-bold text-ever-blue font-mono">¥{Math.round(estimatedCost).toLocaleString()}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'プロジェクト' : 'Project'}</label>
                                <select value={bookingProjectId} onChange={e => setBookingProjectId(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="">{isJapanese ? '選択しない' : 'None'}</option>
                                    {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'メモ（任意）' : 'Notes (Optional)'}</label>
                                <textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            {bookingError && (
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                                    <p className="font-semibold text-yellow-800">{isJapanese ? '予約不可' : 'Slot Unavailable'}</p>
                                    <p className="text-sm text-yellow-700">{bookingError === 'OVERLAP_ERROR' ? (isJapanese ? 'この時間帯は既に予約されています。待機リストに追加しますか？' : 'This time slot is already booked. Would you like to be added to the waitlist?') : bookingError}</p>
                                </div>
                            )}
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
                                {bookingError === 'OVERLAP_ERROR' ? (
                                     <button type="button" onClick={handleAddToWaitlist} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">{isJapanese ? '待機リストに追加' : 'Add to Waitlist'}</button>
                                ) : (
                                    <button type="submit" className="bg-gradient-to-r from-ever-blue to-ever-purple text-white font-bold py-2 px-4 rounded-full">{isJapanese ? '予約を確定' : 'Confirm Booking'}</button>
                                )}
                            </div>
                        </form>
                    </div>
                 </div>
            )}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-6 text-ever-black">{isJapanese ? '不具合を報告' : 'Report Issue'}</h3>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{isJapanese ? '問題の詳細' : 'Details of the issue'}</label>
                                <textarea value={reportNotes} onChange={e => setReportNotes(e.target.value)} rows={5} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsReportModalOpen(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
                                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">{isJapanese ? '報告する' : 'Report'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
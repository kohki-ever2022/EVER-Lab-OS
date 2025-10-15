import React, { useState, useEffect, FormEvent } from 'react';
import { Equipment, ReservationStatus, Usage } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useToast } from '../../contexts/ToastContext';
import { useReservationActions } from '../../hooks/useReservationActions';
import { useBillingActions } from '../../hooks/useBillingActions';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
    equipment: Equipment;
    onClose: () => void;
}

const BookEquipmentModal: React.FC<Props> = ({ equipment, onClose }) => {
    const { currentUser } = useSessionContext();
    const { t } = useTranslation();
    const { projects } = useProjectContext();
    const { showToast } = useToast();
    const { addReservation, addToWaitlist } = useReservationActions();
    const { calculateCostForUsage } = useBillingActions();

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [projectId, setProjectId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const userProjects = projects.filter(p => p.companyId === currentUser?.companyId);

    useEffect(() => {
        setBookingError(null);
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        now.setSeconds(0);
        now.setMilliseconds(0);
        const start = now.toISOString().slice(0, 16);

        const endDt = new Date(now.getTime() + 60 * 60 * 1000);
        const end = endDt.toISOString().slice(0, 16);

        setStartTime(start);
        setEndTime(end);
    }, []);

    useEffect(() => {
        if (startTime && endTime && equipment && currentUser && calculateCostForUsage) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (end > start) {
                const durationMinutes = (end.getTime() - start.getTime()) / 60000;
                const tempUsage: Usage = {
                    id: '', userId: currentUser.id, equipmentId: equipment.id,
                    durationMinutes: durationMinutes, date: start,
                };
                setEstimatedCost(calculateCostForUsage(tempUsage, equipment));
            } else {
                setEstimatedCost(0);
            }
        }
    }, [startTime, endTime, equipment, calculateCostForUsage, currentUser]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setBookingError(null);
        if (!currentUser) return;
        
        const result = await addReservation({
            userId: currentUser.id, equipmentId: equipment.id, projectId: projectId || undefined,
            startTime: new Date(startTime), endTime: new Date(endTime),
            status: ReservationStatus.AwaitingCheckIn, notes,
        });

        if (result.success === false) {
            setBookingError(result.error.message);
        } else {
            showToast(t('bookingSuccess'), 'success');
            onClose();
        }
    };

    const handleAddToWaitlist = async () => {
        const result = await addToWaitlist(equipment.id, new Date(startTime), new Date(endTime));
        if (result.success === false) {
            setBookingError(result.error.message);
            showToast(t('addToWaitlistFailed'), 'error');
        } else {
            showToast(t('addToWaitlistSuccess'), 'success');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md modal-content max-h-full overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6 text-ever-black">{t('bookEquipmentModalTitle')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('startTime')}</label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('endTime')}</label>
                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-700">{t('estimatedCost')}</span>
                            <span className="text-2xl font-bold text-ever-blue font-mono">¥{Math.round(estimatedCost).toLocaleString()}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('projectLabel')}</label>
                        <select value={projectId} onChange={e => setProjectId(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">{t('none')}</option>
                            {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('notesOptional')}</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    {bookingError && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                            <p className="font-semibold text-yellow-800">{t('slotUnavailable')}</p>
                            <p className="text-sm text-yellow-700">{bookingError === 'OVERLAP_ERROR' ? t('slotUnavailableMsg') : bookingError}</p>
                        </div>
                    )}
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        {bookingError === 'OVERLAP_ERROR' ? (
                             <button type="button" onClick={handleAddToWaitlist} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">{t('addToWaitlist')}</button>
                        ) : (
                            <button type="submit" className="bg-gradient-to-r from-ever-blue to-ever-purple text-white font-bold py-2 px-4 rounded-full">{t('confirmBooking')}</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookEquipmentModal;
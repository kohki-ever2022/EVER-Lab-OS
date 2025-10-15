import React, { useState, FormEvent } from 'react';
import { Equipment, EquipmentStatus, MaintenanceLogStatus, Role, NotificationType } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUsers } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { useEquipmentActions } from '../../hooks/useEquipmentActions';
import { useNotifications } from '../../hooks/useNotifications';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
    equipment: Equipment;
    onClose: () => void;
}

const ReportIssueModal: React.FC<Props> = ({ equipment, onClose }) => {
    const { currentUser } = useSessionContext();
    const { t } = useTranslation();
    const users = useUsers();
    const { showToast } = useToast();
    const { addNotification } = useNotifications();
    const { updateEquipment, addMaintenanceLog } = useEquipmentActions();

    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!notes || !currentUser) return;

        const updateResult = await updateEquipment({ ...equipment, status: EquipmentStatus.Maintenance });
        if (updateResult.success === false) {
            showToast(`${t('updateFailed')}: ${updateResult.error.message}`, 'error');
            return;
        }
    
        const logResult = await addMaintenanceLog({
            equipmentId: equipment.id, logType: 'Repair', status: MaintenanceLogStatus.Reported,
            reportedByUserId: currentUser.id, reportDate: new Date(), notes,
        });

        if (logResult.success === false) {
            showToast(`${t('addFailed')}: ${logResult.error.message}`, 'error');
            return;
        }

        const labAdmins = users.filter(u => u.role === Role.FacilityDirector || u.role === Role.LabManager);
        labAdmins.forEach(admin => {
            addNotification({
                recipientUserId: admin.id, type: NotificationType.EquipmentMalfunction, priority: 'HIGH',
                titleJP: '不具合報告', titleEN: 'Malfunction Report',
                messageJP: `【不具合報告】${equipment.nameJP}に問題が報告されました。`,
                messageEN: `[Malfunction Report] An issue has been reported for ${equipment.nameEN}.`
            })
        });

        showToast(t('issueReported'), 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md modal-content">
                <h3 className="text-2xl font-bold mb-6 text-ever-black">{t('reportIssue')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('detailsOfIssue')}</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                        {/* FIX: Use a more specific translation key 'submitReport' to avoid conflicts. */}
                        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">{t('submitReport')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssueModal;
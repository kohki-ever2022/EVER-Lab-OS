// src/hooks/useComplianceActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useQmsContext } from '../contexts/AppProviders';
import { useSessionContext } from '../contexts/SessionContext';
import { useAudit } from './useAudit';
import { useNotifications } from './useNotifications';
import { useToast } from '../contexts/ToastContext';
import {
  Result,
  LabRule,
  RegulatoryRequirement,
  InsuranceCertificate,
  CalendarEventType,
  NotificationType,
  Certificate,
} from '../types';
import { googleCalendarService, createCalendarEventFromSchedule } from '../services/googleCalendarService';
import { useCompanyContext } from '../contexts/CompanyContext';

const simpleUUID = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useComplianceActions = () => {
    const adapter = useDataAdapter();
    const { labRules, setLabRules } = useQmsContext();
    const { companies } = useCompanyContext();
    const { currentUser, isJapanese, language } = useSessionContext();
    const { addAuditLog } = useAudit();
    const { addNotification } = useNotifications();
    const { showToast } = useToast();

    const acknowledgeRule = useCallback(async (ruleId: string): Promise<Result<LabRule, Error>> => {
        if (!currentUser) return { success: false, error: new Error('User not logged in.') };
        const rule = labRules.find(r => r.id === ruleId);
        if (!rule) return { success: false, error: new Error('Rule not found.') };
        
        const alreadyAcknowledged = rule.acknowledgedBy.some(ack => ack.userId === currentUser.id);
        if (alreadyAcknowledged) return { success: true, data: rule };
        
        const updatedRule: LabRule = {
            ...rule,
            acknowledgedBy: [
                ...rule.acknowledgedBy,
                { userId: currentUser.id, userName: currentUser.name, acknowledgedAt: new Date(), ruleVersion: '1.0' /* TODO: manage versions */ }
            ]
        };
        
        setLabRules(prev => prev.map(r => r.id === ruleId ? updatedRule : r));
        addAuditLog('RULE_ACKNOWLEDGED', `User acknowledged rule ${rule.ruleNumber}`);
        return { success: true, data: updatedRule };
    }, [currentUser, labRules, setLabRules, addAuditLog]);

    const addRegulatoryRequirement = useCallback(async (req: Omit<RegulatoryRequirement, 'id' | 'lastUpdated'>): Promise<Result<RegulatoryRequirement, Error>> => {
        const newReqWithCalendar: RegulatoryRequirement = { ...req, id: simpleUUID(), lastUpdated: new Date() } as RegulatoryRequirement;
        
        if (newReqWithCalendar.submissionDeadline) {
            const companyName = companies.find(c => c.id === newReqWithCalendar.tenantId)?.[isJapanese ? 'nameJP' : 'nameEN'] || 'Tenant';
            const calendarEvent = createCalendarEventFromSchedule(
                CalendarEventType.RegulatorySubmission,
                { jp: `【法規制】${newReqWithCalendar.requirementNameJP} 提出期限`, en: `[Compliance] ${newReqWithCalendar.requirementNameEN} Deadline` },
                { jp: `提出先: ${newReqWithCalendar.submissionAuthority}`, en: `Authority: ${newReqWithCalendar.submissionAuthority}` },
                newReqWithCalendar.submissionDeadline,
                60,
                [newReqWithCalendar.assignedTo || '', 'user-lab-manager'],
                newReqWithCalendar.id,
                [10080, 4320]
            );
            const syncResult = await googleCalendarService.createEvent(calendarEvent, language);
            if (syncResult.success) {
                newReqWithCalendar.googleCalendarEventId = syncResult.googleCalendarEventId;
                showToast(isJapanese ? '提出期限をカレンダーに登録しました。' : 'Submission deadline added to calendar.', 'success');
            } else {
                showToast(isJapanese ? 'カレンダーへの登録に失敗しました。' : 'Failed to add to calendar.', 'warning');
            }
        }
    
        return await adapter.createRegulatoryRequirement(newReqWithCalendar);
    }, [adapter, companies, isJapanese, language, showToast]);

    const checkAndNotifyForCertificate = useCallback((cert: InsuranceCertificate) => {
        const now = new Date();
        const expiry = new Date(cert.endDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        if (expiry > now && expiry <= thirtyDaysFromNow) {
            addNotification({
                recipientUserId: cert.uploadedBy,
                type: NotificationType.CertificateExpiring,
                priority: 'MEDIUM',
                titleJP: '保険証明書の有効期限警告',
                titleEN: 'Insurance Certificate Expiring Soon',
                messageJP: `保険「${cert.insuranceCompany}」が${expiry.toLocaleDateString('ja-JP')}に失効します。`,
                messageEN: `Your insurance from "${cert.insuranceCompany}" will expire on ${expiry.toLocaleDateString('en-US')}.`,
                actionUrl: `#/insuranceManagement`
            });
        }
    }, [addNotification]);

    const addInsuranceCertificate = useCallback(async (cert: Omit<InsuranceCertificate, 'id'>): Promise<Result<InsuranceCertificate, Error>> => {
        const result = await adapter.createInsuranceCertificate(cert);
        if(result.success) {
            checkAndNotifyForCertificate(result.data);
        }
        return result;
    }, [adapter, checkAndNotifyForCertificate]);
    
    const updateInsuranceCertificate = useCallback(async (cert: InsuranceCertificate): Promise<Result<InsuranceCertificate, Error>> => {
        const result = await adapter.updateInsuranceCertificate(cert);
        if(result.success) {
            checkAndNotifyForCertificate(result.data);
        }
        return result;
    }, [adapter, checkAndNotifyForCertificate]);

    const addCertificate = useCallback(async (cert: Omit<Certificate, 'id'>): Promise<Result<Certificate, Error>> => {
        const result = await adapter.createCertificate(cert);
        if (result.success) {
            addAuditLog('CERTIFICATE_UPLOAD', `Uploaded certificate '${cert.certificateType}' for user ${cert.userId}`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const updateCertificate = useCallback(async (cert: Certificate): Promise<Result<Certificate, Error>> => {
        const result = await adapter.updateCertificate(cert);
        if (result.success) {
            addAuditLog('CERTIFICATE_UPDATE', `Updated certificate '${cert.certificateType}' for user ${cert.userId}`);
        }
        return result;
    }, [adapter, addAuditLog]);

    return useMemo(() => ({
        acknowledgeRule,
        addRegulatoryRequirement,
        addInsuranceCertificate,
        updateInsuranceCertificate,
        addCertificate,
        updateCertificate
    }), [acknowledgeRule, addRegulatoryRequirement, addInsuranceCertificate, updateInsuranceCertificate, addCertificate, updateCertificate]);
};
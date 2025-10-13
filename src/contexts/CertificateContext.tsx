import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Certificate, NotificationType } from '../types';
import { useDataAdapter } from './DataAdapterContext';
import { useSessionContext } from './SessionContext';
import { useNotificationsContext } from './NotificationContext';

interface CertificateContextType {
  certificates: Certificate[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export const CertificateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const adapter = useDataAdapter();
  const { addNotification } = useNotificationsContext();
  const { currentUser } = useSessionContext();

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    const result = await adapter.getCertificates();
    if (result.success) {
      setCertificates(result.data);
    }
    setLoading(false);
  }, [adapter]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToCertificates(data => {
      setCertificates(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [adapter]);
  
  // Moved from useAppEffects.ts
  useEffect(() => {
    if (!currentUser || loading || certificates.length === 0) return;

    const checkCertificateExpiry = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const userCertificates = certificates.filter(c => c.userId === currentUser.id);

      userCertificates.forEach((cert: Certificate) => {
        const expiryDate = new Date(cert.expiryDate);
        if (expiryDate <= thirtyDaysFromNow && expiryDate > today) {
          
          addNotification({
            recipientUserId: currentUser.id,
            type: NotificationType.CertificateExpiring,
            priority: 'MEDIUM',
            titleJP: '証明書期限警告',
            titleEN: 'Certificate Expiry Warning',
            messageJP: `証明書「${cert.certificateType}」が30日以内に期限切れになります。`,
            messageEN: `Certificate "${cert.certificateType}" will expire in less than 30 days.`,
            actionUrl: '#/certificateManagement',
          });
        }
      });
    };

    checkCertificateExpiry();

    const intervalId = setInterval(checkCertificateExpiry, 24 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [certificates, loading, currentUser, addNotification]);

  const value = useMemo(() => ({ certificates, loading, refetch: fetchCertificates }), [certificates, loading, fetchCertificates]);

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
};

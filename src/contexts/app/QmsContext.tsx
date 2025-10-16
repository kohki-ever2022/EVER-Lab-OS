// src/contexts/app/QmsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { SDS, EhsIncident, RegulatoryRequirement, InsuranceCertificate, Manual, LabRule, Qualification, UserCertification, Protocol } from '../../types';
import { useDataAdapter } from '../DataAdapterContext';
import { getMockData } from '../../data/mockData';

interface QmsContextValue {
  sds: SDS[];
  ehsIncidents: EhsIncident[];
  regulatoryRequirements: RegulatoryRequirement[];
  insuranceCertificates: InsuranceCertificate[];
  manuals: Manual[];
  labRules: LabRule[];
  setLabRules: React.Dispatch<React.SetStateAction<LabRule[]>>;
  qualifications: Qualification[];
  userCertifications: UserCertification[];
  protocols: Protocol[];
}

const QmsContext = createContext<QmsContextValue | null>(null);

export const QmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const adapter = useDataAdapter();
    const initialData = getMockData();

    const [sds, setSds] = useState<SDS[]>([]);
    const [ehsIncidents, setEhsIncidents] = useState<EhsIncident[]>(initialData.ehsIncidents);
    const [regulatoryRequirements, setRegulatoryRequirements] = useState<RegulatoryRequirement[]>([]);
    const [insuranceCertificates, setInsuranceCertificates] = useState<InsuranceCertificate[]>([]);
    const [manuals, setManuals] = useState<Manual[]>(initialData.manuals);
    const [labRules, setLabRules] = useState<LabRule[]>(initialData.labRules);
    const [qualifications, setQualifications] = useState<Qualification[]>(initialData.qualifications);
    const [userCertifications, setUserCertifications] = useState<UserCertification[]>(initialData.userCertifications);
    const [protocols, setProtocols] = useState<Protocol[]>(initialData.protocols);

    useEffect(() => {
        const fetchData = async () => {
            const [sdsResult, reqsResult, insResult] = await Promise.all([
                adapter.getSds(),
                adapter.getRegulatoryRequirements(),
                adapter.getInsuranceCertificates(),
            ]);
            if (sdsResult.success) setSds(sdsResult.data);
            if (reqsResult.success) setRegulatoryRequirements(reqsResult.data);
            if (insResult.success) setInsuranceCertificates(insResult.data);
        };
        fetchData();
    }, [adapter]);
    
    const value = useMemo(() => ({
        sds, ehsIncidents, regulatoryRequirements, insuranceCertificates, manuals,
        labRules, setLabRules, qualifications, userCertifications, protocols
    }), [sds, ehsIncidents, regulatoryRequirements, insuranceCertificates, manuals, labRules, qualifications, userCertifications, protocols]);

    return <QmsContext.Provider value={value}>{children}</QmsContext.Provider>;
};

export const useQmsContext = () => {
    const c = useContext(QmsContext);
    if (!c) throw new Error('useQmsContext must be inside QmsProvider');
    return c;
};
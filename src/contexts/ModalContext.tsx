import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import {
  User,
  Tenant,
  Equipment,
  Invoice,
  Consumable,
  Quotation,
  Inquiry,
  Project,
  Protocol,
  Task,
  Vial,
  SampleBox,
  LegalDocument,
  DocumentVersion,
  EhsIncident,
  Budget,
  WasteContainer,
  WasteManifest,
  Ticket,
  SDS,
  Certificate,
  BenchAssignment,
} from '../types';

// App.tsxから移動するModalPayload型定義
export type ModalPayload =
  | { type: 'sendMemo'; props: { recipient: User } }
  | { type: 'scheduleEquipment'; props: { equipment: Equipment } }
  | { type: 'bookEquipment'; props: { equipment: Equipment } }
  | { type: 'reportIssue'; props: { equipment: Equipment } }
  | { type: 'equipmentHistory'; props: { equipment: Equipment } }
  | { type: 'equipmentManuals'; props: { equipment: Equipment } }
  | { type: 'viewInvoice'; props: { invoice: Invoice } }
  | { type: 'purchaseConsumable'; props: { consumable: Consumable } }
  | { type: 'projectDetails'; props: { project: Project | null } }
  | { type: 'logProtocol'; props: { protocol: Protocol } }
  | {
      type: 'editTask';
      props: { task: Task | null; prefilledData?: Partial<Task> | null };
    }
  | {
      type: 'eSignature';
      props: {
        request: {
          type: 'DocumentVersion' | 'LegalDocument';
          entity: DocumentVersion | LegalDocument;
        };
      };
    }
  | { type: 'tenantDetails'; props: { tenant: Tenant } }
  | { type: 'legalDocDetails'; props: { document: LegalDocument } }
  | { type: 'vialDetails'; props: { vial: Vial } }
  | { type: 'sampleBoxView'; props: { box: SampleBox } }
  | { type: 'pickList'; props: {} }
  | { type: 'ehsIncident'; props: { incident: EhsIncident | null } }
  | { type: 'budget'; props: { budgetToEdit: Budget | null } }
  | { type: 'addWaste'; props: { container: WasteContainer } }
  | { type: 'schedulePickup'; props: {} }
  | { type: 'wasteManifest'; props: { manifest: WasteManifest } }
  | { type: 'newTicket'; props: {} }
  | { type: 'ticketDetails'; props: { ticket: Ticket | null } }
  | { type: 'sdsDetails'; props: { sds: SDS } }
  | { type: 'sdsSubmission'; props: {} }
  | { type: 'qrScanner'; props: {} }
  | { type: 'quoteResponse'; props: { quotation: Quotation } }
  | { type: 'inquiryResponse'; props: { inquiry: Inquiry } }
  | { type: 'uploadCertificate'; props: { certificateToEdit?: Certificate } }
  | {
      type: 'benchDetails';
      props: { benchInfo: { id: string; assignment?: BenchAssignment } | null };
    }
  | {
      type: 'confirmAction';
      props: {
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText?: string;
        cancelText?: string;
      };
    }
  | {
      type: 'promptAction';
      props: {
        title: string;
        message: string;
        onConfirm: (value: string) => void;
        confirmText?: string;
        cancelText?: string;
        inputLabel?: string;
      };
    };

interface ModalContextType {
  activeModal: ModalPayload | null;
  openModal: (payload: ModalPayload) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * Provides a global system for managing and displaying modals.
 * Allows any component to open a modal without complex prop drilling.
 */
export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeModal, setActiveModal] = useState<ModalPayload | null>(null);
  const openModal = useCallback(
    (payload: ModalPayload) => setActiveModal(payload),
    []
  );
  const closeModal = useCallback(() => setActiveModal(null), []);

  const value = useMemo(
    () => ({ activeModal, openModal, closeModal }),
    [activeModal, openModal, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

/**
 * Hook to access the modal context.
 * Provides `openModal` and `closeModal` functions.
 */
export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context)
    throw new Error('useModalContext must be used within a ModalProvider');
  return context;
};

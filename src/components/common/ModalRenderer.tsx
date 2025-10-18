import React from 'react';
import { useModalContext } from '../../contexts/ModalContext';

// Import all modals
import ProjectDetailsModal from '../modals/ProjectDetailsModal';
import ConfirmModal from './ConfirmModal';
import PromptModal from './PromptModal';
import PlaceholderModal, {
  BenchDetailsModal,
} from '../modals/PlaceholderModal';
import EquipmentManualsModal from '../modals/EquipmentManualsModal';
import UploadCertificateModal from '../modals/UploadCertificateModal';
import ScheduleEquipmentModal from '../modals/ScheduleEquipmentModal';
import EditTaskModal from '../modals/EditTaskModal';
import BookEquipmentModal from '../modals/BookEquipmentModal';
import ReportIssueModal from '../modals/ReportIssueModal';
import SdsDetailsModal from '../modals/SdsDetailsModal';

const ModalRenderer: React.FC = () => {
  const { activeModal, closeModal } = useModalContext();

  if (!activeModal) return null;

  switch (activeModal.type) {
    case 'projectDetails':
      return (
        <ProjectDetailsModal {...activeModal.props} onClose={closeModal} />
      );
    case 'confirmAction':
      return <ConfirmModal {...activeModal.props} onClose={closeModal} />;
    case 'promptAction':
      return <PromptModal {...activeModal.props} onClose={closeModal} />;

    // Implemented Modals
    case 'equipmentManuals':
      return (
        <EquipmentManualsModal
          equipment={activeModal.props.equipment}
          onClose={closeModal}
        />
      );
    case 'uploadCertificate':
      return (
        <UploadCertificateModal
          certificateToEdit={activeModal.props.certificateToEdit}
          onClose={closeModal}
        />
      );
    case 'scheduleEquipment':
      return (
        <ScheduleEquipmentModal
          equipment={activeModal.props.equipment}
          onClose={closeModal}
        />
      );
    case 'bookEquipment':
      return (
        <BookEquipmentModal
          equipment={activeModal.props.equipment}
          onClose={closeModal}
        />
      );
    case 'reportIssue':
      return (
        <ReportIssueModal
          equipment={activeModal.props.equipment}
          onClose={closeModal}
        />
      );
    case 'editTask':
      return <EditTaskModal {...activeModal.props} onClose={closeModal} />;
    case 'sdsDetails':
      return (
        <SdsDetailsModal sds={activeModal.props.sds} onClose={closeModal} />
      );
    case 'benchDetails':
      return <BenchDetailsModal {...activeModal.props} onClose={closeModal} />;

    // Handle other modals with a placeholder to prevent silent failures
    case 'qrScanner':
      return <PlaceholderModal title='QR Code Scanner' onClose={closeModal} />;

    // Default case for any other unhandled or future modal types
    default: {
      // @ts-expect-error This is intended to catch unhandled modal types
      const modalType: string = activeModal.type || 'Unknown Modal';
      // Convert camelCase to Title Case for a better display name
      const title = modalType
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
      return <PlaceholderModal title={title} onClose={closeModal} />;
    }
  }
};

export default ModalRenderer;

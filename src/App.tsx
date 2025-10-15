import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
// FIX: import from barrel file
import { RoleCategory } from './types';
import { useSessionContext } from './contexts/SessionContext';
import Toast from './components/common/Toast';
import ModalRenderer from './components/common/ModalRenderer';
import { useTranslation } from './hooks/useTranslation';

// --- Lazy-loaded View Components ---

// Default Exports
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Equipment = lazy(() => import('./components/equipment/Equipment'));
const Announcements = lazy(() => import('./components/dashboard/Announcements'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));
const Billing = lazy(() => import('./components/billing/Billing'));
const Projects = lazy(() => import('./components/project/Projects'));
const Tasks = lazy(() => import('./components/project/Tasks'));
const Reservations = lazy(() => import('./components/reservations/Reservations'));
const FavoriteConsumablesList = lazy(() => import('./components/inventory/FavoriteConsumablesList'));
const ElectronicLabNotebook = lazy(() => import('./components/project/ElectronicLabNotebook'));
const ProjectProgressDashboard = lazy(() => import('./components/dashboard/ProjectProgressDashboard'));
const SupplierDashboard = lazy(() => import('./components/supplier/SupplierDashboard'));
const ReorderSuggestions = lazy(() => import('./components/inventory/ReorderSuggestions'));
const CertificateManagement = lazy(() => import('./components/certificates/CertificateManagement'));
const Settings = lazy(() => import('./components/admin/Settings'));

// Named Exports
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const EquipmentManagement = lazy(() => import('./components/admin/EquipmentManagement').then(m => ({ default: m.EquipmentManagement })));
const UserManagement = lazy(() => import('./components/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const AuditLog = lazy(() => import('./components/admin/AuditLog'));
const MaintenanceLogViewer = lazy(() => import('./components/equipment/MaintenanceLogViewer').then(m => ({ default: m.MaintenanceLogViewer })));
const MaintenanceStatus = lazy(() => import('./components/equipment/MaintenanceStatus'));
const MemberManagement = lazy(() => import('./components/user/MemberManagement').then(m => ({ default: m.MemberManagement })));
const ManualManagement = lazy(() => import('./components/qms/ManualManagement').then(m => ({ default: m.ManualManagement })));
const LabRuleManagement = lazy(() => import('./components/qms/LabRuleManagement').then(m => ({ default: m.LabRuleManagement })));
const FacilityConsumableNotification = lazy(() => import('./components/facility/FacilityConsumableNotification').then(m => ({ default: m.FacilityConsumableNotification })));
const ChatInterface = lazy(() => import('./components/chat/ChatInterface').then(m => ({ default: m.ChatInterface })));
const InventoryLockManager = lazy(() => import('./components/admin/InventoryLockManager'));
const MonthlyReportGenerator = lazy(() => import('./components/admin/MonthlyReportGenerator'));
const HazardousMaterialsDashboard = lazy(() => import('./components/inventory/HazardousMaterialsDashboard').then(m => ({ default: m.HazardousMaterialsDashboard })));
const RegulatoryCompliance = lazy(() => import('./components/compliance/RegulatoryCompliance').then(m => ({ default: m.RegulatoryCompliance })));
const FacilityLayout = lazy(() => import('./components/facility/FacilityLayout').then(m => ({ default: m.FacilityLayout })));
const InsuranceManagement = lazy(() => import('./components/compliance/InsuranceManagement').then(m => ({ default: m.InsuranceManagement })));
const CO2IncubatorManagement = lazy(() => import('./components/equipment/CO2IncubatorManagement').then(m => ({ default: m.CO2IncubatorManagement })));
const ProjectGanttChart = lazy(() => import('./components/project/ProjectGanttChart').then(m => ({ default: m.ProjectGanttChart })));
const NotificationCenter = lazy(() => import('./components/notifications/NotificationCenter'));

const AppLayout: React.FC = () => {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-ever-blue/5 to-ever-purple/5">
            <Sidebar setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col md:ml-64">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onNotificationsClick={() => setIsNotificationsOpen(p => !p)} />
                {isNotificationsOpen && <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />}
                <main className="flex-1 overflow-y-auto p-8">
                    <Suspense fallback={
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-ever-blue"></div>
                            <span className="ml-4 text-gray-500">{t('loadingApplication')}</span>
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

// --- Main App Component ---
export const App: React.FC = () => {
    const { currentUser } = useSessionContext();

    if (!currentUser) {
        // Should be redirected by the router in index.tsx, but as a safeguard:
        return <Navigate to="/login" replace />;
    }

    const defaultView = currentUser.roleCategory === RoleCategory.Facility ? '/adminDashboard' : '/dashboard';
    
    return (
        <>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Navigate to={defaultView} replace />} />
                    
                    {/* Shared Routes */}
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="announcements" element={<Announcements />} />
                    <Route path="maintenanceStatus" element={<MaintenanceStatus />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="manuals" element={<ManualManagement />} />
                    <Route path="rules" element={<LabRuleManagement />} />
                    <Route path="facilityConsumableNotification" element={<FacilityConsumableNotification />} />
                    <Route path="chat" element={<ChatInterface />} />

                    {/* Tenant Routes */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="equipment" element={<Equipment />} />
                    <Route path="reservations" element={<Reservations />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="memberManagement" element={<MemberManagement />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="certificateManagement" element={<CertificateManagement />} />
                    <Route path="insuranceManagement" element={<InsuranceManagement />} />
                    <Route path="reorderSuggestions" element={<ReorderSuggestions />} />
                    <Route path="favoriteConsumables" element={<FavoriteConsumablesList />} />
                    <Route path="electronicLabNotebook" element={<ElectronicLabNotebook />} />
                    <Route path="projectProgress" element={<ProjectProgressDashboard />} />
                    <Route path="projectGanttChart" element={<ProjectGanttChart />} />
                    
                    {/* Admin Routes */}
                    <Route path="adminDashboard" element={<AdminDashboard />} />
                    <Route path="equipmentManagement" element={<EquipmentManagement />} />
                    <Route path="userManagement" element={<UserManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="auditLog" element={<AuditLog />} />
                    <Route path="maintenanceLog" element={<MaintenanceLogViewer />} />
                    <Route path="hazardousMaterialsDashboard" element={<HazardousMaterialsDashboard />} />
                    <Route path="compliance" element={<RegulatoryCompliance />} />
                    <Route path="facilityLayout" element={<FacilityLayout />} />
                    <Route path="inventoryLockManager" element={<InventoryLockManager />} />
                    <Route path="co2IncubatorManagement" element={<CO2IncubatorManagement />} />
                    <Route path="monthlyReportGenerator" element={<MonthlyReportGenerator />} />
                    
                    {/* Supplier Routes */}
                    <Route path="supplierDashboard" element={<SupplierDashboard />} />
                    
                    {/* Fallback for unknown routes */}
                    <Route path="*" element={<Navigate to={defaultView} replace />} />
                </Route>
            </Routes>
            <ModalRenderer />
            <Toast />
        </>
    );
};
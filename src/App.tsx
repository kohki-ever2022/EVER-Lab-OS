import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Header from './components/Header';
import { Sidebar } from './components/Sidebar';
import UserProfile from './components/UserProfile';
import Billing from './components/Billing';
import Settings from './components/Settings';
import AuditLog from './components/AuditLog';
import NotificationCenter from './components/NotificationCenter';
import MaintenanceLogViewer from './components/MaintenanceLogViewer';
import MaintenanceStatus from './components/MaintenanceStatus';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import { RoleCategory } from './types/core';
import InventoryLockManager from './components/inventory/InventoryLockManager';
import FavoriteConsumablesList from './components/inventory/FavoriteConsumablesList';
import MonthlyReportGenerator from './components/reports/MonthlyReportGenerator';
import { useSessionContext } from './contexts/SessionContext';
import Toast from './components/Toast';
import ModalRenderer from './components/common/ModalRenderer';
import { AdminProvider, BillingProvider, PurchasingProvider } from './contexts/AppProviders';

// --- Lazy-loaded View Components ---

// Default Exports
const Dashboard = lazy(() => import('./components/Dashboard'));
const Equipment = lazy(() => import('./components/Equipment'));
const Announcements = lazy(() => import('./components/Announcements'));
const ManualManagement = lazy(() => import('./components/ManualManagement'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const CO2IncubatorManagement = lazy(() => import('./components/CO2IncubatorManagement'));
const FacilityConsumableNotification = lazy(() => import('./components/FacilityConsumableNotification'));
const ElectronicLabNotebook = lazy(() => import('./components/ElectronicLabNotebook'));
const ProjectProgressDashboard = lazy(() => import('./components/ProjectProgressDashboard'));
const ProjectGanttChart = lazy(() => import('./components/ProjectGanttChart').then(m => ({ default: m.ProjectGanttChart })));
const SupplierDashboard = lazy(() => import('./components/SupplierDashboard'));

// Named Exports
const EquipmentManagement = lazy(() => import('./components/EquipmentManagement').then(module => ({ default: module.EquipmentManagement })));
const Reservations = lazy(() => import('./components/Reservations'));
const MemberManagement = lazy(() => import('./components/MemberManagement').then(module => ({ default: module.MemberManagement })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const HazardousMaterialsDashboard = lazy(() => import('./components/HazardousMaterialsDashboard').then(module => ({ default: module.HazardousMaterialsDashboard })));
const RegulatoryCompliance = lazy(() => import('./components/RegulatoryCompliance').then(module => ({ default: module.RegulatoryCompliance })));
const FacilityLayout = lazy(() => import('./components/FacilityLayout').then(module => ({ default: module.FacilityLayout })));
const InsuranceManagement = lazy(() => import('./components/InsuranceManagement').then(module => ({ default: module.InsuranceManagement })));
const LabRuleManagement = lazy(() => import('./components/LabRuleManagement').then(module => ({ default: module.LabRuleManagement })));
const ChatInterface = lazy(() => import('./components/ChatInterface').then(module => ({ default: module.ChatInterface })));
const CertificateManagement = lazy(() => import('./components/certificates/CertificateManagement'));
const ReorderSuggestions = lazy(() => import('./components/ReorderSuggestions'));

const AppLayout: React.FC = () => {
    const { isJapanese } = useSessionContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-ever-blue/5 to-ever-purple/5">
            <Sidebar setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col md:ml-64">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onNotificationsClick={() => setIsNotificationsOpen(p => !p)} />
                {isNotificationsOpen && <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />}
                <main className="flex-1 overflow-y-auto p-8">
                    <Suspense fallback={<div className="p-8 text-center text-gray-500">{isJapanese ? '読み込み中...' : 'Loading...'}</div>}>
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
                    <Route element={<BillingProvider><Outlet /></BillingProvider>}>
                      <Route path="billing" element={<Billing />} />
                    </Route>
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
                    <Route element={<AdminProvider><Outlet /></AdminProvider>}>
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
                        <Route element={<BillingProvider><Outlet /></BillingProvider>}>
                            <Route path="monthlyReportGenerator" element={<MonthlyReportGenerator />} />
                        </Route>
                    </Route>
                    
                    {/* Supplier Routes */}
                    <Route element={<PurchasingProvider><Outlet /></PurchasingProvider>}>
                        <Route path="supplierDashboard" element={<SupplierDashboard />} />
                    </Route>
                    
                    {/* Fallback for unknown routes */}
                    <Route path="*" element={<Navigate to={defaultView} replace />} />
                </Route>
            </Routes>
            <ModalRenderer />
            <Toast />
        </>
    );
};

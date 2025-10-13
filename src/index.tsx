import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { ModalProvider } from './contexts/ModalContext';
import { ToastProvider } from './contexts/ToastContext';
import { SessionProvider, useSessionContext } from './contexts/SessionContext';
import { DataAdapterProvider } from './contexts/DataAdapterContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Login from './components/Login';

// New Context Providers
import { CompanyProvider } from './contexts/CompanyContext';
import { ConsumableProvider } from './contexts/ConsumableContext';
import { EquipmentProvider } from './contexts/EquipmentContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ReservationProvider } from './contexts/ReservationContext';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CertificateProvider } from './contexts/CertificateContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import { MaintenanceLogProvider } from './contexts/MaintenanceLogContext';
import { OrderProvider } from './contexts/OrderContext';
import { UsageProvider } from './contexts/UsageContext';
import { AdminProvider, QmsProvider, BillingProvider, PurchasingProvider, LabStateProvider } from './contexts/AppProviders';


// Initialize Firebase. This must run before any other Firebase services are used.
import './firebase';

// Dynamically import the App component to code-split the main app bundle from the login page.
const App = lazy(() => import('./App').then(module => ({ default: module.App })));

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminProvider>
    <BillingProvider>
      <PurchasingProvider>
        <QmsProvider>
          <LabStateProvider>
            <UserProvider>
              <CompanyProvider>
                <EquipmentProvider>
                  <ReservationProvider>
                    <ConsumableProvider>
                      <ProjectProvider>
                        <AnnouncementProvider>
                          <MaintenanceLogProvider>
                            <OrderProvider>
                              <UsageProvider>
                                <CertificateProvider>
                                  <ModalProvider>
                                    {children}
                                  </ModalProvider>
                                </CertificateProvider>
                              </UsageProvider>
                            </OrderProvider>
                          </MaintenanceLogProvider>
                        </AnnouncementProvider>
                      </ProjectProvider>
                    </ConsumableProvider>
                  </ReservationProvider>
                </EquipmentProvider>
              </CompanyProvider>
            </UserProvider>
          </LabStateProvider>
        </QmsProvider>
      </PurchasingProvider>
    </BillingProvider>
  </AdminProvider>
);


const AppShell: React.FC = () => {
  const { currentUser } = useSessionContext();

  return (
    <Routes>
      <Route
        path="/login"
        element={!currentUser ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/*"
        element={
          currentUser ? (
            <AppProviders>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Application...</div>}>
                <App />
              </Suspense>
            </AppProviders>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <DataAdapterProvider>
        <ToastProvider>
          <SessionProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AppShell />
              </BrowserRouter>
            </NotificationProvider>
          </SessionProvider>
        </ToastProvider>
      </DataAdapterProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
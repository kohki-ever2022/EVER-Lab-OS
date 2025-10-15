import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSessionContext } from '../../contexts/SessionContext';
import { usePermissions } from '../../hooks/usePermissions';
import {
  HomeIcon, BeakerIcon, CalendarIcon, FolderIcon, CheckSquareIcon, BookOpenIcon,
  ShoppingCartIcon, StarIcon, ArchiveIcon, FileTextIcon, ShieldIcon, SettingsIcon,
  UsersIcon, MessageSquareIcon, CloseIcon
} from '../common/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    const navItems = useMemo(() => ([
        {
            title: t('main'),
            items: [
                { path: 'dashboard', label: t('dashboard'), icon: <HomeIcon />, permission: true },
                { path: 'equipment', label: t('equipmentBooking'), icon: <BeakerIcon />, permission: hasPermission('equipment', 'read') },
                { path: 'reservations', label: t('myReservations'), icon: <CalendarIcon />, permission: hasPermission('reservation', 'read') },
                { path: 'projects', label: t('projects'), icon: <FolderIcon />, permission: hasPermission('projects', 'read') },
                { path: 'chat', label: t('chat'), icon: <MessageSquareIcon />, permission: true },
            ]
        },
        {
            title: t('inventoryPurchasing'),
            items: [
                { path: 'favoriteConsumables', label: t('favorites'), icon: <StarIcon />, permission: true },
                { path: 'reorderSuggestions', label: t('reorder'), icon: <ShoppingCartIcon />, permission: true },
            ]
        },
        {
            title: t('qualitySafety'),
            items: [
                { path: 'manuals', label: t('manuals'), icon: <BookOpenIcon />, permission: hasPermission('manuals', 'read') },
                { path: 'rules', label: t('labRules'), icon: <CheckSquareIcon />, permission: true },
                { path: 'certificateManagement', label: t('certificates'), icon: <ShieldIcon />, permission: true },
            ]
        },
        {
            title: t('facilityManagement'),
            items: [
                { path: 'adminDashboard', label: t('adminDashboard'), icon: <HomeIcon />, permission: hasPermission('settings', 'read') },
                { path: 'userManagement', label: t('userManagement'), icon: <UsersIcon />, permission: hasPermission('users', 'read') },
                { path: 'equipmentManagement', label: t('equipmentMaster'), icon: <BeakerIcon />, permission: hasPermission('equipment', 'manage') },
                { path: 'inventoryLockManager', label: t('inventoryLock'), icon: <ArchiveIcon />, permission: hasPermission('inventory', 'manage') },
                { path: 'monthlyReportGenerator', label: t('monthlyReports'), icon: <FileTextIcon />, permission: hasPermission('settings', 'read') },
                { path: 'settings', label: t('systemSettings'), icon: <SettingsIcon />, permission: hasPermission('settings', 'read') },
            ]
        }
    ]), [t, hasPermission]);
    
    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
                    <h1 className="text-xl font-bold">EVER-Lab OS</h1>
                    <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-2" style={{height: 'calc(100vh - 4rem)'}}>
                    {navItems.map((section, index) => {
                         const visibleItems = section.items.filter(item => item.permission);
                         if (visibleItems.length === 0) return null;

                         return (
                            <div key={index} className="mb-4">
                                <h2 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</h2>
                                {visibleItems.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={`/${item.path}`}
                                        onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                                        className={({ isActive }) => `w-full flex items-center p-2 my-1 text-sm rounded-md transition-colors ${isActive ? 'bg-ever-blue text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        {item.icon}
                                        <span className="ml-3">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                         )
                    })}
                </nav>
            </div>
            {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}
        </>
    );
};

import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSessionContext } from '../../contexts/SessionContext';
import { usePermissions } from '../../hooks/usePermissions';
import {
  HomeIcon, BeakerIcon, CalendarIcon, FolderIcon, CheckSquareIcon, BookOpenIcon,
  ShoppingCartIcon, StarIcon, ArchiveIcon, FileTextIcon, ShieldIcon, SettingsIcon,
  UsersIcon, MessageSquareIcon, CloseIcon
} from '../common/Icons';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { isJapanese } = useSessionContext();
    const { hasPermission } = usePermissions();

    const navItems = useMemo(() => ([
        {
            titleJP: "メイン",
            titleEN: "Main",
            items: [
                { path: 'dashboard', labelJP: 'ダッシュボード', labelEN: 'Dashboard', icon: <HomeIcon />, permission: true },
                { path: 'equipment', labelJP: '機器予約', labelEN: 'Equipment Booking', icon: <BeakerIcon />, permission: hasPermission('equipment', 'read') },
                { path: 'reservations', labelJP: '予約管理', labelEN: 'My Reservations', icon: <CalendarIcon />, permission: hasPermission('reservation', 'read') },
                { path: 'projects', labelJP: 'プロジェクト', labelEN: 'Projects', icon: <FolderIcon />, permission: hasPermission('projects', 'read') },
                { path: 'chat', labelJP: 'チャット', labelEN: 'Chat', icon: <MessageSquareIcon />, permission: true },
            ]
        },
        {
            titleJP: "在庫・購買",
            titleEN: "Inventory & Purchasing",
            items: [
                { path: 'favoriteConsumables', labelJP: 'お気に入り', labelEN: 'Favorites', icon: <StarIcon />, permission: true },
                { path: 'reorderSuggestions', labelJP: '再発注推奨', labelEN: 'Reorder', icon: <ShoppingCartIcon />, permission: true },
            ]
        },
        {
            titleJP: "品質・安全",
            titleEN: "Quality & Safety",
            items: [
                { path: 'manuals', labelJP: 'マニュアル', labelEN: 'Manuals', icon: <BookOpenIcon />, permission: hasPermission('manuals', 'read') },
                { path: 'rules', labelJP: 'ラボルール', labelEN: 'Lab Rules', icon: <CheckSquareIcon />, permission: true },
                { path: 'certificateManagement', labelJP: '資格・証明書', labelEN: 'Certificates', icon: <ShieldIcon />, permission: true },
            ]
        },
        {
            titleJP: "施設管理",
            titleEN: "Facility Management",
            items: [
                { path: 'adminDashboard', labelJP: '管理ダッシュボード', labelEN: 'Admin Dashboard', icon: <HomeIcon />, permission: hasPermission('settings', 'read') },
                { path: 'userManagement', labelJP: 'ユーザー管理', labelEN: 'User Management', icon: <UsersIcon />, permission: hasPermission('users', 'read') },
                { path: 'equipmentManagement', labelJP: '機器マスタ管理', labelEN: 'Equipment Master', icon: <BeakerIcon />, permission: hasPermission('equipment', 'manage') },
                { path: 'inventoryLockManager', labelJP: '在庫ロック管理', labelEN: 'Inventory Lock', icon: <ArchiveIcon />, permission: hasPermission('inventory', 'manage') },
                { path: 'monthlyReportGenerator', labelJP: '月次レポート', labelEN: 'Monthly Reports', icon: <FileTextIcon />, permission: hasPermission('settings', 'read') },
                { path: 'settings', labelJP: 'システム設定', labelEN: 'System Settings', icon: <SettingsIcon />, permission: hasPermission('settings', 'read') },
            ]
        }
    ]), [isJapanese, hasPermission]);
    
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
                                <h2 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{isJapanese ? section.titleJP : section.titleEN}</h2>
                                {visibleItems.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={`/${item.path}`}
                                        onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                                        className={({ isActive }) => `w-full flex items-center p-2 my-1 text-sm rounded-md transition-colors ${isActive ? 'bg-ever-blue text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        {item.icon}
                                        <span className="ml-3">{isJapanese ? item.labelJP : item.labelEN}</span>
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

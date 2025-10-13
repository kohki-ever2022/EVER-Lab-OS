import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSessionContext } from '../contexts/SessionContext';
import { usePermissions } from '../hooks/usePermissions';

// --- Icon Set ---
const iconProps = {
  strokeWidth: 1.5,
  fill: "none",
  stroke: "currentColor",
  className: "w-6 h-6",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const HomeIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const BeakerIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>;
const CalendarIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const FolderIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const CheckSquareIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const BookOpenIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ShoppingCartIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const StarIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const ArchiveIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const FileTextIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const ShieldIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const SettingsIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const UsersIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const MessageSquareIcon = () => <svg {...iconProps} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

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
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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

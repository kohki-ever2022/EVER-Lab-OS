import React, { useState } from 'react';
import { Language, Role } from '../types/core';
import { UserAvailabilityStatus } from '../types/common';
import UserStatusUpdater from './UserStatusUpdater';
import { useSessionContext } from '../contexts/SessionContext';
import { useNotificationsContext } from '../contexts/NotificationContext';
import { useCompanyContext } from '../contexts/CompanyContext';
import { useModalContext } from '../contexts/ModalContext';

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
}

const BellIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const QrCodeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z"/>
    </svg>
);


const StatusIndicator: React.FC<{ status: UserAvailabilityStatus }> = ({ status }) => {
    const colorMap = {
        [UserAvailabilityStatus.Available]: 'bg-green-500',
        [UserAvailabilityStatus.Busy]: 'bg-yellow-500',
        [UserAvailabilityStatus.Away]: 'bg-gray-400',
    };
    return <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${colorMap[status]}`}></span>;
};


const Header: React.FC<HeaderProps> = ({ onMenuClick, onNotificationsClick }) => {
  const { language, setLanguage, currentUser, isFacilityStaff, isJapanese } = useSessionContext();
  const { notifications } = useNotificationsContext();
  const { companies } = useCompanyContext();
  const { openModal } = useModalContext();
  const [isStatusUpdaterOpen, setIsStatusUpdaterOpen] = useState(false);
  
  const company = companies.find(c => c.id === currentUser?.companyId);
  const companyName = company ? (isJapanese ? company.nameJP : company.nameEN) : '';
  
  const unreadCount = notifications.filter(n => n.recipientUserId === currentUser?.id && !n.read).length;

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center flex-shrink-0 relative z-20 border-b border-ever-blue/10">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-3 mr-2 text-ever-black md:hidden"
          aria-label={isJapanese ? "メニューを開く" : "Open menu"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ever-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <h1 className="text-xl font-bold text-ever-black ml-2">
          EVER-Lab OS
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        
        <button
            onClick={() => openModal({ type: 'qrScanner', props: {} })}
            className="p-3 text-ever-black hover:bg-white/20 rounded-full transition-colors relative"
            aria-label={isJapanese ? "QRスキャン" : "QR Scan"}
        >
            <QrCodeIcon className="h-6 w-6" />
        </button>

        <button
            onClick={onNotificationsClick}
            className="p-3 text-ever-black hover:bg-white/20 rounded-full transition-colors relative"
            aria-label={isJapanese ? "通知" : "Notifications"}
        >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                    {unreadCount}
                </span>
            )}
        </button>

        <button
          onClick={() => setLanguage(isJapanese ? Language.EN : Language.JA)}
          className="p-3 text-ever-black hover:bg-white/20 rounded-full transition-colors font-semibold text-sm"
          aria-label={isJapanese ? "言語を英語に切り替え" : "Switch language to Japanese"}
        >
          {isJapanese ? 'EN' : 'JA'}
        </button>

        <div className="relative">
            <div className={`flex items-center space-x-2 ${isFacilityStaff ? 'cursor-pointer hover:bg-white/20 p-1 pr-2 rounded-full' : ''}`} onClick={() => isFacilityStaff && setIsStatusUpdaterOpen(true)}>
                <div className="relative">
                   {currentUser?.imageUrl ? (
                        <img src={currentUser.imageUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-ever-purple flex items-center justify-center text-white text-base font-bold">
                            {currentUser?.name.charAt(0)}
                        </div>
                    )}
                    {isFacilityStaff && currentUser?.availabilityStatus && <StatusIndicator status={currentUser.availabilityStatus} />}
                </div>
                <div className="text-right hidden sm:block">
                    <p className="font-semibold text-sm text-text-primary">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{companyName}</p>
                </div>
            </div>
             {isFacilityStaff && isStatusUpdaterOpen && (
                <UserStatusUpdater onClose={() => setIsStatusUpdaterOpen(false)} />
            )}
        </div>
        
      </div>
    </header>
  );
};

export default Header;
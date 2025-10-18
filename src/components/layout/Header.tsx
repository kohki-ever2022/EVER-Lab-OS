import React, { useState } from 'react';
// FIX: import from barrel file
import { Language, Role, UserAvailabilityStatus } from '../../types';
import UserStatusUpdater from '../user/UserStatusUpdater';
import { useSessionContext } from '../../contexts/SessionContext';
import { useNotificationsContext } from '../../contexts/NotificationContext';
import { useCompanyContext } from '../../contexts/CompanyContext';
import { useModalContext } from '../../contexts/ModalContext';
import { BellIcon, QrCodeIcon, MenuIcon, LabIcon } from '../common/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
}

const StatusIndicator: React.FC<{ status: UserAvailabilityStatus }> = ({
  status,
}) => {
  const colorMap = {
    [UserAvailabilityStatus.Available]: 'bg-green-500',
    [UserAvailabilityStatus.Busy]: 'bg-yellow-500',
    [UserAvailabilityStatus.Away]: 'bg-gray-400',
  };
  return (
    <span
      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${colorMap[status]}`}
    ></span>
  );
};

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onNotificationsClick,
}) => {
  const { language, setLanguage, currentUser, isFacilityStaff } =
    useSessionContext();
  const { t, isJapanese } = useTranslation();
  const { notifications } = useNotificationsContext();
  const { companies } = useCompanyContext();
  const { openModal } = useModalContext();
  const [isStatusUpdaterOpen, setIsStatusUpdaterOpen] = useState(false);

  const company = companies.find((c) => c.id === currentUser?.companyId);
  const companyName = company
    ? isJapanese
      ? company.nameJP
      : company.nameEN
    : '';

  const unreadCount = notifications.filter(
    (n) => n.recipientUserId === currentUser?.id && !n.read
  ).length;

  return (
    <header className='bg-white/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center flex-shrink-0 relative z-20 border-b border-ever-blue/10'>
      <div className='flex items-center'>
        <button
          onClick={onMenuClick}
          className='p-3 mr-2 text-ever-black md:hidden'
          aria-label={t('openMenu')}
        >
          <MenuIcon className='h-6 w-6' />
        </button>
        <LabIcon className='h-8 w-8 text-ever-blue' />
        <h1 className='text-xl font-bold text-ever-black ml-2'>EVER-Lab OS</h1>
      </div>
      <div className='flex items-center space-x-2 sm:space-x-4'>
        <button
          onClick={() => openModal({ type: 'qrScanner', props: {} })}
          className='p-3 text-ever-black hover:bg-white/20 rounded-full transition-colors relative'
          aria-label={t('qrScan')}
        >
          <QrCodeIcon className='h-6 w-6' />
        </button>

        <button
          onClick={onNotificationsClick}
          className='p-3 text-ever-black hover:bg-white/20 rounded-full transition-colors relative'
          aria-label={t('notifications')}
        >
          <BellIcon className='h-6 w-6' />
          {unreadCount > 0 && (
            <span className='absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2'>
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setLanguage(isJapanese ? Language.EN : Language.JA)}
          className='p-3 text-ever-black hover:bg-white/20 rounded-full transition-colors font-semibold text-sm'
          aria-label={isJapanese ? t('switchLangToEN') : t('switchLangToJA')}
        >
          {isJapanese ? 'EN' : 'JA'}
        </button>

        <div className='relative'>
          <div
            className={`flex items-center space-x-2 ${isFacilityStaff ? 'cursor-pointer hover:bg-white/20 p-1 pr-2 rounded-full' : ''}`}
            onClick={() => isFacilityStaff && setIsStatusUpdaterOpen(true)}
          >
            <div className='relative'>
              {currentUser?.imageUrl ? (
                <img
                  src={currentUser.imageUrl}
                  alt='Profile'
                  className='w-9 h-9 rounded-full object-cover'
                />
              ) : (
                <div className='w-9 h-9 rounded-full bg-ever-purple flex items-center justify-center text-white text-base font-bold'>
                  {currentUser?.name.charAt(0)}
                </div>
              )}
              {isFacilityStaff && currentUser?.availabilityStatus && (
                <StatusIndicator status={currentUser.availabilityStatus} />
              )}
            </div>
            <div className='text-right hidden sm:block'>
              <p className='font-semibold text-sm text-text-primary'>
                {currentUser?.name}
              </p>
              <p className='text-xs text-gray-500'>{companyName}</p>
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

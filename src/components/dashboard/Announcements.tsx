import React from 'react';
import { useAnnouncementContext } from '../../contexts/AnnouncementContext';
import { useTranslation } from '../../hooks/useTranslation';
// FIX: import from barrel file
import { Announcement } from '../../types';

const Announcements: React.FC = () => {
    const { announcements } = useAnnouncementContext();
    const { t, isJapanese } = useTranslation();

    const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {t('announcements')}
            </h2>
            <div className="space-y-4">
                {sortedAnnouncements.length > 0 ? (
                    sortedAnnouncements.map((announcement: Announcement) => (
                        <div key={announcement.id} className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-bold text-lg text-ever-purple">
                                {isJapanese ? announcement.titleJP : announcement.titleEN}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {new Date(announcement.startDate).toLocaleDateString()}
                            </p>
                            <p className="mt-2 text-gray-700">
                                {isJapanese ? announcement.contentJP : announcement.contentEN}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">{t('noAnnouncements')}</p>
                )}
            </div>
        </div>
    );
};

export default Announcements;
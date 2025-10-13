import React from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useAdminContext } from '../../contexts/AppProviders';
import { Equipment, ManualType } from '../../types/equipment';

// --- Icon Components ---
const YoutubeIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM17.2,9.47,14.8,11.2,12,9.36,9.2,11.2,6.8,9.47l-2,5.85,5.4,3.21,5.4,3.21Z" opacity=".3"/><path d="M12,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22ZM12,4a8,8,0,1,0,8,8A8,8,0,0,0,12,4Z"/><path d="M12,15.64,6.6,18.85l2-5.85L4,9.47,10,9,2-6,2,6,6,0-4.59,3.53,2,5.85Z"/></svg>);
const PdfIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20,2H8A2,2,0,0,0,6,4V16a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V4A2,2,0,0,0,20,2ZM12,16a2,2,0,1,1,2-2A2,2,0,0,1,12,16Zm6-7H16V7h2Z"/><path d="M4,6H2V20a2,2,0,0,0,2,2H16V20H4Z"/></svg>);
const LinkIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17,12a1,1,0,0,0-1,1v5a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V10a1,1,0,0,1,1-1h5a1,1,0,0,0,0-2H7A3,3,0,0,0,4,10V18a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V13A1,1,0,0,0,17,12Z"/><path d="M20,2.93a1,1,0,0,0,0,1.41L15.41,9H18a1,1,0,0,0,0-2H12a1,1,0,0,0-1,1v6a1,1,0,0,0,2,0V8.41l4.29-4.3a1,1,0,0,0-1.41-1.41Z"/></svg>);
const ArrowRightIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>);

const getManualIcon = (type: ManualType) => {
    switch (type) {
        case ManualType.YouTube: return <YoutubeIcon className="w-6 h-6 text-red-600" />;
        case ManualType.PDF: return <PdfIcon className="w-6 h-6 text-red-800" />;
        case ManualType.ExternalLink: return <LinkIcon className="w-6 h-6 text-blue-600" />;
    }
}

interface EquipmentManualsModalProps {
    equipment: Equipment;
    onClose: () => void;
}

const EquipmentManualsModal: React.FC<EquipmentManualsModalProps> = ({ equipment, onClose }) => {
    const { isJapanese } = useSessionContext();
    const { equipmentManuals } = useAdminContext();

    const manuals = equipment.manualIds?.map(id => equipmentManuals.find(m => m.id === id)).filter(Boolean) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg modal-content">
                <h3 className="text-xl font-bold mb-4">{isJapanese ? `${equipment.nameJP} のマニュアル` : `Manuals for ${equipment.nameEN}`}</h3>
                
                {manuals.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {manuals.map(manual => (
                            <a key={manual!.id} href={manual!.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                                {getManualIcon(manual!.type)}
                                <div className="flex-1">
                                    <p className="font-semibold">{manual!.name}</p>
                                    <p className="text-sm text-gray-500">{isJapanese ? 'バージョン' : 'Version'}: {manual!.version}</p>
                                </div>
                                <ArrowRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">{isJapanese ? '利用可能なマニュアルはありません。' : 'No manuals available.'}</p>
                )}

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
                        {isJapanese ? '閉じる' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentManualsModal;

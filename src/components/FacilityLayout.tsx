import React from 'react';
import { BenchAssignment } from '../types';
import { useModalContext } from '../contexts/ModalContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAdminContext } from '../contexts/AppProviders';
import { useCompanyContext } from '../contexts/CompanyContext';

interface BenchItem {
  id: string;
}

interface BenchGroup {
  id: string;
  items: (BenchItem | null)[][];
  gridArea: string;
}

const layoutData: BenchGroup[] = [
    { id: 'group-a', gridArea: '9 / 2 / 11 / 5', items: [[{ id: 'A-1' }, { id: 'A-2' }, { id: 'A-3' }], [{ id: 'A-4' }, { id: 'A-5' }, { id: 'A-6' }]] },
    { id: 'group-b', gridArea: '9 / 5 / 11 / 8', items: [[{ id: 'B-1' }, { id: 'B-2' }, { id: 'B-3' }], [{ id: 'B-4' }, { id: 'B-5' }, { id: 'B-6' }]] },
    { id: 'group-c', gridArea: '9 / 8 / 11 / 11', items: [[{ id: 'C-1' }, { id: 'C-2' }, { id: 'C-3' }], [{ id: 'C-4' }, { id: 'C-5' }, { id: 'C-6' }]] },
    { id: 'group-d', gridArea: '6 / 8 / 8 / 11', items: [[{ id: 'D-1' }, { id: 'D-2' }, { id: 'D-3' }], [{ id: 'D-4' }, { id: 'D-5' }, null]] },
    { id: 'group-e', gridArea: '3 / 8 / 5 / 11', items: [[{ id: 'E-1' }, { id: 'E-2' }, { id: 'E-3' }], [{ id: 'E-4' }, { id: 'E-5' }, { id: 'E-6' }]] },
    { 
      id: 'group-p1', 
      gridArea: '3 / 2 / 6 / 5', 
      items: [
        [{ id: '個室-1' }, { id: '個室-2' }], 
        [{ id: '個室-3' }, { id: '個室-4' }]
      ] 
    },
];

interface BenchProps {
    item: BenchItem | null;
    isJapanese: boolean;
}

const Bench: React.FC<BenchProps> = ({ item, isJapanese }) => {
  const { benchAssignments } = useAdminContext();
  const { companies } = useCompanyContext();
  const { openModal } = useModalContext();

  if (!item) {
    return <div className="p-1"></div>;
  }

  const assignment = benchAssignments.find(b => b.id === item.id);
  const company = assignment?.companyId ? companies.find(c => c.id === assignment.companyId) : null;

  const baseClasses = "rounded-lg p-1 text-center shadow-sm transition-all duration-200 flex flex-col justify-center items-center w-full h-full transform hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const assignedClasses = "bg-teal-500 border border-teal-600 text-white focus:ring-teal-400";
  const unassignedClasses = "bg-white border-2 border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-600 focus:ring-teal-300";
  
  const statusText = company ? (isJapanese ? '契約済' : 'Assigned') : (isJapanese ? '空き' : 'Available');

  return (
    <button 
        onClick={() => openModal({ type: 'benchDetails', props: { benchInfo: { id: item.id, assignment } } })}
        className={`${baseClasses} ${company ? assignedClasses : unassignedClasses}`}
    >
      <p className={`font-bold text-[clamp(0.75rem,2vw,1.25rem)] leading-tight ${company ? 'text-white' : 'text-slate-700'}`}>{item.id}</p>
      <p className={`text-[clamp(0.625rem,1.5vw,0.875rem)] truncate w-full ${company ? 'text-teal-100' : 'text-gray-500'}`}>{statusText}</p>
    </button>
  );
};

export const FacilityLayout:React.FC = () => {
  const { isJapanese } = useSessionContext();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-lab-blue-dark">{isJapanese ? '施設レイアウト' : 'Facility Layout'}</h2>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="overflow-x-auto">
            <div className="relative w-full aspect-[11/10] bg-slate-50 rounded-lg p-4" style={{
                minWidth: '600px',
                display: 'grid',
                gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
                gap: '0.5rem',
                backgroundImage: 'radial-gradient(circle at center, #d1d5db 1px, transparent 1px)',
                backgroundSize: 'calc(100%/22) calc(100%/20)'
            }}>
                {/* AREA P1 ラベル（陰圧式P1実験室） */}
                <div className="z-10 text-slate-400 font-bold tracking-widest text-[clamp(0.75rem,2vw,1.125rem)]" style={{ gridArea: '2 / 2 / 3 / 5', alignSelf: 'end', justifySelf: 'center' }}>
                  {isJapanese ? '陰圧式P1実験室' : 'AREA P1'}
                </div>
                
                <div className="z-10 text-slate-400 font-bold tracking-widest text-[clamp(0.75rem,2vw,1.125rem)]" style={{ gridArea: '8 / 2 / 9 / 5', alignSelf: 'end', justifySelf: 'center' }}>AREA A</div>
                <div className="z-10 text-slate-400 font-bold tracking-widest text-[clamp(0.75rem,2vw,1.125rem)]" style={{ gridArea: '8 / 5 / 9 / 8', alignSelf: 'end', justifySelf: 'center' }}>AREA B</div>
                <div className="z-10 text-slate-400 font-bold tracking-widest text-[clamp(0.75rem,2vw,1.125rem)]" style={{ gridArea: '8 / 8 / 9 / 11', alignSelf: 'end', justifySelf: 'center' }}>AREA C</div>
                <div className="z-10 text-slate-400 font-bold tracking-widest text-[clamp(0.75rem,2vw,1.125rem)]" style={{ gridArea: '5 / 8 / 6 / 11', alignSelf: 'end', justifySelf: 'center' }}>AREA D</div>
                <div className="z-10 text-slate-400 font-bold tracking-widest text-[clamp(0.75rem,2vw,1.125rem)]" style={{ gridArea: '2 / 8 / 3 / 11', alignSelf: 'end', justifySelf: 'center' }}>AREA E</div>
                
                {layoutData.map(group => (
                    <div key={group.id} className="p-1 z-10" style={{ gridArea: group.gridArea }}>
                        <div className="grid gap-2 h-full" style={{
                            gridTemplateColumns: `repeat(${group.items[0].length}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${group.items.length}, minmax(0, 1fr))`
                        }}>
                            {group.items.flat().map((item, index) => (
                            <Bench 
                                key={item ? item.id : `${group.id}-empty-${index}`} 
                                item={item} 
                                isJapanese={isJapanese}
                            />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex items-center justify-end space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full bg-teal-500 mr-2"></span>
                    <span>{isJapanese ? '契約済' : 'Assigned'}</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full border-2 border-dashed border-gray-400 mr-2"></span>
                    <span>{isJapanese ? '空き' : 'Available'}</span>
                </div>
            </div>
        </div>
    </div>
  );
};
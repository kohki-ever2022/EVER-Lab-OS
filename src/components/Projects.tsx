import React from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { useUserContext } from '../contexts/UserContext';

import { useModalContext } from '../contexts/ModalContext';

const Projects: React.FC = () => {
    const { isJapanese, currentUser } = useSessionContext();
    const { projects } = useProjectContext();
    const { users } = useUserContext();
    const { openModal } = useModalContext();

    const myProjects = projects.filter(p => p.companyId === currentUser?.companyId);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-ever-black">{isJapanese ? 'プロジェクト一覧' : 'Projects'}</h2>
                <button 
                    onClick={() => openModal({ type: 'projectDetails', props: { project: null } })}
                    className="bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg"
                >
                    {isJapanese ? '新規プロジェクト' : 'New Project'}
                </button>
            </div>

            {myProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProjects.map(project => {
                        const members = users.filter(u => project.memberIds.includes(u.id));
                        return (
                            <div 
                                key={project.id} 
                                className="bg-white rounded-lg shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => openModal({ type: 'projectDetails', props: { project } })}
                            >
                                <h3 className="text-xl font-bold text-ever-purple mb-2">{project.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 flex-grow">{project.description}</p>
                                <div className="border-t pt-4">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">{isJapanese ? 'メンバー' : 'Members'}</p>
                                    <div className="flex -space-x-2">
                                        {members.slice(0, 5).map(member => (
                                            <div key={member.id} title={member.name} className="relative inline-block">
                                                {member.imageUrl ? (
                                                    <img className="h-8 w-8 rounded-full ring-2 ring-white" src={member.imageUrl} alt={member.name} />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full ring-2 ring-white bg-ever-purple-light flex items-center justify-center text-ever-purple-dark font-bold text-sm">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {members.length > 5 && (
                                            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                +{members.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">{isJapanese ? 'プロジェクトがありません。' : 'No projects found.'}</p>
                    <button 
                        onClick={() => openModal({ type: 'projectDetails', props: { project: null } })}
                        className="mt-4 bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg"
                    >
                        {isJapanese ? '最初のプロジェクトを作成' : 'Create your first project'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Projects;

// src/components/project/ElectronicLabNotebook.tsx
import React, { useState, useMemo } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useToast } from '../../contexts/ToastContext';
import { useProjectActions } from '../../hooks/useProjectActions';
import { LabNotebookEntry } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { useTranslation } from '../../hooks/useTranslation';

const ElectronicLabNotebook: React.FC = () => {
    const { currentUser } = useSessionContext();
    const { t } = useTranslation();
    const { projects, labNotebookEntries } = useProjectContext();
    const { addLabNotebookEntry, updateLabNotebookEntry, deleteLabNotebookEntry } = useProjectActions();
    const { showToast } = useToast();

    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const myProjects = useMemo(() => projects.filter(p => p.companyId === currentUser?.companyId), [projects, currentUser]);

    const filteredEntries = useMemo(() => {
        return (labNotebookEntries || [])
            .filter(entry => entry.userId === currentUser?.id)
            .filter(entry => {
                if (dateFilter) {
                    return new Date(entry.experimentDate).toISOString().startsWith(dateFilter);
                }
                return true;
            })
            .filter(entry => {
                const lowerSearch = searchTerm.toLowerCase();
                return (
                    entry.title.toLowerCase().includes(lowerSearch) ||
                    entry.content.toLowerCase().includes(lowerSearch) ||
                    entry.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
                );
            })
            .sort((a, b) => new Date(b.experimentDate).getTime() - new Date(a.experimentDate).getTime());
    }, [labNotebookEntries, currentUser, dateFilter, searchTerm]);

    const selectedEntry = useMemo(() => {
        if (!selectedEntryId) return null;
        return (labNotebookEntries || []).find(e => e.id === selectedEntryId) || null;
    }, [selectedEntryId, labNotebookEntries]);

    const handleNewEntry = () => {
        setSelectedEntryId(null);
        setIsEditing(true);
    };

    const handleSelectEntry = (id: string) => {
        setSelectedEntryId(id);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!selectedEntry) return;
        if (window.confirm(t('deleteEntryConfirm'))) {
            const result = await deleteLabNotebookEntry(selectedEntry.id);
            if (result.success) {
                showToast(t('entryDeleted'), 'success');
                setSelectedEntryId(null);
                setIsEditing(false);
            } else {
                showToast(t('deleteFailed'), 'error');
            }
        }
    };

    const EntryForm: React.FC<{ entry: Partial<LabNotebookEntry> | null }> = ({ entry }) => {
        const [title, setTitle] = useState(entry?.title || '');
        const [experimentDate, setExperimentDate] = useState(entry?.experimentDate ? new Date(entry.experimentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        const [projectId, setProjectId] = useState(entry?.projectId || '');
        const [tags, setTags] = useState(entry?.tags?.join(', ') || '');
        const [content, setContent] = useState(entry?.content || '');
        const [attachments, setAttachments] = useState(entry?.attachments || []);

        const handleSave = async () => {
            if (!title) {
                showToast(t('titleRequired'), 'error');
                return;
            }

            const entryData = {
                title,
                experimentDate: new Date(experimentDate),
                projectId: projectId || undefined,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                content,
                attachments,
                relatedEquipment: [],
                relatedSamples: []
            };

            const result = entry?.id 
                ? await updateLabNotebookEntry({ ...entryData, id: entry.id, userId: entry.userId!, createdAt: entry.createdAt!, updatedAt: new Date() })
                : await addLabNotebookEntry(entryData);

            if (result.success) {
                showToast(t('saveSuccess'), 'success');
                setSelectedEntryId(result.data.id);
                setIsEditing(false);
            } else {
                showToast(t('saveFailed'), 'error');
            }
        };

        return (
            <div className="p-4 sm:p-6 space-y-4">
                <input type="text" placeholder={t('entryTitle')} value={title} onChange={e => setTitle(e.target.value)} className="w-full text-2xl font-bold border-b-2 pb-2 focus:outline-none focus:border-ever-blue" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">{t('experimentDate')}</label>
                        <input type="date" value={experimentDate} onChange={e => setExperimentDate(e.target.value)} className="mt-1 w-full border rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">{t('relatedProject')}</label>
                        <select value={projectId} onChange={e => setProjectId(e.target.value)} className="mt-1 w-full border rounded-md p-2">
                            <option value="">{t('none')}</option>
                            {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">{t('tagsCommaSeparated')}</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 w-full border rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">{t('contentMarkdown')}</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} rows={15} className="mt-1 w-full border rounded-md p-2 font-mono text-sm"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">{t('attachments')}</label>
                    <div className="mt-1 p-2 border rounded-md bg-gray-50 text-center">
                        <p className="text-sm text-gray-500">{t('fileAttachmentWip')}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-md">{t('cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-ever-blue text-white rounded-md">{t('save')}</button>
                </div>
            </div>
        );
    };

    const EntryViewer: React.FC<{ entry: LabNotebookEntry }> = ({ entry }) => {
        const project = entry.projectId ? myProjects.find(p => p.id === entry.projectId) : null;
        return (
            <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{entry.title}</h2>
                        <p className="text-sm text-gray-500">{t('experimentDate')}: {new Date(entry.experimentDate).toLocaleDateString()}</p>
                        {project && <p className="text-sm text-gray-500">{t('projectLabel')}: {project.name}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} className="px-3 py-1 border rounded-md text-sm">{t('edit')}</button>
                        <button onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded-md text-sm">{t('delete')}</button>
                    </div>
                </div>
                {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {entry.tags.map(tag => <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">{tag}</span>)}
                    </div>
                )}
                <div className="prose max-w-none">
                    <MarkdownRenderer markdown={entry.content} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {t('electronicLabNotebook')}
            </h2>
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
                {/* Left Panel: Entry List */}
                <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md flex flex-col">
                    <div className="p-4 border-b">
                        <div className="flex gap-2 mb-2">
                            <input type="text" placeholder={t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border rounded-md p-2 text-sm" />
                            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="border rounded-md p-2 text-sm" />
                        </div>
                        <button onClick={handleNewEntry} className="w-full bg-ever-blue text-white font-bold py-2 px-4 rounded-lg text-sm">{t('newEntry')}</button>
                    </div>
                    <div className="overflow-y-auto">
                        {filteredEntries.map(entry => (
                            <div key={entry.id} onClick={() => handleSelectEntry(entry.id)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedEntryId === entry.id ? 'bg-ever-blue-light' : ''}`}>
                                <h4 className="font-semibold truncate">{entry.title}</h4>
                                <p className="text-sm text-gray-500">{new Date(entry.experimentDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Content */}
                <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-y-auto">
                    {isEditing ? (
                        <EntryForm entry={selectedEntry} />
                    ) : selectedEntry ? (
                        <EntryViewer entry={selectedEntry} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>{t('selectOrCreateEntry')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ElectronicLabNotebook;
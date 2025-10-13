// src/hooks/useProjectActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAudit } from './useAudit';
import { Result } from '../types/core';
import { Project, LabNotebookEntry } from '../types/research';

const simpleUUID = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useProjectActions = () => {
    const adapter = useDataAdapter();
    const { setLabNotebookEntries } = useProjectContext();
    const { currentUser } = useSessionContext();
    const { addAuditLog } = useAudit();

    const addProject = useCallback(async (project: Omit<Project, 'id'>): Promise<Result<Project, Error>> => {
        const result = await adapter.createProject(project);
        if(result.success){
            addAuditLog('PROJECT_CREATE', `Created project '${result.data.name}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const updateProject = useCallback(async (project: Project): Promise<Result<Project, Error>> => {
        const result = await adapter.updateProject(project);
        if(result.success){
            addAuditLog('PROJECT_UPDATE', `Updated project '${project.name}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const addLabNotebookEntry = useCallback(async (entry: Omit<LabNotebookEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Result<LabNotebookEntry, Error>> => {
        if (!currentUser) return { success: false, error: new Error('User not logged in.') };
        const newEntry: LabNotebookEntry = {
            ...entry,
            id: `eln-${simpleUUID()}`,
            userId: currentUser.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setLabNotebookEntries(prev => [...prev, newEntry]); // Mock behavior
        return { success: true, data: newEntry };
    }, [currentUser, setLabNotebookEntries]);

    const updateLabNotebookEntry = useCallback(async (entry: LabNotebookEntry): Promise<Result<LabNotebookEntry, Error>> => {
        const updatedEntry = { ...entry, updatedAt: new Date() };
        setLabNotebookEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e)); // Mock behavior
        return { success: true, data: updatedEntry };
    }, [setLabNotebookEntries]);
    
    const deleteLabNotebookEntry = useCallback(async (entryId: string): Promise<Result<void, Error>> => {
        setLabNotebookEntries(prev => prev.filter(e => e.id !== entryId)); // Mock behavior
        return { success: true, data: undefined };
    }, [setLabNotebookEntries]);

    return useMemo(() => ({
        addProject,
        updateProject,
        addLabNotebookEntry,
        updateLabNotebookEntry,
        deleteLabNotebookEntry
    }), [addProject, updateProject, addLabNotebookEntry, updateLabNotebookEntry, deleteLabNotebookEntry]);
};

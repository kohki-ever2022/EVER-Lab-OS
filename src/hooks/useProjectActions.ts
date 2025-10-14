// src/hooks/useProjectActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAudit } from './useAudit';
import { Result } from '../types/core';
import { Project, LabNotebookEntry, Task } from '../types/research';

export const useProjectActions = () => {
    const adapter = useDataAdapter();
    const { labNotebookEntries, tasks } = useProjectContext();
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
        const newEntryData: Omit<LabNotebookEntry, 'id'> = {
            ...entry,
            userId: currentUser.id,
            createdAt: new Date(), // This will be replaced by serverTimestamp in FirebaseAdapter
            updatedAt: new Date(),
        };
        const result = await adapter.createLabNotebookEntry(newEntryData);
        if (result.success) {
            addAuditLog('ELN_ENTRY_CREATE', `Created ELN entry '${result.data.title}'`);
        }
        return result;
    }, [currentUser, adapter, addAuditLog]);

    const updateLabNotebookEntry = useCallback(async (entry: LabNotebookEntry): Promise<Result<LabNotebookEntry, Error>> => {
        const updatedEntry = { ...entry, updatedAt: new Date() }; // client-side update
        const result = await adapter.updateLabNotebookEntry(updatedEntry);
        if (result.success) {
            addAuditLog('ELN_ENTRY_UPDATE', `Updated ELN entry '${entry.title}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const deleteLabNotebookEntry = useCallback(async (entryId: string): Promise<Result<void, Error>> => {
        const entryToDelete = labNotebookEntries.find(e => e.id === entryId);
        const result = await adapter.deleteLabNotebookEntry(entryId);
        if (result.success && entryToDelete) {
            addAuditLog('ELN_ENTRY_DELETE', `Deleted ELN entry '${entryToDelete.title}'`);
        }
        return result;
    }, [adapter, labNotebookEntries, addAuditLog]);

    const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdByUserId' | 'createdAt' | 'updatedAt'>): Promise<Result<Task, Error>> => {
        if (!currentUser) return { success: false, error: new Error('User not logged in.') };
        const newTaskData: Omit<Task, 'id'> = {
            ...task,
            createdByUserId: currentUser.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await adapter.createTask(newTaskData);
        if (result.success) {
            addAuditLog('TASK_CREATE', `Created task '${result.data.title}'`);
        }
        return result;
    }, [currentUser, adapter, addAuditLog]);

    const updateTask = useCallback(async (task: Task): Promise<Result<Task, Error>> => {
        const updatedTask = { ...task, updatedAt: new Date() };
        const result = await adapter.updateTask(updatedTask);
        if (result.success) {
            addAuditLog('TASK_UPDATE', `Updated task '${task.title}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const deleteTask = useCallback(async (taskId: string): Promise<Result<void, Error>> => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        const result = await adapter.deleteTask(taskId);
        if (result.success && taskToDelete) {
            addAuditLog('TASK_DELETE', `Deleted task '${taskToDelete.title}'`);
        }
        return result;
    }, [adapter, tasks, addAuditLog]);


    return useMemo(() => ({
        addProject,
        updateProject,
        addLabNotebookEntry,
        updateLabNotebookEntry,
        deleteLabNotebookEntry,
        addTask,
        updateTask,
        deleteTask,
    }), [addProject, updateProject, addLabNotebookEntry, updateLabNotebookEntry, deleteLabNotebookEntry, addTask, updateTask, deleteTask]);
};
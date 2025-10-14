// src/contexts/ProjectContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Project, Task, LabNotebookEntry, Protocol } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface ProjectContextValue {
  projects: Project[];
  tasks: Task[];
  labNotebookEntries: LabNotebookEntry[];
  protocols: Protocol[];
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labNotebookEntries, setLabNotebookEntries] = useState<LabNotebookEntry[]>([]);
  // @ts-ignore
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
        const [
            projectsResult,
            tasksResult,
            entriesResult,
        ] = await Promise.all([
            adapter.getProjects(),
            adapter.getTasks(),
            adapter.getLabNotebookEntries(),
        ]);
        
        if (projectsResult.success) setProjects(projectsResult.data);
        if (tasksResult.success) setTasks(tasksResult.data);
        if (entriesResult.success) setLabNotebookEntries(entriesResult.data);
        
        // Protocols are not fetched yet, but this follows the original structure.
        
        setLoading(false);
    };

    fetchData();
  }, [adapter]);

  const value = useMemo(() => ({ projects, tasks, loading, labNotebookEntries, protocols }), [projects, tasks, loading, labNotebookEntries, protocols]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjectContext must be used within ProjectProvider');
  return context;
};
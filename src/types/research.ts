// src/types/research.ts

// --- Enums ---

export enum MilestoneStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

export enum TaskScope {
  Personal = 'PERSONAL',
  Team = 'TEAM',
}

export enum TaskStatus {
  ToDo = 'TO_DO',
  InProgress = 'IN_PROGRESS',
  InReview = 'IN_REVIEW',
  Done = 'DONE',
}

export enum TaskPriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Urgent = 'URGENT',
}

export enum PipelineStage {
  Idea = 'IDEA',
  Sourcing = 'SOURCING',
  Ordered = 'ORDERED',
  Installation = 'INSTALLATION',
  Validation = 'VALIDATION',
  InService = 'IN_SERVICE',
}

export enum VialStatus {
    Available = 'Available',
    Reserved = 'Reserved',
    InUse = 'InUse',
    Depleted = 'Depleted',
    Disposed = 'Disposed',
}

// --- Interfaces ---

export interface Milestone {
  id: string;
  name: string;
  dueDate: Date;
  status: MilestoneStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  memberIds: string[];
  milestones: Milestone[];
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  companyId: string;
  equipmentId?: string;
  consumableIds: { id: string, quantity: number }[];
  requiredVials?: { sampleLotId: string, count: number };
}

export interface SampleLot {
  id: string;
  name: string;
  source: string;
  companyId: string;
  createdAt: Date;
  notes?: string;
}

export interface ProtocolUsageLog {
  id: string;
  protocolId: string;
  userId: string;
  timestamp: Date;
  sampleLotId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  scope: TaskScope;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date;
  dueDate?: Date;
  assigneeIds: string[];
  isPrivate: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

export interface PipelineItem {
  id: string;
  name: string;
  type: 'Equipment' | 'Reagent';
  stage: PipelineStage;
}

export interface Freezer {
  id: string;
  name: string;
  location: string;
  targetTemperature: number;
}

export interface FreezerRack {
  id: string;
  name: string;
  freezerId: string;
}

export interface SampleBox {
  id: string;
  name: string;
  rackId: string;
  gridSize: [number, number]; // [rows, columns]
}

export interface Vial {
  id: string;
  sampleLotId: string;
  boxId: string;
  position: [number, number]; // [row, column]
  status: VialStatus;
  volume: number;
  volumeUnit: 'uL' | 'mL';
  expiryDate: Date;
  custodyChain: { id: string; userId: string; timestamp: Date; action: string; details: string }[];
}

export interface TemperatureLog {
  id: string;
  freezerId: string;
  timestamp: Date;
  temperature: number;
  isExcursion: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface LabNotebookEntry {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  content: string; // Markdown
  experimentDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  attachments: string[]; // Firebase Storage URLs
  relatedEquipment: string[];
  relatedSamples: string[];
}
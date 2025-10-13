// src/types/reports.ts

export interface MonthlyReport {
  id: string;
  period: string; // YYYY-MM
  generatedAt: Date;
  generatedByUserId: string;
  markdownContent: string;
}

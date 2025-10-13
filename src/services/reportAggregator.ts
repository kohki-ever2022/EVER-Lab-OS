// src/services/reportAggregator.ts
import { Reservation, Equipment, ReservationStatus } from '@/types';
import { Consumable } from '@/types';
import { SDS, Certificate, CertificateStatus, EhsIncident, SDSStatus } from '@/types';
import { Invoice } from '@/types';
import { User } from '@/types';
import { Language } from '@/types';

/**
 * 月次レポートのデータ集計に必要な入力データ
 */
export interface MonthlyDataSources {
  reservations: Reservation[];
  equipment: Equipment[];
  consumables: Consumable[];
  sds: SDS[];
  certificates: Certificate[];
  invoices: Invoice[];
  users: User[];
  incidents: EhsIncident[];
  language: Language;
}

/**
 * 月次レポートデータの型定義
 */
export interface MonthlyReportData {
  period: string; // YYYY-MM
  equipmentUsage: {
    totalReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    noShowCount: number;
    totalUsageHours: number;
    overallUtilizationRate: number; // Percentage
    byEquipment: Array<{
      equipmentName: string;
      totalHours: number;
      reservationCount: number;
    }>;
  };
  inventory: {
    hazardousRatio: number;
    stockoutItems: string[];
    reorderNeededItems: string[];
  };
  compliance: {
    pendingSDSCount: number;
    expiredCertificatesCount: number;
    incidentsCount: number;
  };
  financial: {
    totalRevenue: number;
    previousMonthRevenue: number;
    revenueChangePercentage: number;
    byTenant: Array<{
      tenantName: string;
      amount: number;
    }>;
  };
}

const isJapanese = (language: Language) => language === Language.JA;

/**
 * 指定された年月のデータを集計します。
 * @param year - 集計対象の年
 * @param month - 集計対象の月 (1-12)
 * @param sources - データソース
 * @returns {MonthlyReportData} 集計されたデータ
 */
export const aggregateMonthlyData = (
  year: number,
  month: number,
  sources: MonthlyDataSources
): MonthlyReportData => {
  const { reservations, equipment, consumables, sds, certificates, invoices, users, incidents, language } = sources;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // --- Equipment Usage ---
  const monthReservations = reservations.filter(r => {
    const d = new Date(r.startTime);
    return d >= startDate && d <= endDate;
  });

  const byEquipmentUsage = equipment.map(e => {
    const equipReservations = monthReservations.filter(r => r.equipmentId === e.id && r.status === ReservationStatus.Completed);
    const totalMinutes = equipReservations.reduce((sum, r) => {
        if (r.actualStartTime && r.actualEndTime) {
            return sum + (new Date(r.actualEndTime).getTime() - new Date(r.actualStartTime).getTime()) / 60000;
        }
        return sum;
    }, 0);
    return {
      equipmentName: isJapanese(language) ? e.nameJP : e.nameEN,
      totalHours: Math.round(totalMinutes / 60),
      reservationCount: equipReservations.length,
    };
  }).sort((a, b) => b.totalHours - a.totalHours)
  .slice(0, 5); // Limit to top 5 to reduce payload size

  const totalUsageHours = byEquipmentUsage.reduce((sum, e) => sum + e.totalHours, 0);
  const totalAvailableHours = equipment.length * 30 * 12; // Approximation: 30 days * 12h/day
  const overallUtilizationRate = totalAvailableHours > 0 ? Math.round((totalUsageHours / totalAvailableHours) * 100) : 0;


  // --- Inventory ---
  const hazardousItems = consumables.filter(c => c.isHazardous);
  const calculateMultiple = (item: Consumable) => {
      if (!item.isHazardous || !item.designatedQuantity || !item.packageSize || item.designatedQuantity === 0) return 0;
      const totalAmount = (item.stock * item.packageSize);
      return totalAmount / item.designatedQuantity;
  };
  const hazardousRatio = hazardousItems.reduce((sum, item) => sum + calculateMultiple(item), 0);
  
  const allStockoutItems = consumables.filter(c => c.stock <= 0);
  const stockoutItems = allStockoutItems.slice(0, 10).map(c => isJapanese(language) ? c.nameJP : c.nameEN);
  if (allStockoutItems.length > 10) {
      stockoutItems.push(isJapanese(language) ? `...他${allStockoutItems.length - 10}件` : `...and ${allStockoutItems.length - 10} more`);
  }

  const allReorderItems = consumables.filter(c => c.stock > 0 && c.stock <= c.lowStockThreshold);
  const reorderNeededItems = allReorderItems.slice(0, 10).map(c => isJapanese(language) ? c.nameJP : c.nameEN);
  if (allReorderItems.length > 10) {
      reorderNeededItems.push(isJapanese(language) ? `...他${allReorderItems.length - 10}件` : `...and ${allReorderItems.length - 10} more`);
  }


  // --- Compliance ---
  const pendingSDSCount = sds.filter(s => s.status === SDSStatus.Pending).length;
  const expiredCertificatesCount = certificates.filter(c => c.status === CertificateStatus.Expired).length;
  const monthIncidents = incidents.filter(i => new Date(i.reportedAt) >= startDate && new Date(i.reportedAt) <= endDate);

  // --- Financial ---
  const monthInvoices = invoices.filter(i => i.period === `${year}-${String(month).padStart(2, '0')}`);
  const totalRevenue = monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  
  const prevMonthDate = new Date(year, month - 2, 1);
  const prevMonthPeriod = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthInvoices = invoices.filter(i => i.period === prevMonthPeriod);
  const previousMonthRevenue = prevMonthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const revenueChangePercentage = previousMonthRevenue > 0 ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : (totalRevenue > 0 ? 100 : 0);

  const byTenantAmount: Record<string, number> = {};
    monthInvoices.forEach(inv => {
        byTenantAmount[inv.companyName] = (byTenantAmount[inv.companyName] || 0) + inv.totalAmount;
    });

  const byTenant = Object.entries(byTenantAmount)
    .map(([tenantName, amount]) => ({ tenantName, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10); // Limit to top 10

  return {
    period: `${year}-${String(month).padStart(2, '0')}`,
    equipmentUsage: {
      totalReservations: monthReservations.length,
      completedReservations: monthReservations.filter(r => r.status === ReservationStatus.Completed).length,
      cancelledReservations: monthReservations.filter(r => r.status === ReservationStatus.Cancelled).length,
      noShowCount: monthReservations.filter(r => r.status === ReservationStatus.NoShow).length,
      totalUsageHours,
      overallUtilizationRate,
      byEquipment: byEquipmentUsage,
    },
    inventory: {
      hazardousRatio: parseFloat(hazardousRatio.toFixed(3)),
      stockoutItems,
      reorderNeededItems,
    },
    compliance: {
      pendingSDSCount,
      expiredCertificatesCount,
      incidentsCount: monthIncidents.length,
    },
    financial: {
      totalRevenue,
      previousMonthRevenue,
      revenueChangePercentage: parseFloat(revenueChangePercentage.toFixed(1)),
      byTenant,
    },
  };
};
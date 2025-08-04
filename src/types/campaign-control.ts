// Tipos para el módulo de control de campañas

export interface CampaignBudgetChange {
  id: string;
  campaignId: string;
  campaignName: string;
  date: string;
  previousBudget: number;
  newBudget: number;
  reason: string;
  changeType: 'increase' | 'decrease' | 'pause' | 'resume';
}

export interface CampaignDailyRecord {
  campaignId: string;
  date: string;
  budget: number; // Presupuesto actual
  spend: number; // Gasto del día anterior
  units: number; // Unidades vendidas del día anterior
  revenue: number; // Ingresos generados del día anterior
  roas?: number; // Calculado: revenue / spend
  status: 'active' | 'paused' | 'limited' | 'learning';
  needsUpdate?: boolean; // Indica si necesita actualización de datos del día anterior
  notes?: string; // Notas específicas del día para esta campaña
}

export interface DailySummary {
  date: string;
  totalBudget: number; // Suma de presupuestos de todas las campañas activas
  totalSpend: number; // Suma de gastos del día anterior
  totalRevenue: number; // Suma de ingresos del día anterior
  activeCampaigns: number; // Número de campañas activas
  campaignsNeedingUpdate: number; // Número de campañas que necesitan actualizar datos
  avgROAS: number; // ROAS promedio de todas las campañas activas
  notes: string; // Notas generales del día
}

// Tipo extendido para campañas con datos diarios
export interface CampaignWithDailyData {
  id: string;
  name: string;
  platform?: string;
  product_id?: string;
  cp?: string; // Código o ID externo de la campaña
  status: boolean; // Estado en la base de datos
  launch_date: Date;
  end_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  dailyData: CampaignDailyRecord; // Datos del día actual
  lastChange?: CampaignBudgetChange; // Último cambio registrado
  needsUpdate: boolean; // Indica si necesita actualización de datos del día anterior
}

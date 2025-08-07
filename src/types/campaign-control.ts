// Tipos para el módulo de control de campañas

export interface CampaignBudgetChange {
  id?: string;
  campaign_id: string;
  campaignName?: string; // Campo derivado, no en BD
  date: string;
  previous_budget: number;
  new_budget: number;
  reason: string;
  change_type: 'increase' | 'decrease' | 'pause' | 'resume';
  created_by?: string;
  created_at?: string;
}

export interface CampaignDailyRecord {
  id?: string;
  campaign_id: string;
  date: string;
  budget: number; // Presupuesto actual
  spend: number; // Gasto del día anterior
  units: number; // Unidades vendidas del día anterior (campo original)
  units_sold: number; // Alias para units (para compatibilidad con componentes)
  revenue: number; // Ingresos generados del día anterior
  sales: number; // Alias para revenue (para compatibilidad con componentes)
  roas?: number; // Calculado: revenue / spend
  status: 'active' | 'paused' | 'limited' | 'learning' | 'ended';
  notes?: string; // Notas específicas del día para esta campaña
  created_at?: string;
  updated_at?: string;
}

export interface DailySummary {
  id?: string;
  company_id: string;
  date: string;
  total_budget: number; // Suma de presupuestos de todas las campañas activas
  total_spend: number; // Suma de gastos del día anterior
  total_revenue: number; // Suma de ingresos del día anterior
  total_units: number; // Total de unidades vendidas
  adjusted_units?: number; // Unidades ajustadas (ej. después de cancelaciones)
  adjusted_revenue?: number; // Ingresos ajustados
  avg_cpa?: number; // CPA promedio (costo por adquisición)
  avg_roas?: number; // ROAS promedio (retorno sobre inversión en publicidad)
  adjusted_cpa?: number; // CPA ajustado
  adjusted_roas?: number; // ROAS ajustado
  active_campaigns: number; // Número de campañas activas
  pending_updates?: number; // Número de campañas que necesitan actualizar datos
  notes?: string; // Notas generales del día
  created_at?: string;
  updated_at?: string;
  last_adjusted_at?: string;
  last_adjusted_by?: string;
}

// Tipo extendido para campañas con datos diarios
export interface CampaignWithDailyData {
  id: string;
  name: string;
  platform?: string;
  product_id?: string;
  company_id?: string;
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

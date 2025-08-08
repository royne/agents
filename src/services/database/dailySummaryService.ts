import { supabase } from '../../lib/supabase';
import type { DailySummary } from '../../types/campaign-control';

export const dailySummaryService = {
  async getDailySummary(companyId: string, date: string): Promise<DailySummary | null> {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('company_id', companyId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily summary:', error);
    }
    return data;
  },

  async saveDailySummary(summary: Omit<DailySummary, 'id' | 'created_at' | 'updated_at'>): Promise<DailySummary | null> {
    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert({
        ...summary,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id,date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving daily summary:', error);
      throw new Error(`Error al guardar resumen diario: ${error.message}`);
    }
    return data;
  },
  
  async adjustDailySummary(
    id: string,
    adjustments: {
      adjusted_units?: number,
      adjusted_revenue?: number,
      notes?: string
    }
  ): Promise<DailySummary | null> {
    // Obtener resumen actual para calcular métricas ajustadas
    const { data: summary, error: fetchError } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching summary for adjustment:', fetchError);
      throw new Error(`Error al obtener resumen para ajuste: ${fetchError.message}`);
    }
    
    // Calcular métricas ajustadas
    const adjusted_cpa = adjustments.adjusted_units && summary.total_spend > 0 
      ? summary.total_spend / adjustments.adjusted_units 
      : summary.avg_cpa;
      
    const adjusted_roas = adjustments.adjusted_revenue && summary.total_spend > 0 
      ? adjustments.adjusted_revenue / summary.total_spend 
      : summary.avg_roas;
    
    const { data, error } = await supabase
      .from('daily_summaries')
      .update({
        ...adjustments,
        adjusted_cpa,
        adjusted_roas,
        last_adjusted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error adjusting daily summary:', error);
      throw new Error(`Error al ajustar resumen diario: ${error.message}`);
    }
    return data;
  },
  
  // Método para consolidar datos diarios y crear un resumen automáticamente
  async generateDailySummary(companyId: string, date: string): Promise<DailySummary | null> {
    try {
      // 1. Obtener todas las campañas activas para la fecha dada
      const { data: campaignsWithRecords, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id, 
          name,
          campaign_daily_records!inner(*)
        `)
        .eq('company_id', companyId)
        .eq('campaign_daily_records.date', date);
      
      if (campaignsError) {
        throw new Error(`Error al obtener campañas: ${campaignsError.message}`);
      }
      
      // 2. Calcular métricas consolidadas
      let totalBudget = 0;
      let totalSpend = 0;
      let totalRevenue = 0;
      let totalUnits = 0;
      let activeCampaignsCount = 0;
      
      campaignsWithRecords?.forEach(campaign => {
        const record = campaign.campaign_daily_records[0];
        if (record) {
          // Determinar si la campaña tuvo actividad durante el día
          const hadActivity = record.status === 'active' || // Está activa actualmente
                             (record.spend && record.spend > 0); // O tuvo gasto (estuvo activa en algún momento)
          
          // Solo sumar el presupuesto si la campaña tuvo actividad
          if (hadActivity) {
            totalBudget += record.budget || 0;
          }
          
          // Solo contar como activas las que tienen ese estado actualmente
          if (record.status === 'active') {
            activeCampaignsCount++;
          }
          
          // Sumar el resto de métricas para todas las campañas con registros
          totalSpend += record.spend || 0;
          totalRevenue += record.revenue || 0;
          totalUnits += record.units || 0;
        }
      });
      
      // 3. Calcular métricas derivadas
      const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
      const avgCpa = totalUnits > 0 ? totalSpend / totalUnits : 0;
      
      // 4. Crear o actualizar el resumen diario
      return await this.saveDailySummary({
        company_id: companyId,
        date,
        total_budget: totalBudget,
        total_spend: totalSpend,
        total_revenue: totalRevenue,
        total_units: totalUnits,
        avg_cpa: avgCpa,
        avg_roas: avgRoas,
        active_campaigns: activeCampaignsCount,
        notes: ''
      });
    } catch (error) {
      console.error('Error generating daily summary:', error);
      throw new Error(`Error al generar resumen diario: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

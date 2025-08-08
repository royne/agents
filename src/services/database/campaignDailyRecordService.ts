import { supabase } from '../../lib/supabase';
import type { CampaignDailyRecord } from '../../types/campaign-control';

export const campaignDailyRecordService = {
  // Obtener todos los registros diarios para una fecha específica y compañía
  async getCompanyDailyRecords(companyId: string, date: string): Promise<CampaignDailyRecord[]> {
    try {
      // Primero, obtener todas las campañas que pertenecen a la compañía
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('company_id', companyId);

      if (campaignsError) {
        console.error('Error fetching company campaigns:', campaignsError);
        throw new Error(`Error al obtener campañas de la compañía: ${campaignsError.message}`);
      }

      if (!campaigns || campaigns.length === 0) {
        return []; // No hay campañas para esta compañía
      }

      // Extraer solo la parte de la fecha (YYYY-MM-DD) para la consulta
      const dateOnly = date.split('T')[0];
      
      // Obtener los IDs de las campañas
      const campaignIds = campaigns.map(campaign => campaign.id);
      
      // Ahora, obtener los registros diarios para estas campañas en la fecha especificada
      // En lugar de usar LIKE, usamos eq con la fecha exacta para evitar problemas con el operador
      const { data, error } = await supabase
        .from('campaign_daily_records')
        .select('*')
        .in('campaign_id', campaignIds)
        .eq('date', dateOnly)
        .order('date', { ascending: false });

      console.log('Data:', data);
      if (error) {
        console.error('Error fetching daily records:', error);
        throw new Error(`Error al obtener registros diarios: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getCompanyDailyRecords:', error);
      throw error;
    }
  },
  async getDailyRecord(campaignId: string, date: string): Promise<CampaignDailyRecord | null> {
    // Extraer solo la parte de la fecha (YYYY-MM-DD) para la consulta
    // Esto permite buscar registros por día independientemente de la hora
    const dateOnly = date.split('T')[0];
    console.log('Buscando registro diario con fecha:', dateOnly);
    
    const { data, error } = await supabase
      .from('campaign_daily_records')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('date', date) // Mantener la fecha completa para compatibilidad
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily record:', error);
      throw new Error(`Error al obtener registro diario: ${error.message}`);
    }
    
    // Si no encontramos con fecha completa, intentamos con solo la fecha
    if (!data) {
      const { data: dataByDateOnly, error: errorByDateOnly } = await supabase
        .from('campaign_daily_records')
        .select('*')
        .eq('campaign_id', campaignId)
        .like('date', `${dateOnly}%`) // Buscar registros que empiecen con la fecha
        .order('date', { ascending: false })
        .limit(1)
        .single();
        
      if (errorByDateOnly && errorByDateOnly.code !== 'PGRST116') {
        console.error('Error fetching daily record by date only:', errorByDateOnly);
      }
      
      return dataByDateOnly;
    }
    
    return data;
  },

  async saveDailyRecord(record: Omit<CampaignDailyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<CampaignDailyRecord | null> {
    // Asegurarnos de que la fecha incluye la hora completa
    const recordWithFullDate = {
      ...record,
      // Si la fecha no tiene formato ISO completo, lo convertimos
      date: record.date.includes('T') ? record.date : new Date(record.date).toISOString()
    };
    
    console.log('Guardando registro diario con fecha completa:', recordWithFullDate.date);
    
    // Primero verificamos si existe un registro para esta campaña y fecha
    const dateOnly = recordWithFullDate.date.split('T')[0];
    
    // Buscar primero por fecha exacta
    const { data: existingRecord } = await supabase
      .from('campaign_daily_records')
      .select('id')
      .eq('campaign_id', recordWithFullDate.campaign_id)
      .eq('date', recordWithFullDate.date)
      .single();
    
    // Si no encontramos por fecha exacta, intentamos buscar por fecha parcial
    if (!existingRecord) {
      const { data: existingByDateOnly } = await supabase
        .from('campaign_daily_records')
        .select('id')
        .eq('campaign_id', recordWithFullDate.campaign_id)
        .like('date', `${dateOnly}%`)
        .order('date', { ascending: false })
        .limit(1)
        .single();
        
      // Si encontramos por fecha parcial, actualizamos ese registro
      if (existingByDateOnly) {
        console.log('Encontrado registro por fecha parcial:', existingByDateOnly.id);
        const { data, error } = await supabase
          .from('campaign_daily_records')
          .update({
            ...recordWithFullDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingByDateOnly.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating daily record by date only:', error);
          throw new Error(`Error al actualizar registro diario: ${error.message}`);
        }
        return data;
      }
    }
    
    // Si existe por fecha exacta, actualizamos el registro
    if (existingRecord) {
      console.log('Actualizando registro existente:', existingRecord.id);
      const { data, error } = await supabase
        .from('campaign_daily_records')
        .update({
          ...recordWithFullDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating daily record:', error);
        throw new Error(`Error al actualizar registro diario: ${error.message}`);
      }
      return data;
    }
    
    // Si no existe, insertamos un nuevo registro con un ID generado
    console.log('Creando nuevo registro diario con fecha completa');
    const recordId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    
    const { data, error } = await supabase
      .from('campaign_daily_records')
      .insert({
        ...recordWithFullDate,
        id: recordId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating daily record:', error);
      throw new Error(`Error al crear registro diario: ${error.message}`);
    }
    return data;
  },

  async getDailyRecordsRange(campaignId: string, startDate: string, endDate: string): Promise<CampaignDailyRecord[]> {
    const { data, error } = await supabase
      .from('campaign_daily_records')
      .select('*')
      .eq('campaign_id', campaignId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching daily records range:', error);
      throw new Error(`Error al obtener rango de registros diarios: ${error.message}`);
    }
    
    return data || [];
  },

  /**
   * Obtiene todos los registros diarios de una campaña
   * @param campaignId - ID de la campaña
   * @returns Array de registros diarios
   */
  async getCampaignDailyRecords(campaignId: string): Promise<CampaignDailyRecord[]> {
    const { data, error } = await supabase
      .from('campaign_daily_records')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching campaign daily records:', error);
      throw new Error(`Error al obtener registros diarios de la campaña: ${error.message}`);
    }
    
    // Mapear los campos units y revenue a units_sold y sales para compatibilidad
    const recordsWithAliases = (data || []).map(record => ({
      ...record,
      units_sold: record.units,
      sales: record.revenue
    }));
    
    return recordsWithAliases;
  }
};

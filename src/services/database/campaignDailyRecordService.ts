import { supabase } from '../../lib/supabase';
import type { CampaignDailyRecord } from '../../types/campaign-control';

export const campaignDailyRecordService = {
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
      .order('date');

    if (error) {
      console.error('Error fetching daily records range:', error);
      return [];
    }
    return data || [];
  }
};

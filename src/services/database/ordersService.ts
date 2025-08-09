import { supabase } from '../../lib/supabase';
import type { Order, OrderStatus } from '../../types/orders';

export const ordersDatabaseService = {
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, company_id: string): Promise<Order | null> {
    console.log('=== DEBUG: createOrder ===');
    console.log('Datos de la orden:', JSON.stringify(orderData));
    console.log('Company ID:', company_id);
    
    try {
      // Si existe carrier pero no shipping_company, usar carrier como shipping_company
      let dataToSave = { ...orderData, company_id };
      
      if (orderData.carrier && !orderData.shipping_company) {
        dataToSave = {
          ...dataToSave,
          shipping_company: orderData.carrier
        };
      }
      
      // Calcular profit si no viene y tenemos los datos necesarios
      if (dataToSave.profit === undefined && dataToSave.order_value !== undefined && dataToSave.provider_cost !== undefined) {
        dataToSave.profit = dataToSave.order_value - dataToSave.provider_cost;
      }
      
      // Supabase ignora automáticamente las propiedades que no existen en la tabla
      const { data, error } = await supabase
        .from('orders')
        .insert(dataToSave)
        .select()
        .single();

      if (error) {
        console.error('Error al crear orden en Supabase:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.details);
        return null;
      }
      
      console.log('Orden creada exitosamente:', data?.id);
      return data;
    } catch (error) {
      console.error('Excepción al crear orden:');
      console.error('Error completo:', error);
      return null;
    }
  },

  async getOrders(company_id: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          campaigns:campaign_id (*)
        `)
        .eq('company_id', company_id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      return [];
    }
  },

  async getOrderByExternalId(externalId: string, company_id: string): Promise<Order | null> {
    console.log('=== DEBUG: getOrderByExternalId ===');
    console.log('ID externo:', externalId);
    console.log('Company ID:', company_id);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('external_id', externalId)
        .eq('company_id', company_id)
        .maybeSingle();

      if (error) {
        console.error('Error al buscar orden por ID externo:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.details);
        return null;
      }

      if (!data) {
        console.log('No se encontró orden con ID externo:', externalId);
        return null;
      }
      
      // Calcular profit si tenemos los datos necesarios
      let profit = data.profit;
      if (data.order_value !== undefined && data.provider_cost !== undefined && profit === undefined) {
        profit = data.order_value - data.provider_cost;
      }
      
      const fullData = {
        ...data,
        profit
      };
      
      console.log('Orden encontrada:', fullData.id);
      return fullData;
    } catch (error) {
      console.error('Excepción al buscar orden por ID externo:');
      console.error('Error completo:', error);
      return null;
    }
  },

  async updateOrder(orderId: string, orderData: Partial<Order>, company_id: string): Promise<Order | null> {
    console.log('=== DEBUG: updateOrder ===');
    console.log('ID de la orden:', orderId);
    console.log('Datos de actualización:', JSON.stringify(orderData));
    console.log('Company ID:', company_id);
    
    try {
      // Si existe carrier pero no shipping_company, usar carrier como shipping_company
      let dataToSave = { ...orderData };
      
      if (orderData.carrier && !orderData.shipping_company) {
        dataToSave = {
          ...dataToSave,
          shipping_company: orderData.carrier
        };
      }
      
      // Calcular profit si se actualizaron order_value o provider_cost
      if ((orderData.order_value !== undefined || orderData.provider_cost !== undefined)) {
        // Primero obtenemos la orden actual para tener todos los datos
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('order_value, provider_cost')
          .eq('id', orderId)
          .single();
          
        if (currentOrder) {
          const orderValue = orderData.order_value !== undefined ? orderData.order_value : currentOrder.order_value;
          const providerCost = orderData.provider_cost !== undefined ? orderData.provider_cost : currentOrder.provider_cost;
          
          if (orderValue !== undefined && providerCost !== undefined) {
            dataToSave.profit = orderValue - providerCost;
          }
        }
      }
      
      // Supabase ignora automáticamente las propiedades que no existen en la tabla
      const { data, error } = await supabase
        .from('orders')
        .update(dataToSave)
        .eq('id', orderId)
        .eq('company_id', company_id)
        .select('*')
        .single();

      if (error) {
        console.error('Error al actualizar orden en Supabase:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.details);
        return null;
      }
      
      console.log('Orden actualizada exitosamente:', data?.id);
      return data;
    } catch (error) {
      console.error('Excepción al actualizar orden:');
      console.error('Error completo:', error);
      return null;
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    return !error;
  },

  async getUnassignedOrders(company_id: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('company_id', company_id)
        .is('campaign_id', null)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener órdenes sin asignar:', error);
      return [];
    }
  },

  async assignOrdersToCampaign(orderIds: string[], campaignId: string, company_id: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ campaign_id: campaignId, updated_at: new Date().toISOString() })
      .in('id', orderIds)
      .eq('company_id', company_id);

    return !error;
  },

  async getOrdersByStatus(status: OrderStatus, company_id: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          campaigns:campaign_id (name)
        `)
        .eq('status', status)
        .eq('company_id', company_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error al obtener órdenes con estado ${status}:`, error);
      return [];
    }
  }
};

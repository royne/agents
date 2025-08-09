import { ExcelOrderData, Order, OrderStatus, OrderSyncResult } from '../../types/orders';
import { ordersDatabaseService } from '../database/ordersService';

class OrderSyncService {
  /**
   * Determina el estado de la orden basado en el texto del estado
   * @param status Texto del estado de la orden
   */
  private getOrderStatus(status: any): OrderStatus {
    if (!status) return OrderStatus.IN_PROGRESS;
    
    const statusStr = String(status).toUpperCase();
    
    if (statusStr.includes('CANCEL') || statusStr === 'CANCELADO' || statusStr === 'CANCELADA') {
      return OrderStatus.CANCELED;
    }
    
    if (statusStr.includes('RECHAZ') || statusStr === 'RECHAZADO' || statusStr === 'RECHAZADA') {
      return OrderStatus.REJECTED;
    }
    
    if (statusStr === 'DEVOLUCION' || statusStr === 'DEVOLUCIÓN' || statusStr.includes('DEVOL')) {
      return OrderStatus.RETURNED;
    }
    
    if (statusStr.includes('ENTREG') || statusStr === 'ENTREGADO' || statusStr === 'ENTREGADA') {
      return OrderStatus.DELIVERED;
    }
    
    if (statusStr.includes('PENDI')) {
      return OrderStatus.PENDING;
    }
    
    return OrderStatus.IN_PROGRESS;
  }
  
  /**
   * Normaliza un ID externo para asegurar consistencia
   */
  private normalizeExternalId(externalId: any): string {
    if (!externalId) return '';
    return String(externalId).trim();
  }
  
  /**
   * Normaliza una fecha en varios formatos posibles
   */
  private normalizeDate(dateValue: any): string | undefined {
    if (!dateValue) return undefined;
    
    const dateStr = String(dateValue).trim();
    if (!dateStr) return undefined;
    
    // Intentar parsear la fecha
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString();
    } catch (e) {
      console.log('Error al parsear fecha:', dateStr, e);
      return undefined;
    }
  }
  
  /**
   * Normaliza un valor monetario asegurando que sea un número
   */
  private normalizeMonetaryValue(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    
    // Convertir a string y limpiar
    const valueStr = String(value).trim()
      .replace(/\$/g, '') // Eliminar símbolos de moneda
      .replace(/,/g, ''); // Eliminar comas
    
    // Intentar convertir a número
    const numValue = parseFloat(valueStr);
    
    // Verificar si es un número válido
    if (isNaN(numValue)) return undefined;
    
    return numValue;
  }
  
  /**
   * Extrae datos de la orden del registro Excel, incluyendo datos del cliente
   */
  private extractOrderData(excelData: ExcelOrderData): Omit<Order, 'id' | 'created_at' | 'updated_at'> {
    console.log('=== DEBUG: extractOrderData ===');
    console.log('Datos del Excel para orden:', excelData);
    
    // Normalizar ID externo
    const externalId = this.normalizeExternalId(excelData.ID);
    console.log('ID externo normalizado:', externalId);
    
    // Normalizar valores monetarios
    const orderValue = this.normalizeMonetaryValue(excelData["VALOR DE COMPRA EN PRODUCTOS"]);
    const shippingCost = this.normalizeMonetaryValue(excelData["PRECIO FLETE"]);
    const providerCost = this.normalizeMonetaryValue(excelData["TOTAL EN PRECIOS DE PROVEEDOR"]);
    
    // Calcular ganancia si tenemos los datos necesarios
    let profit = undefined;
    if (orderValue !== undefined && providerCost !== undefined) {
      profit = orderValue - providerCost;
    }
    
    // Normalizar fechas
    const lastMovementDate = this.normalizeDate(
      excelData["FECHA DE ÚLTIMO MOVIMIENTO"] || excelData["FECHA DE ULTIMO MOVIMIENTO"]
    );
    
    // Extraer fecha de la orden
    const orderDate = this.normalizeDate(
      excelData["FECHA DE ORDEN"] || excelData["FECHA DE COMPRA"] || excelData["FECHA"]
    );
    
    // Determinar estado
    const status = this.getOrderStatus(excelData["ESTATUS"] || excelData["estado"]);
    
    // Extraer datos del cliente
    const customerPhone = String(excelData["TELÉFONO"] || excelData["TELEFONO"] || '');
    const customerName = String(excelData["NOMBRE CLIENTE"] || '');
    const customerAddress = String(excelData["DIRECCION"] || '');
    const customerCity = String(excelData["CIUDAD DESTINO"] || '');
    const customerState = String(excelData["DEPARTAMENTO DESTINO"] || '');
    
    const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
      external_id: externalId,
      status,
      order_value: orderValue || 0,
      shipping_cost: shippingCost || 0,
      order_date: orderDate,
      
      // Datos del cliente integrados en la orden
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      customer_city: customerCity,
      customer_state: customerState,
      customer_email: undefined,
      customer_postal_code: undefined,
      customer_country: undefined,
      
      // Campos opcionales
      tracking_number: String(excelData["NÚMERO GUIA"] || excelData["NUMERO GUIA"] || ''),
      shipping_company: String(excelData["TRANSPORTADORA"] || ''),
      carrier: String(excelData["TRANSPORTADORA"] || ''), // Duplicamos para compatibilidad
      
      // Campos adicionales del Excel
      destination_city: String(excelData["CIUDAD DESTINO"] || ''),
      destination_state: String(excelData["DEPARTAMENTO DESTINO"] || ''),
      shipping_address: String(excelData["DIRECCION"] || ''),
      last_movement: String(excelData["ÚLTIMO MOVIMIENTO"] || excelData["ULTIMO MOVIMIENTO"] || ''),
      last_movement_date: lastMovementDate,
      shipping_type: String(excelData["TIPO DE ENVIO"] || excelData["TIPO ENVIO"] || ''),
      provider_cost: providerCost,
      profit,
      
      // Estos campos se llenarán en el método de sincronización
      company_id: ''
    };
    
    console.log('Datos de la orden extraídos:', orderData);
    return orderData;
  }
  
  /**
   * Verifica si hay cambios significativos que ameriten actualización
   */
  private hasSignificantChanges(existingOrder: Order, newOrderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): boolean {
    console.log('=== DEBUG: hasSignificantChanges ===');
    console.log('Orden existente:', existingOrder);
    console.log('Nuevos datos:', newOrderData);
    
    // Verificar cambios en campos clave
    if (existingOrder.status !== newOrderData.status) return true;
    if (existingOrder.order_value !== newOrderData.order_value) return true;
    if (existingOrder.shipping_cost !== newOrderData.shipping_cost) return true;
    if (existingOrder.tracking_number !== newOrderData.tracking_number) return true;
    if (existingOrder.shipping_company !== newOrderData.shipping_company) return true;
    
    // Verificar cambios en campos adicionales
    if (existingOrder.last_movement !== newOrderData.last_movement) return true;
    if (existingOrder.last_movement_date !== newOrderData.last_movement_date) return true;
    if (existingOrder.provider_cost !== newOrderData.provider_cost) return true;
    if (existingOrder.order_date !== newOrderData.order_date) return true;
    if (existingOrder.shipping_type !== newOrderData.shipping_type) return true;
    
    // Verificar cambios en datos del cliente
    if (existingOrder.customer_name !== newOrderData.customer_name) return true;
    if (existingOrder.customer_phone !== newOrderData.customer_phone) return true;
    if (existingOrder.customer_address !== newOrderData.customer_address) return true;
    if (existingOrder.customer_city !== newOrderData.customer_city) return true;
    if (existingOrder.customer_state !== newOrderData.customer_state) return true;
    
    console.log('No se detectaron cambios significativos');
    return false;
  }
  
  /**
   * Sincroniza datos del Excel con la base de datos
   */
  async syncOrdersFromExcel(excelData: ExcelOrderData[], companyId: string): Promise<OrderSyncResult> {
    console.log('=== DEBUG: Iniciando syncOrdersFromExcel ===');
    console.log('Company ID:', companyId);
    console.log('Total registros Excel:', excelData.length);
    
    const result: OrderSyncResult = {
      created: 0,
      updated: 0,
      unchanged: 0,
      details: []
    };
    
    // Iterar sobre cada registro del Excel
    for (const orderData of excelData) {
      const externalId = this.normalizeExternalId(orderData.ID);
      if (!externalId) {
        console.log('Ignorando registro sin ID:', orderData);
        continue; // Ignorar registros sin ID
      }
      
      console.log(`=== DEBUG: Procesando orden con ID externo: ${externalId} ===`);
      
      try {
        // Paso 1: Extraer datos de la orden (incluye datos del cliente)
        console.log('Paso 1: Extrayendo datos de la orden y cliente');
        const newOrderData = this.extractOrderData(orderData);
        newOrderData.company_id = companyId;
        console.log('Datos de la orden extraídos:', newOrderData);
        
        // Paso 2: Verificar si la orden ya existe
        console.log('Paso 2: Verificando si la orden existe');
        const existingOrder = await ordersDatabaseService.getOrderByExternalId(externalId, companyId);
        console.log('¿Orden existente?', existingOrder ? 'Sí' : 'No');
        
        if (existingOrder) {
          // Verificar si hay cambios significativos
          console.log('Verificando cambios en la orden existente');
          if (this.hasSignificantChanges(existingOrder, newOrderData)) {
            console.log('Hay cambios significativos, actualizando orden');
            // Actualizar la orden existente
            await ordersDatabaseService.updateOrder(existingOrder.id, newOrderData, companyId);
            result.updated++;
            result.details.push({ id: externalId, action: 'updated' });
          } else {
            // Sin cambios significativos
            console.log('No hay cambios significativos');
            result.unchanged++;
            result.details.push({ id: externalId, action: 'unchanged' });
          }
        } else {
          // Crear nueva orden
          console.log('Creando nueva orden');
          const newOrder = await ordersDatabaseService.createOrder(newOrderData, companyId);
          if (newOrder) {
            console.log('Orden creada correctamente:', newOrder.id);
            result.created++;
            result.details.push({ id: externalId, action: 'created' });
          } else {
            console.error('Error al crear la orden, no se recibió respuesta');
          }
        }
      } catch (error) {
        console.error(`=== DEBUG: Error procesando orden ${externalId} ===`);
        console.error('Tipo de error:', typeof error);
        console.error('Error completo:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace disponible');
        // Continuar con la siguiente orden
      }
    }
    
    return result;
  }
  
  /**
   * Asigna múltiples órdenes a una campaña
   */
  async assignOrdersToCampaign(orderIds: string[], campaignId: string, companyId: string): Promise<boolean> {
    return ordersDatabaseService.assignOrdersToCampaign(orderIds, campaignId, companyId);
  }
  
  /**
   * Obtiene órdenes no asignadas a ninguna campaña
   */
  async getUnassignedOrders(companyId: string): Promise<Order[]> {
    return ordersDatabaseService.getUnassignedOrders(companyId);
  }
}

export default new OrderSyncService();

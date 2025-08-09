import { ExcelOrderData, Order, Customer, OrderStatus, OrderSyncResult } from '../../types/orders';
import { customersDatabaseService } from '../database/customersService';
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
   * Extrae datos del cliente del registro Excel
   */
  private extractCustomerData(excelData: ExcelOrderData): Omit<Customer, 'id' | 'created_at' | 'updated_at'> {
    console.log('=== DEBUG: extractCustomerData ===');
    console.log('Datos del Excel para cliente:', excelData);
    
    const phone = String(excelData["TELÉFONO"] || excelData["TELEFONO"] || '');
    
    const customerData = {
      name: String(excelData["NOMBRE CLIENTE"] || ''),
      phone,
      address: String(excelData["DIRECCION"] || ''),
      city: String(excelData["CIUDAD DESTINO"] || ''),
      state: String(excelData["DEPARTAMENTO DESTINO"] || ''), // Cambiado de region a state
      company_id: '' // Se llenará en el método de sincronización
    };
    
    console.log('Datos del cliente extraídos:', customerData);
    return customerData;
  }
  
  /**
   * Extrae datos de la orden del registro Excel
   */
  private extractOrderData(excelData: ExcelOrderData, customerId: string): Omit<Order, 'id' | 'created_at' | 'updated_at'> {
    console.log('=== DEBUG: extractOrderData ===');
    console.log('Datos del Excel para orden:', excelData);
    
    // Convertir valores monetarios asegurando que sean números
    const orderValue = parseFloat(String(excelData["VALOR DE COMPRA EN PRODUCTOS"] || 0)) || 0;
    const shippingCost = parseFloat(String(excelData["PRECIO FLETE"] || excelData.precioFlete || excelData.flete || 0)) || 0;
    const providerCost = parseFloat(String(excelData["TOTAL EN PRECIOS DE PROVEEDOR"] || excelData.precioProveedor || 0)) || 0;
    
    // Calcular ganancia estimada
    const profit = orderValue - providerCost;
    
    // Extraer fecha de orden si existe
    const orderDate = excelData["FECHA"] || excelData["FECHA DE ORDEN"] || excelData["FECHA ORDEN"] || null;
    
    // Extraer método de pago si existe
    const paymentMethod = excelData["METODO DE PAGO"] || excelData["FORMA DE PAGO"] || null;
    
    // Extraer notas si existen
    const notes = excelData["NOTAS"] || excelData["OBSERVACIONES"] || null;
    
    // Extraer datos de ubicación
    const destinationCity = excelData["CIUDAD DESTINO"] || null;
    const destinationState = excelData["DEPARTAMENTO DESTINO"] || null;
    const shippingAddress = excelData["DIRECCION"] || null;
    
    // Extraer último movimiento y su fecha
    const lastMovement = excelData["CONCEPTO ÚLTIMO MOVIMIENTO"] || excelData["ÚLTIMO MOVIMIENTO"] || excelData["ULTIMO MOVIMIENTO"] || null;
    const lastMovementDate = excelData["FECHA DE ÚLTIMO MOVIMIENTO"] || excelData["FECHA ULTIMO MOVIMIENTO"] || null;
    const lastMovementTime = excelData["HORA DE ÚLTIMO MOVIMIENTO"] || excelData["HORA ULTIMO MOVIMIENTO"] || null;
    
    // Combinar fecha y hora de último movimiento si ambos existen
    let combinedLastMovementDate = undefined;
    if (lastMovementDate) {
      combinedLastMovementDate = lastMovementTime ? `${lastMovementDate} ${lastMovementTime}` : lastMovementDate;
    }
    
    // Extraer tipo de envío
    const shippingType = excelData["TIPO DE ENVIO"] || null;
    
    // Extraer si la novedad fue solucionada
    const issueSolved = excelData["FUE SOLUCIONADA LA NOVEDAD"] === "SI" || 
                      excelData["FUE SOLUCIONADA LA NOVEDAD"] === true || 
                      excelData["FUE SOLUCIONADA LA NOVEDAD"] === "true" || 
                      excelData["FUE SOLUCIONADA LA NOVEDAD"] === 1 || 
                      excelData["FUE SOLUCIONADA LA NOVEDAD"] === "1";
    
    const orderData = {
      external_id: String(excelData.ID || ''),
      customer_id: customerId,
      status: this.getOrderStatus(excelData["ESTATUS"] || excelData.estado),
      order_date: orderDate ? String(orderDate) : undefined,
      payment_method: paymentMethod ? String(paymentMethod) : undefined,
      tracking_number: String(excelData["NÚMERO GUIA"] || excelData["NUMERO GUIA"] || ''),
      shipping_company: String(excelData["TRANSPORTADORA"] || excelData.transportadora || ''),
      carrier: String(excelData["TRANSPORTADORA"] || excelData.transportadora || ''), // Duplicamos para mantener compatibilidad
      order_value: orderValue,
      shipping_cost: shippingCost,
      provider_cost: providerCost,
      profit: profit,
      notes: notes ? String(notes) : undefined,
      
      // Campos adicionales que ahora están en la BD
      destination_city: destinationCity ? String(destinationCity) : undefined,
      destination_state: destinationState ? String(destinationState) : undefined,
      shipping_address: shippingAddress ? String(shippingAddress) : undefined,
      last_movement: lastMovement ? String(lastMovement) : undefined,
      last_movement_date: combinedLastMovementDate ? String(combinedLastMovementDate) : undefined,
      issue_solved: issueSolved !== undefined ? issueSolved : undefined,
      shipping_type: shippingType ? String(shippingType) : undefined,
      
      company_id: '', // Se llenará en el método de sincronización
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
    
    // Verificar cambios en los campos principales
    const changes: Record<string, boolean> = {
      status: existingOrder.status !== newOrderData.status,
      order_value: existingOrder.order_value !== newOrderData.order_value,
      shipping_cost: existingOrder.shipping_cost !== newOrderData.shipping_cost,
      shipping_company: existingOrder.shipping_company !== newOrderData.shipping_company,
      carrier: existingOrder.carrier !== newOrderData.carrier,
      tracking_number: existingOrder.tracking_number !== newOrderData.tracking_number,
      payment_method: existingOrder.payment_method !== newOrderData.payment_method,
      notes: existingOrder.notes !== newOrderData.notes
    };
    
    // Verificar campos adicionales que no están en la BD pero usamos en el código
    if (newOrderData.provider_cost !== undefined) {
      changes.provider_cost = existingOrder.provider_cost !== newOrderData.provider_cost;
    }
    
    if (newOrderData.last_movement !== undefined) {
      changes.last_movement = existingOrder.last_movement !== newOrderData.last_movement;
    }
    
    console.log('Cambios detectados:', changes);
    
    // Si hay al menos un cambio, retornar true
    const hasChanges = Object.values(changes).some(changed => changed === true);
    console.log('¿Tiene cambios significativos?', hasChanges);
    
    return hasChanges;
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
      const externalId = String(orderData.ID || '');
      if (!externalId) {
        console.log('Ignorando registro sin ID:', orderData);
        continue; // Ignorar registros sin ID
      }
      
      console.log(`=== DEBUG: Procesando orden con ID externo: ${externalId} ===`);
      
      try {
        // Paso 1: Extraer y procesar datos del cliente
        console.log('Paso 1: Extrayendo datos del cliente');
        const customerData = this.extractCustomerData(orderData);
        customerData.company_id = companyId;
        console.log('Datos del cliente extraídos:', customerData);
        
        // Paso 2: Encontrar o crear el cliente
        console.log('Paso 2: Buscando o creando cliente');
        const customer = await customersDatabaseService.findOrCreateCustomer(customerData, companyId);
        if (!customer) {
          console.error('No se pudo procesar el cliente, saltando orden');
          continue; // Si no se pudo procesar el cliente, pasar al siguiente
        }
        console.log('Cliente procesado correctamente:', customer.id);
        
        // Paso 3: Extraer datos de la orden
        console.log('Paso 3: Extrayendo datos de la orden');
        const newOrderData = this.extractOrderData(orderData, customer.id);
        newOrderData.company_id = companyId;
        console.log('Datos de la orden extraídos:', newOrderData);
        
        // Paso 4: Verificar si la orden ya existe
        console.log('Paso 4: Verificando si la orden existe');
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

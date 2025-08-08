import BaseExcelService from './BaseExcelService';

// Tipos para el análisis de órdenes
export interface OrderData {
  id?: string | number;
  fecha?: string | Date;
  numeroGuia?: string;
  estatus?: string;
  tipoEnvio?: string;
  departamento?: string;
  ciudad?: string;
  transportadora?: string;
  valorCompra?: number | string;
  ganancia?: number | string;
  precioFlete?: number | string;
  costoDevolucionFlete?: number | string;
  [key: string]: any; // Para campos adicionales
}

// Enumeración para los estados de órdenes
export enum OrderStatus {
  DELIVERED = 'entregado',
  RETURNED = 'devolucion',
  CANCELED = 'cancelado',
  REJECTED = 'rechazado',
  IN_PROGRESS = 'en_proceso'
}

// Campos requeridos para el análisis de órdenes
export const requiredOrderFields = [
  'id', 'fecha', 'numeroGuia', 'estatus', 'tipoEnvio', 'departamento', 
  'ciudad', 'transportadora', 'valorCompra', 'ganancia', 'precioFlete', 'costoDevolucionFlete'
];

// Mapeo de nombres de columnas del Excel a los campos normalizados para órdenes
export const orderColumnMapping: Record<string, string> = {
  // Campos para órdenes
  'id': 'id', 'orden': 'id', 'orden_id': 'id', 'order_id': 'id', 'pedido': 'id', 'pedido_id': 'id',
  'fecha': 'fecha', 'date': 'fecha', 'fecha_orden': 'fecha', 'fecha_pedido': 'fecha',
  'guia': 'numeroGuia', 'numero_guia': 'numeroGuia', 'tracking': 'numeroGuia', 'guia_numero': 'numeroGuia',
  'NÚMERO GUIA': 'numeroGuia', 'NUMERO GUIA': 'numeroGuia',
  'estado': 'estatus', 'status': 'estatus', 'estatus': 'estatus',
  'tipo_envio': 'tipoEnvio', 'tipo_de_envio': 'tipoEnvio', 'shipping_type': 'tipoEnvio',
  'TIPO DE ENVIO': 'tipoEnvio',
  'departamento': 'departamento', 'depto': 'departamento', 'state': 'departamento', 'region': 'departamento',
  'DEPARTAMENTO DESTINO': 'departamento',
  'ciudad': 'ciudad', 'city': 'ciudad', 'municipio': 'ciudad',
  'CIUDAD DESTINO': 'ciudad',
  'transportadora': 'transportadora', 'carrier': 'transportadora', 'empresa_envio': 'transportadora',
  'valor': 'valorCompra', 'valor_compra': 'valorCompra', 'total': 'valorCompra', 'monto': 'valorCompra',
  'VALOR DE COMPRA EN PRODUCTOS': 'valorCompra',
  'ganancia': 'ganancia', 'profit': 'ganancia', 'utilidad': 'ganancia',
  'flete': 'precioFlete', 'precio_flete': 'precioFlete', 'costo_envio': 'precioFlete',
  'PRECIO FLETE': 'precioFlete',
  'devolucion': 'costoDevolucionFlete', 'costo_devolucion': 'costoDevolucionFlete', 'devolucion_flete': 'costoDevolucionFlete',
  'COSTO DEVOLUCION FLETE': 'costoDevolucionFlete'
};

// Tipos para los resultados del análisis de órdenes
export interface OrderAnalysisResult {
  totalOrders: number;
  totalValue: number;
  totalProfit: number;
  totalShippingCost: number;
  totalReturnCost: number;
  
  // Nuevas métricas financieras
  confirmedOrders: number;    // Órdenes entregadas
  confirmedValue: number;     // Valor de órdenes entregadas
  confirmedProfit: number;    // Ganancia de órdenes entregadas
  
  inProgressOrders: number;   // Órdenes en proceso
  inProgressValue: number;    // Valor de órdenes en proceso
  inProgressProfit: number;   // Ganancia potencial de órdenes en proceso
  
  returnedOrders: number;     // Órdenes devueltas
  returnedValue: number;      // Valor perdido por devoluciones
  returnedProfit: number;     // Ganancia perdida por devoluciones
  
  canceledOrders: number;     // Órdenes canceladas/rechazadas
  
  // Cálculos financieros
  netProfit: number;
  deliveryEfficiency: number;
  
  // Escenarios optimista y pesimista
  optimisticProfit: number;             // Ganancia total si todo se entrega
  optimisticGainFromInProgress: number;  // Ganancia adicional si todas las órdenes en proceso se entregan
  pessimisticProfit: number;            // Ganancia neta resultante si todas las órdenes en proceso se devuelven
  pessimisticLoss: number;              // Costo adicional si todas las órdenes en proceso se devuelven
  potentialReturnCost: number;          // Costo potencial de devolución de órdenes en proceso
  
  // Datos agrupados para gráficos
  groupField: string;
  groupedData: Record<string, number>;
  statusDistribution: Record<string, number>;
  shippingTypeDistribution: Record<string, number>;
  regionDistribution: Record<string, number>;
  carrierDistribution: Record<string, number>;
  carrierShippingCosts: Record<string, number>;
  carrierReturnCosts: Record<string, number>;
  carrierEfficiency: Record<string, number>;
}

/**
 * Servicio especializado para el análisis de órdenes
 */
class OrdersAnalysisService extends BaseExcelService {
  /**
   * Normaliza los nombres de las columnas específicamente para datos de órdenes
   */
  public normalizeOrderData(data: any[]): any[] {
    return this.normalizeColumnNames(data, orderColumnMapping);
  }

  /**
   * Determina el estado de una orden según su campo estatus
   */
  private getOrderStatus(status: any): OrderStatus {
    if (!status) return OrderStatus.IN_PROGRESS;
    
    const statusStr = String(status).toUpperCase();
    
    // Verificar si es cancelado o rechazado
    if (statusStr.includes('CANCEL') || statusStr === 'CANCELADO' || statusStr === 'CANCELADA') {
      return OrderStatus.CANCELED;
    }
    
    if (statusStr.includes('RECHAZ') || statusStr === 'RECHAZADO' || statusStr === 'RECHAZADA') {
      return OrderStatus.REJECTED;
    }
    
    // Verificar si es una devolución
    if (statusStr === 'DEVOLUCION' || statusStr === 'DEVOLUCIÓN' || statusStr.includes('DEVOL')) {
      return OrderStatus.RETURNED;
    }
    
    // Verificar si está entregado
    if (statusStr.includes('ENTREG') || statusStr === 'ENTREGADO' || statusStr === 'ENTREGADA') {
      return OrderStatus.DELIVERED;
    }
    
    // Por defecto, consideramos que está en proceso
    return OrderStatus.IN_PROGRESS;
  }

  /**
   * Analiza los datos de órdenes para calcular totales y distribuciones
   */
  public analyzeOrdersData(data: any[]): OrderAnalysisResult {
    if (!data || data.length === 0) {
      return {
        totalOrders: 0,
        totalValue: 0,
        totalProfit: 0,
        totalShippingCost: 0,
        totalReturnCost: 0,
        confirmedOrders: 0,
        confirmedValue: 0,
        confirmedProfit: 0,
        inProgressOrders: 0,
        inProgressValue: 0,
        inProgressProfit: 0,
        returnedOrders: 0,
        returnedValue: 0,
        returnedProfit: 0,
        canceledOrders: 0,
        netProfit: 0,
        deliveryEfficiency: 0,
        // Escenarios optimista y pesimista
        optimisticProfit: 0,
        optimisticGainFromInProgress: 0,
        pessimisticProfit: 0,
        pessimisticLoss: 0,
        potentialReturnCost: 0,
        groupField: 'departamento',
        groupedData: {},
        statusDistribution: {},
        shippingTypeDistribution: {},
        regionDistribution: {},
        carrierDistribution: {},
        carrierShippingCosts: {},
        carrierReturnCosts: {},
        carrierEfficiency: {}
      };
    }
    
    console.log('Analizando datos de órdenes, muestra:', data[0]);
    
    // Asegurar que los datos estén normalizados
    const normalizedData = this.normalizeOrderData(data);
    
    // Métricas totales
    let totalValue = 0;
    let totalProfit = 0;
    let totalShippingCost = 0;
    let totalReturnCost = 0;
    
    // Métricas por estado
    let confirmedOrders = 0;
    let confirmedValue = 0;
    let confirmedProfit = 0;
    
    let inProgressOrders = 0;
    let inProgressValue = 0;
    let inProgressProfit = 0;
    
    let returnedOrders = 0;
    let returnedValue = 0;
    let returnedProfit = 0;
    
    let canceledOrders = 0;
    
    // Métricas por transportadora
    const carrierStats: Record<string, {
      total: number,
      delivered: number,
      returned: number,
      shippingCost: number,
      returnCost: number
    }> = {};
    
    // Distribuciones para análisis
    const statusDistribution: Record<string, number> = {};
    const shippingTypeDistribution: Record<string, number> = {};
    const regionDistribution: Record<string, number> = {};
    const carrierDistribution: Record<string, number> = {};
    const carrierShippingCosts: Record<string, number> = {};
    const carrierReturnCosts: Record<string, number> = {};
    
    // Analizar cada orden
    normalizedData.forEach((order, index) => {
      if (index === 0) {
        console.log('Procesando primera orden normalizada:', order);
      }
      
      // Obtener valores principales
      const orderStatus = this.getOrderStatus(order.estatus);
      const value = order.valorCompra ? this.extractNumber(order.valorCompra) : 0;
      const shippingCost = order.precioFlete ? this.extractNumber(order.precioFlete) : 0;
      const returnCost = order.costoDevolucionFlete ? this.extractNumber(order.costoDevolucionFlete) : 0;
      const providerPrice = order['TOTAL EN PRECIOS DE PROVEEDOR'] ? 
        this.extractNumber(order['TOTAL EN PRECIOS DE PROVEEDOR']) : 
        (order['precioProveedor'] ? this.extractNumber(order['precioProveedor']) : 0);
      
      // Calcular ganancia
      let profit = 0;
      
      if (orderStatus === OrderStatus.IN_PROGRESS && (!order.ganancia || order.ganancia.toString().trim() === "")) {
        // Calcular ganancia con la fórmula: GANANCIA = VALOR DE COMPRA - PRECIO PROVEEDOR - FLETE
        profit = value - providerPrice - shippingCost;
        console.log(`Calculando ganancia para orden en proceso: ${order.id || index}`);
        console.log(`Valor: ${value} - Precio proveedor: ${providerPrice} - Flete: ${shippingCost} = Ganancia: ${profit}`);
      } else {
        // Si ya tiene ganancia definida, usarla
        profit = order.ganancia ? this.extractNumber(order.ganancia) : 0;
      }
      
      // Registro de estado en la distribución
      if (order.estatus) {
        const status = String(order.estatus || 'Sin estado');
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      }
      
      // Registrar transportadora
      const carrier = order.transportadora ? String(order.transportadora) : 'Sin transportadora';
      
      // Inicializar estadísticas de transportadora si no existe
      if (!carrierStats[carrier]) {
        carrierStats[carrier] = {
          total: 0,
          delivered: 0,
          returned: 0,
          shippingCost: 0,
          returnCost: 0
        };
      }
      
      // Procesar según el estado de la orden
      switch (orderStatus) {
        case OrderStatus.CANCELED:
        case OrderStatus.REJECTED:
          // Las órdenes canceladas o rechazadas no generan ni valor ni costos
          canceledOrders++;
          break;
          
        case OrderStatus.DELIVERED:
          // Órdenes entregadas: generan valor, ganancia y costos de flete
          confirmedOrders++;
          confirmedValue += value;
          confirmedProfit += profit;
          totalValue += value;
          totalProfit += profit;
          totalShippingCost += shippingCost;
          
          // Registrar en la transportadora
          carrierStats[carrier].total++;
          carrierStats[carrier].delivered++;
          carrierStats[carrier].shippingCost += shippingCost;
          carrierShippingCosts[carrier] = (carrierShippingCosts[carrier] || 0) + shippingCost;
          break;
          
        case OrderStatus.RETURNED:
          // Órdenes devueltas: generan costos de devolución pero no valor ni ganancia
          returnedOrders++;
          returnedValue += value;      // Valor que se perdió
          returnedProfit += profit;    // Ganancia que se perdió
          totalReturnCost += returnCost;
          
          // Registrar en la transportadora
          carrierStats[carrier].total++;
          carrierStats[carrier].returned++;
          carrierStats[carrier].returnCost += returnCost;
          carrierReturnCosts[carrier] = (carrierReturnCosts[carrier] || 0) + returnCost;
          break;
          
        case OrderStatus.IN_PROGRESS:
          // Órdenes en proceso: generan costos de flete pero valor y ganancia están pendientes
          inProgressOrders++;
          inProgressValue += value;    // Valor potencial
          inProgressProfit += profit;  // Ganancia potencial
          totalShippingCost += shippingCost;
          
          // Registrar en la transportadora
          carrierStats[carrier].total++;
          carrierStats[carrier].shippingCost += shippingCost;
          carrierShippingCosts[carrier] = (carrierShippingCosts[carrier] || 0) + shippingCost;
          break;
      }
      
      // Registrar en distribuciones generales
      if (order.tipoEnvio) {
        const type = String(order.tipoEnvio || 'Sin tipo');
        shippingTypeDistribution[type] = (shippingTypeDistribution[type] || 0) + 1;
      }
      
      if (order.departamento) {
        const region = String(order.departamento || 'Sin departamento');
        regionDistribution[region] = (regionDistribution[region] || 0) + 1;
      }
      
      if (order.transportadora) {
        carrierDistribution[carrier] = (carrierDistribution[carrier] || 0) + 1;
      }
    });
    
    // Calcular eficiencia por transportadora
    const carrierEfficiency: Record<string, number> = {};
    Object.keys(carrierStats).forEach(carrier => {
      const stats = carrierStats[carrier];
      // Eficiencia = órdenes entregadas / total órdenes con guía (excluyendo canceladas/rechazadas)
      if (stats.total > 0) {
        carrierEfficiency[carrier] = (stats.delivered / stats.total) * 100;
      } else {
        carrierEfficiency[carrier] = 0;
      }
    });
    
    // Calcular eficiencia general de entrega
    const totalWithTracking = confirmedOrders + inProgressOrders + returnedOrders;
    const deliveryEfficiency = totalWithTracking > 0 ? (confirmedOrders / totalWithTracking) * 100 : 0;
    
    // Calcular ganancia neta (confirmada - costos de devolución)
    const netProfit = confirmedProfit - totalReturnCost;
    
    // Calcular escenarios optimista y pesimista
    // Escenario optimista: Si todas las órdenes en proceso se entregan
    const optimisticProfit = confirmedProfit + inProgressProfit - totalReturnCost;
    const optimisticGainFromInProgress = inProgressProfit; // Ganancia adicional por órdenes en proceso
    
    // Para el escenario pesimista, estimamos el costo de devolución para órdenes en proceso
    // Calculamos un costo promedio de devolución por orden si hay devoluciones, o usamos el costo de flete si no hay datos
    let avgReturnCost = 0;
    if (returnedOrders > 0) {
      avgReturnCost = totalReturnCost / returnedOrders;
    } else if (confirmedOrders + inProgressOrders > 0) {
      avgReturnCost = totalShippingCost / (confirmedOrders + inProgressOrders); // Usamos el costo promedio de flete como aproximación
    }
    
    const potentialReturnCost = avgReturnCost * inProgressOrders;
    const pessimisticProfit = confirmedProfit - totalReturnCost - potentialReturnCost; // Ganancia si todo se devuelve
    const pessimisticLoss = potentialReturnCost; // Costo adicional por devoluciones en proceso
    
    // Determinar el campo de agrupación y los datos agrupados
    let groupField = 'estatus';
    let groupedData = {...statusDistribution};
    
    if (Object.keys(regionDistribution).length > 0) {
      groupField = 'departamento';
      groupedData = {...regionDistribution};
    }
    
    if (Object.keys(carrierDistribution).length > 0) {
      groupField = 'transportadora';
      groupedData = {...carrierDistribution};
    }
    
    // Ordenar los datos agrupados por cantidad (descendente)
    const sortedGroupedData = Object.fromEntries(
      Object.entries(groupedData).sort(([, a], [, b]) => b - a)
    );
    
    // Actualizar valores totales para compatibilidad con código existente
    totalValue = confirmedValue + inProgressValue;
    totalProfit = confirmedProfit + inProgressProfit;
    
    const result: OrderAnalysisResult = {
      // Métricas antiguas para compatibilidad
      totalOrders: normalizedData.length,
      totalValue,
      totalProfit,
      totalShippingCost,
      totalReturnCost,
      
      // Nuevas métricas detalladas
      confirmedOrders,
      confirmedValue,
      confirmedProfit,
      inProgressOrders,
      inProgressValue,
      inProgressProfit,
      returnedOrders,
      returnedValue,
      returnedProfit,
      canceledOrders,
      netProfit,
      deliveryEfficiency,
      
      // Escenarios optimista y pesimista
      optimisticProfit,
      optimisticGainFromInProgress,
      pessimisticProfit,
      pessimisticLoss,
      potentialReturnCost,
      
      // Distribuciones y agrupaciones
      groupField,
      groupedData: sortedGroupedData,
      statusDistribution,
      shippingTypeDistribution,
      regionDistribution,
      carrierDistribution,
      carrierShippingCosts,
      carrierReturnCosts,
      carrierEfficiency
    };
    
    console.log('Resultado del análisis de órdenes:', result);
    return result;
  }
}

export default new OrdersAnalysisService();

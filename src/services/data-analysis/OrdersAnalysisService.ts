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
  groupField: string;
  groupedData: Record<string, number>;
  statusDistribution?: Record<string, number>;
  shippingTypeDistribution?: Record<string, number>;
  regionDistribution?: Record<string, number>;
  carrierDistribution?: Record<string, number>;
  carrierShippingCosts?: Record<string, number>; // Costo de flete por transportadora
  carrierReturnCosts?: Record<string, number>; // Costo de devolución por transportadora
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
        groupField: 'departamento',
        groupedData: {},
        statusDistribution: {},
        shippingTypeDistribution: {},
        regionDistribution: {},
        carrierDistribution: {},
        carrierShippingCosts: {},
        carrierReturnCosts: {}
      };
    }
    
    console.log('Analizando datos de órdenes, muestra:', data[0]);
    
    // Asegurar que los datos estén normalizados
    const normalizedData = this.normalizeOrderData(data);
    
    let totalValue = 0;
    let totalProfit = 0;
    let totalShippingCost = 0;
    let totalReturnCost = 0;
    
    // Distribuciones para análisis
    const statusDistribution: Record<string, number> = {};
    const shippingTypeDistribution: Record<string, number> = {};
    const regionDistribution: Record<string, number> = {};
    const carrierDistribution: Record<string, number> = {};
    const carrierShippingCosts: Record<string, number> = {}; // Costos de flete por transportadora
    const carrierReturnCosts: Record<string, number> = {}; // Costos de devolución por transportadora
    
    // Analizar cada orden
    normalizedData.forEach((order, index) => {
      if (index === 0) {
        console.log('Procesando primera orden normalizada:', order);
      }
      
      // Determinar si la orden es una devolución
      const isReturnOrder = order.estatus && 
        (String(order.estatus).toUpperCase() === 'DEVOLUCION' || 
         String(order.estatus).toUpperCase() === 'DEVOLUCIÓN' ||
         String(order.estatus).toUpperCase().includes('DEVOL'));
      
      // Sumar valores numéricos
      if (order.valorCompra) {
        const value = this.extractNumber(order.valorCompra);
        if (!isNaN(value)) {
          totalValue += value;
        }
      }
      
      if (order.ganancia) {
        const profit = this.extractNumber(order.ganancia);
        if (!isNaN(profit)) {
          totalProfit += profit;
        }
      }
      
      // Para órdenes normales, sumar el precio del flete
      // Para devoluciones, no sumar el precio del flete (se usará el costo de devolución)
      if (!isReturnOrder && order.precioFlete) {
        const shippingCost = this.extractNumber(order.precioFlete);
        if (!isNaN(shippingCost)) {
          totalShippingCost += shippingCost;
          
          // Acumular el costo de flete por transportadora
          if (order.transportadora) {
            const carrier = String(order.transportadora || 'Sin transportadora');
            carrierShippingCosts[carrier] = (carrierShippingCosts[carrier] || 0) + shippingCost;
          }
        }
      }
      
      // Sumar el costo de devolución solo para órdenes con estado de devolución
      if (isReturnOrder && order.costoDevolucionFlete) {
        const returnCost = this.extractNumber(order.costoDevolucionFlete);
        if (!isNaN(returnCost)) {
          totalReturnCost += returnCost;
          
          // Acumular el costo de devolución por transportadora
          if (order.transportadora) {
            const carrier = String(order.transportadora || 'Sin transportadora');
            carrierReturnCosts[carrier] = (carrierReturnCosts[carrier] || 0) + returnCost;
          }
        }
      }
      
      // Contar distribuciones
      if (order.estatus) {
        const status = String(order.estatus || 'Sin estado');
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      }
      
      if (order.tipoEnvio) {
        const type = String(order.tipoEnvio || 'Sin tipo');
        shippingTypeDistribution[type] = (shippingTypeDistribution[type] || 0) + 1;
      }
      
      if (order.departamento) {
        const region = String(order.departamento || 'Sin departamento');
        regionDistribution[region] = (regionDistribution[region] || 0) + 1;
      }
      
      if (order.transportadora) {
        const carrier = String(order.transportadora || 'Sin transportadora');
        carrierDistribution[carrier] = (carrierDistribution[carrier] || 0) + 1;
      }
    });
    
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
    
    const result: OrderAnalysisResult = {
      totalOrders: normalizedData.length,
      totalValue,
      totalProfit,
      totalShippingCost,
      totalReturnCost,
      groupField,
      groupedData: sortedGroupedData,
      statusDistribution,
      shippingTypeDistribution,
      regionDistribution,
      carrierDistribution,
      carrierShippingCosts,
      carrierReturnCosts
    };
    
    console.log('Resultado del análisis de órdenes:', result);
    return result;
  }
}

export default new OrdersAnalysisService();

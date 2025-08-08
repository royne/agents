import { OrderStatus } from './OrdersAnalysisService';

export interface MovementOrder {
  ID?: string;
  ESTATUS?: string;
  estado?: string;
  TRANSPORTADORA?: string;
  transportadora?: string;
  "DEPARTAMENTO DESTINO"?: string;
  departamento?: string;
  "CIUDAD DESTINO"?: string;
  ciudad?: string;
  "VALOR DE COMPRA EN PRODUCTOS"?: string | number;
  precio?: string | number;
  "PRECIO FLETE"?: string | number;
  precioFlete?: string | number;
  flete?: string | number;
  "TOTAL EN PRECIOS DE PROVEEDOR"?: string | number;
  precioProveedor?: string | number;
  ganancia?: string | number;
  calculatedProfit?: number;
  "ÚLTIMO MOVIMIENTO"?: string;
  "ULTIMO MOVIMIENTO"?: string;
  "CONCEPTO ULTIMO MOVIMIENTO"?: string;
  "NOMBRE CLIENTE"?: string;
  "TELÉFONO"?: string;
  "TELEFONO"?: string;
  "NÚMERO GUIA"?: string;
  "NUMERO GUIA"?: string;
  "DIRECCION"?: string;
  "FECHA"?: string;
  "FECHA DE ÚLTIMO MOVIMIENTO"?: string;
  "FECHA DE ULTIMO MOVIMIENTO"?: string;
  "HORA DE ÚLTIMO MOVIMIENTO"?: string;
  "HORA DE ULTIMO MOVIMIENTO"?: string;
  "FECHA GENERACION DE GUIA"?: string;
  "FUE SOLUCIONADA LA NOVEDAD"?: string;
  "TIPO DE ENVIO"?: string;
  [key: string]: any;
}

export interface MovementAnalysisResult {
  ordersInMovement: MovementOrder[];
  totalValue: number;
  totalShippingCost: number;
  totalProviderCost: number;
  potentialProfit: number;
  carriers: Set<string>;
  regions: Set<string>;
  ordersByStatus: Record<string, MovementOrder[]>;
  ordersByCarrier: Record<string, MovementOrder[]>;
  ordersByRegion: Record<string, MovementOrder[]>;
}

export class OrdersMovementService {
  /**
   * Analiza datos de órdenes y filtra solo las que están en movimiento
   */
  public analyzeMovementOrders(data: any[]): MovementAnalysisResult {
    if (!data || data.length === 0) {
      return this.getEmptyResult();
    }

    // Filtrar órdenes en movimiento
    const ordersInMovement = data.filter(order => {
      // Usamos ESTATUS si existe, sino recurrimos a estado
      const status = (order.ESTATUS || order.estado || '').toUpperCase();
      // Consideramos en movimiento si no es entregado, cancelado, devuelto o rechazado
      return !status.includes('ENTREG') && 
             !status.includes('CANCEL') && 
             !status.includes('DEVOL') && 
             !status.includes('RECHAZ');
    });

    if (ordersInMovement.length === 0) {
      return this.getEmptyResult();
    }

    // Inicializar resultado
    const result: MovementAnalysisResult = {
      ordersInMovement,
      totalValue: 0,
      totalShippingCost: 0,
      totalProviderCost: 0,
      potentialProfit: 0,
      carriers: new Set<string>(),
      regions: new Set<string>(),
      ordersByStatus: {},
      ordersByCarrier: {},
      ordersByRegion: {}
    };

    // Procesar cada orden
    ordersInMovement.forEach(order => {
      // Normalizar nombres de campos usando las claves según la estructura de datos
      const status = order.ESTATUS || order.estado || 'Sin estado';
      const carrier = order.TRANSPORTADORA || order.transportadora || 'Sin transportadora';
      const region = order["DEPARTAMENTO DESTINO"] || order.departamento || 
                     order["CIUDAD DESTINO"] || order.ciudad || 'Sin región';
      
      // Valores financieros
      const orderValue = parseFloat(order["VALOR DE COMPRA EN PRODUCTOS"] || order.precio || 0) || 0;
      const shippingCost = parseFloat(order["PRECIO FLETE"] || order.precioFlete || order.flete || 0) || 0;
      const providerPrice = parseFloat(order["TOTAL EN PRECIOS DE PROVEEDOR"] || order.precioProveedor || 0) || 0;
      
      // Calcular ganancia potencial
      const profit = parseFloat(order.ganancia || 0) || (orderValue - providerPrice - shippingCost);
      
      // Acumular totales
      result.totalValue += orderValue;
      result.totalShippingCost += shippingCost;
      result.totalProviderCost += providerPrice;
      result.potentialProfit += profit;
      
      // Guardar transportadoras y regiones únicas
      if (carrier && carrier !== 'Sin transportadora') result.carriers.add(carrier);
      if (region && region !== 'Sin región') result.regions.add(region);
      
      // Agregar la ganancia calculada a la orden
      const orderWithProfit = { ...order, calculatedProfit: profit };
      
      // Agrupar por estado
      if (!result.ordersByStatus[status]) {
        result.ordersByStatus[status] = [];
      }
      result.ordersByStatus[status].push(orderWithProfit);
      
      // Agrupar por transportadora
      if (!result.ordersByCarrier[carrier]) {
        result.ordersByCarrier[carrier] = [];
      }
      result.ordersByCarrier[carrier].push(orderWithProfit);
      
      // Agrupar por región
      if (!result.ordersByRegion[region]) {
        result.ordersByRegion[region] = [];
      }
      result.ordersByRegion[region].push(orderWithProfit);
    });

    return result;
  }

  /**
   * Determina el estado de una orden basado en su campo de estado
   */
  public getOrderStatus(status: any): string {
    if (!status) return 'En Proceso';
    
    const statusStr = String(status).toUpperCase();
    
    if (statusStr.includes('CANCEL') || statusStr === 'CANCELADO' || statusStr === 'CANCELADA') {
      return 'Cancelado';
    }
    
    if (statusStr.includes('RECHAZ') || statusStr === 'RECHAZADO' || statusStr === 'RECHAZADA') {
      return 'Rechazado';
    }
    
    if (statusStr === 'DEVOLUCION' || statusStr === 'DEVOLUCIÓN' || statusStr.includes('DEVOL')) {
      return 'Devolución';
    }
    
    if (statusStr.includes('ENTREG') || statusStr === 'ENTREGADO' || statusStr === 'ENTREGADA') {
      return 'Entregado';
    }
    
    return 'En Proceso';
  }

  /**
   * Retorna un resultado vacío para casos donde no hay datos
   */
  private getEmptyResult(): MovementAnalysisResult {
    return {
      ordersInMovement: [],
      totalValue: 0,
      totalShippingCost: 0,
      totalProviderCost: 0,
      potentialProfit: 0,
      carriers: new Set<string>(),
      regions: new Set<string>(),
      ordersByStatus: {},
      ordersByCarrier: {},
      ordersByRegion: {}
    };
  }
}

export default new OrdersMovementService();

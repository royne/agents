import { OrderStatus } from './OrdersAnalysisService';

export type MovementAgeBucket = '<12h' | '12-24h' | '24-48h' | '48-72h' | '>72h' | 'sin';
export type MovementAgeSeverity = 'normal' | 'warn' | 'danger' | 'none';

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

  // Campos calculados para antigüedad
  lastMovementAt?: string; // ISO string para facilitar render/serialización
  hoursSince?: number; // Diferencia en horas desde ahora
  daysSince?: number; // Diferencia en días desde ahora
  ageLabel?: string; // Ej: "5h" | "2d 3h"
  ageBucket?: MovementAgeBucket;
  ageSeverity?: MovementAgeSeverity;
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
  // Agrupación por antigüedad
  ordersByAge: Record<MovementAgeBucket, MovementOrder[]>;
  ageBucketsCount: Record<MovementAgeBucket, number>;
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
      ordersInMovement: [],
      totalValue: 0,
      totalShippingCost: 0,
      totalProviderCost: 0,
      potentialProfit: 0,
      carriers: new Set<string>(),
      regions: new Set<string>(),
      ordersByStatus: {},
      ordersByCarrier: {},
      ordersByRegion: {},
      ordersByAge: {
        '<12h': [],
        '12-24h': [],
        '24-48h': [],
        '48-72h': [],
        '>72h': [],
        'sin': [],
      },
      ageBucketsCount: {
        '<12h': 0,
        '12-24h': 0,
        '24-48h': 0,
        '48-72h': 0,
        '>72h': 0,
        'sin': 0,
      }
    };

    // Procesar cada orden
    const now = new Date();
    const enrichedOrders: MovementOrder[] = [];
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

      // Calcular antigüedad desde el último movimiento
      const lastAtDate = this.parseLastMovementDate(order);
      let hoursSince = undefined as number | undefined;
      let daysSince = undefined as number | undefined;
      let ageLabel = 'N/A';
      let ageBucket: MovementAgeBucket = 'sin';
      let ageSeverity: 'normal' | 'warn' | 'danger' | 'none' = 'none';
      let lastMovementAtISO: string | undefined = undefined;
      if (lastAtDate && !isNaN(lastAtDate.getTime())) {
        // Si la fecha del último movimiento es futura por errores de origen, acotar a ahora
        const effectiveLast = lastAtDate.getTime() > now.getTime() ? now : lastAtDate;
        const diffMs = Math.max(0, now.getTime() - effectiveLast.getTime());
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffHours / 24;
        hoursSince = Math.floor(diffHours);
        daysSince = Math.floor(diffDays);
        ageLabel = this.formatAgeLabel(diffHours);
        ageBucket = this.getAgeBucket(diffHours);
        ageSeverity = ageBucket === '>72h' ? 'danger' : (ageBucket === '48-72h' ? 'warn' : 'normal');
        lastMovementAtISO = effectiveLast.toISOString();
      }
      
      // Acumular totales
      result.totalValue += orderValue;
      result.totalShippingCost += shippingCost;
      result.totalProviderCost += providerPrice;
      result.potentialProfit += profit;
      
      // Guardar transportadoras y regiones únicas
      if (carrier && carrier !== 'Sin transportadora') result.carriers.add(carrier);
      if (region && region !== 'Sin región') result.regions.add(region);
      
      // Agregar campos calculados a la orden
      const orderWithProfit: MovementOrder = { 
        ...order, 
        calculatedProfit: profit,
        lastMovementAt: lastMovementAtISO,
        hoursSince,
        daysSince,
        ageLabel,
        ageBucket,
        ageSeverity,
      };
      
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

      // Agrupar por antigüedad
      result.ordersByAge[ageBucket].push(orderWithProfit);
      result.ageBucketsCount[ageBucket] = (result.ageBucketsCount[ageBucket] || 0) + 1;

      // Acumular orden enriquecida para el listado principal
      enrichedOrders.push(orderWithProfit);
    });

    // Asignar las órdenes enriquecidas al resultado principal
    result.ordersInMovement = enrichedOrders;

    // Log simple para validar conteos de antigüedad en desarrollo
    try {
      // eslint-disable-next-line no-console
    } catch {}

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
   * Intenta construir un Date a partir de las columnas de fecha/hora de último movimiento.
   * Usa como fuentes: "FECHA DE ÚLTIMO MOVIMIENTO" | "FECHA DE ULTIMO MOVIMIENTO" | "FECHA"
   * y "HORA DE ÚLTIMO MOVIMIENTO" | "HORA DE ULTIMO MOVIMIENTO" | "HORA"
   */
  private parseLastMovementDate(order: MovementOrder): Date | null {
    const rawDate = order["FECHA DE ÚLTIMO MOVIMIENTO"] || order["FECHA DE ULTIMO MOVIMIENTO"] || order["FECHA"];
    const rawTime = order["HORA DE ÚLTIMO MOVIMIENTO"] || order["HORA DE ULTIMO MOVIMIENTO"] || order["HORA"];
    const rawCombined = order["ÚLTIMO MOVIMIENTO"] || order["ULTIMO MOVIMIENTO"];

    // 1) Intentar parsear campo combinado si existe (puede incluir fecha y hora)
    if (rawCombined) {
      const dtFromCombined = this.parseCombinedDateTime(String(rawCombined));
      if (dtFromCombined) return dtFromCombined;
    }

    // 2) Intentar con columnas separadas
    const baseDate = this.parseDate(rawDate);
    if (!baseDate) {
      // Depuración: si había strings pero no se pudo parsear
      if ((rawDate && String(rawDate).trim()) || (rawTime && String(rawTime).trim())) {
        try { console.warn('[OrdersMovementService] No se pudo parsear fecha/hora separadas', { rawDate, rawTime }); } catch {}
      }
      return null;
    }

    const time = this.parseTime(rawTime);
    if (time) {
      baseDate.setHours(time.hours, time.minutes || 0, 0, 0);
    } else {
      // Si no hay hora, fijar mediodía para evitar zonas horarias que resten un día
      baseDate.setHours(12, 0, 0, 0);
    }
    return baseDate;
  }

  /**
   * Parsea fechas en formatos DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, números Excel o strings ISO.
   */
  private parseDate(value: any): Date | null {
    if (value === undefined || value === null) return null;
    // Si ya es Date
    if (value instanceof Date) return value;

    // Número estilo Excel (días desde 1900-01-01, con el bug del 1900)
    if (typeof value === 'number') {
      // Excel (Windows) serial date: day 1 = 1900-01-01
      const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // 1899-12-30
      const ms = value * 24 * 60 * 60 * 1000;
      return new Date(excelEpoch.getTime() + ms);
    }

    const str = String(value).trim();
    if (!str) return null;

    // Aceptar solo formatos ISO explícitos (YYYY-MM-DD...)
    if (/^\d{4}[-/]/.test(str)) {
      const isoTry = new Date(str);
      if (!isNaN(isoTry.getTime())) return isoTry;
    }

    // Normalizar separador
    const parts = str.replace(/\./g, '-').replace(/\//g, '-').split('-');
    if (parts.length === 3) {
      const [a, b, c] = parts.map(p => p.padStart(2, '0'));
      // yyyy-mm-dd
      if (a.length === 4) {
        const y = parseInt(a, 10);
        const m = parseInt(b, 10) - 1;
        const d = parseInt(c, 10);
        const dt = new Date(y, m, d);
        return isNaN(dt.getTime()) ? null : dt;
      }
      // dd-mm-yyyy o dd-mm-yy
      const d = parseInt(a, 10);
      const m = parseInt(b, 10) - 1;
      let y = parseInt(c, 10);
      if (c.length === 2) {
        y += y >= 70 ? 1900 : 2000; // heurística simple
      }
      const dt = new Date(y, m, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    return null;
  }

  /** Parsea horas en formato HH:mm o números fraccionales de día */
  private parseTime(value: any): { hours: number; minutes: number } | null {
    if (value === undefined || value === null) return null;
    if (typeof value === 'number') {
      const totalMinutes = Math.round(value * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return { hours, minutes };
    }
    const str = String(value).trim();
    if (!str) return null;
    const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      const hours = Math.max(0, Math.min(23, parseInt(match[1], 10)));
      const minutes = Math.max(0, Math.min(59, parseInt(match[2], 10)));
      return { hours, minutes };
    }
    return null;
  }

  /** Parsea una fecha y hora combinadas en un único string */
  private parseCombinedDateTime(value: string): Date | null {
    const str = value.trim();
    if (!str) return null;

    // Intento directo solo si parece ISO (YYYY-MM-DD...)
    if (/^\d{4}[-/]/.test(str)) {
      const direct = new Date(str);
      if (!isNaN(direct.getTime())) return direct;
    }

    // Normalizar separadores
    const normalized = str.replace(/\s+/g, ' ').replace(/[\.]/g, '-').replace(/[\/]/g, '-');

    // yyyy-mm-dd hh:mm(:ss)?
    let m = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
      const y = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10) - 1;
      const d = parseInt(m[3], 10);
      const hh = m[4] ? Math.min(23, parseInt(m[4], 10)) : 12;
      const mm = m[5] ? Math.min(59, parseInt(m[5], 10)) : 0;
      const ss = m[6] ? Math.min(59, parseInt(m[6], 10)) : 0;
      const dt = new Date(y, mo, d, hh, mm, ss, 0);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // dd-mm-yyyy hh:mm(:ss)?
    m = normalized.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
      const d = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10) - 1;
      let y = parseInt(m[3], 10);
      if (m[3].length === 2) y += y >= 70 ? 1900 : 2000;
      const hh = m[4] ? Math.min(23, parseInt(m[4], 10)) : 12;
      const mm = m[5] ? Math.min(59, parseInt(m[5], 10)) : 0;
      const ss = m[6] ? Math.min(59, parseInt(m[6], 10)) : 0;
      const dt = new Date(y, mo, d, hh, mm, ss, 0);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // No se pudo
    try { console.warn('[OrdersMovementService] No se pudo parsear campo combinado', value); } catch {}
    return null;
  }

  /** Clasifica por rangos de antigüedad */
  private getAgeBucket(hours: number): MovementAgeBucket {
    if (!isFinite(hours)) return 'sin';
    if (hours < 12) return '<12h';
    if (hours < 24) return '12-24h';
    if (hours < 48) return '24-48h';
    if (hours < 72) return '48-72h';
    return '>72h';
  }

  /** Construye etiqueta legible a partir de horas ("Xd Yh" o "Xh") */
  private formatAgeLabel(hours: number): string {
    if (!isFinite(hours)) return 'N/A';
    if (hours < 24) return `${Math.floor(hours)}h`;
    const d = Math.floor(hours / 24);
    const h = Math.floor(hours % 24);
    return `${d}d ${h}h`;
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
      ordersByRegion: {},
      ordersByAge: {
        '<12h': [],
        '12-24h': [],
        '24-48h': [],
        '48-72h': [],
        '>72h': [],
        'sin': [],
      },
      ageBucketsCount: {
        '<12h': 0,
        '12-24h': 0,
        '24-48h': 0,
        '48-72h': 0,
        '>72h': 0,
        'sin': 0,
      }
    };
  }
}

export default new OrdersMovementService();

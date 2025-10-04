import BaseExcelService from './BaseExcelService';

export interface DailyOrderUTMData {
  orderId?: string | number;
  fecha?: string | Date | number;
  productName?: string;
  totalPrice?: number | string;
  status?: string;
  utmCampaign?: string; // UTM campaign original
  utmTerm?: string;     // Según requerimiento: campaña
  utmContent?: string;  // Según requerimiento: anuncio
  [key: string]: any;
}

export interface CampaignSummary {
  totalOrders: number;
  totalValue: number;
  statusDistribution: Record<string, number>;
  statusValueDistribution?: Record<string, number>;
}

export interface TermSummary extends CampaignSummary {}
export interface AdSummary extends CampaignSummary {}

export interface DailyOrdersUTMResult {
  totalOrders: number;
  totalValue: number;
  // Distribución de estados agregada
  statusDistribution: Record<string, number>;
  statusValueDistribution?: Record<string, number>;
  // Resumen por campaña (utmCampaign)
  campaigns: Record<string, CampaignSummary>;
  // Resumen de terms por campaña (utmTerm dentro de cada utmCampaign)
  termsByCampaign: Record<string, Record<string, TermSummary>>;
  // Resumen de anuncios por term dentro de campaña (utmContent dentro de cada utmTerm)
  adsByCampaignTerm: Record<string, Record<string, Record<string, AdSummary>>>;
  // Tendencia diaria general
  dateTrend: { date: string; orders: number; value: number }[];
}

// Mapeo de columnas específicas para el Excel de POS con UTM
export const utmOrderColumnMapping: Record<string, string> = {
  // Identificadores
  'ID del pedido': 'orderId',
  'id del pedido': 'orderId',
  'pedido': 'orderId',
  'id': 'orderId',
  'order id': 'orderId',

  // Fecha de creación
  'Día de creación': 'fecha',
  'Dia de creación': 'fecha',
  'dia de creacion': 'fecha',
  'fecha': 'fecha',
  'created_at': 'fecha',
  'fecha de creación': 'fecha',

  // Producto y precio
  'Nombre del producto': 'productName',
  'nombre del producto': 'productName',
  'producto': 'productName',
  'Precio total': 'totalPrice',
  'precio total': 'totalPrice',
  'total': 'totalPrice',

  // Estado
  'Estado del pedido': 'status',
  'estado del pedido': 'status',
  'estado': 'status',

  // UTM
  'UTM campaign': 'utmCampaign',
  'utm campaign': 'utmCampaign',
  'utm_campaign': 'utmCampaign',
  'UTM term': 'utmTerm',
  'utm term': 'utmTerm',
  'utm_term': 'utmTerm',
  'UTM content': 'utmContent',
  'utm content': 'utmContent',
  'utm_content': 'utmContent'
};

class DailyOrdersUTMService extends BaseExcelService {
  public normalizeUTMOrders(data: any[]): DailyOrderUTMData[] {
    return this.normalizeColumnNames(data, utmOrderColumnMapping);
  }

  private normalizeStatus(raw: any): string {
    // Mapear exactamente a los estados del POS: Nuevo, Confirmado, Empacando, Cancelado, Abandonado
    // Aceptamos variaciones de mayúsculas/minúsculas y tildes, y también contemplamos "Devolución" si aparece.
    const s = (raw ?? '').toString().trim().toLowerCase();
    if (s.includes('cancel')) return 'Cancelado';
    if (s.includes('abandon')) return 'Abandonado';
    if (s.includes('empac')) return 'Empacando';
    if (s.includes('confirm')) return 'Confirmado';
    if (s.includes('nuevo')) return 'Nuevo';
    if (s.includes('devol')) return 'Devolución';
    // Si no se reconoce, devolvemos tal cual con capitalización básica
    if (s.length > 0) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    // Si viene vacío, por defecto usamos "Nuevo"
    return 'Nuevo';
  }

  private formatDate(rawDate: any): string {
    try {
      let parsed: Date | null = null;
      if (rawDate instanceof Date) {
        parsed = rawDate;
      } else if (typeof rawDate === 'number') {
        // Excel serial date
        if (rawDate > 1000) {
          const excelEpoch = new Date(1899, 11, 30);
          parsed = new Date(excelEpoch.getTime() + rawDate * 24 * 60 * 60 * 1000);
        } else {
          parsed = new Date(rawDate);
        }
      } else {
        const t = String(rawDate);
        const tryIso = new Date(t);
        if (!isNaN(tryIso.getTime())) {
          parsed = tryIso;
        } else {
          const parts = t.split(/[\/\-.]/);
          if (parts.length === 3) {
            if (parseInt(parts[0]) <= 31) {
              parsed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else {
              parsed = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
          }
        }
      }
      if (!parsed || isNaN(parsed.getTime())) return 'fecha-' + String(rawDate).substring(0, 10);
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      return 'fecha-' + String(rawDate).substring(0, 10);
    }
  }

  public analyze(data: any[]): DailyOrdersUTMResult {
    if (!data || data.length === 0) {
      return {
        totalOrders: 0,
        totalValue: 0,
        statusDistribution: {},
        statusValueDistribution: {},
        campaigns: {},
        termsByCampaign: {},
        adsByCampaignTerm: {},
        dateTrend: []
      };
    }

    const normalized = this.normalizeUTMOrders(data);

    let totalOrders = 0;
    let totalValue = 0;
    const statusDistribution: Record<string, number> = {};
    const statusValueDistribution: Record<string, number> = {};
    const campaigns: Record<string, CampaignSummary> = {};
    const termsByCampaign: Record<string, Record<string, TermSummary>> = {};
    const adsByCampaignTerm: Record<string, Record<string, Record<string, AdSummary>>> = {};
    const dateTrendMap = new Map<string, { date: string; orders: number; value: number }>();

    normalized.forEach((row) => {
      // 1) Saltar filas sin ID: si no trae id de ninguna clase (vacío), no se cuenta
      const hasId = (() => {
        const id = row.orderId;
        if (id === null || id === undefined) return false;
        if (typeof id === 'number') return true; // cualquier número es válido
        if (typeof id === 'string') return id.trim().length > 0; // string no vacío es válido
        return false;
      })();

      if (!hasId) {
        return; // saltar esta fila
      }

      totalOrders += 1;

      const price = row.totalPrice ? this.extractNumber(row.totalPrice) : 0;
      totalValue += price;

      const status = this.normalizeStatus(row.status);
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      statusValueDistribution[status] = (statusValueDistribution[status] || 0) + price;

      // 2) Jerarquía: Campaign (utmCampaign) -> Term (utmTerm) -> Content (utmContent)
      // Campaña: si no hay UTM campaign, usar categoría por producto
      const productName = (row.productName ?? '').toString().trim();
      const utmCampaign = (row.utmCampaign ?? '').toString().trim();
      const utmTerm = (row.utmTerm ?? '').toString().trim();
      const utmContent = (row.utmContent ?? '').toString().trim();
      const campaignName = utmCampaign.length > 0 ? utmCampaign : `Sin UTM - ${productName || 'Sin producto'}`;

      // Campañas
      if (!campaigns[campaignName]) {
        campaigns[campaignName] = { totalOrders: 0, totalValue: 0, statusDistribution: {}, statusValueDistribution: {} };
      }
      campaigns[campaignName].totalOrders += 1;
      campaigns[campaignName].totalValue += price;
      campaigns[campaignName].statusDistribution[status] = (campaigns[campaignName].statusDistribution[status] || 0) + 1;
      campaigns[campaignName].statusValueDistribution![status] = (campaigns[campaignName].statusValueDistribution![status] || 0) + price;

      // Terms por campaña
      const termName = utmTerm.length > 0 ? utmTerm : 'Sin término';
      if (!termsByCampaign[campaignName]) termsByCampaign[campaignName] = {};
      if (!termsByCampaign[campaignName][termName]) {
        termsByCampaign[campaignName][termName] = { totalOrders: 0, totalValue: 0, statusDistribution: {}, statusValueDistribution: {} };
      }
      const term = termsByCampaign[campaignName][termName];
      term.totalOrders += 1;
      term.totalValue += price;
      term.statusDistribution[status] = (term.statusDistribution[status] || 0) + 1;
      term.statusValueDistribution![status] = (term.statusValueDistribution![status] || 0) + price;

      // Ads por term dentro de campaña
      const adName = utmContent.length > 0 ? utmContent : 'Sin anuncio';
      if (!adsByCampaignTerm[campaignName]) adsByCampaignTerm[campaignName] = {};
      if (!adsByCampaignTerm[campaignName][termName]) adsByCampaignTerm[campaignName][termName] = {};
      if (!adsByCampaignTerm[campaignName][termName][adName]) {
        adsByCampaignTerm[campaignName][termName][adName] = { totalOrders: 0, totalValue: 0, statusDistribution: {}, statusValueDistribution: {} };
      }
      const ad = adsByCampaignTerm[campaignName][termName][adName];
      ad.totalOrders += 1;
      ad.totalValue += price;
      ad.statusDistribution[status] = (ad.statusDistribution[status] || 0) + 1;
      ad.statusValueDistribution![status] = (ad.statusValueDistribution![status] || 0) + price;

      // Tendencia diaria
      const dateStr = this.formatDate(row.fecha);
      if (!dateTrendMap.has(dateStr)) {
        dateTrendMap.set(dateStr, { date: dateStr, orders: 0, value: 0 });
      }
      const tr = dateTrendMap.get(dateStr)!;
      tr.orders += 1;
      tr.value += price;
    });

    const dateTrend = Array.from(dateTrendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalOrders,
      totalValue,
      statusDistribution,
      statusValueDistribution,
      campaigns: Object.fromEntries(
        Object.entries(campaigns).sort(([, a], [, b]) => (b.totalOrders - a.totalOrders))
      ),
      termsByCampaign: Object.fromEntries(
        Object.entries(termsByCampaign).map(([camp, terms]) => [
          camp,
          Object.fromEntries(Object.entries(terms).sort(([, a], [, b]) => (b.totalOrders - a.totalOrders)))
        ])
      ),
      adsByCampaignTerm: Object.fromEntries(
        Object.entries(adsByCampaignTerm).map(([camp, terms]) => [
          camp,
          Object.fromEntries(
            Object.entries(terms).map(([term, ads]) => [
              term,
              Object.fromEntries(Object.entries(ads).sort(([, a], [, b]) => (b.totalOrders - a.totalOrders)))
            ])
          )
        ])
      ),
      dateTrend
    };
  }
}

export default new DailyOrdersUTMService();

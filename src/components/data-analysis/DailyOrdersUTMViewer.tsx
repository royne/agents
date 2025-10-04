import React, { useEffect, useMemo, useState } from 'react';
import DailyOrdersUTMService, { DailyOrdersUTMResult } from '../../services/data-analysis/DailyOrdersUTMService';
import POSStatusDistributionChart from '../charts/POSStatusDistributionChart';
import OrdersDailyTrendChart from '../charts/OrdersDailyTrendChart';
import UTMCampaignsChart from '../charts/UTMCampaignsChart';
import UTMAdsChart from '../charts/UTMAdsChart';
import ProductCampaignTermChart from '../charts/ProductCampaignTermChart';

interface DailyOrdersUTMViewerProps {
  data: any[];
}

const DailyOrdersUTMViewer: React.FC<DailyOrdersUTMViewerProps> = ({ data }) => {
  const [result, setResult] = useState<DailyOrdersUTMResult | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');

  // Normalizar y analizar una sola vez para el dataset completo
  useEffect(() => {
    try {
      const analysis = DailyOrdersUTMService.analyze(data);
      setResult(analysis);
      setSelectedCampaign('');
      setSelectedTerm('');
    } catch (e) {
      console.error('Error analizando UTM diario:', e);
      setResult(null);
    }
  }, [data]);

  // Obtener listas de campañas y anuncios según selección
  const campaignOptions = useMemo(() => {
    if (!result) return [] as string[];
    return Object.keys(result.campaigns || {});
  }, [result]);

  const termOptions = useMemo(() => {
    if (!result || !selectedCampaign) return [] as string[];
    const terms = result.termsByCampaign[selectedCampaign] || {};
    return Object.keys(terms);
  }, [result, selectedCampaign]);

  // Normalizar todas las filas de entrada
  const normalizedAll = useMemo(() => {
    try {
      return DailyOrdersUTMService.normalizeUTMOrders(data);
    } catch {
      return [] as any[];
    }
  }, [data]);

  // Filas filtradas según selección de campaña/term
  const filteredRows = useMemo(() => {
    const rows = normalizedAll;
    if (!rows || rows.length === 0) return [] as any[];
    return rows.filter(r => {
      // Respetar regla: filas sin orderId no cuentan
      const id = r.orderId;
      const hasId = ((): boolean => {
        if (id === null || id === undefined) return false;
        if (typeof id === 'number') return true;
        if (typeof id === 'string') return id.trim().length > 0;
        return false;
      })();
      if (!hasId) return false;

      const camp = (r.utmCampaign ?? '').toString().trim();
      const term = (r.utmTerm ?? '').toString().trim();
      const product = (r.productName ?? '').toString().trim();
      const campaignName = camp.length > 0 ? camp : `Sin UTM - ${product || 'Sin producto'}`;
      const termName = term.length > 0 ? term : 'Sin término';
      if (selectedCampaign && campaignName !== selectedCampaign) return false;
      if (selectedTerm && termName !== selectedTerm) return false;
      return true;
    });
  }, [normalizedAll, selectedCampaign, selectedTerm]);

  // Recalcular análisis sobre las filas filtradas
  const filteredResult = useMemo(() => {
    if (!result) return null;
    try {
      const base = (!selectedCampaign && !selectedTerm) ? result : DailyOrdersUTMService.analyze(filteredRows);
      return base;
    } catch (e) {
      console.error('Error filtrando análisis UTM:', e);
      return result;
    }
  }, [result, filteredRows, selectedCampaign, selectedTerm]);

  if (!filteredResult) {
    return (
      <div className="p-8 text-center bg-theme-component rounded-lg">
        <p className="text-theme-secondary">No hay datos para analizar. Sube un archivo con columnas: ID del pedido, Día de creación, Nombre del producto, Precio total, Estado del pedido, UTM campaign, UTM term, UTM content.</p>
      </div>
    );
  }

  const totalOrders = filteredResult.totalOrders;

  // Desglose de estados POS
  const statusDist = filteredResult.statusDistribution || {};
  const sumBy = (needle: string) => Object.entries(statusDist)
    .filter(([k]) => k.toLowerCase().includes(needle))
    .reduce((s, [, v]) => s + (v as number), 0);

  const nuevos = sumBy('nuevo');
  const confirmados = sumBy('confirm');
  const empacando = sumBy('empac');
  const cancelados = sumBy('cancel');
  const abandonados = sumBy('abandon');
  const devoluciones = sumBy('devol');
  const efectivos = confirmados + empacando;
  const posibles = nuevos;

  // Porcentajes solicitados para la tarjeta "Valor Total"
  const denomSinAband = Math.max(0, totalOrders - abandonados);
  const inefectivos = cancelados + nuevos; // Cancelados + Nuevos
  const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);
  const pctEfectivosSinAband = pct(efectivos, denomSinAband); // Efectivos vs Total sin Abandonados
  const pctAbandonados = pct(abandonados, totalOrders); // Abandonados vs Total
  const pctInefectivos = pct(inefectivos, totalOrders); // (Cancelados + Nuevos) vs Total
  const pctCanceladosSinAband = pct(cancelados, denomSinAband); // Cancelados vs Total sin Abandonados

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="bg-theme-primary p-4 rounded-lg shadow mb-6 w-full">
        <h3 className="text-lg font-semibold mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-theme-secondary mb-1">Campaña (UTM campaign)</label>
            <select
              className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
              value={selectedCampaign}
              onChange={(e) => {
                setSelectedCampaign(e.target.value);
                setSelectedTerm('');
              }}
            >
              <option value="">Todas</option>
              {campaignOptions.map((c) => (
                <option key={c} value={c}>{c || 'Sin campaña'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-theme-secondary mb-1">Conjunto (UTM term)</label>
            <select
              className="w-full bg-theme-component border border-theme-border rounded px-3 py-2"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              disabled={!selectedCampaign}
            >
              <option value="">Todos</option>
              {termOptions.map((t) => (
                <option key={t} value={t}>{t || 'Sin término'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 w-full">
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-3">Total de Órdenes</h3>
          <p className="text-4xl font-bold text-primary-color">{totalOrders}</p>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-stretch justify-start h-full">
          <h3 className="text-lg font-semibold mb-3">Indicadores (%)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="rounded-md border border-green-600/30 bg-green-600/10 p-3">
              <div className="text-xs text-green-300 mb-1">Efectivos s/Total sin Aband.</div>
              <div className="text-2xl font-bold text-green-400">{pctEfectivosSinAband.toFixed(1)}%</div>
            </div>
            <div className="rounded-md border border-amber-600/30 bg-amber-600/10 p-3">
              <div className="text-xs text-amber-300 mb-1">Abandonados</div>
              <div className="text-2xl font-bold text-amber-400">{pctAbandonados.toFixed(1)}%</div>
            </div>
            <div className="rounded-md border border-orange-600/30 bg-orange-600/10 p-3">
              <div className="text-xs text-orange-300 mb-1">Inefectivos (Canc + Nuevo)</div>
              <div className="text-2xl font-bold text-orange-400">{pctInefectivos.toFixed(1)}%</div>
            </div>
            <div className="rounded-md border border-red-600/30 bg-red-600/10 p-3">
              <div className="text-xs text-red-300 mb-1">Cancelados s/Total sin Aband.</div>
              <div className="text-2xl font-bold text-red-400">{pctCanceladosSinAband.toFixed(1)}%</div>
            </div>
          </div>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-2">Efectivos (Conf + Emp)</h3>
          <p className="text-3xl font-bold text-green-500">{efectivos}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-300">Conf: {confirmados}</span>
            <span className="text-blue-300">Emp: {empacando}</span>
          </div>
        </div>
        <div className="bg-theme-primary p-6 rounded-lg shadow flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-2">Posibles (Nuevo)</h3>
          <p className="text-3xl font-bold text-blue-500">{posibles}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-amber-300">Aband: {abandonados}</span>
            <span className="text-orange-300">Canc: {cancelados}</span>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="bg-theme-primary p-6 rounded-lg shadow mt-6 w-full">
        <h3 className="text-xl font-semibold mb-4 text-center">Análisis Diario por UTM</h3>
        {/* Fila superior: izquierda distribución, derecha gráfico dinámico (campañas/conjuntos/anuncios) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <POSStatusDistributionChart statusDistribution={filteredResult.statusDistribution} />
          {!selectedCampaign ? (
            <UTMCampaignsChart campaigns={filteredResult.campaigns} title="Campañas (UTM campaign)" />
          ) : !selectedTerm ? (
            <UTMCampaignsChart 
              campaigns={(filteredResult.termsByCampaign[selectedCampaign] as unknown as Record<string, any>) || {}} 
              title={`Conjuntos (UTM term) de ${selectedCampaign}`}
            />
          ) : (
            <UTMAdsChart 
              ads={(filteredResult.adsByCampaignTerm[selectedCampaign]?.[selectedTerm]) || {}} 
              title={`Anuncios (UTM content) de ${selectedTerm}`}
            />
          )}
        </div>

        {/* Fila intermedia: contexto de campañas o mensaje */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {selectedCampaign ? (
            <UTMCampaignsChart campaigns={result?.campaigns || {}} title="Campañas (UTM campaign)" />
          ) : (
            <div className="bg-theme-component p-4 rounded-lg shadow h-40 flex items-center justify-center text-theme-secondary">
              <div className="text-center">
                <p className="mb-2">Selecciona una campaña para ver el rendimiento de sus anuncios.</p>
                <p className="text-sm">El bloque de la derecha arriba muestra el detalle por conjunto o anuncio según tu selección.</p>
              </div>
            </div>
          )}
        </div>

        {/* Fila inferior: tendencia diaria a ancho completo */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <OrdersDailyTrendChart data={filteredResult.dateTrend} />
        </div>

        {/* Gráfico por producto: campañas y conjuntos para el producto seleccionado */}
        <div className="grid grid-cols-1 gap-6">
          <ProductCampaignTermChart rows={filteredRows as any} />
        </div>
      </div>
    </div>
  );
};

export default DailyOrdersUTMViewer;

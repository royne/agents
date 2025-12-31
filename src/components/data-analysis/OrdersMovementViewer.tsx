import React, { useState, useEffect, useMemo } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

// Servicios
import ordersMovementService, { MovementAnalysisResult, MovementOrder, MovementAgeSeverity } from '../../services/data-analysis/OrdersMovementService';

// Componentes modularizados
import MovementSummaryCards from './orders-movement/MovementSummaryCards';
import MovementStatusTable from './orders-movement/MovementStatusTable';
import MovementOrdersTable from './orders-movement/MovementOrdersTable';
import MovementOrderDetailPanel from './orders-movement/MovementOrderDetailPanel';
import MovementStatusOrdersModal from './orders-movement/MovementStatusOrdersModal';
import MovementOrdersFilters, { OrdersFiltersValue } from './orders-movement/MovementOrdersFilters';
import MovementAgeAlertsPanel from './orders-movement/MovementAgeAlertsPanel';

interface OrdersMovementViewerProps {
  data: any[];
  summary?: any;
}

const OrdersMovementViewer: React.FC<OrdersMovementViewerProps> = ({ data, summary }) => {
  // Estados para el panel de detalle y análisis
  const [selectedOrder, setSelectedOrder] = useState<MovementOrder | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MovementAnalysisResult | null>(null);
  // Modal de órdenes por estado
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalName, setStatusModalName] = useState<string | null>(null);
  const [statusModalOrders, setStatusModalOrders] = useState<MovementOrder[]>([]);
  // Resaltado de fila dentro del modal de lista
  const [highlightedRowKey, setHighlightedRowKey] = useState<string | null>(null);
  // Filtros para la tabla de detalle
  const [filters, setFilters] = useState<OrdersFiltersValue>({ status: '', carrier: '', region: '', query: '', age: '', severity: '' });

  // Efecto para analizar los datos cuando cambian
  useEffect(() => {
    if (data && data.length > 0) {
      const result = ordersMovementService.analyzeMovementOrders(data);
      setAnalysisResult(result);
    } else {
      setAnalysisResult(null);
    }
  }, [data]);

  // Manejador para seleccionar una orden
  const handleOrderSelect = (order: MovementOrder) => {
    setSelectedOrder(order);
    setSidebarOpen(true);
  };

  // Clave estable para resaltar filas en el modal de lista
  const rowKeyFromOrder = (order: MovementOrder): string => {
    return String(
      order.ID ||
      order["NÚMERO GUIA"] ||
      order["NUMERO GUIA"] ||
      ''
    );
  };

  // Click en una fila de estado: abrir modal con el detalle de esas órdenes
  const handleStatusClick = (status: string, orders: MovementOrder[]) => {
    setStatusModalName(status);
    setStatusModalOrders(orders);
    setStatusModalOpen(true);
  };

  // Click en un rango de antigüedad
  const handleAgeBucketClick = (label: string, orders: MovementOrder[]) => {
    setStatusModalName(`Antigüedad: ${label}`);
    setStatusModalOrders(orders);
    setStatusModalOpen(true);
  };

  // Manejador para cerrar el panel lateral
  const handleClosePanel = () => {
    setSidebarOpen(false);
    setTimeout(() => {
      setSelectedOrder(null);
      setHighlightedRowKey(null); // Quitar resaltado al cerrar detalle
    }, 300); // Limpiar la orden seleccionada después de la animación
  };

  // Verificar si hay datos para analizar
 
  // Listas disponibles para filtros (deben declararse antes de cualquier return condicional)
  const availableStatuses = useMemo(() => Object.keys(analysisResult?.ordersByStatus || {}), [analysisResult]);
  const availableCarriers = useMemo(() => Array.from(analysisResult?.carriers || new Set<string>()), [analysisResult]);
  const availableRegions = useMemo(() => Array.from(analysisResult?.regions || new Set<string>()), [analysisResult]);

  // Órdenes filtradas para la sección de detalle (también antes de returns condicionales)
  const filteredOrders = useMemo(() => {
    if (!analysisResult) return [] as MovementOrder[];
    const q = filters.query.trim().toLowerCase();
    return analysisResult.ordersInMovement.filter((order) => {
      const status = (order.ESTATUS || order.estado || '');
      if (filters.status && status !== filters.status) return false;
      const carrier = (order.TRANSPORTADORA || order.transportadora || '');
      if (filters.carrier && carrier !== filters.carrier) return false;
      const region = (order["DEPARTAMENTO DESTINO"] || order.departamento || order["CIUDAD DESTINO"] || order.ciudad || '');
      if (filters.region && region !== filters.region) return false;
      if (filters.age && order.ageBucket !== filters.age) return false;
      if (filters.severity && (order.ageSeverity || 'none') !== filters.severity) return false;
      if (q) {
        const idStr = String(order.ID || '').toLowerCase();
        const client = String(order["NOMBRE CLIENTE"] || '').toLowerCase();
        if (!idStr.includes(q) && !client.includes(q)) return false;
      }
      return true;
    });
  }, [analysisResult, filters]);

  // Mapas de conteo para mostrar en opciones de filtros
  const statusesCount = useMemo(() => {
    const map: Record<string, number> = {};
    if (!analysisResult) return map;
    Object.entries(analysisResult.ordersByStatus || {}).forEach(([k, arr]) => {
      map[k] = arr.length;
    });
    return map;
  }, [analysisResult]);

  const carriersCount = useMemo(() => {
    const map: Record<string, number> = {};
    if (!analysisResult) return map;
    Object.entries(analysisResult.ordersByCarrier || {}).forEach(([k, arr]) => {
      map[k] = arr.length;
    });
    return map;
  }, [analysisResult]);

  const regionsCount = useMemo(() => {
    const map: Record<string, number> = {};
    if (!analysisResult) return map;
    Object.entries(analysisResult.ordersByRegion || {}).forEach(([k, arr]) => {
      map[k] = arr.length;
    });
    return map;
  }, [analysisResult]);

  // Buckets de antigüedad disponibles y conteos
  const availableAgeBuckets = useMemo(() => {
    if (!analysisResult) return [] as Array<'<12h' | '12-24h' | '24-48h' | '48-72h' | '>72h' | 'sin'>;
    return Object.keys(analysisResult.ageBucketsCount) as Array<'<12h' | '12-24h' | '24-48h' | '48-72h' | '>72h' | 'sin'>;
  }, [analysisResult]);

  const ageCounts = useMemo(() => analysisResult?.ageBucketsCount || ({}) as any, [analysisResult]);

  // Severidades disponibles y conteos para el filtro de semáforo
  const availableSeverities = useMemo<MovementAgeSeverity[]>(() => ['danger', 'warn', 'normal', 'none'], []);
  const severityCounts = useMemo(() => {
    const map: Record<MovementAgeSeverity, number> = { danger: 0, warn: 0, normal: 0, none: 0 };
    if (!analysisResult) return map;
    for (const o of analysisResult.ordersInMovement) {
      const sev = (o.ageSeverity || 'none') as MovementAgeSeverity;
      map[sev] = (map[sev] || 0) + 1;
    }
    return map;
  }, [analysisResult]);
  
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-theme-component rounded-lg">
        <FaExclamationTriangle className="mx-auto text-3xl mb-4 text-yellow-500" />
        <p className="text-theme-secondary">No hay datos de órdenes para analizar.</p>
      </div>
    );
  }
  
  // Verificar si el análisis ha concluido
  if (!analysisResult) {
    return (
      <div className="p-8 text-center bg-theme-component rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color mx-auto mb-4"></div>
        <p className="text-theme-secondary">Analizando datos de órdenes...</p>
      </div>
    );
  }
  
  // Verificar si hay órdenes en movimiento
  if (analysisResult.ordersInMovement.length === 0) {
    return (
      <div className="p-8 text-center bg-theme-component rounded-lg">
        <FaExclamationTriangle className="mx-auto text-3xl mb-4 text-yellow-500" />
        <p className="text-theme-secondary">No se encontraron órdenes en movimiento.</p>
      </div>
    );
  }

  // Esta sección se ha eliminado para evitar duplicaciones

  // La función getOrderStatus se ha movido al servicio OrdersMovementService


  return (
    <div className="space-y-8 w-full">
      {/* Tarjetas de resumen */}
      <MovementSummaryCards analysisResult={analysisResult} />

      {/* Panel de alertas por antigüedad del último movimiento */}
      <MovementAgeAlertsPanel 
        analysisResult={analysisResult}
        onBucketClick={(bucket, orders, label) => handleAgeBucketClick(label, orders)}
      />
      
      {/* Tabla de distribución por estado */}
      <div className="bg-theme-component p-6 rounded-lg shadow-md">
        <MovementStatusTable analysisResult={analysisResult} onStatusClick={handleStatusClick} />
      </div>

      {/* Tabla detallada de órdenes */}
      <MovementOrdersFilters
        availableStatuses={availableStatuses}
        availableCarriers={availableCarriers}
        availableRegions={availableRegions}
        availableAgeBuckets={availableAgeBuckets}
        availableSeverities={availableSeverities}
        value={filters}
        onChange={setFilters}
        totalCount={analysisResult.ordersInMovement.length}
        filteredCount={filteredOrders.length}
        onClear={() => setFilters({ status: '', carrier: '', region: '', query: '', age: '', severity: '' })}
        statusesCount={statusesCount}
        carriersCount={carriersCount}
        regionsCount={regionsCount}
        ageCounts={ageCounts}
        severityCounts={severityCounts}
      />
      <MovementOrdersTable 
        orders={filteredOrders} 
        onOrderSelect={handleOrderSelect} 
      />

      {/* Modal de detalle por estado */}
      <MovementStatusOrdersModal
        isOpen={statusModalOpen}
        status={statusModalName}
        orders={statusModalOrders}
        onClose={() => { setStatusModalOpen(false); setHighlightedRowKey(null); }}
        onOrderSelect={(o) => {
          setHighlightedRowKey(rowKeyFromOrder(o));
          handleOrderSelect(o);
          // No cerramos el modal: se mantiene abierto para mejor UX
        }}
        highlightedKey={highlightedRowKey || undefined}
      />

      {/* Panel lateral para mostrar detalles */}
      <MovementOrderDetailPanel 
        order={selectedOrder} 
        isOpen={sidebarOpen} 
        onClose={handleClosePanel} 
      />
            
    </div>
  );
};

export default OrdersMovementViewer;

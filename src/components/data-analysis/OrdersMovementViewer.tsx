import React, { useState, useEffect, useMemo } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

// Servicios
import ordersMovementService, { MovementAnalysisResult, MovementOrder } from '../../services/data-analysis/OrdersMovementService';

// Componentes modularizados
import MovementSummaryCards from './orders-movement/MovementSummaryCards';
import MovementStatusTable from './orders-movement/MovementStatusTable';
import MovementOrdersTable from './orders-movement/MovementOrdersTable';
import MovementOrderDetailPanel from './orders-movement/MovementOrderDetailPanel';
import MovementStatusOrdersModal from './orders-movement/MovementStatusOrdersModal';
import MovementOrdersFilters, { OrdersFiltersValue } from './orders-movement/MovementOrdersFilters';

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
  // Filtros para la tabla de detalle
  const [filters, setFilters] = useState<OrdersFiltersValue>({ status: '', carrier: '', region: '', query: '' });

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

  // Click en una fila de estado: abrir modal con el detalle de esas órdenes
  const handleStatusClick = (status: string, orders: MovementOrder[]) => {
    setStatusModalName(status);
    setStatusModalOrders(orders);
    setStatusModalOpen(true);
  };

  // Manejador para cerrar el panel lateral
  const handleClosePanel = () => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedOrder(null), 300); // Limpiar la orden seleccionada después de la animación
  };

  // Verificar si hay datos para analizar
  console.log('Datos de órdenes:', data);
  console.log('Resumen de órdenes:', summary);
 
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
      
      {/* Tabla de distribución por estado */}
      <div className="bg-theme-component p-6 rounded-lg shadow-md">
        <MovementStatusTable analysisResult={analysisResult} onStatusClick={handleStatusClick} />
      </div>

      {/* Tabla detallada de órdenes */}
      <MovementOrdersFilters
        availableStatuses={availableStatuses}
        availableCarriers={availableCarriers}
        availableRegions={availableRegions}
        value={filters}
        onChange={setFilters}
        totalCount={analysisResult.ordersInMovement.length}
        filteredCount={filteredOrders.length}
        onClear={() => setFilters({ status: '', carrier: '', region: '', query: '' })}
        statusesCount={statusesCount}
        carriersCount={carriersCount}
        regionsCount={regionsCount}
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
        onClose={() => setStatusModalOpen(false)}
        onOrderSelect={(o) => {
          handleOrderSelect(o);
          setStatusModalOpen(false);
        }}
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

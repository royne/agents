import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

// Servicios
import ordersMovementService, { MovementAnalysisResult, MovementOrder } from '../../services/data-analysis/OrdersMovementService';

// Componentes modularizados
import MovementSummaryCards from './orders-movement/MovementSummaryCards';
import MovementStatusTable from './orders-movement/MovementStatusTable';
import MovementOrdersTable from './orders-movement/MovementOrdersTable';
import MovementOrderDetailPanel from './orders-movement/MovementOrderDetailPanel';

interface OrdersMovementViewerProps {
  data: any[];
  summary?: any;
}

const OrdersMovementViewer: React.FC<OrdersMovementViewerProps> = ({ data, summary }) => {
  // Estados para el panel de detalle y análisis
  const [selectedOrder, setSelectedOrder] = useState<MovementOrder | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MovementAnalysisResult | null>(null);

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

  // Manejador para cerrar el panel lateral
  const handleClosePanel = () => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedOrder(null), 300); // Limpiar la orden seleccionada después de la animación
  };

  // Verificar si hay datos para analizar
  console.log('Datos de órdenes:', data);
  console.log('Resumen de órdenes:', summary);
  
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
        <MovementStatusTable analysisResult={analysisResult} />
      </div>

      {/* Tabla detallada de órdenes */}
      <MovementOrdersTable 
        orders={analysisResult.ordersInMovement} 
        onOrderSelect={handleOrderSelect} 
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

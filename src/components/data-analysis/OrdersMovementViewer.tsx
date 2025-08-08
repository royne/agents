import React from 'react';
import { FaChartBar, FaTruckMoving, FaExclamationTriangle } from 'react-icons/fa';

interface OrdersMovementViewerProps {
  data: any[];
  summary?: any;
}

const OrdersMovementViewer: React.FC<OrdersMovementViewerProps> = ({ data, summary }) => {
  // Verificar si hay datos para analizar
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-theme-component rounded-lg">
        <FaExclamationTriangle className="mx-auto text-3xl mb-4 text-yellow-500" />
        <p className="text-theme-secondary">No hay datos de órdenes para analizar.</p>
      </div>
    );
  }

  // Filtrar solo las órdenes en proceso (no entregadas ni devueltas)
  const ordersInMovement = data.filter(order => {
    const status = order.estado?.toLowerCase() || '';
    return !status.includes('entregado') && !status.includes('devuelto');
  });

  if (ordersInMovement.length === 0) {
    return (
      <div className="p-8 text-center bg-theme-component rounded-lg">
        <FaExclamationTriangle className="mx-auto text-3xl mb-4 text-yellow-500" />
        <p className="text-theme-secondary">No se encontraron órdenes en movimiento.</p>
      </div>
    );
  }

  // Agrupar órdenes por estado
  const ordersByStatus = ordersInMovement.reduce((acc: Record<string, any[]>, order) => {
    const status = order.estado || 'Sin estado';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {});

  return (
    <div className="space-y-8 w-full">
      <div className="bg-theme-component p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaTruckMoving className="mr-2 text-primary-color" /> 
          Órdenes en Movimiento
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-theme-component-light p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-theme-tertiary mb-1">Total de órdenes en movimiento</p>
            <p className="text-2xl font-bold text-theme-primary">{ordersInMovement.length}</p>
          </div>
          
          <div className="bg-theme-component-light p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-theme-tertiary mb-1">Valor total</p>
            <p className="text-2xl font-bold text-theme-primary">
              ${ordersInMovement.reduce((sum, order) => sum + (parseFloat(order.precio || 0) || 0), 0).toLocaleString('es-CO')}
            </p>
          </div>
          
          <div className="bg-theme-component-light p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-theme-tertiary mb-1">Estados diferentes</p>
            <p className="text-2xl font-bold text-theme-primary">{Object.keys(ordersByStatus).length}</p>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-3">Distribución por Estado</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-theme-component-light rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Cantidad</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Valor Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Valor Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(ordersByStatus).map(([status, orders]) => {
                const totalValue = orders.reduce((sum, order) => sum + (parseFloat(order.precio || 0) || 0), 0);
                const averageValue = totalValue / orders.length;
                
                return (
                  <tr key={status} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 text-sm text-theme-primary">{status}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">{orders.length}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">${totalValue.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">${averageValue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-theme-component p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaChartBar className="mr-2 text-primary-color" /> 
          Detalle de Órdenes
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-theme-component-light rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Transportadora</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ordersInMovement.map((order, index) => (
                <tr key={order.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3 text-sm text-theme-primary">{order.id || `Orden-${index + 1}`}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order.producto || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order.estado || 'Sin estado'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order.transportadora || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">${(parseFloat(order.precio || 0) || 0).toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order.fecha || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersMovementViewer;

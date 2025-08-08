import React from 'react';
import { FaChartBar, FaInfoCircle } from 'react-icons/fa';
import { MovementOrder } from '../../../services/data-analysis/OrdersMovementService';

interface MovementOrdersTableProps {
  orders: MovementOrder[];
  onOrderSelect: (order: MovementOrder) => void;
}

const MovementOrdersTable: React.FC<MovementOrdersTableProps> = ({ orders, onOrderSelect }) => {
  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaChartBar className="mr-2 text-primary-color" /> 
        Detalle de Órdenes en Movimiento
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Ciudad Destino</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Departamento</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Último Movimiento</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Transportadora</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Valor</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Flete</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const orderValue = parseFloat(String(order["VALOR DE COMPRA EN PRODUCTOS"] || order.precio || 0)) || 0;
              const shippingCost = parseFloat(String(order["PRECIO FLETE"] || order.precioFlete || 0)) || 0;
              
              return (
                <tr 
                  key={order.ID || index} 
                  className="border-b border-theme-border hover:bg-theme-component-hover cursor-pointer"
                  onClick={() => onOrderSelect(order)}
                >
                  <td className="px-4 py-3 text-sm text-theme-primary">{String(order.ID) || `Orden-${index + 1}`}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{String(order["CIUDAD DESTINO"]) || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order["DEPARTAMENTO DESTINO"] || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order["ÚLTIMO MOVIMIENTO"] || order["ULTIMO MOVIMIENTO"] || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order["NOMBRE CLIENTE"] || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{order["TRANSPORTADORA"] || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">${orderValue.toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">${shippingCost.toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3 text-sm text-primary-color">
                    <button 
                      className="p-1 hover:bg-theme-border rounded-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderSelect(order);
                      }}
                    >
                      <FaInfoCircle />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovementOrdersTable;

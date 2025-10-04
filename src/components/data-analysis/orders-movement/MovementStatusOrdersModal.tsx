import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { MovementOrder } from '../../../services/data-analysis/OrdersMovementService';

interface MovementStatusOrdersModalProps {
  isOpen: boolean;
  status: string | null;
  orders: MovementOrder[];
  onClose: () => void;
  onOrderSelect?: (order: MovementOrder) => void;
}

const MovementStatusOrdersModal: React.FC<MovementStatusOrdersModalProps> = ({
  isOpen,
  status,
  orders,
  onClose,
  onOrderSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-theme-component border border-theme-border rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border flex-none">
          <h3 className="text-lg font-semibold">Órdenes con estado: {status}</h3>
          <button className="p-2 hover:bg-theme-component-hover rounded-full" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-theme-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Transportadora</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Ciudad</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Departamento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Último Movimiento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Flete</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => {
                const orderValue = parseFloat(String(order["VALOR DE COMPRA EN PRODUCTOS"] || order.precio || 0)) || 0;
                const shippingCost = parseFloat(String(order["PRECIO FLETE"] || order.precioFlete || 0)) || 0;
                return (
                  <tr
                    key={order.ID || idx}
                    className="border-b border-theme-border hover:bg-theme-component-hover cursor-pointer"
                    onClick={() => onOrderSelect && onOrderSelect(order)}
                  >
                    <td className="px-4 py-3 text-sm text-theme-primary">{String(order.ID) || `Orden-${idx + 1}`}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">{order["NOMBRE CLIENTE"] || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">{order["TRANSPORTADORA"] || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">{order["CIUDAD DESTINO"] || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">{order["DEPARTAMENTO DESTINO"] || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">{order["ÚLTIMO MOVIMIENTO"] || order["ULTIMO MOVIMIENTO"] || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">${orderValue.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3 text-sm text-theme-primary">${shippingCost.toLocaleString('es-CO')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovementStatusOrdersModal;

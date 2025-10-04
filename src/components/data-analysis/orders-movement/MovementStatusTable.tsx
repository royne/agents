import React from 'react';
import { MovementAnalysisResult, MovementOrder } from '../../../services/data-analysis/OrdersMovementService';

interface MovementStatusTableProps {
  analysisResult: MovementAnalysisResult;
  onStatusClick?: (status: string, orders: MovementOrder[]) => void;
}

const MovementStatusTable: React.FC<MovementStatusTableProps> = ({ analysisResult, onStatusClick }) => {
  const { ordersByStatus } = analysisResult;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Distribución por Estado</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Cantidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Valor Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Valor Promedio</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ordersByStatus).map(([status, orders]) => {
              const totalValue = orders.reduce((sum, order) => {
                // Asegurarse de que el valor sea siempre un número
                const rawValue = order["VALOR DE COMPRA EN PRODUCTOS"] || order.precio || 0;
                const orderValue = typeof rawValue === 'string' ? parseFloat(rawValue) || 0 : Number(rawValue);
                return sum + orderValue;
              }, 0);
              const averageValue = totalValue / orders.length;
              
              return (
                <tr 
                  key={status} 
                  className="border-b border-theme-border hover:bg-theme-component-hover cursor-pointer"
                  onClick={() => onStatusClick && onStatusClick(status, orders)}
                >
                  <td className="px-4 py-3 text-sm text-theme-primary">{status}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">{orders.length}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">${totalValue.toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3 text-sm text-theme-primary">
                    ${averageValue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
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

export default MovementStatusTable;

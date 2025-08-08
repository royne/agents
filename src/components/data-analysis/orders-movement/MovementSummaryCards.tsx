import React from 'react';
import { FaTruckMoving, FaMoneyBillWave, FaShippingFast, FaMapMarkedAlt } from 'react-icons/fa';
import { MovementAnalysisResult } from '../../../services/data-analysis/OrdersMovementService';

interface MovementSummaryCardsProps {
  analysisResult: MovementAnalysisResult;
}

const MovementSummaryCards: React.FC<MovementSummaryCardsProps> = ({ analysisResult }) => {
  const { 
    ordersInMovement,
    totalValue,
    totalShippingCost,
    potentialProfit,
    carriers,
    regions
  } = analysisResult;

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaTruckMoving className="mr-2 text-primary-color" /> 
        Órdenes en Movimiento
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border">
          <p className="text-sm text-theme-tertiary mb-1">Total de órdenes</p>
          <p className="text-2xl font-bold text-theme-primary">{ordersInMovement.length}</p>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border">
          <p className="text-sm text-theme-tertiary mb-1">Valor total</p>
          <p className="text-2xl font-bold text-primary-color">
            ${totalValue.toLocaleString('es-CO')}
          </p>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border">
          <p className="text-sm text-theme-tertiary mb-1">Ganancia potencial</p>
          <p className="text-2xl font-bold text-green-500">
            ${potentialProfit.toLocaleString('es-CO')}
          </p>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border">
          <p className="text-sm text-theme-tertiary mb-1">Costo de fletes</p>
          <p className="text-2xl font-bold text-yellow-500">
            ${totalShippingCost.toLocaleString('es-CO')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            <FaShippingFast className="mr-2 text-blue-500" />
            Transportadoras
          </h3>
          <div className="text-sm">
            {carriers.size > 0 ? (
              <p><span className="text-theme-secondary">Total:</span> <span className="font-medium">{carriers.size}</span></p>
            ) : (
              <p className="text-theme-secondary">No hay datos de transportadoras</p>
            )}
          </div>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            <FaMapMarkedAlt className="mr-2 text-green-500" />
            Regiones
          </h3>
          <div className="text-sm">
            {regions.size > 0 ? (
              <p><span className="text-theme-secondary">Total:</span> <span className="font-medium">{regions.size}</span></p>
            ) : (
              <p className="text-theme-secondary">No hay datos de regiones</p>
            )}
          </div>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            <FaMoneyBillWave className="mr-2 text-yellow-500" />
            Promedio por orden
          </h3>
          <div className="text-sm">
            <p>
              <span className="text-theme-secondary">Valor:</span> 
              <span className="font-medium">
                ${(totalValue / Math.max(ordersInMovement.length, 1)).toLocaleString('es-CO', {maximumFractionDigits: 0})}
              </span>
            </p>
            <p>
              <span className="text-theme-secondary">Ganancia:</span> 
              <span className="font-medium">
                ${(potentialProfit / Math.max(ordersInMovement.length, 1)).toLocaleString('es-CO', {maximumFractionDigits: 0})}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementSummaryCards;

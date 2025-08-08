import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { MovementOrder } from '../../../services/data-analysis/OrdersMovementService';

interface MovementOrderDetailPanelProps {
  order: MovementOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovementOrderDetailPanel: React.FC<MovementOrderDetailPanelProps> = ({ 
  order, 
  isOpen, 
  onClose 
}) => {
  if (!order) return null;

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 bg-theme-background border-l border-theme-border shadow-xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50 overflow-y-auto`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Detalles de Orden</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-theme-component-hover rounded-full text-theme-secondary"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border mb-4">
          <h4 className="text-lg font-medium mb-2 text-primary-color">Información General</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-theme-tertiary">ID</p>
              <p className="text-sm font-medium">{order.ID || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Cliente</p>
              <p className="text-sm font-medium">{order["NOMBRE CLIENTE"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Teléfono</p>
              <p className="text-sm font-medium">{order["TELÉFONO"] || order["TELEFONO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Número Guía</p>
              <p className="text-sm font-medium">{order["NÚMERO GUIA"] || order["NUMERO GUIA"] || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border mb-4">
          <h4 className="text-lg font-medium mb-2 text-primary-color">Ubicación</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-theme-tertiary">Ciudad Destino</p>
              <p className="text-sm font-medium">{order["CIUDAD DESTINO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Departamento Destino</p>
              <p className="text-sm font-medium">{order["DEPARTAMENTO DESTINO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Dirección</p>
              <p className="text-sm font-medium">{order["DIRECCION"] || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border mb-4">
          <h4 className="text-lg font-medium mb-2 text-primary-color">Estado y Movimiento</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-theme-tertiary">Estado</p>
              <p className="text-sm font-medium">{order["ESTATUS"] || 'En Proceso'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Último Movimiento</p>
              <p className="text-sm font-medium">{order["ÚLTIMO MOVIMIENTO"] || order["ULTIMO MOVIMIENTO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Concepto Último Movimiento</p>
              <p className="text-sm font-medium">{order["CONCEPTO ULTIMO MOVIMIENTO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Fecha</p>
              <p className="text-sm font-medium">{order["FECHA"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Fecha de Último Movimiento</p>
              <p className="text-sm font-medium">{order["FECHA DE ÚLTIMO MOVIMIENTO"] || order["FECHA DE ULTIMO MOVIMIENTO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Hora de Último Movimiento</p>
              <p className="text-sm font-medium">{order["HORA DE ÚLTIMO MOVIMIENTO"] || order["HORA DE ULTIMO MOVIMIENTO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Fecha Generación de Guía</p>
              <p className="text-sm font-medium">{order["FECHA GENERACION DE GUIA"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">¿Fue Solucionada la Novedad?</p>
              <p className="text-sm font-medium">{order["FUE SOLUCIONADA LA NOVEDAD"] || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-theme-component p-4 rounded-lg border border-theme-border mb-4">
          <h4 className="text-lg font-medium mb-2 text-primary-color">Envío y Valores</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-theme-tertiary">Transportadora</p>
              <p className="text-sm font-medium">{order["TRANSPORTADORA"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Tipo de Envío</p>
              <p className="text-sm font-medium">{order["TIPO DE ENVIO"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Valor de Compra</p>
              <p className="text-sm font-medium">${(parseFloat(String(order["VALOR DE COMPRA EN PRODUCTOS"] || 0)) || 0).toLocaleString('es-CO')}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Precio Flete</p>
              <p className="text-sm font-medium">${(parseFloat(String(order["PRECIO FLETE"] || 0)) || 0).toLocaleString('es-CO')}</p>
            </div>
            <div>
              <p className="text-xs text-theme-tertiary">Total Precio Proveedor</p>
              <p className="text-sm font-medium">${(parseFloat(String(order["TOTAL EN PRECIOS DE PROVEEDOR"] || 0)) || 0).toLocaleString('es-CO')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementOrderDetailPanel;

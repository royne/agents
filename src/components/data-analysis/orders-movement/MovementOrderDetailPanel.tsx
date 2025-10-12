import React from 'react';
import { FaTimes, FaUser, FaMapMarkerAlt, FaClipboardList, FaShippingFast } from 'react-icons/fa';
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
      className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 bg-theme-component border-l border-theme-border shadow-xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50 overflow-y-auto`}
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
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 w-5 h-5 flex items-center justify-center rounded-full mr-3">
              <FaUser className="text-xs text-white" />
            </div>
            <h4 className="text-lg font-medium text-primary-color">Información General</h4>
          </div>
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
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 w-5 h-5 flex items-center justify-center rounded-full mr-3">
              <FaMapMarkerAlt className="text-xs text-white" />
            </div>
            <h4 className="text-lg font-medium text-primary-color">Ubicación</h4>
          </div>
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
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 w-5 h-5 flex items-center justify-center rounded-full mr-3">
              <FaClipboardList className="text-xs text-white" />
            </div>
            <h4 className="text-lg font-medium text-primary-color">Estado y Movimiento</h4>
          </div>
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
              <p className="text-xs text-theme-tertiary">Tiempo transcurrido desde último movimiento</p>
              <div>
                <span
                  title={order.lastMovementAt ? new Date(order.lastMovementAt).toLocaleString('es-CO') : 'Sin último movimiento'}
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    order.ageSeverity === 'danger' ? 'bg-red-900/30 border border-red-600 text-red-300' :
                    order.ageSeverity === 'warn' ? 'bg-yellow-900/30 border border-yellow-600 text-yellow-300' :
                    order.ageSeverity === 'normal' ? 'bg-green-900/30 border border-green-600 text-green-300' :
                    'bg-slate-800/40 border border-slate-600 text-slate-300'
                  }`}
                >
                  {order.ageLabel || 'N/A'}
                </span>
              </div>
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
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 w-5 h-5 flex items-center justify-center rounded-full mr-3">
              <FaShippingFast className="text-xs text-white" />
            </div>
            <h4 className="text-lg font-medium text-primary-color">Envío y Valores</h4>
          </div>
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

import React, { useState } from 'react';
import { FaFileExcel, FaTag, FaChevronRight } from 'react-icons/fa';
import { OrdersSyncComponent } from '../../components/data-analysis/orders-sync/OrdersSyncComponent';
import OrderCampaignAssignment from '../../components/data-analysis/orders-sync/OrderCampaignAssignment';
import DashboardLayout from '../../components/layout/DashboardLayout';

const OrdersManagementPage: React.FC = () => {
  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState<'sync' | 'assign'>('sync');
  
  return (
    <DashboardLayout>
      {/* Tabs de navegación */}
      <div className="flex border-b border-theme-border mb-6">
        <button
          className={`px-4 py-2 flex items-center ${
            activeTab === 'sync' 
              ? 'border-b-2 border-primary-color text-primary-color' 
              : 'text-theme-secondary'
          }`}
          onClick={() => setActiveTab('sync')}
        >
          <FaFileExcel className="mr-2" />
          Sincronizar Órdenes
        </button>
        
        <button
          className={`px-4 py-2 flex items-center ${
            activeTab === 'assign' 
              ? 'border-b-2 border-primary-color text-primary-color' 
              : 'text-theme-secondary'
          }`}
          onClick={() => setActiveTab('assign')}
        >
          <FaTag className="mr-2" />
          Asignar a Campañas
        </button>
      </div>
      
      {/* Contenido según la pestaña seleccionada */}
      <div>
        {activeTab === 'sync' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaFileExcel className="mr-2 text-primary-color" />
              Sincronización de Órdenes desde Excel
            </h2>
            <p className="mb-6 text-theme-secondary">
              Carga un archivo Excel con las órdenes para sincronizarlas con la base de datos. 
              El sistema detectará automáticamente órdenes nuevas y existentes, actualizando solo la información que haya cambiado.
            </p>
            
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
              <h3 className="font-bold">Flujo de trabajo recomendado:</h3>
              <ol className="list-decimal list-inside mt-2">
                <li className="flex items-center">
                  <FaChevronRight className="mr-2 text-blue-500" />
                  <span>Cargar archivo Excel con órdenes actualizadas</span>
                </li>
                <li className="flex items-center">
                  <FaChevronRight className="mr-2 text-blue-500" />
                  <span>Verificar resultados de la sincronización</span>
                </li>
                <li className="flex items-center">
                  <FaChevronRight className="mr-2 text-blue-500" />
                  <span>Ir a la pestaña "Asignar a Campañas" para asociar las órdenes con campañas publicitarias</span>
                </li>
              </ol>
            </div>
            
            <OrdersSyncComponent />
          </div>
        )}
        
        {activeTab === 'assign' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaTag className="mr-2 text-primary-color" />
              Asignación de Órdenes a Campañas
            </h2>
            <p className="mb-6 text-theme-secondary">
              Asigna las órdenes sincronizadas a campañas publicitarias para facilitar el seguimiento del rendimiento de 
              tus estrategias de marketing y calcular el ROI de cada campaña.
            </p>
            
            <OrderCampaignAssignment />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersManagementPage;

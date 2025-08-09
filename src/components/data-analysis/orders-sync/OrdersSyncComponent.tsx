import React, { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { FaUpload, FaSync, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import ExcelFileUploader from '../../data-analysis/ExcelFileUploader';
import OrderSyncService from '../../../services/data-analysis/OrderSyncService';
import { OrderSyncResult } from '../../../types/orders';

export const OrdersSyncComponent: React.FC = () => {
  const { authData } = useAppContext();
  const [syncResults, setSyncResults] = useState<OrderSyncResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleExcelUpload = async (data: any[]) => {
    if (!authData?.company_id) {
      setError('No se pudo determinar la compañía del usuario');
      return;
    }
    
    console.log('=== DEBUG: Iniciando sincronización de órdenes ===');
    console.log('Company ID:', authData.company_id);
    console.log('Datos recibidos del Excel:', data.length, 'registros');
    console.log('Muestra de datos:', data.slice(0, 2));
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Sincronizar datos con la base de datos
      const results = await OrderSyncService.syncOrdersFromExcel(data, authData.company_id);
      console.log('=== DEBUG: Sincronización completada ===');
      console.log('Resultados:', results);
      setSyncResults(results);
    } catch (err) {
      console.error("=== DEBUG: Error durante la sincronización ===");
      console.error("Tipo de error:", typeof err);
      console.error("Error completo:", err);
      console.error("Stack trace:", err instanceof Error ? err.stack : 'No stack trace disponible');
      setError('Error al sincronizar los datos: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-theme-component p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaSync className="mr-2 text-primary-color" />
          Sincronización de Órdenes desde Excel
        </h2>
        
        <p className="text-theme-secondary mb-4">
          Carga un archivo Excel con las órdenes para sincronizarlas con la base de datos. 
          El sistema creará nuevas órdenes o actualizará las existentes automáticamente.
        </p>
        
        <ExcelFileUploader
          onDataLoaded={handleExcelUpload}
          analysisType="orders"
          showTypeSelector={false}
          disabled={isLoading}
        />
        
        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center">
            <FaSpinner className="animate-spin text-blue-500 mr-3 text-xl" />
            <span className="text-blue-700 font-medium">Sincronizando órdenes, por favor espere...</span>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <FaTimesCircle className="inline-block mr-2" />
            {error}
          </div>
        )}
      </div>
      
      {syncResults && (
        <div className="bg-theme-component p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            Resultados de sincronización
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm">
              <h3 className="text-lg font-medium text-green-800">Nuevas órdenes</h3>
              <p className="text-3xl font-bold text-green-600">{syncResults.created}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
              <h3 className="text-lg font-medium text-blue-800">Órdenes actualizadas</h3>
              <p className="text-3xl font-bold text-blue-600">{syncResults.updated}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm">
              <h3 className="text-lg font-medium text-purple-800">Sin cambios</h3>
              <p className="text-3xl font-bold text-purple-600">{syncResults.unchanged}</p>
            </div>
          </div>
          
          {/* Mostrar detalles de los cambios */}
          {syncResults.details.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Detalle de cambios</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-theme-border">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncResults.details.map((detail, index) => (
                      <tr key={index} className="border-b border-theme-border">
                        <td className="px-4 py-2">{detail.id}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            detail.action === 'created' 
                              ? 'bg-green-100 text-green-800' 
                              : detail.action === 'updated'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {detail.action === 'created' ? 'Nueva' : detail.action === 'updated' ? 'Actualizada' : 'Sin cambios'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersSyncComponent;

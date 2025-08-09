import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { FaChartLine, FaSync } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { ordersDatabaseService } from '../../services/database/ordersService';
import OrdersAnalysisViewer from '../../components/data-analysis/OrdersAnalysisViewer';
import ExcelAnalysisService, { OrderAnalysisResult } from '../../services/data-analysis/ExcelAnalysisService';
import { createGlobalScrollbarStyles } from '../../utils/scrollStyles';

export default function Rentability() {
  const { authData } = useAppContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<OrderAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Crear estilos globales para scrollbars
  useEffect(() => {
    createGlobalScrollbarStyles();
  }, []);

  // Cargar datos de órdenes desde la base de datos
  useEffect(() => {
    const loadOrders = async () => {
      if (!authData?.company_id) {
        setError('No se ha identificado una empresa. Por favor, inicia sesión nuevamente.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Obtener órdenes de la base de datos
        const ordersData = await ordersDatabaseService.getOrders(authData.company_id);
        
        if (!ordersData || ordersData.length === 0) {
          setError('No se encontraron órdenes en la base de datos.');
          setIsLoading(false);
          return;
        }

        // Mapear los datos de la base de datos al formato esperado por el servicio de análisis
        const mappedOrders = ordersData.map(order => {
          // Usar last_movement como estado principal si existe
          const statusFromLastMovement = order.last_movement ? order.last_movement : null;
          let statusToUse = statusFromLastMovement || order.status || 'en_proceso';
          
          // Calcular el costo de devolución basado en el estado y el costo de envío
          let returnCost = 0;
          const upperStatus = statusToUse.toUpperCase();
          
          // Verificar si es una devolución usando una lógica más completa
          if (upperStatus.includes('DEVOL') || 
              upperStatus === 'DEVOLUCION' || 
              upperStatus === 'DEVOLUCIÓN' ||
              upperStatus === 'RETURNED' ||
              upperStatus === 'DEVUELTO' ||
              upperStatus === 'DEVUELTA' ||
              order.status === 'RETURNED') {
            // Para órdenes devueltas, el costo de devolución es igual al costo de envío
            returnCost = order.shipping_cost || 0;
            
            // Asegurarnos de que el estado se marque claramente como devolución para el análisis
            statusToUse = 'devolucion';
          }
          
          return {
            id: order.id,
            fecha: order.order_date || order.created_at,
            numeroGuia: order.tracking_number || '',
            estatus: statusToUse,
            tipoEnvio: order.shipping_type || 'normal',
            departamento: order.destination_state || order.customer_state || '',
            ciudad: order.destination_city || order.customer_city || '',
            transportadora: order.shipping_company || order.carrier || '',
            valorCompra: order.order_value || 0,
            ganancia: order.profit || 0,
            precioFlete: order.shipping_cost || 0,
            costoDevolucionFlete: returnCost // Calculado basado en el estado
          };
        });

        // Analizar los datos mapeados
        const analysisResult = ExcelAnalysisService.analyzeOrdersData(mappedOrders);
        
        setOrders(mappedOrders);
        setSummary(analysisResult);
      } catch (err) {
        console.error('Error al cargar órdenes:', err);
        setError('Ocurrió un error al cargar los datos de órdenes.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [authData?.company_id]);

  const handleRefresh = () => {
    if (!isLoading && authData?.company_id) {
      setIsLoading(true);
      // Volver a cargar los datos
      ordersDatabaseService.getOrders(authData.company_id)
        .then(ordersData => {
          if (!ordersData || ordersData.length === 0) {
            setError('No se encontraron órdenes en la base de datos.');
            setOrders([]);
            setSummary(null);
            return;
          }

          // Mapear los datos de la base de datos al formato esperado
          const mappedOrders = ordersData.map(order => {
            // Usar last_movement como estado principal si existe
            const statusFromLastMovement = order.last_movement ? order.last_movement : null;
            let statusToUse = statusFromLastMovement || order.status || 'en_proceso';
            
            // Calcular el costo de devolución basado en el estado y el costo de envío
            let returnCost = 0;
            const upperStatus = statusToUse.toUpperCase();
            
            // Verificar si es una devolución usando una lógica más completa
            if (upperStatus.includes('DEVOL') || 
                upperStatus === 'DEVOLUCION' || 
                upperStatus === 'DEVOLUCIÓN' ||
                upperStatus === 'RETURNED' ||
                upperStatus === 'DEVUELTO' ||
                upperStatus === 'DEVUELTA' ||
                order.status === 'RETURNED') {
              // Para órdenes devueltas, el costo de devolución es igual al costo de envío
              returnCost = order.shipping_cost || 0;
              
              // Asegurarnos de que el estado se marque claramente como devolución para el análisis
              statusToUse = 'devolucion';
            }
            
            return {
              id: order.id,
              fecha: order.order_date || order.created_at,
              numeroGuia: order.tracking_number || '',
              estatus: statusToUse,
              tipoEnvio: order.shipping_type || 'normal',
              departamento: order.destination_state || order.customer_state || '',
              ciudad: order.destination_city || order.customer_city || '',
              transportadora: order.shipping_company || order.carrier || '',
              valorCompra: order.order_value || 0,
              ganancia: order.profit || 0,
              precioFlete: order.shipping_cost || 0,
              costoDevolucionFlete: returnCost // Calculado basado en el estado
            };
          });

          // Analizar los datos mapeados
          const analysisResult = ExcelAnalysisService.analyzeOrdersData(mappedOrders);
          
          setOrders(mappedOrders);
          setSummary(analysisResult);
          setError(null);
        })
        .catch(err => {
          console.error('Error al actualizar órdenes:', err);
          setError('Ocurrió un error al actualizar los datos de órdenes.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto">
        <PageHeader
          title={
            <>
              <FaChartLine className="inline-block mr-2 mb-1" />
              Análisis de Rentabilidad
            </>
          }
          description="Monitorea y analiza la rentabilidad de tus órdenes basado en datos reales."
          backLink="/profitability"
          actions={
            <button 
              onClick={handleRefresh} 
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark transition-colors disabled:bg-gray-400"
            >
              <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar datos
            </button>
          }
        />

        <div className="mb-6">
          {isLoading ? (
            <div className="p-8 text-center bg-theme-component rounded-lg shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto mb-4"></div>
              <p className="text-theme-secondary">Cargando datos de órdenes...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-theme-component rounded-lg shadow-md">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : orders.length > 0 && summary ? (
            <div className="bg-theme-component p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-primary-color" /> 
                Análisis de Rentabilidad ({orders.length} órdenes)
              </h2>
              
              <OrdersAnalysisViewer 
                data={orders} 
                summary={summary} 
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-theme-component rounded-lg shadow-md">
              <p className="text-theme-secondary">No hay datos de órdenes disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

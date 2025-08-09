import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { FaTags, FaCheck, FaSpinner } from 'react-icons/fa';
import { ordersDatabaseService } from '../../../services/database/ordersService';
import { campaignDatabaseService } from '../../../services/database/campaignService';
import { Order } from '../../../types/orders';
import type { Campaign } from '../../../types/database';



const OrderCampaignAssignment: React.FC = () => {
  const { authData } = useAppContext();
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [assigningOrders, setAssigningOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!authData?.company_id) return;

      setLoading(true);
      setError(null);

      try {
        // Cargar órdenes sin asignar
        const orders = await ordersDatabaseService.getUnassignedOrders(authData.company_id);
        setUnassignedOrders(orders);

        // Cargar campañas
        const campaignsData = await campaignDatabaseService.getCampaigns(authData.company_id);
        setCampaigns(campaignsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authData]);

  // Manejar selección/deselección de todas las órdenes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(unassignedOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Manejar selección/deselección de una orden individual
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  // Asignar órdenes a la campaña seleccionada
  const handleAssign = async () => {
    if (!selectedCampaign || selectedOrders.length === 0) {
      setError('Selecciona una campaña y al menos una orden');
      return;
    }

    if (!authData?.company_id) {
      setError('No se pudo determinar la compañía del usuario');
      return;
    }

    setAssigningOrders(true);
    setError(null);
    setSuccess(null);

    try {
      await ordersDatabaseService.assignOrdersToCampaign(selectedOrders, selectedCampaign, authData.company_id);

      // Actualizar la lista de órdenes sin asignar
      setUnassignedOrders(unassignedOrders.filter(order => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
      setSuccess(`${selectedOrders.length} órdenes asignadas correctamente a la campaña`);
    } catch (err) {
      console.error('Error asignando órdenes:', err);
      setError('Error al asignar las órdenes a la campaña');
    } finally {
      setAssigningOrders(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-theme-component p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaTags className="mr-2 text-primary-color" />
          Asignación de Órdenes a Campañas
        </h2>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin mr-2" />
            <span>Cargando datos...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            {success}
          </div>
        )}

        {!loading && unassignedOrders.length === 0 ? (
          <div className="text-center py-8 text-theme-secondary">
            No hay órdenes sin asignar en este momento
          </div>
        ) : (
          <>
            {/* Selector de campaña */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Seleccionar Campaña</label>
              <select
                className="border border-gray-300 rounded-md p-2 w-full bg-theme-input"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                disabled={selectedOrders.length === 0}
              >
                <option value="">Selecciona una campaña</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabla de órdenes */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-theme-border">
                    <th className="px-4 py-2 text-left">
                      <input 
                        type="checkbox" 
                        onChange={e => handleSelectAll(e.target.checked)}
                        checked={selectedOrders.length === unassignedOrders.length && unassignedOrders.length > 0}
                        className="form-checkbox"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-theme-secondary">ID Externo</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-theme-secondary">Cliente</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-theme-secondary">Estado</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-theme-secondary">Valor</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-theme-secondary">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedOrders.map(order => (
                    <tr key={order.id} className="border-b border-theme-border hover:bg-theme-component-hover">
                      <td className="px-4 py-2">
                        <input 
                          type="checkbox" 
                          checked={selectedOrders.includes(order.id)}
                          onChange={e => handleSelectOrder(order.id, e.target.checked)}
                          className="form-checkbox"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">{order.external_id}</td>
                      <td className="px-4 py-2 text-sm">{order.customer_id}</td>
                      <td className="px-4 py-2 text-sm">{order.status}</td>
                      <td className="px-4 py-2 text-sm">${order.order_value.toLocaleString('es-CO')}</td>
                      <td className="px-4 py-2 text-sm">
                        {order.last_movement_date ? new Date(order.last_movement_date).toLocaleDateString('es-CO') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Botón de asignación */}
            <div className="mt-6 flex justify-end">
              <button 
                className={`flex items-center px-4 py-2 rounded-md ${
                  selectedOrders.length > 0 && selectedCampaign 
                    ? 'bg-primary-color text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={loading || selectedOrders.length === 0 || !selectedCampaign}
                onClick={handleAssign}
              >
                <FaCheck className="mr-2" />
                Asignar {selectedOrders.length} órdenes a la campaña
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCampaignAssignment;

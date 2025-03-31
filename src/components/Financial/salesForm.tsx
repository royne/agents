import React, { useState } from 'react';
import type { Sale, Advertisement } from '../../types/database';
import { salesDatabaseService } from '../../services/database/salesService';
import { getCurrentLocalDate, formatDateForInput } from '../../utils/dateUtils';

interface SalesFormProps {
  selectedAd: Advertisement | null;
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ selectedAd, companyId, onSuccess, onCancel }) => {
  const [currentSale, setCurrentSale] = useState<Partial<Sale>>({
    date: getCurrentLocalDate()
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedAd) return;

    try {
      setLoading(true);
      const salePayload = {
        advertisement_id: selectedAd.id,
        amount: 0,
        order_dropi: '',
        date: getCurrentLocalDate(),
        ...currentSale,
        company_id: companyId
      };

      await salesDatabaseService.createSale(salePayload, companyId);
      alert('Venta registrada correctamente');
      onSuccess();
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="number"
        placeholder="Monto de la venta"
        className="w-full p-3 rounded bg-gray-700 text-white border border-green-500"
        value={currentSale.amount || ''}
        onChange={(e) => setCurrentSale({
          ...currentSale,
          amount: Number(e.target.value)
        })}
        required
      />
      
      <input
        type="text"
        placeholder="Número de orden de drop"
        className="w-full p-3 rounded bg-gray-700 text-white"
        value={currentSale.order_dropi || ''}
        onChange={(e) => setCurrentSale({
          ...currentSale,
          order_dropi: e.target.value
        })}
        required
      />
      
      <input
        type="date"
        className="w-full p-3 rounded bg-gray-700 text-white"
        value={currentSale.date ? formatDateForInput(currentSale.date) : ''}
        onChange={(e) => setCurrentSale({
          ...currentSale,
          date: new Date(e.target.value)
        })}
        required
      />
      
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Registrar Venta'}
        </button>
      </div>
    </form>
  );
};

export default SalesForm;
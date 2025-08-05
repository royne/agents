import React from 'react';
import { FaEdit, FaMoneyBillWave, FaRegChartBar, FaSave } from 'react-icons/fa';
import { CampaignDailyRecord } from '../../../types/campaign-control';
import { formatCurrency } from '../../../utils/formatters';
import CampaignDateSelector from './CampaignDateSelector';

interface DailyDataFormProps {
  dailyRecord: CampaignDailyRecord;
  onSave: (data: Partial<CampaignDailyRecord>) => void;
}

const DailyDataForm: React.FC<DailyDataFormProps> = ({ dailyRecord, onSave }) => {
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    spend: dailyRecord.spend,
    revenue: dailyRecord.revenue,
    units: dailyRecord.units || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? value : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Cálculos derivados
  const costPerUnit = formData.units > 0 ? formData.spend / formData.units : 0;
  const roas = formData.spend > 0 ? formData.revenue / formData.spend : 0;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaEdit className="mr-2 text-primary-color" />
          Registrar Datos del Día Anterior
        </div>
        <div>
          <CampaignDateSelector
            selectedDate={formData.date}
            onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
            label="Fecha:"
          />
        </div>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Métricas financieras */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <FaMoneyBillWave className="mr-2 text-green-500" />
            Métricas Financieras
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Gastos (MXN)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  $
                </span>
                <input 
                  type="number" 
                  name="spend"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                  value={formData.spend}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Ingresos (MXN)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  $
                </span>
                <input 
                  type="number" 
                  name="revenue"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                  value={formData.revenue}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Unidades vendidas */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <FaRegChartBar className="mr-2 text-blue-500" />
            Unidades Vendidas
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Total de Unidades Vendidas
              </label>
              <input 
                type="number" 
                name="units"
                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                value={formData.units}
                onChange={handleChange}
                placeholder="Ingresa el número total de unidades vendidas"
              />
            </div>
          </div>
        </div>
        
        {/* Métricas calculadas */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <FaRegChartBar className="mr-2 text-primary-color" />
            Métricas Financieras Calculadas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Costo por Unidad */}
            <div className="bg-gray-750 p-4 rounded-lg border-t-2 border-blue-500">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-400 font-medium">Costo por Unidad</div>
                <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  Gasto/Unidades
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xl font-bold">
                  {formData.units > 0 ? formatCurrency(costPerUnit) : '-'}
                </div>
                <div className="flex items-center text-xs">
                  {costPerUnit < 50 ? (
                    <span className="text-green-500">Bueno</span>
                  ) : costPerUnit < 100 ? (
                    <span className="text-yellow-500">Regular</span>
                  ) : (
                    <span className="text-red-500">Alto</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* ROAS */}
            <div className="bg-gray-750 p-4 rounded-lg border-t-2 border-green-500">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-400 font-medium">ROAS</div>
                <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  Ingresos/Gastos
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xl font-bold">
                  {formData.spend > 0 ? roas.toFixed(2) + 'x' : '-'}
                </div>
                <div className="flex items-center text-xs">
                  {roas >= 2 ? (
                    <span className="text-green-500">Excelente</span>
                  ) : roas >= 1 ? (
                    <span className="text-yellow-500">Rentable</span>
                  ) : (
                    <span className="text-red-500">No rentable</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button 
            type="submit"
            className="bg-primary-color hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaSave className="mr-2" />
            Guardar Datos
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailyDataForm;

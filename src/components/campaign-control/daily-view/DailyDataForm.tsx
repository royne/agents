import React, { useEffect, useState } from 'react';
import { FaEdit, FaMoneyBillWave, FaRegChartBar, FaSave, FaCheckCircle } from 'react-icons/fa';
import { CampaignDailyRecord } from '../../../types/campaign-control';
import { formatCurrency } from '../../../utils/formatters';

interface DailyDataFormProps {
  dailyRecord: CampaignDailyRecord;
  onSave: (data: Partial<CampaignDailyRecord>) => void;
  selectedDate?: string;
}

const DailyDataForm: React.FC<DailyDataFormProps> = ({ dailyRecord, onSave, selectedDate }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    spend: dailyRecord.spend || 0,
    revenue: dailyRecord.revenue || 0,
    units: dailyRecord.units || 0
  });

  const [inputValues, setInputValues] = useState({
    spend: formData.spend > 0 ? formData.spend.toString() : '',
    revenue: formData.revenue > 0 ? formData.revenue.toString() : '',
    units: formData.units > 0 ? formData.units.toString() : ''
  });

  useEffect(() => {
    const newFormData = {
      spend: dailyRecord.spend || 0,
      revenue: dailyRecord.revenue || 0,
      units: dailyRecord.units || 0
    };
    
    setFormData(newFormData);
    
    setInputValues({
      spend: newFormData.spend > 0 ? newFormData.spend.toString() : '',
      revenue: newFormData.revenue > 0 ? newFormData.revenue.toString() : '',
      units: newFormData.units > 0 ? newFormData.units.toString() : ''
    });
  }, [dailyRecord]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputValues(prev => ({
        ...prev,
        [name]: value
      }));
      
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      spend: formData.spend,
      revenue: formData.revenue,
      units: formData.units
    });
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    
    setFormData({
      spend: 0,
      revenue: 0,
      units: 0
    });
    
    setInputValues({
      spend: '',
      revenue: '',
      units: ''
    });
  };

  const costPerUnit = formData.units > 0 ? formData.spend / formData.units : 0;
  
  const cpaPercentage = formData.revenue > 0 ? (formData.spend / formData.revenue) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 relative">
      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="absolute top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-2 rounded flex items-center">
          <FaCheckCircle className="mr-2 text-green-500" />
          Datos guardados correctamente
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-4">
        <div className="flex items-center">
          <FaEdit className="mr-2 text-primary-color" />
          Registrar Datos del Día {selectedDate && <span className="ml-2 text-sm text-gray-400">({selectedDate})</span>}
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
                Gastos
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  $
                </span>
                <input 
                  type="text" 
                  name="spend"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                  value={inputValues.spend}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Ingresos
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  $
                </span>
                <input 
                  type="text" 
                  name="revenue"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                  value={inputValues.revenue}
                  onChange={handleChange}
                  placeholder="0"
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
                type="text" 
                name="units"
                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                value={inputValues.units}
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
                  {costPerUnit <= 15000 ? (
                    <span className="text-green-500">Óptimo</span>
                  ) : costPerUnit <= 20000 ? (
                    <span className="text-yellow-500">Regular</span>
                  ) : (
                    <span className="text-red-500">Alto</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Porcentaje de CPA */}
            <div className="bg-gray-750 p-4 rounded-lg border-t-2 border-orange-500">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-400 font-medium">% CPA</div>
                <div className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  Gasto/Ingreso
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xl font-bold">
                  {formData.revenue > 0 ? `${Math.round(cpaPercentage)}%` : '-'}
                </div>
                <div className="flex items-center text-xs">
                  {cpaPercentage <= 18 ? (
                    <span className="text-green-500">Óptimo</span>
                  ) : cpaPercentage <= 23 ? (
                    <span className="text-blue-500">Bueno</span>
                  ) : cpaPercentage <= 33 ? (
                    <span className="text-yellow-500">Límite</span>
                  ) : (
                    <span className="text-red-500">Pérdida</span>
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
            {showSuccess ? 'Datos Guardados' : 'Guardar Datos'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailyDataForm;

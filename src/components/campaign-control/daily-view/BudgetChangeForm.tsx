import React, { useState } from 'react';
import { FaExchangeAlt, FaSave, FaArrowUp, FaArrowDown, FaPlay, FaPause } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/formatters';

interface BudgetChangeFormProps {
  currentBudget: number;
  onSave: (data: {
    newBudget: number;
    reason: string;
    changeType: 'increase' | 'decrease' | 'pause' | 'resume';
  }) => void;
}

const BudgetChangeForm: React.FC<BudgetChangeFormProps> = ({ currentBudget, onSave }) => {
  const [formData, setFormData] = useState({
    newBudget: currentBudget,
    reason: '',
    changeType: 'increase' as 'increase' | 'decrease' | 'pause' | 'resume'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'newBudget' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaExchangeAlt className="mr-2 text-primary-color" />
        Registrar Cambio de Presupuesto
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-750 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">
              Tipo de Cambio
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ${
                formData.changeType === 'increase' ? 'bg-green-500/20 border border-green-500' : 'bg-gray-700 border border-gray-600'
              }`}>
                <input 
                  type="radio" 
                  name="changeType" 
                  value="increase" 
                  checked={formData.changeType === 'increase'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <FaArrowUp className={`mr-2 ${formData.changeType === 'increase' ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Aumentar</span>
              </label>
              
              <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ${
                formData.changeType === 'decrease' ? 'bg-red-500/20 border border-red-500' : 'bg-gray-700 border border-gray-600'
              }`}>
                <input 
                  type="radio" 
                  name="changeType" 
                  value="decrease" 
                  checked={formData.changeType === 'decrease'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <FaArrowDown className={`mr-2 ${formData.changeType === 'decrease' ? 'text-red-500' : 'text-gray-400'}`} />
                <span>Reducir</span>
              </label>
              
              <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ${
                formData.changeType === 'pause' ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-700 border border-gray-600'
              }`}>
                <input 
                  type="radio" 
                  name="changeType" 
                  value="pause" 
                  checked={formData.changeType === 'pause'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <FaPause className={`mr-2 ${formData.changeType === 'pause' ? 'text-yellow-500' : 'text-gray-400'}`} />
                <span>Pausar</span>
              </label>
              
              <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ${
                formData.changeType === 'resume' ? 'bg-blue-500/20 border border-blue-500' : 'bg-gray-700 border border-gray-600'
              }`}>
                <input 
                  type="radio" 
                  name="changeType" 
                  value="resume" 
                  checked={formData.changeType === 'resume'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <FaPlay className={`mr-2 ${formData.changeType === 'resume' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span>Reactivar</span>
              </label>
            </div>
          </div>
          
          {formData.changeType !== 'pause' && formData.changeType !== 'resume' && (
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">
                Nuevo Presupuesto (MXN)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      $
                    </span>
                    <input 
                      type="number" 
                      name="newBudget"
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-6"
                      value={formData.newBudget}
                      onChange={handleChange}
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="text-gray-400">Presupuesto Actual:</div>
                  <div className="font-medium">{formatCurrency(currentBudget)}</div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center">
                <div className="text-sm">
                  <span className="text-gray-400 mr-1">Cambio:</span>
                  <span className={`font-medium ${formData.newBudget > currentBudget ? 'text-green-500' : 'text-red-500'}`}>
                    {formData.newBudget > currentBudget ? '+' : ''}{formatCurrency(formData.newBudget - currentBudget)}
                    {' '}({Math.abs(Math.round((formData.newBudget - currentBudget) / currentBudget * 100))}%)
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Razón del Cambio
            </label>
            <textarea 
              name="reason"
              className="w-full bg-gray-700 border border-gray-600 rounded p-2"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explica brevemente la razón de este cambio de presupuesto..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button 
            type="submit"
            className="bg-primary-color hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaSave className="mr-2" />
            Guardar Cambio
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetChangeForm;

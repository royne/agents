import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

// Interfaz para los resultados de búsqueda
interface TransportadoraResult {
  id: string;
  transportadora: string;
  ciudad: string;
  departamento: string;
}

// Lista de transportadoras disponibles
const transportadorasOptions = [
  { id: 'veloces', nombre: 'Veloces' },
  { id: 'interrapidisimo', nombre: 'Inter Rapidísimo' },
  { id: 'coordinadora', nombre: 'Coordinadora' },
  { id: 'tcc', nombre: 'TCC' },
  { id: 'servientrega', nombre: 'Servientrega' },
  { id: 'envia', nombre: 'Envía' },
  { id: 'deprisa', nombre: 'Deprisa' },
  { id: 'fedex', nombre: 'FedEx' },
  { id: 'dhl', nombre: 'DHL' }
];

interface SearchResultsProps {
  result: TransportadoraResult | null;
  loading: boolean;
  error: string | null;
  searchType: 'ciudad' | 'departamento';
  onSave: (data: { transportadora: string; ciudad: string; departamento: string }) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  result, 
  loading, 
  error, 
  searchType,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    transportadora: '',
    ciudad: '',
    departamento: ''
  });

  // Inicializar el formulario cuando hay un resultado
  React.useEffect(() => {
    if (result) {
      setFormData({
        transportadora: result.transportadora,
        ciudad: result.ciudad,
        departamento: result.departamento
      });
    } else {
      setFormData({
        transportadora: '',
        ciudad: '',
        departamento: ''
      });
    }
  }, [result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-30 p-6 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Transportadora</label>
            <select
              name="transportadora"
              value={formData.transportadora}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Selecciona una transportadora</option>
              {transportadorasOptions.map(option => (
                <option key={option.id} value={option.nombre}>
                  {option.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Departamento</label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-color hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Guardar
          </button>
        </form>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-primary-color">{result.transportadora}</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary-color hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
            >
              <FaEdit />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Ciudad</p>
              <p className="text-xl font-medium text-white">{result.ciudad}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Departamento</p>
              <p className="text-xl font-medium text-white">{result.departamento}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-primary-color">Editar información</h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
            >
              <FaTimes />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Transportadora</label>
            <select
              name="transportadora"
              value={formData.transportadora}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Selecciona una transportadora</option>
              {transportadorasOptions.map(option => (
                <option key={option.id} value={option.nombre}>
                  {option.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Departamento</label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-color hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
          >
            <FaCheck className="mr-2" /> Guardar cambios
          </button>
        </form>
      )}
    </div>
  );
};

export default SearchResults;

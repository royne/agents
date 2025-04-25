import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaUpload, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { readCarriersFromExcel } from '../../utils/excelReader';
import { carrierDatabaseService, BaseCarrier } from '../../services/database/carrierDatabaseService';
import { useAppContext } from '../../contexts/AppContext';

const CarrierImporter: React.FC = () => {
  const { authData } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ count: number } | null>(null);
  const [preview, setPreview] = useState<BaseCarrier[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Verificar si el usuario es administrador al montar el componente
  useEffect(() => {
    const initializeService = async () => {
      if (authData?.isAuthenticated) {
        try {
          await carrierDatabaseService.setUserAndCompany(null, authData.company_id || null, checkIsAdmin());
        } catch (error) {
          console.error('Error inicializando servicio:', error);
        }
      }
    };
    
    initializeService();
  }, [authData]);
  
  // Usar la función isAdmin del contexto
  const { isAdmin: checkIsAdmin } = useAppContext();
  
  // Actualizar el estado isAdmin cuando cambie el contexto
  useEffect(() => {
    setIsAdmin(checkIsAdmin());
  }, [checkIsAdmin, authData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
      setPreview([]);
    }
  };

  const processFile = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo Excel');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Leer datos del archivo Excel
      const carriers = await readCarriersFromExcel(file);
      
      if (carriers.length === 0) {
        setError('No se encontraron datos válidos en el archivo');
        setLoading(false);
        return;
      }
      
      // Mostrar vista previa
      // Limitamos a 10 registros para la vista previa, pero agrupamos por transportadora para mostrar variedad
      const uniqueCarriers = carriers.reduce((acc, curr) => {
        const key = `${curr.name}-${curr.state}-${curr.city}`;
        if (!acc[key]) {
          acc[key] = curr;
        }
        return acc;
      }, {} as Record<string, BaseCarrier>);
      
      const previewData = Object.values(uniqueCarriers).slice(0, 10);
      setPreview(previewData);
      setLoading(false);
    } catch (err) {
      setError('Error al procesar el archivo: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const importCarriers = async () => {
    if (!file || preview.length === 0) {
      setError('No hay datos para importar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Leer todos los datos nuevamente
      const carriers = await readCarriersFromExcel(file);
      
      // Importar a la base de datos
      carrierDatabaseService.setUserAndCompany(null, authData?.company_id || null, checkIsAdmin());
      const result = await carrierDatabaseService.importBaseCarriers(carriers);
      
      if (result.success) {
        setSuccess({ count: result.count });
        setFile(null);
        setPreview([]);
      } else {
        setPreview(preview);
      }
      setLoading(false);
    } catch (err) {
      setError('Error al importar los datos: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-theme-component rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-theme-primary mb-4">Importar Transportadoras</h2>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">Acceso restringido</p>
          <p className="text-gray-400">Solo los administradores pueden importar transportadoras</p>
        </div>
      </div>
    );
  }

  // El componente principal para administradores

  return (
    <div className="bg-theme-component rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-theme-primary">Importar Transportadoras</h2>
        <div className="relative">
          <FaInfoCircle 
            className="text-theme-primary text-xl cursor-pointer" 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          />
          {showTooltip && (
            <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-gray-800 rounded-lg shadow-lg z-10 text-sm">
              <div className="relative">
                {/* Flecha del tooltip */}
                <div className="absolute bottom-0 right-4 transform translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
                
                <p className="text-gray-300 mb-2">
                  Sube un archivo Excel con las siguientes columnas: <span className="font-semibold">DEPARTAMENTO</span>, <span className="font-semibold">MUNICIPIO</span>, y columnas para cada transportadora:
                </p>
                <ul className="list-disc pl-5 text-gray-300 mb-2">
                  <li>TCC</li>
                  <li>ENVIA</li>
                  <li>COORDINADORA</li>
                  <li>INTERRAPIDISIMO</li>
                  <li>DOMINA</li>
                  <li>VELOCES</li>
                  <li>WILLOG</li>
                  <li>FUTURA</li>
                </ul>
                <p className="text-gray-300">
                  Marca con una <span className="font-semibold">X</span> las transportadoras que operan en cada municipio.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FaFileExcel className="w-10 h-10 text-green-500 mb-3" />
            <p className="mb-2 text-sm text-gray-300">
              <span className="font-semibold">Haz clic para seleccionar</span> o arrastra un archivo Excel
            </p>
            <p className="text-xs text-gray-400">XLSX, XLS (MAX. 10MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange}
          />
        </label>
      </div>
      
      {file && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <FaFileExcel className="text-green-500 mr-2" />
            <span className="text-white">{file.name}</span>
          </div>
          <button
            onClick={processFile}
            disabled={loading}
            className="bg-theme-primary hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <FaUpload className="mr-2" />
            {loading ? 'Procesando...' : 'Procesar Archivo'}
          </button>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-900 bg-opacity-30 text-green-400 rounded-lg flex items-center">
          <FaCheck className="mr-2" />
          Se importaron {success.count} transportadoras correctamente
        </div>
      )}
      
      {preview.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-white">Vista Previa</h3>
              <button
                onClick={importCarriers}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <FaCheck className="mr-2" />
                {loading ? 'Importando...' : 'Confirmar Importación'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {preview.map((carrier, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded text-sm">
                  <p className="text-theme-primary font-semibold mb-1">{carrier.name}</p>
                  <p><span className="font-semibold">Ciudad:</span> {carrier.city}</p>
                  <p><span className="font-semibold">Departamento:</span> {carrier.state}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Mostrando {preview.length} de {file ? 'muchos' : '0'} registros. La importación procesará todos los registros válidos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarrierImporter;

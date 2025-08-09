import React, { useState, useRef } from 'react';
import { FaFileExcel, FaUpload, FaBoxOpen, FaShoppingCart } from 'react-icons/fa';
import ExcelAnalysisService from '../../services/data-analysis/ExcelAnalysisService';

interface ExcelFileUploaderProps {
  onDataLoaded: (data: any[]) => void;
  analysisType: 'orders' | 'products';
  onAnalysisTypeChange?: (type: 'orders' | 'products') => void;
  showTypeSelector?: boolean;
  disabled?: boolean;
}

const ExcelFileUploader: React.FC<ExcelFileUploaderProps> = ({
  onDataLoaded,
  analysisType,
  onAnalysisTypeChange,
  showTypeSelector = true,
  disabled = false
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Verificar que sea un archivo Excel
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(selectedFile);
      } else {
        alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)');
      }
    }
  };

  const handleAnalysisTypeChange = (type: 'orders' | 'products') => {
    if (onAnalysisTypeChange) {
      onAnalysisTypeChange(type);
    }
  };

  const handleUpload = async () => {
    if (!file || disabled) {
      if (!file) alert('Por favor, selecciona un archivo Excel primero');
      return;
    }

    setIsLoading(true);

    try {
      // Utilizar el servicio para leer y procesar el archivo Excel
      let jsonData = await ExcelAnalysisService.readExcelFile(file);
      
      // Verificar que los datos sean válidos antes de procesarlos
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('El archivo no contiene datos válidos');
      }
      
      // Pasar los datos al componente padre
      onDataLoaded(jsonData);
    } catch (error: any) {
      console.error('Error al procesar el archivo:', error);
      // Mostrar un mensaje de error más específico
      alert(error?.message || 'Ocurrió un error al procesar el archivo Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      // Verificar que sea un archivo Excel
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(selectedFile);
      } else {
        alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isDragActive = false;

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaFileExcel className="mr-2 text-primary-color" /> Cargador de Archivos
      </h2>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
          <div className="flex-1">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-theme-component-hover'} transition-colors ${isDragActive ? 'border-primary-color bg-theme-component-hover' : 'border-theme-border'}`}
              onDragOver={!disabled ? handleDragOver : undefined}
              onDragEnter={!disabled ? handleDragEnter : undefined}
              onDragLeave={!disabled ? handleDragLeave : undefined}
              onDrop={!disabled ? handleDrop : undefined}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="hidden"
              />
              <FaUpload className="mx-auto text-3xl mb-2 text-gray-400" />
              <p className="text-theme-secondary mb-1">
                {file ? file.name : 'Haz clic para seleccionar un archivo Excel'}
              </p>
              <p className="text-xs text-theme-tertiary">
                Formatos soportados: .xlsx, .xls
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {showTypeSelector && (
            <div className="flex space-x-4">
              <button
                className={`flex items-center px-4 py-2 rounded-md ${analysisType === 'orders' ? 'bg-primary-color text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleAnalysisTypeChange('orders')}
              >
                <FaShoppingCart className="mr-2" /> Por Órdenes
              </button>
              <button
                className={`flex items-center px-4 py-2 rounded-md ${analysisType === 'products' ? 'bg-primary-color text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleAnalysisTypeChange('products')}
              >
                <FaBoxOpen className="mr-2" /> Por Productos
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            className={`mt-4 px-4 py-2 rounded-md bg-primary-color text-white flex items-center justify-center ${(file && !disabled) ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!file || disabled || isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              'Analizar Archivo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelFileUploader;

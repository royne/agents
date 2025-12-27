import React, { useState, useRef } from 'react';
import { FaFileExcel, FaUpload, FaBoxOpen, FaShoppingCart } from 'react-icons/fa';
import ExcelAnalysisService from '../../services/data-analysis/ExcelAnalysisService';
import { CreditService } from '../../lib/creditService';
import { supabase } from '../../lib/supabase';
import { useImageUsage } from '../../hooks/useImageUsage';

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
  const { refreshCredits } = useImageUsage();
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
      // 1. Validar y consumir créditos (2 para Excel)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const { can, balance } = await CreditService.canPerformAction(session.user.id, 'EXCEL_ANALYSIS', supabase);
      if (!can) {
        throw new Error(`Créditos insuficientes. Tienes ${balance} y necesitas 2.`);
      }

      // Utilizar el servicio para leer y procesar el archivo Excel
      let jsonData = await ExcelAnalysisService.readExcelFile(file);

      // Verificar que los datos sean válidos antes de procesarlos
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('El archivo no contiene datos válidos');
      }

      // Consumir créditos
      const consumeResult = await CreditService.consumeCredits(session.user.id, 'EXCEL_ANALYSIS', { fileName: file.name }, supabase);
      if (!consumeResult.success) throw new Error(consumeResult.error);

      // Refrescar créditos en el UI
      refreshCredits();

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
    <div className="soft-card p-8 mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <div className="p-2 bg-primary-color/10 rounded-lg mr-3">
          <FaFileExcel className="text-primary-color" />
        </div>
        Cargador de Archivos
      </h2>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
          <div className="flex-1">
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${disabled ? 'opacity-60 cursor-not-allowed border-white/5' : 'cursor-pointer hover:bg-primary-color/5 hover:border-primary-color/50 border-white/10'} ${isDragActive ? 'border-primary-color bg-primary-color/10' : ''}`}
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
              <div className="mb-4 inline-flex p-4 bg-white/5 rounded-full ring-8 ring-white/5 group-hover:ring-primary-color/10 transition-all">
                <FaUpload className="text-3xl text-theme-tertiary" />
              </div>
              <p className="text-theme-primary font-bold mb-2">
                {file ? file.name : 'Suelta tu archivo aquí o haz clic para buscar'}
              </p>
              <p className="text-xs text-theme-tertiary font-medium">
                Solo archivos .xlsx o .xls de hasta 25MB
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {showTypeSelector && (
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${analysisType === 'orders' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-theme-tertiary hover:text-theme-primary'}`}
                onClick={() => handleAnalysisTypeChange('orders')}
              >
                <FaShoppingCart className="mr-2" /> Órdenes
              </button>
              <button
                className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${analysisType === 'products' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-theme-tertiary hover:text-theme-primary'}`}
                onClick={() => handleAnalysisTypeChange('products')}
              >
                <FaBoxOpen className="mr-2" /> Productos
              </button>
            </div>
          )}

          <div className="flex-grow"></div>

          <button
            onClick={handleUpload}
            className={`px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center transition-all ${isLoading ? 'bg-white/10 text-theme-tertiary' : 'bg-primary-color text-black hover:shadow-[0_0_20px_rgba(18,216,250,0.4)] btn-modern'} ${(file && !disabled) ? '' : 'opacity-50 cursor-not-allowed'}`}
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

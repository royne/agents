import React, { useState, useCallback } from 'react';
import { FaCloudUploadAlt, FaFileImage, FaTrash } from 'react-icons/fa';

interface ImageUploaderProps {
  onImageSelect: (file: File | string | null) => void;
  label?: string;
  externalPreview?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, label = 'Imagen de Referencia', externalPreview }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sincronizar previsualización externa (desde biblioteca)
  React.useEffect(() => {
    if (externalPreview) {
      setPreview(externalPreview);
    } else if (!selectedFile) {
      setPreview(null);
    }
  }, [externalPreview, selectedFile]);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      // Validar tamaño (1MB = 1048576 bytes)
      if (file.size > 1024 * 1024) {
        alert('La imagen es demasiado pesada. El límite es de 1MB para asegurar un procesamiento rápido.');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    } else {
      alert('Por favor selecciona un archivo de imagen válido.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-theme-secondary mb-2">{label}</label>
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer bg-theme-component/50 border-gray-700 hover:border-primary-color ${isDragging ? 'border-primary-color bg-primary-color/5' : ''
            }`}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <FaCloudUploadAlt className="text-primary-color text-4xl mb-4" />
          <p className="text-theme-primary font-medium text-center">Haz clic o arrastra una imagen aquí</p>
          <p className="text-theme-tertiary text-sm mt-1">Sube el template o base para la generación</p>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-gray-700 bg-theme-component">
          <img src={preview} alt="Vista previa" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={clearFile}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-transform hover:scale-110"
            >
              <FaTrash />
            </button>
          </div>
          <div className="p-3 flex items-center bg-theme-component/80 backdrop-blur-sm">
            <FaFileImage className="text-primary-color mr-2" />
            <span className="text-theme-primary text-sm truncate">{selectedFile?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

import React from 'react';
import { FaCog } from 'react-icons/fa';
import { AspectRatio, ProductData } from '../../types/image-pro';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  productData: ProductData;
  onProductDataChange: (data: ProductData) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  onAspectRatioChange,
  productData,
  onProductDataChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-theme-component border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-effect">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-theme-primary flex items-center gap-3">
            <FaCog className="text-primary-color" /> Configuración Pro
          </h3>
          <button onClick={onClose} className="text-theme-tertiary hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-theme-tertiary uppercase tracking-[0.2em]">Formato de Salida</label>
            <div className="flex gap-4">
              <button
                onClick={() => onAspectRatioChange('1:1')}
                className={`flex-1 p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${aspectRatio === '1:1' ? 'border-primary-color bg-primary-color/10 shadow-lg' : 'border-white/5'}`}
              >
                <div className="w-8 h-8 border-2 border-current rounded-lg"></div>
                <span className="text-xs font-bold">Cuadrado</span>
              </button>
              <button
                onClick={() => onAspectRatioChange('9:16')}
                className={`flex-1 p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${aspectRatio === '9:16' ? 'border-primary-color bg-primary-color/10 shadow-lg' : 'border-white/5'}`}
              >
                <div className="w-6 h-10 border-2 border-current rounded-lg"></div>
                <span className="text-xs font-bold">Vertical</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-theme-tertiary uppercase tracking-[0.2em]">Instrucciones Extra</label>
            <textarea
              placeholder="Ej: Estilo minimalista, fondo blanco, iluminación de estudio..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-theme-primary focus:border-primary-color outline-none resize-none transition-all"
              value={productData.details}
              onChange={(e) => onProductDataChange({ ...productData, details: e.target.value })}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-primary-color text-black font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Listo, guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;

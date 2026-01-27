import React from 'react';
import { FaTrash, FaChevronRight, FaImages } from 'react-icons/fa';
import UsageCounter from '../ImageGen/UsageCounter';
import ImageUploader from '../ImageGen/ImageUploader';
import { ProductData, MarketingLayout } from '../../types/landing-pro';
import { MARKETING_LAYOUTS } from '../../constants/landing-pro';

interface IdentityCoreProps {
  productData: ProductData;
  baseImageBase64: string | null;
  styleImageBase64: string | null;
  selectedLayout: string | null;
  isContextOpen: boolean;
  onProductDataChange: (data: ProductData) => void;
  onImageSelect: (file: File | string | null) => void;
  onStyleImageSelect: (file: File | string | null) => void;
  onLayoutSelect: (layoutId: string | null) => void;
  setIsLibraryOpen: (open: boolean) => void;
  setIsContextOpen: (open: boolean) => void;
  setStyleImageBase64: (base64: string | null) => void;
}

const IdentityCore: React.FC<IdentityCoreProps> = ({
  productData,
  baseImageBase64,
  styleImageBase64,
  selectedLayout,
  isContextOpen,
  onProductDataChange,
  onImageSelect,
  onStyleImageSelect,
  onLayoutSelect,
  setIsLibraryOpen,
  setIsContextOpen,
  setStyleImageBase64
}) => {
  return (
    <div className="lg:col-span-4 space-y-6">
      <UsageCounter />

      <div className="soft-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-color/5 blur-2xl rounded-full -mr-8 -mt-8"></div>

        <h2 className="text-lg font-bold text-theme-primary mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary-color rounded-full"></div>
          Nucleo de Identidad
        </h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em] flex justify-between">
              <span id="tour-product-photo">1. Foto Producto Real</span>
              <span className="text-primary-color font-bold">Obligatorio</span>
            </label>
            <ImageUploader onImageSelect={onImageSelect} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em] flex justify-between">
              <span id="tour-branding-style">2. Referencia de Estilo / Branding</span>
            </label>

            <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl mt-4">
              <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em]">Elige un Estilo</label>
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="px-3 py-1.5 bg-primary-color/10 hover:bg-primary-color text-primary-color hover:text-black rounded-lg border border-primary-color/30 hover:shadow-[0_0_15px_rgba(18,216,250,0.3)] transition-all duration-300 flex items-center gap-1.5 group/lib"
              >
                <FaImages size={10} className="group-hover/lib:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-wider">Biblioteca</span>
              </button>
            </div>

            <div className="relative group">
              <span className="text-[10px] font-black uppercase tracking-wider">O Subir una Imagen</span>
              <ImageUploader
                onImageSelect={onStyleImageSelect}
                externalPreview={styleImageBase64}
              />
              {styleImageBase64 && (
                <button
                  onClick={() => setStyleImageBase64(null)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <button
              id="tour-context-trigger"
              onClick={() => setIsContextOpen(!isContextOpen)}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all ${isContextOpen || productData.name
                ? 'border-primary-color/30 bg-primary-color/5 text-primary-color'
                : 'border-white/5 bg-white/5 text-theme-tertiary'
                }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isContextOpen ? 'Información del Producto' : 'Abrir Contexto'}
              </span>
              <FaChevronRight className={`transition-transform duration-300 ${isContextOpen ? 'rotate-90' : ''}`} />
            </button>

            {isContextOpen && (
              <div className="space-y-4 p-4 bg-black/20 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Nombre del Producto</label>
                  <input
                    type="text"
                    placeholder="Ej: Reloj Nebula..."
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                    value={productData.name}
                    onChange={(e) => onProductDataChange({ ...productData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Ángulo de Venta</label>
                  <input
                    type="text"
                    placeholder="Ej: El regalo perfecto..."
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                    value={productData.angle}
                    onChange={(e) => onProductDataChange({ ...productData, angle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Cliente Ideal</label>
                  <input
                    type="text"
                    placeholder="Ej: Emprendedores..."
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                    value={productData.buyer}
                    onChange={(e) => onProductDataChange({ ...productData, buyer: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div id="tour-instructions" className="space-y-2">
              <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.15em]">Instrucciones / Detalles</label>
              <textarea
                placeholder="Ej: Estilo minimalista, fondo oscuro..."
                rows={3}
                className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs resize-none transition-all"
                value={productData.details}
                onChange={(e) => onProductDataChange({ ...productData, details: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityCore;

import React from 'react';
import { FaTrash, FaRocket, FaImages } from 'react-icons/fa';
import ImageUploader from '../ImageGen/ImageUploader';
import UsageCounter from '../ImageGen/UsageCounter';
import { PERSONA_PROMPTS } from '../../constants/image-pro';
import { useImagePro } from '../../hooks/useImagePro';

interface ImageConfigProps {
  state: ReturnType<typeof useImagePro>['state'];
  actions: ReturnType<typeof useImagePro>['actions'];
}

const ImageConfig: React.FC<ImageConfigProps> = ({ state, actions }) => {
  const {
    generationMode,
    adsSubMode,
    personaOption,
    faceSwapOption,
    aspectRatio,
    styleImageBase64,
    productData,
    isContextExpanded,
    isGenerating,
    baseImageBase64
  } = state;

  return (
    <div className="space-y-6">
      <UsageCounter />

      <div className="soft-card p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

        <h2 className="text-lg font-semibold text-theme-primary mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary-color rounded-full"></div>
          {generationMode === 'libre' ? 'Configuración Libre' : generationMode === 'ads' ? 'Configuración de Ads' : 'Configuración de Personas'}
        </h2>

        <div className="space-y-6">
          {/* OPCIONES SECUNDARIAS SEGÚN MODO */}
          {generationMode === 'ads' && (
            <div className="p-1 bg-white/5 rounded-xl flex gap-1 shadow-inner">
              <button
                onClick={() => actions.setAdsSubMode('sencillo')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${adsSubMode === 'sencillo' ? 'bg-white/10 text-white' : 'text-theme-tertiary'}`}
              >
                Sencillo (1)
              </button>
              <button
                onClick={() => actions.setAdsSubMode('completo')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${adsSubMode === 'completo' ? 'bg-white/10 text-white' : 'text-theme-tertiary'}`}
              >
                Completo (3)
              </button>
            </div>
          )}

          {generationMode === 'personas' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(PERSONA_PROMPTS).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => actions.setPersonaOption(opt as any)}
                    className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${personaOption === opt ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/5 bg-white/5 text-theme-tertiary hover:border-white/10'}`}
                  >
                    {opt === 'generar' ? 'Generar' : opt === 'fondo' ? 'Cambiar Fondo' : opt === 'cara' ? 'Cambiar Cara' : 'Agregar Prod.'}
                  </button>
                ))}
              </div>

              {personaOption === 'cara' && (
                <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => actions.setFaceSwapOption('rostro')}
                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${faceSwapOption === 'rostro' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-theme-tertiary hover:text-white'}`}
                  >
                    Solo Rostro
                  </button>
                  <button
                    onClick={() => actions.setFaceSwapOption('completo')}
                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${faceSwapOption === 'completo' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-theme-tertiary hover:text-white'}`}
                  >
                    Rostro y Cabello
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Formato de Salida</label>
              <div className="flex gap-2">
                <button
                  onClick={() => actions.setAspectRatio('1:1')}
                  className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${aspectRatio === '1:1' ? 'border-primary-color bg-primary-color/10 text-primary-color shadow-lg' : 'border-white/5 bg-white/5 text-theme-tertiary'}`}
                >
                  <div className="w-2.5 h-2.5 border border-current rounded-sm"></div>
                  <span className="text-[10px] font-bold">1:1</span>
                </button>
                <button
                  onClick={() => actions.setAspectRatio('9:16')}
                  className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-primary-color bg-primary-color/10 text-primary-color shadow-lg' : 'border-white/5 bg-white/5 text-theme-tertiary'}`}
                >
                  <div className="w-2 h-3.5 border border-current rounded-sm"></div>
                  <span className="text-[10px] font-bold">9:16</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label id="tour-image-product" className="text-[10px] font-black text-theme-secondary uppercase tracking-widest flex justify-between">
                <span>1. {generationMode === 'personas' ? 'Persona / Modelo Principal' : 'Foto Producto Real'}</span>
                <span className="text-primary-color animate-pulse font-bold">Obligatorio</span>
              </label>
              <ImageUploader onImageSelect={actions.handleImageSelect} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label id="tour-image-style" className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                  2. {generationMode === 'personas' ? 'Referencia de Rostro / Pose' : 'Referencia de Estilo'}
                </label>
                <button
                  onClick={() => actions.setIsLibraryOpen(true)}
                  className="px-3 py-1.5 bg-primary-color/10 hover:bg-primary-color text-primary-color hover:text-black rounded-lg border border-primary-color/30 hover:shadow-[0_0_15px_rgba(18,216,250,0.3)] transition-all duration-300 flex items-center gap-1.5 group/lib"
                >
                  <FaImages size={10} className="group-hover/lib:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Biblioteca</span>
                </button>
              </div>
              <div className="relative group">
                <span className="text-[10px] font-black uppercase tracking-wider">O Subir una Imagen</span>
                <ImageUploader
                  onImageSelect={actions.handleStyleImageSelect}
                  externalPreview={styleImageBase64}
                />
                {styleImageBase64 && (
                  <button
                    onClick={() => actions.setStyleImageBase64(null)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>

            {generationMode === 'personas' ? (
              <div className="space-y-4 pt-2">
                <button
                  onClick={() => actions.setIsContextExpanded(!isContextExpanded)}
                  className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${isContextExpanded || productData.name || productData.angle || productData.buyer ? 'border-primary-color/30 bg-primary-color/5 text-primary-color' : 'border-white/5 bg-white/5 text-theme-tertiary'}`}
                >
                  <span>{isContextExpanded ? 'Ocultar Contexto' : 'Ajustar Contexto (Nombre/Target)'}</span>
                  <div className={`w-2 h-2 rounded-full ${productData.name || productData.angle || productData.buyer ? 'bg-primary-color animate-pulse' : 'bg-gray-600'}`}></div>
                </button>

                {isContextExpanded && (
                  <div className="space-y-4 p-4 bg-black/20 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Nombre del Producto</label>
                      <input
                        type="text"
                        placeholder="Ej: Reloj Nebula..."
                        className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                        value={productData.name}
                        onChange={(e) => actions.setProductData({ ...productData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Ángulo de Venta</label>
                      <input
                        type="text"
                        placeholder="Ej: El regalo perfecto..."
                        className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                        value={productData.angle}
                        onChange={(e) => actions.setProductData({ ...productData, angle: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-theme-tertiary uppercase tracking-widest">Buyer Persona</label>
                      <input
                        type="text"
                        placeholder="Ej: Emprendedores..."
                        className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                        value={productData.buyer}
                        onChange={(e) => actions.setProductData({ ...productData, buyer: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div id="tour-image-context" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Nombre del Producto</label>
                  <input
                    type="text"
                    placeholder="Ej: Reloj Nebula..."
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                    value={productData.name}
                    onChange={(e) => actions.setProductData({ ...productData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Ángulo de Venta</label>
                  <input
                    type="text"
                    placeholder="Ej: El regalo perfecto para Navidad..."
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                    value={productData.angle}
                    onChange={(e) => actions.setProductData({ ...productData, angle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Buyer Persona</label>
                  <input
                    type="text"
                    placeholder="Ej: Emprendedores de 25-40 años..."
                    className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs transition-all"
                    value={productData.buyer}
                    onChange={(e) => actions.setProductData({ ...productData, buyer: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div id="tour-image-instructions" className="space-y-2">
              <label className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                {generationMode === 'personas' ? 'Instrucciones del Cambio' : 'Instrucciones / Detalles'}
              </label>
              <textarea
                placeholder={generationMode === 'personas' ? "Ej: Cambia el rostro de la modelo 1 por el de la modelo 2 manteniendo la luz..." : "Ej: Estilo minimalista, fondo oscuro..."}
                rows={3}
                className="w-full bg-theme-component border border-gray-700 rounded-xl p-3 text-theme-primary focus:border-primary-color outline-none text-xs resize-none transition-all"
                value={productData.details}
                onChange={(e) => actions.setProductData({ ...productData, details: e.target.value })}
              />
            </div>
          </div>

          <button
            id="tour-image-generate"
            onClick={() => actions.handleGenerate(false)}
            disabled={isGenerating || (generationMode !== 'personas' && !productData.name) || !baseImageBase64}
            className={`w-full py-4 mt-4 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all btn-modern disabled:opacity-30 disabled:cursor-not-allowed ${generationMode === 'libre' ? 'bg-primary-color' : generationMode === 'ads' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'}`}
          >
            {isGenerating ? (
              <div className="w-6 h-6 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <>
                <FaRocket /> {generationMode === 'ads' && adsSubMode === 'completo' ? `Generar Ad ${state.currentAdStep + 1}` : 'Generar Imagen Pro'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageConfig;

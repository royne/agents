import React, { useState, useEffect } from 'react';
import { FaBookmark, FaLightbulb, FaTimes, FaSearch, FaImage } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface ReferenceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  category?: string;
}

export const ReferenceLibraryModal: React.FC<ReferenceLibraryModalProps> = ({ isOpen, onClose, onSelect, category }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inspiration' | 'template'>('template');
  const [search, setSearch] = useState('');

  const [currentCategory, setCurrentCategory] = useState<string | undefined>(category);

  useEffect(() => {
    setCurrentCategory(category);
  }, [category]);

  useEffect(() => {
    if (isOpen) {
      fetchReferences();
    }
  }, [isOpen, currentCategory, activeTab]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReferences = async () => {
    setLoading(true);
    let query = supabase
      .from('visual_references')
      .select('*')
      .eq('type', activeTab);

    if (currentCategory) {
      if (currentCategory === 'landing') {
        query = query.ilike('base_category', 'landing-%');
      } else if (currentCategory === 'ads') {
        query = query.ilike('base_category', 'ads-%');
      } else {
        query = query.eq('base_category', currentCategory);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-theme-component border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-effect flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-xl font-bold text-theme-primary flex items-center gap-3">
              <FaBookmark className="text-primary-color" /> Biblioteca de Referencias
            </h3>
            <p className="text-xs text-theme-tertiary mt-1">
              Explora nuestra base de inspiración para potenciar tu diseño.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {currentCategory && (
              <button
                onClick={() => setCurrentCategory(undefined)}
                className="text-[10px] bg-white/5 px-2 py-1 rounded text-theme-tertiary hover:text-white transition-colors"
              >
                Ver Todo
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <FaTimes className="text-theme-tertiary" />
            </button>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="p-4 bg-black/20 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/5">
          <div className="flex bg-theme-primary/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('template')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'template' ? 'bg-primary-color text-black shadow-lg' : 'text-theme-secondary hover:text-white'}`}
            >
              <FaBookmark size={12} /> Templates (Estructura)
            </button>
            <button
              onClick={() => setActiveTab('inspiration')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inspiration' ? 'bg-primary-color text-black shadow-lg' : 'text-theme-secondary hover:text-white'}`}
            >
              <FaLightbulb size={12} /> Inspiración (Estilo)
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary text-xs" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-theme-primary outline-none focus:border-primary-color transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div>
              <p className="text-theme-tertiary animate-pulse">Cargando biblioteca...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden border border-white/5 bg-white/5 hover:border-primary-color/50 transition-all hover:translate-y-[-4px]"
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Overlay con botones */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(item.url);
                      }}
                      className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold rounded-lg border border-white/10 flex items-center justify-center gap-2"
                    >
                      <FaSearch className="text-[8px]" /> PREVISUALIZAR
                    </button>
                    <button className="w-full py-2 bg-primary-color text-black text-xs font-black rounded-lg shadow-xl">
                      USAR ESTE
                    </button>
                  </div>

                  <div className="p-2">
                    <p className="text-[10px] font-bold text-theme-primary truncate">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
              <FaImage size={48} className="text-theme-tertiary" />
              <p className="text-theme-secondary">No se encontraron referencias en esta categoría.</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-white/5 border-t border-white/5 text-center px-6">
          <p className="text-[10px] text-theme-tertiary">
            Tip: Elige un <b>Template</b> si necesitas guiar la composición, o <b>Inspiración</b> si quieres imitar el estilo visual.
          </p>
        </div>
      </div>

      {/* Modal Previsualización de Imagen */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setPreviewImage(null)}></div>
          <div className="relative max-w-5xl w-full h-[90vh] flex items-center justify-center">
            <img src={previewImage} alt="Fullscreen Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all backdrop-blur-md"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

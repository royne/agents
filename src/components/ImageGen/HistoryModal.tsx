import { useState, useEffect } from 'react';
import { FaHistory, FaDownload, FaImage, FaClock, FaExclamationTriangle, FaPlay } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface Generation {
  id: string;
  image_url: string | null;
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  mode: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function HistoryModal({ isOpen, onClose, userId }: HistoryModalProps) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory();
    }
  }, [isOpen, userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setGenerations(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleDownload = async (url: string, id: string) => {
    try {
      // Usamos fetch para obtener el archivo como blob y forzar la descarga
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;

      // Detectar extensión
      const extension = isVideo(url) ? 'mp4' : 'png';
      link.download = `generacion-${id.substring(0, 8)}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar memoria
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error al descargar:', err);
      // Fallback: abrir en nueva pestaña si falla el fetch (ej. CORS)
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      link.click();
    }
  };

  const isVideo = (url: string | null) => {
    if (!url) return false;
    return url.includes('.mp4') || url.includes('video') || url.includes('veo');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-theme-component border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-effect flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-theme-primary flex items-center gap-3">
            <FaHistory className="text-primary-color" /> Historial de Generaciones
          </h3>
          <button onClick={onClose} className="text-theme-tertiary hover:text-white transition-colors text-2xl">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div>
              <p className="text-theme-tertiary animate-pulse text-sm uppercase tracking-widest">Cargando tu arte...</p>
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <FaImage className="text-4xl text-theme-tertiary opacity-30" />
              </div>
              <p className="text-theme-secondary font-medium">Aún no tienes generaciones.</p>
              <p className="text-theme-tertiary text-sm">Tus creaciones estratégicas aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((gen) => (
                <div key={gen.id} className="group bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-primary-color/30 transition-all flex flex-col shadow-lg">
                  <div className="aspect-square relative bg-black/40 flex items-center justify-center overflow-hidden">
                    {gen.status === 'completed' && gen.image_url ? (
                      <>
                        {isVideo(gen.image_url) ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-blue-500/10">
                            <FaPlay className="text-4xl text-primary-color opacity-30 mb-2" />
                            <span className="text-[10px] font-black uppercase text-primary-color/50">Video UGC</span>
                          </div>
                        ) : (
                          <img src={gen.image_url} alt={gen.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleDownload(gen.image_url!, gen.id)}
                            className="p-3 bg-primary-color text-black rounded-full hover:scale-110 transition-transform"
                            title="Descargar"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </>
                    ) : gen.status === 'completed' && !gen.image_url ? (
                      <div className="flex flex-col items-center gap-2 p-4 text-center bg-white/5 w-full h-full justify-center">
                        <FaClock className="text-theme-tertiary text-2xl opacity-50" />
                        <span className="text-[9px] text-theme-tertiary font-bold uppercase tracking-tighter">Imagen expirada</span>
                        <span className="text-[8px] text-theme-tertiary/50">(Plan Free)</span>
                      </div>
                    ) : gen.status === 'pending' ? (
                      <div className="flex flex-col items-center gap-2">
                        <FaClock className="text-yellow-500 text-3xl animate-pulse" />
                        <span className="text-[10px] text-yellow-500 font-bold uppercase">Procesando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <FaExclamationTriangle className="text-rose-500 text-3xl" />
                        <span className="text-[10px] text-rose-500 font-bold uppercase">Error en generación</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                      {gen.mode}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] text-theme-secondary line-clamp-2 italic mb-3">"{gen.prompt}"</p>
                    <div className="flex items-center justify-between text-[9px] text-theme-tertiary border-t border-white/5 pt-3">
                      <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                      <span className="opacity-50">{new Date(gen.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/5 text-center">
          <p className="text-[9px] text-theme-tertiary uppercase tracking-widest opacity-50">
            Mostrando las últimas 20 generaciones
          </p>
        </div>
      </div>
    </div>
  );
}

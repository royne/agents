import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FaImages, FaUser, FaCalendarAlt, FaChevronLeft, FaChevronRight,
  FaSpinner, FaTimes, FaSearchPlus, FaHeart, FaComment,
  FaPaperPlane, FaRegBookmark
} from 'react-icons/fa';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader';
import { supabase } from '../../lib/supabase';

interface ImageGeneration {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
  mode?: string;
  profiles: {
    name: string;
    email: string;
    avatar_url?: string;
    plan?: string;
  };
}

export default function AdminGallery() {
  const [images, setImages] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [previewImage, setPreviewImage] = useState<ImageGeneration | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = async (pageNum: number) => {
    if (loading || (pageNum > 1 && !hasMore)) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      const res = await fetch(`/api/admin/image-generations?page=${pageNum}&limit=30`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        if (pageNum === 1) {
          setImages(data.data);
        } else {
          setImages(prev => [...prev, ...data.data]);
        }
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
        setHasMore(pageNum < data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(1);
  }, []);

  // Intersection Observer for Infinite Scroll
  const observerTarget = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => {
            const nextPage = prev + 1;
            fetchImages(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewImage]);

  const renderPrompt = (prompt: string) => {
    try {
      // Check if it's a strategic prompt JSON
      if (prompt.includes('"strategicPrompt"')) {
        const parsed = JSON.parse(prompt);
        return parsed.strategicPrompt || prompt;
      }
      return prompt;
    } catch (e) {
      return prompt;
    }
  };

  const getModeLabel = (mode?: string) => {
    if (!mode) return 'V2 Gen';
    switch (mode.toLowerCase()) {
      case 'ads': return 'Ads Pro';
      case 'landing': return 'Landing Pro';
      case 'section': return 'Sección';
      default: return mode.toUpperCase();
    }
  };

  // Logic to split items into columns for horizontal orderingMASONRY
  const useColumns = (items: any[], columnCount: number) => {
    const columns: any[][] = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  };

  const [colCount, setColCount] = useState(6);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setColCount(1);
      else if (window.innerWidth < 768) setColCount(2);
      else if (window.innerWidth < 1024) setColCount(3);
      else if (window.innerWidth < 1280) setColCount(4);
      else if (window.innerWidth < 1536) setColCount(5);
      else setColCount(6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columnItems = useColumns(images, colCount);

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Galería de Imágenes</title>
        </Head>
        <div className="flex flex-col h-full">
          <PageHeader
            title={
              <>
                <FaImages className="inline-block mr-2 mb-1" />
                Galería de Imágenes
              </>
            }
            description={`Explora las ${total} imágenes generadas por la comunidad.`}
            backLink="/admin"
          />

          {loading && images.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-primary-color mb-4" />
              <p className="text-theme-secondary">Cargando galería...</p>
            </div>
          ) : (
            <>
              {/* Instagram-style Ordered Masonry Grid */}
              <div className="flex gap-4 pb-12 overflow-hidden">
                {columnItems.map((column, colIdx) => (
                  <div key={colIdx} className="flex-1 flex flex-col gap-4">
                    {column.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setPreviewImage(img)}
                        className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 group/igpost cursor-pointer"
                      >
                        {/* Header (Instagram style) */}
                        <div className="p-2.5 flex items-center justify-between border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                              <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-0.5 overflow-hidden">
                                {img.profiles?.avatar_url ? (
                                  <img src={img.profiles.avatar_url} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-primary-color/20 flex items-center justify-center text-[8px] font-black text-primary-color">
                                    {img.profiles?.name?.substring(0, 2).toUpperCase() || 'DA'}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-white leading-none truncate max-w-[80px]">{img.profiles?.name || 'Anónimo'}</span>
                                {img.profiles?.plan && (
                                  <span className="text-[7px] font-black bg-white/10 text-white/60 px-1 py-0.5 rounded-sm uppercase tracking-tighter shrink-0 border border-white/5">
                                    {img.profiles.plan}
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] text-white/40 leading-none mt-0.5">{getModeLabel(img.mode)}</span>
                            </div>
                          </div>
                          <div className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">
                            {new Date(img.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                          </div>
                        </div>

                        {/* Image Container */}
                        <div className="relative overflow-hidden w-full h-auto bg-black/40">
                          <img
                            src={img.image_url}
                            alt={img.prompt}
                            className="w-full h-auto object-contain transition-transform duration-700 group-hover/igpost:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/igpost:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 text-white scale-90 group-hover/igpost:scale-100 transition-transform">
                              <FaSearchPlus />
                            </div>
                          </div>
                        </div>

                        {/* Actions (Aesthetic items) */}
                        <div className="p-3 pb-2 flex items-center justify-between opacity-50">
                          <div className="flex gap-3 text-white/90">
                            <FaHeart className="text-xs hover:text-red-500 transition-colors cursor-pointer" />
                            <FaComment className="text-xs hover:text-primary-color transition-colors cursor-pointer" />
                            <FaPaperPlane className="text-xs hover:text-primary-color transition-colors cursor-pointer" />
                          </div>
                          <FaRegBookmark className="text-xs text-white/90 cursor-pointer hover:text-primary-color transition-colors" />
                        </div>

                        {/* Caption Area */}
                        <div className="px-3 pb-4">
                          <p className="text-[10px] text-white/90 line-clamp-2 leading-snug italic font-medium">
                            "{renderPrompt(img.prompt)}"
                          </p>
                          <p className="text-[8px] text-white/30 mt-2 font-bold lowercase truncate opacity-40">
                            {img.profiles?.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Sentinel */}
              <div ref={observerTarget} className="h-20 flex items-center justify-center">
                {loading && (
                  <div className="flex flex-col items-center gap-2">
                    <FaSpinner className="animate-spin text-2xl text-primary-color" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary">Cargando más...</span>
                  </div>
                )}
                {!hasMore && images.length > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary opacity-40 italic">
                    Has llegado al final de la galería
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>

      {/* Modal Previsualización de Imagen */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setPreviewImage(null)}></div>

          <div className="relative max-w-6xl w-full max-h-full flex flex-col gap-4 overflow-y-auto scrollbar-hide py-10">
            <div className="relative w-full flex-shrink-0 flex items-center justify-center">
              <img
                src={previewImage.image_url}
                alt="Fullscreen Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="fixed top-8 right-8 bg-white/10 hover:bg-red-500/80 w-12 h-12 rounded-2xl text-white transition-all backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl z-[120]"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="w-full max-w-4xl mx-auto bg-theme-component/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl flex-shrink-0 mb-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-color flex items-center justify-center text-black shadow-lg shadow-primary-color/20 rotate-3 overflow-hidden">
                    {previewImage.profiles?.avatar_url ? (
                      <img src={previewImage.profiles.avatar_url} alt={previewImage.profiles.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaUser size={24} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{previewImage.profiles?.name}</h3>
                      {previewImage.profiles?.plan && (
                        <span className="text-[10px] font-black bg-white/10 text-primary-color px-2 py-0.5 rounded-md uppercase tracking-widest border border-primary-color/20">
                          Plan {previewImage.profiles.plan}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-theme-tertiary font-bold lowercase opacity-60">{previewImage.profiles?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest mb-1 opacity-60">Generada via {getModeLabel(previewImage.mode)}</p>
                  <p className="text-lg font-black text-white uppercase">{new Date(previewImage.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-primary-color uppercase tracking-widest opacity-80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-color animate-pulse"></span> Strategic Visual Instructions
                  </p>
                </div>
                <p className="text-sm text-theme-secondary leading-relaxed italic whitespace-pre-wrap">
                  {renderPrompt(previewImage.prompt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .break-inside-avoid {
          break-inside: avoid-column;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .break-inside-avoid {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </ProtectedRoute>
  );
}

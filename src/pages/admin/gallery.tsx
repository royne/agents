import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaImages, FaUser, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSpinner, FaTimes, FaSearchPlus } from 'react-icons/fa';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader';
import { supabase } from '../../lib/supabase';

interface ImageGeneration {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
  profiles: {
    name: string;
    email: string;
  };
}

export default function AdminGallery() {
  const [images, setImages] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [previewImage, setPreviewImage] = useState<ImageGeneration | null>(null);

  const fetchImages = async (pageNum: number) => {
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
        setImages(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(page);
  }, [page]);

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
              {/* Pinterest-style Masonry Grid */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4 pb-12">
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setPreviewImage(img)}
                    className="break-inside-avoid bg-theme-component rounded-2xl overflow-hidden shadow-lg border border-white/5 hover:border-primary-color/30 hover:shadow-2xl hover:shadow-primary-color/10 transform hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden aspect-auto">
                      <img
                        src={img.image_url}
                        alt={img.prompt}
                        className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                        <div className="bg-primary-color/90 text-black w-8 h-8 rounded-lg flex items-center justify-center self-end mb-auto shadow-lg">
                          <FaSearchPlus />
                        </div>
                        <p className="text-white text-xs line-clamp-4 italic font-medium leading-relaxed mb-1">
                          "{img.prompt}"
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] backdrop-blur-sm border-t border-white/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-color/10 flex items-center justify-center text-primary-color shrink-0 border border-primary-color/20">
                          <FaUser className="text-sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white truncate uppercase tracking-tight">
                            {img.profiles?.name || 'Usuario Anónimo'}
                          </p>
                          <p className="text-[10px] text-theme-tertiary truncate font-bold lowercase opacity-60">
                            {img.profiles?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-theme-tertiary font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 opacity-60">
                          <FaCalendarAlt size={10} />
                          <span>{new Date(img.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="bg-primary-color/10 text-primary-color px-2 py-0.5 rounded-md border border-primary-color/20">
                          V2 Gen
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center gap-6 py-10 mt-auto border-t border-white/5 bg-black/20 rounded-t-3xl">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-theme-component border border-white/5 text-theme-primary hover:bg-theme-component-hover hover:border-primary-color/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                  <FaChevronLeft />
                </button>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-theme-tertiary uppercase tracking-[0.2em] mb-1">Página</span>
                  <span className="text-xl font-black text-white">
                    {page} <span className="text-theme-tertiary opacity-30 mx-1">/</span> {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-theme-component border border-white/5 text-theme-primary hover:bg-theme-component-hover hover:border-primary-color/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                  <FaChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>

      {/* Modal Previsualización de Imagen */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setPreviewImage(null)}></div>
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="relative w-full h-[70vh] flex items-center justify-center group">
              <img
                src={previewImage.image_url}
                alt="Fullscreen Preview"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 bg-white/10 hover:bg-red-500/80 w-12 h-12 rounded-2xl text-white transition-all backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="w-full max-w-3xl bg-theme-component/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-color flex items-center justify-center text-black shadow-lg shadow-primary-color/20 rotate-3">
                    <FaUser size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{previewImage.profiles?.name}</h3>
                    <p className="text-xs text-theme-tertiary font-bold lowercase opacity-60">{previewImage.profiles?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest mb-1 opacity-60">Generada</p>
                  <p className="text-sm font-black text-white uppercase">{new Date(previewImage.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-primary-color uppercase tracking-widest mb-2 opacity-80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-color animate-pulse"></span> Prompt de Generación
                </p>
                <p className="text-sm text-theme-secondary leading-relaxed italic">
                  "{previewImage.prompt}"
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

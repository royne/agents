import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PhoneMockup from '../../components/v2/Canvas/PhoneMockup';
import InstagramPost from '../../components/v2/Dashboard/InstagramPost';
import { Launch } from '../../services/launches/types';
import { LandingGenerationState, SectionGeneration, AdGeneration } from '../../types/image-pro';
import { FaRocket, FaChevronLeft, FaMagic, FaBoxOpen, FaLink } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export default function LaunchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { authData } = useAppContext();

  const [launch, setLaunch] = useState<Launch | null>(null);
  const [generations, setGenerations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'landing' | 'ads'>('landing');

  useEffect(() => {
    if (!id || !authData?.isAuthenticated) return;

    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers = {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const [launchRes, gensRes] = await Promise.all([
          fetch(`/api/v2/launches/${id}`, { headers }),
          fetch(`/api/v2/launches/generations?launchId=${id}`, { headers })
        ]);

        const launchData = await launchRes.json();
        const gensData = await gensRes.json();

        if (launchData.success) setLaunch(launchData.data);
        if (gensData.success) setGenerations(gensData.data);
      } catch (error) {
        console.error('Error loading launch details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, authData]);

  // Transform generations into LandingGenerationState for PhoneMockup
  const getLandingState = (): LandingGenerationState => {
    if (!launch) return { phase: 'landing', proposedStructure: null, selectedSectionId: null, selectedReferenceUrl: null, generations: {}, adGenerations: {} };

    const gensMap: Record<string, SectionGeneration> = {};
    const adGensMap: Record<string, AdGeneration> = {};

    generations.forEach(g => {
      if (g.mode === 'landing' || g.mode === 'Discovery') { // Map common modes
        gensMap[g.sub_mode || 'hero'] = {
          imageUrl: g.image_url,
          status: g.status,
          copy: g.details?.copy || { headline: '', body: '' }
        };
      } else if (g.mode === 'ads' || g.mode === 'video') {
        adGensMap[g.sub_mode || g.id] = {
          imageUrl: g.image_url,
          status: g.status,
          aspectRatio: g.details?.aspectRatio || '1:1'
        };
      }
    });

    return {
      phase: 'landing',
      proposedStructure: launch.landing_structure,
      selectedSectionId: null,
      selectedReferenceUrl: null,
      generations: gensMap,
      adGenerations: adGensMap,
      adConcepts: launch.ad_concepts
    };
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-primary-color border-t-transparent animate-spin rounded-full"></div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Cargando War Room...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!launch) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-black text-white uppercase">Lanzamiento no encontrado</h1>
          <button onClick={() => router.push('/launches')} className="mt-4 text-primary-color underline">Volver al Index</button>
        </div>
      </DashboardLayout>
    );
  }

  const landingState = getLandingState();



  return (
    <DashboardLayout>
      <Head>
        <title>{launch.name} - War Room</title>
      </Head>

      <div className="v2-layout-container flex flex-col gap-6 pb-32">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/launches')}
            className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
          >
            <FaChevronLeft className="text-[7px]" /> Volver a mis lanzamientos
          </button>

          <div className="flex gap-4">
            <button className="px-6 py-2 bg-primary-color text-black font-black rounded-xl text-[9px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_30px_rgba(18,216,250,0.2)] flex items-center gap-2">
              <FaRocket /> Cargar en Dashboard
            </button>
          </div>
        </div>

        {/* Hero Header Simplified */}
        <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
          <div className={`px-2 py-0.5 w-fit rounded-full text-[7px] font-black uppercase tracking-widest border border-white/10 bg-primary-color/10 text-primary-color`}>
            {launch.status}
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">
            {launch.name}
          </h1>
        </div>

        {/* NEW 60/40 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Info (60% -> 7/12) */}
          <div className="lg:col-span-8 space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ADN & Strategia Compacto */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaBoxOpen className="text-primary-color text-sm" />
                  <h2 className="text-lg font-black text-white uppercase tracking-tighter">ADN Vendedor</h2>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-5 relative overflow-hidden group">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-primary-color uppercase tracking-widest">Ángulo de Venta</span>
                    <p className="text-xs text-white/90 leading-relaxed italic line-clamp-3">"{launch.product_dna?.angle}"</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-primary-color uppercase tracking-widest">Comprador Ideal</span>
                    <p className="text-xs text-white/70 font-bold uppercase tracking-tight">{launch.product_dna?.buyer}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Atributos Visuales</span>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{launch.product_dna?.details}</p>
                  </div>
                </div>
              </div>

              {/* Estrategia & Imagen Original */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaMagic className="text-primary-color text-sm" />
                  <h2 className="text-lg font-black text-white uppercase tracking-tighter">Estrategia AI</h2>
                </div>

                <div className="bg-primary-color/[0.02] border border-primary-color/10 rounded-[32px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-primary-color text-black text-[8px] font-black uppercase tracking-widest rounded-lg">
                      {launch.creative_strategy?.package?.name || "Sin Estrategia"}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed italic">
                    {launch.creative_strategy?.justification || "Análisis completado exitosamente."}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={launch.thumbnail_url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="Original" />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Imagen de Referencia</span>
                      <p className="text-[9px] text-white/60 font-medium leading-tight">Esta es la pieza original que alimentó el motor de IA.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contexto de Activos (Resumen) */}
            <div className="bg-white/[0.01] border border-white/5 border-dashed rounded-[32px] p-8 text-center bg-gradient-to-b from-transparent to-black/20">
              <h3 className="text-lg font-black text-white/80 uppercase tracking-tighter mb-2">Previsualización del Ecosistema</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
                Usa el dispositivo a tu derecha para navegar entre la Landing Page y el Feed de Anuncios. Todos los activos han sido orquestados bajo la misma línea estratégica.
              </p>
            </div>

          </div>

          {/* Right Column: Unified Mockup (40% -> 5/12) */}
          <div className="lg:col-span-4 flex flex-col items-center gap-6 sticky top-8">

            {/* View Selector */}
            <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1.5 w-full max-w-[360px] mb-2">
              <button
                onClick={() => setViewMode('landing')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'landing' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-white/40 hover:text-white'}`}
              >
                Landing
              </button>
              <button
                onClick={() => setViewMode('ads')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ads' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-white/40 hover:text-white'}`}
              >
                Ads Feed
              </button>
            </div>

            <PhoneMockup
              landingState={landingState}
              className="w-full max-w-[360px]"
              viewMode={viewMode}
            />

            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-2">V2 Realtime Renderer</span>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

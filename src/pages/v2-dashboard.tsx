import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '../components/layout/DashboardLayout';
import HeaderCredits from '../components/dashboard/HeaderCredits';
import AdsCarousel from '../components/v2/Dashboard/AdsCarousel';
import PhoneMockup from '../components/v2/Canvas/PhoneMockup';
import { FaRocket, FaInstagram, FaMobileAlt } from 'react-icons/fa';
import Link from 'next/link';
import { LandingGenerationState, SectionGeneration } from '../types/image-pro';

const V2DashboardPage: React.FC = () => {
  const [adReferences, setAdReferences] = useState<any[]>([]);
  const [landingSections, setLandingSections] = useState<any[]>([]);
  const [landingGenerations, setLandingGenerations] = useState<Record<string, SectionGeneration>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setIsLoading(true);
        // Fetch Ads References
        const adsRes = await fetch('/api/v2/ads/references');
        const adsData = await adsRes.json();
        if (adsData.success) {
          const ads = adsData.data.map((ref: any, index: number) => ({
            id: `ad-${ref.id}`,
            title: ref.name || `Concepto ${index + 1}`,
            imageUrl: ref.url,
            hook: "Optimiza tu conversión con el poder de la Inteligencia Artificial.",
            adCta: "COMPRAR AHORA"
          }));

          // Mezclar aleatoriamente los anuncios
          const shuffledAds = ads.sort(() => Math.random() - 0.5);
          setAdReferences(shuffledAds.slice(0, 8));
        }

        // Mapeo de categorías del showcase a categorías reales en la DB
        const categoryMapping: Record<string, string> = {
          'hero': 'hero',
          'beneficios': 'beneficios',
          'testimonios': 'testimonios',
          'autoridad': 'autoridad',
          'cierre': 'cierre'
        };

        const categories = Object.keys(categoryMapping);
        const allSections: any[] = [];
        const allGenerations: Record<string, SectionGeneration> = {};

        await Promise.all(categories.map(async (cat) => {
          const dbCat = categoryMapping[cat];
          const res = await fetch(`/api/v2/landing/references?sectionId=${dbCat}`);
          const data = await res.json();
          if (data.success && data.data.length > 0) {
            // Mezclar las referencias de esta categoría y tomar 4 al azar
            const shuffledRefs = data.data.sort(() => Math.random() - 0.5).slice(0, 4);

            shuffledRefs.forEach((ref: any) => {
              const sectionId = `${cat}-${ref.id}`;
              allSections.push({
                sectionId: sectionId,
                title: `${cat.toUpperCase()}`,
                reasoning: `Referencia táctica de ${cat}.`
              });

              allGenerations[sectionId] = {
                status: 'completed',
                imageUrl: ref.url,
                copy: {
                  headline: ref.name || "Diseño de Alto Impacto",
                  body: "Optimizado para conversión máxima."
                }
              };
            });
          }
        }));

        // Ordenar según el flujo típico de una landing
        const sortedSections = allSections.sort((a, b) => {
          const order = ['hero', 'beneficios', 'testimonios', 'autoridad', 'cierre'];
          const aType = a.sectionId.split('-')[0];
          const bType = b.sectionId.split('-')[0];
          return order.indexOf(aType) - order.indexOf(bType);
        });

        setLandingSections(sortedSections);
        setLandingGenerations(allGenerations);
      } catch (error) {
        console.error("Error fetching references:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferences();
  }, []);

  const MOCK_LANDING_STATE: LandingGenerationState = {
    phase: 'landing',
    proposedStructure: {
      sections: landingSections.length > 0 ? landingSections : [
        { sectionId: 'hero', title: 'Impacto Visual Hero', reasoning: '...' },
        { sectionId: 'social', title: 'Prueba Social', reasoning: '...' },
        { sectionId: 'benefits', title: 'Beneficios Clave', reasoning: '...' }
      ]
    },
    selectedSectionId: null,
    selectedReferenceUrl: null,
    generations: Object.keys(landingGenerations).length > 0 ? landingGenerations : {},
    adGenerations: {},
    adConcepts: []
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Showcase V2 | DropApp</title>
      </Head>

      <div className="v2-layout-container flex flex-col gap-8">
        {/* Header Replicado del Dashboard 1 */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <HeaderCredits className="flex-1" />
          <div className="pt-2">
            <Link href="/v2">
              <button className="px-6 py-3 bg-primary-color text-black font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_30px_rgba(18,216,250,0.2)] flex items-center gap-2">
                <FaRocket /> Nuevo Proyecto
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Redes Sociales (8/12) */}
          <div className="lg:col-span-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] px-4 py-2 backdrop-blur-3xl relative overflow-hidden h-fit">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 blur-[60px] rounded-full pointer-events-none"></div>
                <AdsCarousel customAds={adReferences.length > 0 ? adReferences : undefined} />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mobile View (4/12) */}
          <div className="lg:col-span-4 flex flex-col items-center gap-4">
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-[32px] px-4 py-4 flex flex-col items-center gap-3 h-fit">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                <FaMobileAlt className="text-primary-color text-[10px]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Gama de Landings</span>
              </div>

              <div className="w-full flex justify-center py-2 h-[670px] overflow-hidden">
                <PhoneMockup
                  landingState={MOCK_LANDING_STATE}
                  className="flex flex-col items-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default V2DashboardPage;

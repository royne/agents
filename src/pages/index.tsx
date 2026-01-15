import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  FaMagic, FaRocket, FaFilm, FaPlayCircle, FaFileExcel,
  FaPercentage, FaBoxOpen, FaLightbulb, FaChartArea
} from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import type { ModuleKey, Plan } from '../constants/plans';
import { PLAN_CREDITS } from '../constants/plans';
import DashboardSection from '../components/dashboard/DashboardSection';
import ModuleCard from '../components/dashboard/ModuleCard';
import Head from 'next/head';
import PublicLanding from '../components/public/PublicLanding';
import { useRouter } from 'next/router';
import WhatsAppButton from '../components/common/WhatsAppButton';
import DashboardTour from '../components/tours/DashboardTour';

export default function Dashboard() {
  const { authData, isAdmin, canAccessModule, isSyncing } = useAppContext();
  const router = useRouter();

  const getModuleStatus = (key: ModuleKey) => {
    return canAccessModule(key);
  };

  // Si authData es null (está cargando o verificando), mostramos un fondo oscuro mientras se decide
  if (!authData) {
    return <div className="min-h-screen bg-[#050608]"></div>;
  }

  // Mostrar la Landing Page si no hay sesión iniciada
  if (!authData.isAuthenticated) {
    return (
      <>
        <Head>
          <title>DROPAPP - IA para E-commerce</title>
        </Head>
        <PublicLanding />
      </>
    );
  }

  const planKey = (authData.plan || 'free') as Plan;
  const maxCredits = PLAN_CREDITS[planKey] || 50;
  const currentCredits = authData.credits || 0;
  const percentage = Math.min(Math.round((currentCredits / maxCredits) * 100), 100);

  return (
    <DashboardLayout>
      <Head>
        <title>DROPAPP - Dashboard</title>
      </Head>
      <div className="w-full px-8 py-4 space-y-6">
        {/* Sección de Perfil Minimalista */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 mx-2">
          <div className="flex flex-col">
            <h2 id="tour-welcome" className="text-4xl font-black text-white tracking-tighter">
              ¡Hola, <span className="text-primary-color">{authData.name?.split(' ')[0] || 'Usuario'}</span>!
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 -ml-0.5">
              Portal de gestión inteligente
            </p>
            {authData.community_name && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-color/10 border border-primary-color/20 translate-in-bottom">
                <span className="text-[10px] font-black text-primary-color uppercase tracking-widest leading-none">
                  Miembro de <span className="text-white ml-1">{authData.community_name}</span>
                </span>
              </div>
            )}
          </div>

          <div id="tour-credits" className="flex flex-col md:items-end gap-3 min-w-[280px]">
            <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
              <span className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-primary-color'} shadow-[0_0_8px_rgba(18,216,250,0.5)]`}></div>
                Plan {authData.plan || 'Free'}
              </span>
              <span className="text-white/80 flex items-center gap-2">
                {isSyncing && (
                  <div className="w-3 h-3 border-2 border-primary-color/30 border-t-primary-color rounded-full animate-spin"></div>
                )}
                <span className="text-primary-color font-bold">{currentCredits}</span> / {maxCredits} Créditos
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
              <div
                className="h-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(18,216,250,0.6)]"
                style={{
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, #12D8FA 0%, #3B82F6 100%)'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sección 1: ¿Qué quieres hacer hoy? */}
        <DashboardSection title="¿Qué quieres hacer hoy?">
          <ModuleCard
            name="Landing PRO"
            description="Crea una landing optimizada para vender hoy con IA de alto impacto"
            icon={FaRocket}
            path="/landing-pro"
            gradientClass="gradient-creative"
            buttonText="Generar Landing"
            buttonClass="btn-premium-green"
            badge="Estrategia"
            disabled={!getModuleStatus('landing-pro')}
            isLarge={true}
            containerId="tour-landing-card"
          />
          <ModuleCard
            name="Imagen PRO"
            description="Imágenes, Banners & Catálogos publicitarios en segundos"
            icon={FaMagic}
            path="/image-pro"
            gradientClass="gradient-strategy"
            buttonText="Crear Creatividades"
            buttonClass="btn-premium-blue"
            badge="Creativos"
            disabled={!getModuleStatus('image-pro')}
            isLarge={true}
          />
          <ModuleCard
            name="Video Generator"
            description="Videos listos para Ads Sociales con ganchos virales"
            icon={FaFilm}
            path="/video-pro"
            gradientClass="gradient-video"
            buttonText="Generar Video Ad"
            buttonClass="btn-premium-purple"
            disabled={!getModuleStatus('video-pro')}
            isLarge={true}
          />
        </DashboardSection>

        {/* Sección 2: Control & Decisión */}
        <DashboardSection title="Control & Decisión">
          <ModuleCard
            name="Análisis de Rentabilidad"
            description="Análisis de ventas y ganancias"
            icon={FaFileExcel}
            path="/data-analysis/analysis"
            gradientClass="gradient-subtle-blue"
            buttonText="Analizar Archivo"
            buttonClass="btn-premium-gray"
            disabled={!getModuleStatus('data-analysis')}
          />
          <ModuleCard
            name="Calculadora de Precios"
            description="Simula márgenes de beneficio"
            icon={FaPercentage}
            path="/calculator"
            gradientClass="gradient-subtle-blue"
            buttonText="Calcular Precio"
            buttonClass="btn-premium-gray"
            disabled={!getModuleStatus('calculator')}
          />
          <ModuleCard
            name="Gestión Logística"
            description="Monitorea tus envíos"
            icon={FaBoxOpen}
            path="/logistic"
            gradientClass="gradient-subtle-blue"
            buttonText="Ver Transportes"
            buttonClass="btn-premium-gray"
            disabled={!getModuleStatus('logistic')}
          />
        </DashboardSection>

        {/* Sección 3: Flujos Inteligentes */}
        <DashboardSection title="Flujos Inteligentes">
          <ModuleCard
            name="Agentes"
            description="Lanza y optimiza un nuevo producto"
            icon={FaLightbulb}
            path="/agents"
            gradientClass="gradient-subtle-purple"
            buttonText="Iniciar Flujo"
            buttonClass="btn-premium-gray"
            disabled={!getModuleStatus('agents')}
          />
          <ModuleCard
            name="Master Chat"
            description="Mejora el rendimiento de tus Ads"
            icon={FaChartArea}
            path="/chat"
            gradientClass="gradient-subtle-orange"
            buttonText="Optimizar Ahora"
            buttonClass="btn-premium-gray"
            disabled={!getModuleStatus('chat')}
          />
          <ModuleCard
            name="Tutoriales"
            description="Domina todas las herramientas"
            icon={FaPlayCircle}
            path="/tutorials"
            gradientClass="gradient-subtle-orange"
            buttonText="Ver Tutoriales"
            buttonClass="btn-premium-gray"
            disabled={false}
            containerId="tour-tutorials"
          />
        </DashboardSection>
      </div>

      <DashboardTour />

      <WhatsAppButton />
    </DashboardLayout>
  );
}

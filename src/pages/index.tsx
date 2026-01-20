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
import HeaderCredits from '../components/dashboard/HeaderCredits';

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

  return (
    <DashboardLayout>
      <Head>
        <title>DROPAPP - Dashboard</title>
      </Head>
      <div className="w-full px-8 py-4 space-y-6">
        {/* Sección de Perfil Minimalista */}
        <HeaderCredits className="mx-2" />

        {/* Sección 1: ¿Qué quieres hacer hoy? */}
        <DashboardSection title="¿Qué quieres hacer hoy?">
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

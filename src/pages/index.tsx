import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaComments, FaChartLine, FaTruck, FaCog, FaRobot, FaDatabase, FaLock, FaDollarSign, FaBrain, FaCalendarAlt, FaAd, FaMagic } from 'react-icons/fa';
import Link from 'next/link';
import { useAppContext } from '../contexts/AppContext';
import type { ModuleKey } from '../constants/plans';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import MentorQuote from '../components/dashboard/MentorQuote';
import Head from 'next/head';

type HomeModule = {
  name: string;
  icon: any;
  description: string;
  path: string;
  moduleKey: ModuleKey;
};

const modules: HomeModule[] = [
  {
    name: 'Agentes',
    icon: FaComments,
    description: 'Chat con múltiples agentes IA',
    path: '/agents',
    moduleKey: 'agents'
  },
  {
    name: 'Rentabilidad',
    icon: FaChartLine,
    description: 'Análisis de ventas y estadísticas',
    path: '/profitability',
    moduleKey: 'profitability'
  },
  {
    name: 'Control de Campañas',
    icon: FaAd,
    description: 'Gestión y seguimiento de campañas publicitarias',
    path: '/campaign-control',
    moduleKey: 'campaign-control'
  },
  {
    name: 'Calculadora de Precios',
    icon: FaDollarSign,
    description: 'Calculadora de precios',
    path: '/calculator',
    moduleKey: 'calculator'
  },
  {
    name: 'Logística',
    icon: FaTruck,
    description: 'Gestión de logística y envíos',
    path: '/logistic',
    moduleKey: 'logistic'
  },
  {
    name: 'Planeación',
    icon: FaCalendarAlt,
    description: 'Gestión de tareas y calendario',
    path: '/planning',
    moduleKey: 'planning'
  },
  {
    name: 'Análisis de Datos',
    icon: FaBrain,
    description: 'Análisis de archivos Excel',
    path: '/data-analysis',
    moduleKey: 'data-analysis'
  },
  {
    name: 'Manager DB',
    icon: FaDatabase,
    description: 'Gestión de base de datos',
    path: '/dbmanager',
    moduleKey: 'dbmanager'
  },
  {
    name: 'Configuración',
    icon: FaCog,
    description: 'Configuración del sistema',
    path: '/settings',
    moduleKey: 'settings'
  },
  {
    name: 'Agente Pro',
    icon: FaMagic,
    description: 'Generación de imágenes con Imagen 3 Pro',
    path: '/image-pro',
    moduleKey: 'image-pro'
  },
  {
    name: 'Master Chat',
    icon: FaRobot,
    description: 'Chat con RAG',
    path: '/chat',
    moduleKey: 'chat'
  }
];

export default function Dashboard() {
  const { isAdmin, canAccessModule } = useAppContext();

  return (
    <DashboardLayout>
      <Head>
        <title>DROPLAB - Dashboard</title>
      </Head>
      <div>
        <WelcomeBanner />

        <div className="soft-card p-6 mb-10 overflow-visible">
          <div className="flex flex-col">
            <MentorQuote />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8 border-l-4 border-primary-color pl-4 tracking-tight">Módulos Disponibles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules
            .filter((m) => {
              // Chat requiere además rol admin
              if (m.moduleKey === 'chat') return canAccessModule('chat') && isAdmin();
              return canAccessModule(m.moduleKey);
            })
            .map((module) => {
              const isRagModule = module.moduleKey === 'chat';
              const isDisabled = isRagModule && !isAdmin();

              const card = (
                <div className={`soft-card p-8 ${!isDisabled ? 'cursor-pointer' : 'opacity-60 grayscale'} group card`}>
                  {isDisabled && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                      <div className="bg-theme-component/90 p-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-white/10">
                        <FaLock className="text-yellow-500 text-lg" />
                        <span className="text-white font-medium">Solo administradores</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-5 items-center">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-primary-color/10 to-transparent group-hover:from-primary-color/20 transition-all duration-300 ${isDisabled ? '' : 'shadow-inner'}`}>
                      <module.icon className={`w-10 h-10 ${isDisabled ? 'text-theme-tertiary' : 'text-primary-color card-icon group-hover:scale-110 transition-transform duration-300'}`} />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-primary-color transition-colors">
                        {module.name}
                      </h2>
                      <p className="text-theme-secondary text-sm leading-relaxed max-w-[200px]">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>
              );

              return (
                <Link key={module.path} href={module.path}>
                  {card}
                </Link>
              );
            })}
        </div>
      </div>
    </DashboardLayout>
  );
}

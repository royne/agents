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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]">
          {/* Bento Item 1: Agente Pro (First) */}
          {modules
            .filter(m => m.moduleKey === 'image-pro' && canAccessModule('image-pro'))
            .map(module => (
              <Link key={module.path} href={module.path} className="md:col-span-2 md:row-span-1">
                <div className="soft-card h-full p-6 cursor-pointer group bg-gradient-to-br from-primary-color/10 via-transparent to-transparent border-primary-color/20 hover:border-primary-color/40 transition-all duration-500 flex items-center justify-between gap-4 overflow-hidden">
                  <div className="relative z-10 flex-1">
                    <div className="inline-flex px-2 py-0.5 rounded-full bg-primary-color/10 border border-primary-color/20 text-[8px] font-black uppercase tracking-widest text-primary-color mb-2">Destacado</div>
                    <h2 className="text-xl font-black text-white mb-1 group-hover:text-primary-color transition-colors tracking-tight">{module.name}</h2>
                    <p className="text-gray-400 text-[11px] font-medium leading-tight max-w-[180px]">{module.description}</p>
                  </div>
                  <div className="relative z-10 p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-primary-color/10 transition-all duration-500 shadow-xl shadow-primary-color/5">
                    <module.icon className="w-7 h-7 text-primary-color" />
                  </div>
                </div>
              </Link>
            ))}

          {/* Bento Item 2: Rentabilidad (Row 1 Col 3) */}
          {modules
            .filter(m => m.moduleKey === 'profitability' && canAccessModule('profitability'))
            .map(module => (
              <Link key={module.path} href={module.path} className="md:col-span-1">
                <div className="soft-card h-full p-5 cursor-pointer group hover:bg-white/5 transition-all border-emerald-500/10 hover:border-emerald-500/30">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2 w-fit group-hover:rotate-6 transition-transform">
                    <module.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{module.name}</h3>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">{module.description}</p>
                </div>
              </Link>
            ))}

          {/* Bento Item 3: Calculadora (Row 1 Col 4) */}
          {modules
            .filter(m => m.moduleKey === 'calculator' && canAccessModule('calculator'))
            .map(module => (
              <Link key={module.path} href={module.path} className="md:col-span-1">
                <div className="soft-card h-full p-5 cursor-pointer group hover:bg-white/5 transition-all border-blue-400/10 hover:border-blue-400/30">
                  <div className="p-2.5 rounded-lg bg-blue-400/10 text-blue-400 mb-2 w-fit group-hover:-rotate-6 transition-transform">
                    <module.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{module.name}</h3>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">{module.description}</p>
                </div>
              </Link>
            ))}

          {/* Bento Item 4: Mentor Quote (Row 2 Col 1-2) */}
          <div className="md:col-span-2 md:row-span-1 soft-card p-6 flex items-center justify-center bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10 overflow-hidden relative">
            <div className="scale-100 w-full overflow-hidden">
              <MentorQuote />
            </div>
          </div>

          {/* Bento Item 5: Control de Campañas (Vertical, Row 2 Col 3) */}
          {modules
            .filter(m => m.moduleKey === 'campaign-control' && canAccessModule('campaign-control'))
            .map(module => (
              <Link key={module.path} href={module.path} className="md:col-span-1 md:row-span-2">
                <div className="soft-card h-full p-6 cursor-pointer group hover:bg-white/5 transition-all border-amber-500/10 hover:border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 w-fit group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/5">
                    <module.icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-black text-white mb-1 leading-tight tracking-tight">{module.name}</h3>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal">{module.description}</p>
                  </div>
                </div>
              </Link>
            ))}

          {/* Bento Item 6: Master Chat (Admin Special, Row 2 Col 4) */}
          {modules
            .filter(m => m.moduleKey === 'chat' && canAccessModule('chat') && isAdmin())
            .map(module => (
              <Link key={module.path} href={module.path} className="md:col-span-1">
                <div className="soft-card h-full p-5 cursor-pointer group bg-gradient-to-br from-purple-600/10 to-transparent border-purple-500/20 hover:border-purple-500/40">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 mb-2 w-fit flex items-center gap-2">
                    <module.icon className="w-4 h-4" />
                    <FaLock className="w-2.5 h-2.5 opacity-60" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{module.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Restringido</p>
                </div>
              </Link>
            ))}

          {/* Bento Item 7: Agentes (Row 3 Col 1-2, Large) */}
          {modules
            .filter(m => m.moduleKey === 'agents' && canAccessModule('agents'))
            .map(module => (
              <Link key={module.path} href={module.path} className="md:col-span-2 md:row-span-2">
                <div className="soft-card h-full p-7 cursor-pointer group hover:bg-white/5 transition-all duration-500 flex flex-col justify-between border-blue-500/10 hover:border-blue-500/30 overflow-hidden relative">
                  <div className="flex justify-between items-start">
                    <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500 shadow-xl shadow-blue-500/5">
                      <module.icon className="w-7 h-7" />
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black uppercase tracking-widest text-blue-400">Nuevo</div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors tracking-tight">{module.name}</h2>
                    <p className="text-gray-400 text-xs font-medium leading-normal max-w-xs">{module.description}</p>
                  </div>
                </div>
              </Link>
            ))}


          {/* Rest of the modules */}
          {modules
            .filter(m => !['agents', 'profitability', 'campaign-control', 'calculator', 'chat', 'image-pro'].includes(m.moduleKey) && canAccessModule(m.moduleKey))
            .map((module) => (
              <Link key={module.path} href={module.path}>
                <div className="soft-card h-full p-5 cursor-pointer group hover:bg-white/5 transition-all border-white/5 hover:border-white/10">
                  <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white mb-3 w-fit transition-all">
                    <module.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{module.name}</h3>
                  <p className="text-[9px] text-gray-600 font-medium leading-tight">{module.description}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

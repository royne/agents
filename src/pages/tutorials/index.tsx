import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import { FaPlayCircle, FaChevronLeft } from 'react-icons/fa';
import TutorialCard from '../../components/dashboard/TutorialCard';
import VideoModal from '../../components/dashboard/VideoModal';
import Link from 'next/link';

const TUTORIALS = [
  {
    id: 1,
    title: 'Primeros Pasos con Landing PRO',
    description: 'Aprende a crear tu primera landing page de alto impacto en menos de 5 minutos.',
    thumbnail: 'https://img.youtube.com/vi/4seupBFA4Zc/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=4seupBFA4Zc'
  },
  {
    id: 2,
    title: 'Optimización de Creativos con Imagen PRO',
    description: 'Trucos para generar banners y anuncios que conviertan usando nuestra IA.',
    thumbnail: 'https://img.youtube.com/vi/xL8MMDbF7C8/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=xL8MMDbF7C8'
  },
  {
    id: 3,
    title: 'Gestión Logística Eficiente',
    description: 'Aprende a gestionar tus envíos y optimizar tus tiempos de entrega con nuestras herramientas.',
    thumbnail: 'https://img.youtube.com/vi/4ZaLG4G3q2Y/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=4ZaLG4G3q2Y'
  },
  {
    id: 4,
    title: 'Análisis de Rentabilidad Avanzado',
    description: 'Entiende tus números a fondo y escala tus campañas con datos reales.',
    thumbnail: 'https://img.youtube.com/vi/I1xquU-BAYA/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=I1xquU-BAYA'
  },
  {
    id: 5,
    title: 'Configuración de Agentes Especializados',
    description: 'Cómo delegar tareas complejas a tus agentes de IA personalizados.',
    thumbnail: 'https://img.youtube.com/vi/d4YjNubArVw/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=d4YjNubArVw'
  },
  {
    id: 6,
    title: 'Dominando la Calculadora de Precios',
    description: 'Simula tus márgenes de beneficio y define precios competitivos para tus productos.',
    thumbnail: 'https://img.youtube.com/vi/V23o1ngq9tU/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=V23o1ngq9tU'
  }
];

export default function TutorialsPage() {
  const [selectedVideo, setSelectedVideo] = useState<typeof TUTORIALS[0] | null>(null);

  return (
    <DashboardLayout>
      <Head>
        <title>Tutoriales - DROPAPP</title>
      </Head>

      <div className="w-full px-8 py-4 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 mx-2">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest w-fit"
            >
              <FaChevronLeft /> Volver al Dashboard
            </Link>
            <div className="flex flex-col">
              <h2 className="text-4xl font-black text-white tracking-tighter">
                Módulo de <span className="text-primary-color">Tutoriales</span>
              </h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 -ml-0.5">
                Domina las herramientas de élite
              </p>
            </div>
          </div>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {TUTORIALS.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              title={tutorial.title}
              description={tutorial.description}
              thumbnail={tutorial.thumbnail}
              onClick={() => setSelectedVideo(tutorial)}
            />
          ))}
        </div>
      </div>

      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
        />
      )}
    </DashboardLayout>
  );
}

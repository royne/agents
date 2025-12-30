import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Link from 'next/link';
import { FaCalendarAlt, FaListUl, FaUsers } from 'react-icons/fa';
import Head from 'next/head';

export default function Planning() {
  return (
    <ProtectedRoute moduleKey={'planning'}>
      <DashboardLayout>
        <Head>
          <title>DROPAPP - Planeación</title>
        </Head>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl mb-8 border-l-4 border-primary-color pl-3">Planeación</h1>
          <p className="text-theme-secondary mb-8">
            Gestiona tus tareas, eventos y planifica actividades para tu equipo de trabajo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/planning/calendar">
              <div className="bg-theme-component p-6 rounded-lg shadow-md cursor-pointer hover:bg-theme-component-hover transform hover:-translate-y-0.5 transition-all duration-200 relative">
                <div className="flex flex-col gap-4 items-center">
                  <FaCalendarAlt className="w-8 h-8 text-primary-color" />
                  <h2 className="text-xl font-bold text-theme-primary">
                    Calendario
                  </h2>
                  <p className="text-theme-secondary text-center">
                    Visualiza y gestiona eventos y tareas en un calendario interactivo
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/planning/tasks">
              <div className="bg-theme-component p-6 rounded-lg shadow-md cursor-pointer hover:bg-theme-component-hover transform hover:-translate-y-0.5 transition-all duration-200 relative">
                <div className="flex flex-col gap-4 items-center">
                  <FaListUl className="w-8 h-8 text-primary-color" />
                  <h2 className="text-xl font-bold text-theme-primary">
                    Lista de Tareas
                  </h2>
                  <p className="text-theme-secondary text-center">
                    Gestiona tus tareas pendientes y completa tu lista de pendientes
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/planning/team">
              <div className="bg-theme-component p-6 rounded-lg shadow-md cursor-pointer hover:bg-theme-component-hover transform hover:-translate-y-0.5 transition-all duration-200 relative">
                <div className="flex flex-col gap-4 items-center">
                  <FaUsers className="w-8 h-8 text-primary-color" />
                  <h2 className="text-xl font-bold text-theme-primary">
                    Asignaciones
                  </h2>
                  <p className="text-theme-secondary text-center">
                    Asigna tareas a miembros del equipo y realiza seguimiento
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

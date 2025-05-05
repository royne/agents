import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import { FaCalendarAlt, FaPlus, FaTasks } from 'react-icons/fa';
import Link from 'next/link';
import MonthlyCalendar from '../../components/planning/calendar/MonthlyCalendar';
import ScheduleView from '../../components/planning/schedule/ScheduleView';



export default function CalendarPage() {
  const [viewType, setViewType] = useState<'month' | 'schedule'>('schedule');
  
  // Manejador para añadir un nuevo evento en una hora y sala específica
  const handleAddEvent = (roomId: string, hour: string) => {
    console.log(`Añadir evento en sala ${roomId} a las ${hour}`);
    // Aquí se implementaría la lógica para abrir un modal de creación de evento
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Unlocked Ecom - Calendario</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl mb-2 border-l-4 border-primary-color pl-3">Calendario</h1>
            <p className="text-theme-secondary">
              Visualiza y gestiona tus eventos y tareas programadas.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/planning">
              <button className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">
                Volver
              </button>
            </Link>
            <button className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark flex items-center">
              <FaPlus className="mr-2" /> Nuevo Evento
            </button>
          </div>
        </div>
        
        {/* Selector de tipo de vista */}
        <div className="flex mb-4 bg-theme-component rounded-lg p-1 w-fit">
          <button 
            className={`px-4 py-2 rounded-md flex items-center ${viewType === 'month' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
            onClick={() => setViewType('month')}
          >
            <FaCalendarAlt className="mr-2" /> Vista Mensual
          </button>
          <button 
            className={`px-4 py-2 rounded-md flex items-center ${viewType === 'schedule' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
            onClick={() => setViewType('schedule')}
          >
            <FaTasks className="mr-2" /> Vista Horario
          </button>
        </div>

        {viewType === 'month' ? (
          <MonthlyCalendar />
        ) : (
          <ScheduleView onAddEvent={handleAddEvent} />
        )}
      </div>
    </DashboardLayout>
  );
}

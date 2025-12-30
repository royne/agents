import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import { FaCalendarAlt, FaPlus, FaTasks, FaColumns } from 'react-icons/fa';
import MonthlyCalendar from '../../components/planning/calendar/MonthlyCalendar';
import ScheduleView from '../../components/planning/schedule/ScheduleView';
import KanbanView from '../../components/planning/kanban/KanbanView';
import PageHeader from '../../components/common/PageHeader';



export default function CalendarPage() {
  const [viewType, setViewType] = useState<'month' | 'schedule' | 'kanban'>('schedule');

  // Manejador para añadir un nuevo evento en una hora y sala específica
  const handleAddEvent = (roomId: string, hour: string) => {
    console.log(`Añadir evento en sala ${roomId} a las ${hour}`);
    // Aquí se implementaría la lógica para abrir un modal de creación de evento
  };

  return (
    <DashboardLayout>
      <Head>
        <title>DROPAPP - Calendario</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Calendario"
          description="Visualiza y gestiona tus eventos y tareas programadas."
          backLink="/planning"
          actions={
            <button className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark flex items-center">
              <FaPlus className="mr-2" /> Nuevo Evento
            </button>
          }
        />

        {/* Selector de tipo de vista */}
        <div className="flex flex-wrap mb-4 bg-theme-component rounded-lg p-1 w-fit">
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
          <button
            className={`px-4 py-2 rounded-md flex items-center ${viewType === 'kanban' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
            onClick={() => setViewType('kanban')}
          >
            <FaColumns className="mr-2" /> Vista Tablero
          </button>
        </div>

        {viewType === 'month' ? (
          <MonthlyCalendar />
        ) : viewType === 'schedule' ? (
          <ScheduleView onAddEvent={handleAddEvent} />
        ) : (
          <KanbanView />
        )}
      </div>
    </DashboardLayout>
  );
}

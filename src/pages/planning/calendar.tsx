import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import { FaCalendarAlt, FaPlus, FaArrowLeft, FaArrowRight, FaTasks } from 'react-icons/fa';
import Link from 'next/link';
import ScheduleView from '../../components/planning/ScheduleView';

// Componente básico para el calendario
const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);

  // Función para obtener los días del mes actual
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Función para obtener el primer día de la semana del mes
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Navegación entre meses
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Obtener información del mes actual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Nombres de los meses en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Nombres de los días de la semana en español
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Generar las celdas del calendario
  const calendarCells = [];
  
  // Agregar celdas vacías para los días anteriores al primer día del mes
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-24 border border-theme-border bg-theme-component-hover"></div>);
  }

  // Agregar celdas para cada día del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === month && 
                    new Date().getFullYear() === year;

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        className={`h-24 border border-theme-border p-2 ${isToday ? 'bg-primary-color bg-opacity-10' : 'bg-theme-component'} hover:bg-theme-component-hover cursor-pointer transition-colors`}
      >
        <div className={`text-sm font-semibold ${isToday ? 'text-primary-color' : 'text-theme-primary'}`}>
          {day}
        </div>
        {/* Aquí se mostrarían los eventos del día */}
        <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
          {/* Placeholder para eventos futuros */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-theme-primary flex items-center">
          <FaCalendarAlt className="mr-2 text-primary-color" />
          {monthNames[month]} {year}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          >
            <FaArrowLeft />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center font-medium text-theme-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Celdas del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells}
      </div>
    </div>
  );
};

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
          <Calendar />
        ) : (
          <ScheduleView onAddEvent={handleAddEvent} />
        )}
      </div>
    </DashboardLayout>
  );
}

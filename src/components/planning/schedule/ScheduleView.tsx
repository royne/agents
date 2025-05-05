import React, { useState, useEffect } from 'react';
import ScheduleHeader from './ScheduleHeader';
import ScheduleGrid from './ScheduleGrid';
import { Event } from './ScheduleEvent';
import { CalendarProvider, CalendarEvent, useCalendar } from '../../../contexts/CalendarContext';

interface Room {
  id: string;
  name: string;
}

interface ScheduleViewProps {
  onAddEvent?: (roomId: string, hour: string) => void;
}

// Componente interno que utiliza el contexto del calendario
const ScheduleViewContent: React.FC<ScheduleViewProps> = ({ onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  
  // Obtener eventos del contexto del calendario
  const { events: calendarEvents, addEvent } = useCalendar();
  
  // Convertir eventos del formato CalendarEvent al formato Event
  const [scheduleEvents, setScheduleEvents] = useState<Event[]>([]);
  
  // Datos de ejemplo para las salas
  const [rooms] = useState<Room[]>([
    { id: '1', name: 'Auditorio A' },
    { id: '2', name: 'Auditorio B' },
    { id: '3', name: 'Auditorio C' },
    { id: '4', name: 'Auditorio D' },
    { id: '5', name: 'Room D1' },
    { id: '6', name: 'Room D2' },
    { id: '7', name: 'Auditorio E' },
    { id: '8', name: 'Auditorio F' },
    { id: '9', name: 'Auditorio G' },
    { id: '10', name: 'Auditorio H' },
    { id: '11', name: 'Auditorio I' },
  ]);
  
  // Convertir eventos del contexto al formato necesario para ScheduleGrid
  useEffect(() => {
    const convertedEvents = calendarEvents.map(calEvent => {
      // Formatear la fecha para comparar con el formato de la vista de horario
      const dateStr = `${calEvent.start.getFullYear()}-${String(calEvent.start.getMonth() + 1).padStart(2, '0')}-${String(calEvent.start.getDate()).padStart(2, '0')}`;
      
      // Formatear las horas de inicio y fin
      const startTime = calEvent.start.toTimeString().substring(0, 5); // Formato: "HH:MM"
      const endTime = calEvent.end.toTimeString().substring(0, 5); // Formato: "HH:MM"
      
      return {
        id: calEvent.id,
        title: calEvent.title,
        roomId: calEvent.roomId || '1', // Usar sala predeterminada si no hay roomId
        startTime,
        endTime,
        date: dateStr,
        color: calEvent.color || 'bg-blue-500'
      } as Event;
    });
    
    setScheduleEvents(convertedEvents);
  }, [calendarEvents]);

  // Navegación entre fechas
  const prevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleViewModeChange = (mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
  };
  
  // Función para manejar la adición de eventos desde la vista de horario
  const handleAddEvent = (roomId: string, hour: string) => {
    if (onAddEvent) {
      onAddEvent(roomId, hour);
    } else {
      // Si no se proporciona una función onAddEvent, crear un evento predeterminado
      const hourNum = parseInt(hour.replace('am', '').replace('pm', ''));
      const isPm = hour.includes('pm') && hourNum !== 12;
      const adjustedHour = isPm ? hourNum + 12 : hourNum;
      
      // Crear fechas de inicio y fin
      const start = new Date(currentDate);
      start.setHours(adjustedHour, 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(adjustedHour + 1, 0, 0, 0);
      
      // Crear un nuevo evento
      addEvent({
        title: 'Nuevo evento',
        start,
        end,
        roomId,
        color: 'bg-blue-500'
      });
    }
  };

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <ScheduleHeader 
        currentDate={currentDate}
        viewMode={viewMode}
        onPrevDay={prevDay}
        onNextDay={nextDay}
        onViewModeChange={handleViewModeChange}
      />
      <ScheduleGrid 
        rooms={rooms}
        events={scheduleEvents}
        currentDate={currentDate}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};

// Componente principal que proporciona el contexto del calendario
const ScheduleView: React.FC<ScheduleViewProps> = (props) => {
  // Eventos iniciales de ejemplo (opcional)
  const initialEvents: CalendarEvent[] = [
    { 
      id: '1', 
      title: 'Evento 1', 
      start: new Date(2025, 4, 5, 7, 0), // 7:00 AM
      end: new Date(2025, 4, 5, 14, 0), // 2:00 PM
      roomId: '4',
      color: 'bg-blue-500'
    },
    { 
      id: '2', 
      title: 'Evento 2', 
      start: new Date(2025, 4, 5, 9, 0), // 9:00 AM
      end: new Date(2025, 4, 5, 13, 0), // 1:00 PM
      roomId: '7',
      color: 'bg-blue-500'
    },
    { 
      id: '3', 
      title: 'Evento 3', 
      start: new Date(2025, 4, 5, 12, 0), // 12:00 PM
      end: new Date(2025, 4, 5, 16, 0), // 4:00 PM
      roomId: '3',
      color: 'bg-orange-500'
    },
    { 
      id: '4', 
      title: 'Evento 4', 
      start: new Date(2025, 4, 5, 9, 0), // 9:00 AM
      end: new Date(2025, 4, 5, 11, 0), // 11:00 AM
      roomId: '8',
      color: 'bg-red-500'
    },
    { 
      id: '5', 
      title: 'Evento 5', 
      start: new Date(2025, 4, 5, 10, 0), // 10:00 AM
      end: new Date(2025, 4, 5, 12, 0), // 12:00 PM
      roomId: '2',
      color: 'bg-green-500'
    },
  ];
  
  return (
    <CalendarProvider initialEvents={initialEvents}>
      <ScheduleViewContent {...props} />
    </CalendarProvider>
  );
};

export default ScheduleView;

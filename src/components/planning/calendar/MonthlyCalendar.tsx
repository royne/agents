import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { CalendarProvider, CalendarEvent } from '../../../contexts/CalendarContext';

// Definir una interfaz para los eventos que pueden venir en diferentes formatos
interface LegacyEvent {
  id: string;
  title: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  color?: string;
  description?: string;
}

interface MonthlyCalendarProps {
  events?: (CalendarEvent | LegacyEvent)[];
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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

  // Convertir eventos de formato simple a formato CalendarEvent si es necesario
  const formattedEvents: CalendarEvent[] = events?.map(event => {
    // Si el evento ya tiene el formato correcto, devolverlo tal cual
    if ('start' in event && 'end' in event && event.start instanceof Date && event.end instanceof Date) {
      return event as CalendarEvent;
    }
    
    // Si no, convertirlo al formato correcto (asumiendo que es un LegacyEvent)
    const legacyEvent = event as LegacyEvent;
    const startDate = new Date();
    const endDate = new Date();
    
    // Establecer la fecha base
    if (legacyEvent.date) {
      const baseDate = new Date(legacyEvent.date);
      startDate.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
      endDate.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    }
    
    // Si hay hora de inicio y fin, establecerlas
    if (legacyEvent.startTime) {
      const [hours, minutes] = legacyEvent.startTime.split(':').map(Number);
      startDate.setHours(hours, minutes);
    }
    
    if (legacyEvent.endTime) {
      const [hours, minutes] = legacyEvent.endTime.split(':').map(Number);
      endDate.setHours(hours, minutes);
    } else {
      // Si no hay hora de fin, establecer 1 hora después de la hora de inicio
      endDate.setHours(startDate.getHours() + 1, startDate.getMinutes());
    }
    
    return {
      id: legacyEvent.id || String(Date.now()),
      title: legacyEvent.title,
      start: startDate,
      end: endDate,
      roomId: legacyEvent.roomId,
      color: legacyEvent.color,
      description: legacyEvent.description
    };
  }) || [];

  return (
    <CalendarProvider initialEvents={formattedEvents}>
      <div className="bg-theme-component p-6 rounded-lg shadow-md">
        <CalendarHeader 
          month={month} 
          year={year} 
          onPrevMonth={prevMonth} 
          onNextMonth={nextMonth} 
        />
        <CalendarGrid 
          year={year} 
          month={month} 
        />
      </div>
    </CalendarProvider>
  );
};

export default MonthlyCalendar;

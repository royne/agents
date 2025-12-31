import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definir interfaces para mantener la coherencia de tipos
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  roomId?: string;
  color?: string;
  description?: string;
  // Propiedades adicionales para tareas
  priority?: 'high' | 'medium' | 'low';
  is_assigned?: boolean;
  assigned_to?: any;
  owner_name?: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  moveEvent: (id: string, newStart: Date, newEnd?: Date, newRoomId?: string) => void;
}

// Crear el contexto con un valor inicial
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar debe ser usado dentro de un CalendarProvider');
  }
  return context;
};

// Props para el proveedor del contexto
interface CalendarProviderProps {
  children: ReactNode;
  initialEvents?: CalendarEvent[];
}

// Componente proveedor que contiene la lógica de estado
export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  children,
  initialEvents = []
}) => {
  // Validar y corregir eventos iniciales
  const validatedInitialEvents = initialEvents.filter(event => {
    // Verificar que las fechas son válidas
    const hasValidStart = event.start instanceof Date && !isNaN(event.start.getTime());
    const hasValidEnd = event.end instanceof Date && !isNaN(event.end.getTime());

    if (!hasValidStart || !hasValidEnd) {
      console.error('Evento con fechas inválidas excluido:', event);
      return false;
    }

    return true;
  });


  const [events, setEvents] = useState<CalendarEvent[]>(validatedInitialEvents);

  // Función para añadir un nuevo evento
  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    // Validar que las fechas son válidas
    if (!(eventData.start instanceof Date) || isNaN(eventData.start.getTime())) {
      console.error('Intento de añadir evento con fecha de inicio inválida:', eventData);
      return null;
    }

    if (!(eventData.end instanceof Date) || isNaN(eventData.end.getTime())) {
      console.error('Intento de añadir evento con fecha de fin inválida:', eventData);
      return null;
    }

    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    return newEvent;
  };

  // Función para actualizar un evento existente
  const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id ? { ...event, ...eventData } : event
      )
    );
  };

  // Función para eliminar un evento
  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  // Función para mover un evento (cambiar fecha/hora y posiblemente sala)
  const moveEvent = (id: string, newStart: Date, newEnd?: Date, newRoomId?: string) => {
    // Validar que las fechas son válidas
    if (!(newStart instanceof Date) || isNaN(newStart.getTime())) {
      console.error('Intento de mover evento con fecha de inicio inválida:', { id, newStart });
      return;
    }

    if (newEnd && (!(newEnd instanceof Date) || isNaN(newEnd.getTime()))) {
      console.error('Intento de mover evento con fecha de fin inválida:', { id, newEnd });
      return;
    }

    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id !== id) return event;

        // Calcular la duración del evento original
        const duration = event.end.getTime() - event.start.getTime();

        // Si no se proporciona una nueva fecha de fin, calcularla basada en la duración original
        const calculatedNewEnd = newEnd || new Date(newStart.getTime() + duration);

        return {
          ...event,
          start: newStart,
          end: calculatedNewEnd,
          roomId: newRoomId !== undefined ? newRoomId : event.roomId
        };
      });
    });
  };

  // Valor del contexto que se proporcionará
  const value: CalendarContextType = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarContext;

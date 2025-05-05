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
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  // Función para añadir un nuevo evento
  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
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
    console.log('moveEvent called:', { id, newStart, newEnd, newRoomId });
    
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        if (event.id === id) {
          // Calcular la duración del evento original
          const duration = event.end.getTime() - event.start.getTime();
          
          // Si no se proporciona una nueva hora de finalización, calcularla basada en la duración original
          const updatedEnd = newEnd || new Date(newStart.getTime() + duration);
          
          const updatedEvent = {
            ...event,
            start: newStart,
            end: updatedEnd,
            roomId: newRoomId !== undefined ? newRoomId : event.roomId
          };
          
          console.log('Event updated:', { 
            before: { start: event.start, end: event.end, roomId: event.roomId },
            after: { start: updatedEvent.start, end: updatedEvent.end, roomId: updatedEvent.roomId }
          });
          
          return updatedEvent;
        }
        return event;
      });
      
      return updatedEvents;
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

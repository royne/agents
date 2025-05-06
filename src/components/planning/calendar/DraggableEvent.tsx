import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { CalendarEvent } from '../../../contexts/CalendarContext';

// Definir los tipos de elementos arrastrables
export const ItemTypes = {
  EVENT: 'event'
};

// Interfaz para los props del componente
interface DraggableEventProps {
  event: CalendarEvent;
  onMove: (event: CalendarEvent, targetDate: Date, targetRoomId?: string) => void;
  targetDate?: Date;
  targetRoomId?: string;
  className?: string;
}

// Interfaz para el objeto de arrastre
interface DragItem {
  type: string;
  event: CalendarEvent;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ 
  event, 
  onMove, 
  targetDate, 
  targetRoomId,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configurar el arrastre de manera simplificada
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EVENT,
    item: { type: ItemTypes.EVENT, event } as DragItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Configurar el destino de soltar de manera simplificada
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.EVENT,
    drop: (item: DragItem) => {
      if (targetDate && item.event && item.event.id !== event.id) {
        onMove(item.event, targetDate, targetRoomId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Aplicar las referencias al elemento
  drag(drop(ref));
  
  // Determinar el color de fondo según la prioridad
  let bgColorClass = 'bg-blue-500'; // Color por defecto
  
  if (event.priority === 'high') {
    bgColorClass = 'bg-red-500';
  } else if (event.priority === 'low') {
    bgColorClass = 'bg-green-500';
  }
  
  // Clases CSS mejoradas para el evento
  const eventClasses = `
    p-1.5 rounded text-white
    ${bgColorClass}
    ${isDragging ? 'opacity-50' : ''}
    hover:shadow-md transform hover:-translate-y-0.5
    transition-all duration-150 ease-in-out
    cursor-grab active:cursor-grabbing
    ${className}
  `;

  // Manejar posibles errores en la visualización
  let timeDisplay = '';
  try {
    if (event.start instanceof Date && !isNaN(event.start.getTime())) {
      timeDisplay = event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (error) {
    console.error('Error al formatear la hora:', error);
  }

  return (
    <div 
      ref={ref} 
      className={eventClasses.trim()}
    >
      <div className="font-semibold text-xs truncate flex items-center justify-between">
        <span>{event.title || 'Sin título'}</span>
        {event.priority && (
          <span className="ml-1 inline-block w-2 h-2 rounded-full" 
                style={{ backgroundColor: event.priority === 'high' ? '#FF4D4D' : 
                                        event.priority === 'low' ? '#4CAF50' : '#3B82F6' }}>
          </span>
        )}
      </div>
      {timeDisplay && (
        <div className="text-xs opacity-90 truncate mt-0.5">
          {timeDisplay}
        </div>
      )}
      {event.description && (
        <div className="text-xs mt-1 opacity-80 truncate">{event.description}</div>
      )}
      {event.is_assigned && (
        <div className="text-xs mt-1 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
          </svg>
          <span>Asignada</span>
        </div>
      )}
    </div>
  );
};

export default DraggableEvent;

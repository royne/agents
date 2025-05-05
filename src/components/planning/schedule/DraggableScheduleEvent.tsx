import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Event } from './ScheduleEvent';

// Definir los tipos de elementos arrastrables
export const ItemTypes = {
  SCHEDULE_EVENT: 'scheduleEvent'
};

// Interfaz para los props del componente
interface DraggableScheduleEventProps {
  event: Event;
  duration: number;
  onMove?: (event: Event, targetRoomId: string, targetHour: string) => void;
}

// Interfaz para el objeto de arrastre
interface DragItem {
  type: string;
  event: Event;
}

const DraggableScheduleEvent: React.FC<DraggableScheduleEventProps> = ({ 
  event, 
  duration
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configurar el arrastre
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SCHEDULE_EVENT,
    item: { type: ItemTypes.SCHEDULE_EVENT, event } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Aplicar la referencia al elemento
  drag(ref);
  
  // Calcular estilos basados en el estado
  const eventStyle = {
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div
      ref={ref}
      className={`absolute inset-0 p-2 ${event.color || 'bg-blue-500'} text-white rounded-md overflow-hidden shadow-md dark:shadow-gray-900 transition-all duration-200`}
      style={eventStyle}
    >
      <div className="font-semibold text-sm truncate mb-1">{event.title}</div>
      <div className="text-xs text-white text-opacity-80">
        {event.startTime} - {event.endTime}
      </div>
    </div>
  );
};

export default DraggableScheduleEvent;

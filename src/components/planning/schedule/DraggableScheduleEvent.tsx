import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import ScheduleEvent, { Event } from './ScheduleEvent';

// Definir los tipos de elementos arrastrables
export const ItemTypes = {
  SCHEDULE_EVENT: 'scheduleEvent'
};

// Interfaz para los props del componente
interface DraggableScheduleEventProps {
  event: Event;
  duration: number;
  onMove?: (event: Event, targetRoomId: string, targetHour: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

// Interfaz para el objeto de arrastre
interface DragItem {
  type: string;
  event: Event;
}

const DraggableScheduleEvent: React.FC<DraggableScheduleEventProps> = ({ 
  event, 
  duration,
  onStatusChange
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
      <ScheduleEvent 
        event={event} 
        duration={duration} 
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

export default DraggableScheduleEvent;

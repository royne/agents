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
  
  // Configurar el arrastre
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EVENT,
    item: { type: ItemTypes.EVENT, event } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Configurar el destino de soltar
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.EVENT,
    drop: (item: DragItem) => {
      if (targetDate && item.event.id !== event.id) {
        onMove(item.event, targetDate, targetRoomId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  // Combinar las referencias de arrastre y soltar
  drag(drop(ref));
  
  // Agregar un console.log para depuración
  console.log('DraggableEvent rendered:', { id: event.id, isDragging });
  
  // Calcular estilos basados en el estado
  const eventStyle = {
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    backgroundColor: event.color || '#3788d8',
  };
  
  // Calcular clases CSS basadas en el estado
  const eventClasses = `
    p-2 rounded-md text-white text-sm overflow-hidden
    ${isOver ? 'ring-2 ring-yellow-400' : ''}
    ${className}
  `;

  // Generar un color aleatorio si no se proporciona uno
  const getEventColor = () => {
    if (event.color) return event.color;
    
    const colors = [
      'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400', 
      'bg-yellow-400', 'bg-indigo-400', 'bg-red-400', 'bg-orange-400'
    ];
    
    // Usar el id del evento para seleccionar un color consistente
    const colorIndex = parseInt(event.id) % colors.length;
    return colors[colorIndex];
  };
  
  const eventColor = getEventColor();
  
  // Actualizar el estilo con el color
  const updatedEventStyle = {
    ...eventStyle,
    backgroundColor: event.color ? undefined : undefined,
  };

  return (
    <div
      ref={ref}
      className={`${eventClasses} ${eventColor} rounded-lg shadow-sm hover:shadow-md transition-shadow`}
      style={updatedEventStyle}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="text-xs opacity-90 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default DraggableEvent;

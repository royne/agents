import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { FaPlus } from 'react-icons/fa';
import { ItemTypes } from './DraggableScheduleEvent';
import { Event } from './ScheduleEvent';

// Interfaz para los props del componente
interface DroppableScheduleCellProps {
  roomId: string;
  hour: string;
  onDrop: (event: Event, targetRoomId: string, targetHour: string) => void;
  onAddEvent?: (roomId: string, hour: string) => void;
  children?: React.ReactNode;
}

// Interfaz para el objeto de arrastre
interface DragItem {
  type: string;
  event: Event;
}

const DroppableScheduleCell: React.FC<DroppableScheduleCellProps> = ({ 
  roomId, 
  hour, 
  onDrop, 
  onAddEvent,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configurar el destino de soltar
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.SCHEDULE_EVENT,
    drop: (item: DragItem) => {
      onDrop(item.event, roomId, hour);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  // Aplicar la referencia al elemento
  drop(ref);
  
  // Calcular clases CSS basadas en el estado
  const cellClasses = `
    border border-theme-border p-1 text-center relative group
    ${isOver && canDrop ? 'bg-blue-100 dark:bg-blue-900 bg-opacity-50' : ''}
    ${canDrop ? 'cursor-pointer' : ''}
  `;

  // Manejar clic para añadir evento
  const handleClick = () => {
    if (onAddEvent && !children) {
      onAddEvent(roomId, hour);
    }
  };

  return (
    <div ref={ref} className={cellClasses} onClick={handleClick}>
      {children || (
        <div className="invisible group-hover:visible absolute inset-0 flex items-center justify-center bg-theme-component-hover bg-opacity-50">
          <FaPlus className="text-primary-color" />
        </div>
      )}
    </div>
  );
};

export default DroppableScheduleCell;

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
    p-1 text-center relative group
    ${isOver && canDrop ? 'bg-primary-color bg-opacity-20' : 'bg-theme-component bg-opacity-30 dark:bg-opacity-10 hover:bg-opacity-40 dark:hover:bg-opacity-20'}
    ${canDrop ? 'cursor-pointer' : ''}
    transition-all duration-200
    border border-gray-200 dark:border-gray-700 border-opacity-40 dark:border-opacity-30
    shadow-inner shadow-gray-100 dark:shadow-gray-900 dark:shadow-opacity-20
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
        <div className="invisible group-hover:visible absolute inset-0 flex items-center justify-center">
          <FaPlus className="text-primary-color opacity-70" />
        </div>
      )}
    </div>
  );
};

export default DroppableScheduleCell;

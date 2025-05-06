import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './DraggableEvent';
import { CalendarEvent } from '../../../contexts/CalendarContext';

// Interfaz para los props del componente
interface DroppableCellProps {
  date: Date;
  roomId?: string;
  onDrop: (event: CalendarEvent, targetDate: Date, targetRoomId?: string) => void;
  isToday?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// Interfaz para el objeto de arrastre
interface DragItem {
  type: string;
  event: CalendarEvent;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ 
  date, 
  roomId, 
  onDrop, 
  isToday = false,
  children,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configurar el destino de soltar
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.EVENT,
    drop: (item: DragItem) => {
      try {
        if (item && item.event && date) {
          onDrop(item.event, date, roomId);
        }
      } catch (error) {
        console.error('Error en drop:', error);
      }
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Aplicar la referencia al elemento
  drop(ref);
  
  // Clases mejoradas para el componente
  const cellClasses = `
    h-28 m-1 p-1 rounded-lg
    ${isToday ? 'bg-primary-color bg-opacity-10' : 'bg-theme-component'}
    ${isOver && canDrop ? 'bg-primary-color bg-opacity-20' : ''}
    border border-gray-200 hover:border-primary-color hover:border-opacity-50
    transition-all duration-200
    ${className}
  `;

  return (
    <div ref={ref} className={cellClasses}>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default DroppableCell;

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
      console.log('Item dropped:', { item, date, roomId });
      onDrop(item.event, date, roomId);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  // Aplicar la referencia al elemento
  drop(ref);
  
  // Agregar un console.log para depuración
  console.log('DroppableCell rendered:', { date, isOver, canDrop });
  
  // Calcular clases CSS basadas en el estado
  const cellClasses = `
    h-28 m-1 p-1 rounded-lg transition-all duration-200
    ${isToday ? 'bg-primary-color bg-opacity-10 dark:bg-primary-color dark:bg-opacity-20' : 'bg-theme-component'}
    ${isOver && canDrop ? 'bg-primary-color bg-opacity-20 dark:bg-primary-color dark:bg-opacity-30 scale-105 shadow-md dark:shadow-gray-900' : ''}
    ${canDrop ? 'cursor-pointer' : ''}
    hover:bg-theme-component-hover hover:shadow-sm dark:hover:shadow-gray-900
    border border-gray-200 dark:border-gray-700
    ${className}
  `;

  return (
    <div ref={ref} className={cellClasses}>
      {children}
    </div>
  );
};

export default DroppableCell;

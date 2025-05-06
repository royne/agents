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
    w-full h-full p-2 text-center relative group
    ${isOver && canDrop ? 'bg-blue-500 bg-opacity-20' : ''}
    ${canDrop ? 'cursor-pointer' : ''}
    transition-all duration-200
    hover:bg-gray-600 hover:bg-opacity-20
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
          <div className="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 rounded-full p-1.5 transition-colors">
            <FaPlus className="text-white" size={12} />
          </div>
        </div>
      )}
      
      {/* Indicador visual cuando se está arrastrando sobre la celda */}
      {isOver && canDrop && (
        <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-sm pointer-events-none"></div>
      )}
    </div>
  );
};

export default DroppableScheduleCell;

import React, { useState } from 'react';
import { FaCheck, FaClock, FaExclamation } from 'react-icons/fa';
import TaskDetailModal from './TaskDetailModal';
import { usePomodoroContext } from '../../../contexts/PomodoroContext';

export interface Event {
  id: string;
  title: string;
  roomId: string;
  startTime: string; // formato "HH:mm"
  endTime: string; // formato "HH:mm"
  date: string; // formato "YYYY-MM-DD"
  color: string;
  status?: string;
  priority?: string;
  description?: string;
  is_assigned?: boolean;
  assigned_to_name?: string;
}

interface ScheduleEventProps {
  event: Event;
  duration: number;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onEventClick?: (event: Event) => void;
}

const ScheduleEvent: React.FC<ScheduleEventProps> = ({ event, duration, onStatusChange, onEventClick }) => {
  const [showModal, setShowModal] = useState(false);
  const { startPomodoro } = usePomodoroContext();

  // Obtener el estado formateado
  const getStatusDisplay = () => {
    if (!event.status) return null;
    
    const status = event.status.toLowerCase();
    
    if (status === 'done' || status === 'completado' || status === 'terminado' || status === 'completed') {
      return (
        <span className="bg-green-700 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center">
          <FaCheck className="mr-1" size={8} /> Completado
        </span>
      );
    } else if (status === 'in progress' || status === 'en progreso' || status === 'en proceso' || status === 'progress') {
      return (
        <span className="bg-yellow-600 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center">
          <FaClock className="mr-1" size={8} /> En progreso
        </span>
      );
    } else {
      return (
        <span className="bg-blue-700 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center">
          <FaExclamation className="mr-1" size={8} /> Por hacer
        </span>
      );
    }
  };
  
  // Obtener la visualización de la prioridad
  const getPriorityDisplay = () => {
    if (!event.priority) return null;
    
    const priority = event.priority.toLowerCase();
    
    if (priority === 'high' || priority === 'alta') {
      return (
        <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">
          Alta
        </span>
      );
    } else if (priority === 'medium' || priority === 'media') {
      return (
        <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
          Media
        </span>
      );
    } else {
      return (
        <span className="bg-gray-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
          Baja
        </span>
      );
    }
  };
  
  // Manejar el cambio de estado
  const handleStatusChange = () => {
    if (!onStatusChange) return;
    
    const currentStatus = event.status?.toLowerCase() || 'todo';
    let newStatus = 'todo';
    
    if (currentStatus === 'todo' || currentStatus === 'pendiente' || currentStatus === 'por hacer') {
      newStatus = 'in progress';
      // Iniciar pomodoro cuando la tarea pasa a 'en progreso'
      startPomodoro(event);
    } else if (currentStatus === 'in progress' || currentStatus === 'en progreso' || currentStatus === 'en proceso' || currentStatus === 'progress') {
      newStatus = 'done';
    } else {
      newStatus = 'todo';
    }
    
    onStatusChange(event.id, newStatus);
  };
  
  // Determinar el ícono para el botón de cambio de estado
  const getStatusIcon = () => {
    const currentStatus = event.status?.toLowerCase() || 'todo';
    
    if (currentStatus === 'todo' || currentStatus === 'pendiente' || currentStatus === 'por hacer') {
      return <FaClock size={10} title="Marcar como en progreso" />;
    } else if (currentStatus === 'in progress' || currentStatus === 'en progreso' || currentStatus === 'en proceso' || currentStatus === 'progress') {
      return <FaCheck size={10} title="Marcar como completado" />;
    } else {
      return <FaExclamation size={10} title="Marcar como pendiente" />;
    }
  };
  
  // Determinar el color de fondo basado en la prioridad y el estado
  const getCardColor = () => {
    // Determinar el color basado en el estado
    const status = event.status?.toLowerCase() || 'todo';
    
    if (status === 'done' || status === 'completed' || status === 'completado' || status === 'terminado') {
      return 'bg-green-600';
    }
    
    if (status === 'in progress' || status === 'progress' || status === 'en progreso' || status === 'en proceso') {
      return 'bg-yellow-600';
    }
    
    // Si está pendiente, el color depende de la prioridad
    const priority = event.priority?.toLowerCase() || 'medium';
    if (priority === 'high' || priority === 'alta') {
      return 'bg-red-600';
    } else if (priority === 'medium' || priority === 'media') {
      return 'bg-blue-600';
    } else {
      return 'bg-gray-600';
    }
  };
  
  // Obtener el nombre del estado para mostrar en la interfaz
  const getStatusName = () => {
    const status = event.status?.toLowerCase() || 'todo';
    
    if (status === 'done' || status === 'completed' || status === 'completado' || status === 'terminado') {
      return 'Completado';
    }
    
    if (status === 'in progress' || status === 'progress' || status === 'en progreso' || status === 'en proceso') {
      return 'En progreso';
    }
    
    return 'Por hacer';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar que se propague el clic si fue en el ícono de estado
    if ((e.target as HTMLElement).closest('.status-icon')) {
      return;
    }
    
    setShowModal(true);
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div 
        className={`${getCardColor()} h-full rounded-md overflow-hidden shadow-lg cursor-pointer`}
        onClick={handleCardClick}
      >
        {/* Barra superior con título y botón de estado */}
        <div className="px-3 py-2 flex justify-between items-center bg-black bg-opacity-20 border-b border-black border-opacity-10">
          <div className="font-medium text-white truncate text-sm">{event.title}</div>
          {onStatusChange && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Evitar que se propague al div padre
                handleStatusChange();
              }}
              className="ml-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1 transition-colors status-icon"
              title={`Cambiar a: ${getStatusName()}`}
            >
              {getStatusIcon()}
            </button>
          )}
        </div>
        
        {/* Contenido principal */}
        <div className="p-2 flex flex-col h-full text-white">
          {/* Descripción - ahora con mayor legibilidad */}
          {event.description && (
            <div className="text-white text-opacity-90 text-xs mb-2 bg-black bg-opacity-20 p-1.5 rounded">
              {event.description}
            </div>
          )}
          
          {/* Etiquetas de estado y prioridad */}
          <div className="mt-auto pt-1 flex flex-wrap gap-1.5">
            {/* Indicador visual de estado actual */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                {getPriorityDisplay()}
                
                {/* Asignado a */}
                {event.is_assigned && event.assigned_to_name && (
                  <span className="bg-white bg-opacity-20 text-[10px] px-2 py-0.5 rounded-full flex items-center">
                    <svg className="w-2.5 h-2.5 mr-1 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {event.assigned_to_name}
                  </span>
                )}
              </div>
              
              {/* Indicador de estado con borde brillante para mayor visibilidad */}
              <div className="bg-white bg-opacity-10 border border-white border-opacity-30 rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center shadow-sm">
                {getStatusIcon()}
                <span className="ml-1">{getStatusName()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de detalle de tarea usando el componente separado */}
      <TaskDetailModal 
        event={event}
        isOpen={showModal}
        onClose={closeModal}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

export default ScheduleEvent;

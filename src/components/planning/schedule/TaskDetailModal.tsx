import React from 'react';
import { FaCheck, FaClock, FaExclamation, FaTimes, FaHourglass } from 'react-icons/fa';
import { usePomodoroContext } from '../../../contexts/PomodoroContext';
import { Event } from './ScheduleEvent';

interface TaskDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  event, 
  isOpen, 
  onClose,
  onStatusChange
}) => {
  const { startPomodoro } = usePomodoroContext();
  if (!isOpen) return null;
  
  // Obtener el color de fondo basado en la prioridad y el estado
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
  
  // Obtener el color del estado en el modal
  const getStatusModalColor = () => {
    const status = event.status?.toLowerCase() || 'todo';
    
    if (status === 'done' || status === 'completed' || status === 'completado' || status === 'terminado') {
      return 'bg-green-700 text-white';
    } else if (status === 'in progress' || status === 'progress' || status === 'en progreso' || status === 'en proceso') {
      return 'bg-yellow-600 text-white';
    } else {
      return 'bg-blue-700 text-white';
    }
  };
  
  // Determinar el ícono para el botón de cambio de estado
  const getStatusIcon = () => {
    const currentStatus = event.status?.toLowerCase() || 'todo';
    
    if (currentStatus === 'todo' || currentStatus === 'pendiente' || currentStatus === 'por hacer') {
      return <FaClock size={14} title="Marcar como en progreso" />;
    } else if (currentStatus === 'in progress' || currentStatus === 'en progreso' || currentStatus === 'en proceso' || currentStatus === 'progress') {
      return <FaCheck size={14} title="Marcar como completado" />;
    } else {
      return <FaExclamation size={14} title="Marcar como pendiente" />;
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
  
  // Obtener la visualización de la prioridad
  const getPriorityDisplay = () => {
    if (!event.priority) return null;
    
    const priority = event.priority.toLowerCase();
    
    if (priority === 'high' || priority === 'alta') {
      return (
        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
          Alta
        </span>
      );
    } else if (priority === 'medium' || priority === 'media') {
      return (
        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          Media
        </span>
      );
    } else {
      return (
        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
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
  
  // Obtener el próximo estado para el botón de cambio
  const getNextStatusName = () => {
    const currentStatus = event.status?.toLowerCase() || 'todo';
    
    if (currentStatus === 'todo' || currentStatus === 'pendiente' || currentStatus === 'por hacer') {
      return 'En progreso';
    } else if (currentStatus === 'in progress' || currentStatus === 'en progreso' || currentStatus === 'en proceso' || currentStatus === 'progress') {
      return 'Completado';
    } else {
      return 'Por hacer';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div 
        className={`${getCardColor()} rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center p-4 bg-black bg-opacity-30 border-b border-black border-opacity-20">
          <h2 className="text-xl font-bold text-white">{event.title}</h2>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white hover:text-gray-200 transition-colors bg-black bg-opacity-20 rounded-full p-2"
          >
            <FaTimes size={16} />
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div className="p-4 space-y-4 text-white">
          {/* Estado y prioridad */}
          <div className="flex flex-wrap gap-2">
            <div className={`${getStatusModalColor()} px-3 py-1 rounded-full flex items-center gap-1`}>
              {getStatusIcon()}
              <span>{getStatusName()}</span>
            </div>
            
            {event.priority && getPriorityDisplay()}
          </div>
          
          {/* Horario */}
          <div className="bg-black bg-opacity-20 p-3 rounded-md">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-300">Fecha:</p>
                <p className="font-medium">{new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Hora:</p>
                <p className="font-medium">{event.startTime} - {event.endTime}</p>
              </div>
            </div>
          </div>
          
          {/* Descripción */}
          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">Descripción:</h3>
              <p className="bg-black bg-opacity-20 p-3 rounded-md">{event.description}</p>
            </div>
          )}
          
          {/* Información adicional */}
          {event.is_assigned && event.assigned_to_name && (
            <div className="bg-black bg-opacity-20 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-300 mb-1">Asignado a:</h3>
              <div className="flex items-center gap-2">
                <div className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{event.assigned_to_name}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Pie del modal */}
        <div className="flex justify-end gap-2 p-4 bg-black bg-opacity-30 border-t border-black border-opacity-20">
          {onStatusChange && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange();
                onClose();
              }}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-md transition-colors"
            >
              Cambiar a: {getNextStatusName()}
            </button>
          )}
          
          {/* Botón para iniciar pomodoro directamente */}
          {(event.status?.toLowerCase() === 'in progress' || 
            event.status?.toLowerCase() === 'en progreso' || 
            event.status?.toLowerCase() === 'en proceso' || 
            event.status?.toLowerCase() === 'progress') && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                startPomodoro(event);
                onClose();
              }}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <FaHourglass size={14} />
              Iniciar Pomodoro
            </button>
          )}
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

import React from 'react';
import { FaCheck, FaEdit, FaTrash, FaClock, FaCalendarAlt, FaUserPlus } from 'react-icons/fa';
import { Task } from './TaskForm';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onEdit 
}) => {
  // Normalizar la prioridad a un valor conocido
  const normalizePriority = (priority: any): 'high' | 'medium' | 'low' => {
    if (typeof priority !== 'string') return 'medium';
    
    const priorityLower = priority.toLowerCase();
    
    if (priorityLower.includes('high') || priorityLower.includes('alta') || priorityLower === 'high') {
      return 'high';
    } else if (priorityLower.includes('low') || priorityLower.includes('baja') || priorityLower === 'low') {
      return 'low';
    } else {
      return 'medium';
    }
  };
  
  // Obtener clases de prioridad
  const getPriorityClasses = (priority: any): string => {
    const normalizedPriority = normalizePriority(priority);
    
    switch(normalizedPriority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  // Formatear texto de prioridad
  const formatPriority = (priority: any): string => {
    const normalizedPriority = normalizePriority(priority);
    
    const translations: Record<string, string> = {
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    
    return translations[normalizedPriority];
  };
  
  // Verificar si la tarea está completada
  const isCompleted = task.status === 'completed';
  
  // Función para formatear fechas de manera segura
  const formatDate = (dateValue: string | Date | undefined): string => {
    if (!dateValue) return 'Fecha no disponible';
    
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return date.toLocaleDateString('es-ES');
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <div 
      className={`p-4 border border-theme-border rounded-md flex items-center justify-between ${isCompleted ? 'bg-theme-component-hover opacity-70' : 'bg-theme-component'}`}
    >
      <div className="flex items-center">
        <button 
          onClick={() => onToggleComplete(task.id)}
          className={`mr-3 p-1 rounded-full ${isCompleted ? 'bg-primary-color text-white' : 'border border-theme-border text-theme-secondary'}`}
          aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {isCompleted ? <FaCheck /> : <span className="block w-4 h-4"></span>}
        </button>
        <div>
          <p className={`text-theme-primary ${isCompleted ? 'line-through' : ''}`}>{task.title}</p>
          {task.description && (
            <p className="text-sm text-theme-secondary mt-1 line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center mt-1 space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClasses(task.priority)}`}>
              {formatPriority(task.priority)}
            </span>
            {task.is_assigned && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center">
                <FaUserPlus className="mr-1" />
                Asignada
              </span>
            )}
            {task.start_date && (
              <span className="text-xs flex items-center text-theme-secondary">
                <FaCalendarAlt className="mr-1" /> 
                {formatDate(task.start_date)}
              </span>
            )}
            {task.due_date && (
              <span className="text-xs flex items-center text-theme-secondary">
                <FaClock className="mr-1" /> 
                {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {onEdit && (
          <button 
            onClick={() => onEdit(task)}
            className="p-2 text-theme-secondary hover:text-primary-color"
            title="Editar"
          >
            <FaEdit />
          </button>
        )}
        <button 
          onClick={() => onDelete(task.id)}
          className="p-2 text-theme-secondary hover:text-red-500"
          title="Eliminar"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;

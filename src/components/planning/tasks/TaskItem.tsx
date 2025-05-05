import React from 'react';
import { FaCheck, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { Task } from './TaskForm';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit?: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onEdit 
}) => {
  // Obtener clases de prioridad
  const getPriorityClasses = (priority: string): string => {
    switch(priority) {
      case 'alta':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baja':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div 
      className={`p-4 border border-theme-border rounded-md flex items-center justify-between ${task.completed ? 'bg-theme-component-hover opacity-70' : 'bg-theme-component'}`}
    >
      <div className="flex items-center">
        <button 
          onClick={() => onToggleComplete(task.id)}
          className={`mr-3 p-1 rounded-full ${task.completed ? 'bg-primary-color text-white' : 'border border-theme-border text-theme-secondary'}`}
          aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {task.completed ? <FaCheck /> : <span className="block w-4 h-4"></span>}
        </button>
        <div>
          <p className={`text-theme-primary ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
          <div className="flex items-center mt-1 space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClasses(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            {task.dueDate && (
              <span className="text-xs flex items-center text-theme-secondary">
                <FaClock className="mr-1" /> {new Date(task.dueDate).toLocaleDateString('es-ES')}
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

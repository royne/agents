import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { FaCalendarAlt, FaUser, FaFlag } from 'react-icons/fa';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  owner_name?: string;
  is_assigned?: boolean;
}

interface KanbanCardProps {
  task: Task;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configurar el drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Aplicar la referencia al elemento
  drag(ref);
  
  // Formatear la fecha de vencimiento
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  // Determinar el color según la prioridad
  const getPriorityColor = () => {
    switch (task.priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };
  
  // Determinar el texto de la prioridad
  const getPriorityText = () => {
    switch (task.priority?.toLowerCase()) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };
  
  // Verificar si la tarea está vencida
  const isOverdue = () => {
    if (!task.due_date) return false;
    
    try {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      
      // Eliminar las horas para comparar solo las fechas
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    } catch (error) {
      return false;
    }
  };
  
  return (
    <div 
      ref={ref}
      className={`bg-theme-component p-3 rounded-lg shadow-sm cursor-move transition-opacity duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${isOverdue() ? 'border-l-4 border-red-500' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Título de la tarea */}
      <h4 className="font-medium text-theme-primary mb-2 line-clamp-2">
        {task.title}
      </h4>
      
      {/* Descripción (opcional) */}
      {task.description && (
        <p className="text-sm text-theme-secondary mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      {/* Metadatos */}
      <div className="flex flex-wrap gap-2 text-xs text-theme-secondary">
        {/* Fecha de vencimiento */}
        {task.due_date && (
          <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-500' : ''}`}>
            <FaCalendarAlt />
            <span>{formatDueDate(task.due_date)}</span>
          </div>
        )}
        
        {/* Prioridad */}
        {task.priority && (
          <div className={`flex items-center gap-1 ${getPriorityColor()}`}>
            <FaFlag />
            <span>{getPriorityText()}</span>
          </div>
        )}
        
        {/* Asignado a */}
        {task.is_assigned && task.assigned_to_name && (
          <div className="flex items-center gap-1 ml-auto">
            <FaUser />
            <span>{task.assigned_to_name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;

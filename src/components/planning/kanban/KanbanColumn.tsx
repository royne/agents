import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import KanbanCard from './KanbanCard';

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

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  onTaskMove: (taskId: string) => void;
  status: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, tasks, onTaskMove, status }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Configurar el drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string }) => {
      onTaskMove(item.id);
      return { moved: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Determinar el color del borde según el estado
  const getBorderColor = () => {
    switch (status.toLowerCase()) {
      case 'todo':
        return 'border-blue-400';
      case 'in progress':
        return 'border-yellow-400';
      case 'done':
        return 'border-green-400';
      default:
        return 'border-gray-300';
    }
  };

  // Determinar el color de fondo cuando se está arrastrando sobre la columna
  const getBackgroundColor = () => {
    if (isOver && canDrop) {
      switch (status.toLowerCase()) {
        case 'todo':
          return 'bg-blue-50';
        case 'in progress':
          return 'bg-yellow-50';
        case 'done':
          return 'bg-green-50';
        default:
          return 'bg-gray-50';
      }
    }
    return 'bg-theme-component-hover';
  };

  // Aplicar la referencia al elemento
  drop(ref);
  
  return (
    <div 
      ref={ref}
      className={`flex-1 flex flex-col rounded-lg ${getBackgroundColor()} transition-colors duration-200 min-h-[500px] max-w-xs`}
    >
      {/* Encabezado de la columna */}
      <div className={`p-3 border-b-2 ${getBorderColor()} bg-theme-component rounded-t-lg`}>
        <h3 className="font-semibold text-theme-primary flex items-center justify-between">
          {title}
          <span className="text-xs bg-theme-component-hover px-2 py-1 rounded-full text-theme-secondary">
            {tasks.length}
          </span>
        </h3>
      </div>
      
      {/* Contenido de la columna */}
      <div className="p-2 flex-grow overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-sm text-theme-secondary italic">
            No hay tareas
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <KanbanCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;

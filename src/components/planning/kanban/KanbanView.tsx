import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { taskService } from '../../../services/database/taskService';
import { supabase } from '../../../lib/supabase';
import { useAppContext } from '../../../contexts/AppContext';
import { Switch } from '../../ui/Switch';
import KanbanColumn from './KanbanColumn';
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

const KanbanView: React.FC = () => {
  const { authData } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTeamTasks, setShowTeamTasks] = useState(false);

  // Estados para las columnas
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);

  // Cargar tareas
  useEffect(() => {
    const loadTasks = async () => {
      if (!authData?.isAuthenticated || !authData?.company_id) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return;
        }
        
        // Configurar el servicio de tareas con el usuario y compañía actuales
        taskService.setUserAndCompany(user.id, authData.company_id);
        
        // Obtener las tareas según el tipo seleccionado
        let tasksData = [];
        try {
          if (showTeamTasks) {
            tasksData = await taskService.getTeamTasks() || [];
          } else {
            tasksData = await taskService.getUserTasks() || [];
          }
        } catch (error) {
          tasksData = [];
        }
        
        // Asegurarse de que tasksData es un array
        if (!Array.isArray(tasksData)) {
          tasksData = [];
        }
        
        setTasks(tasksData);
        
        // Clasificar tareas por estado
        const todo: Task[] = [];
        const inProgress: Task[] = [];
        const done: Task[] = [];
        
        tasksData.forEach((task: Task) => {
          switch (task.status?.toLowerCase()) {
            case 'to do':
            case 'todo':
            case 'pendiente':
            case 'por hacer':
              todo.push(task);
              break;
            case 'in progress':
            case 'en progreso':
            case 'en proceso':
              inProgress.push(task);
              break;
            case 'done':
            case 'completado':
            case 'terminado':
              done.push(task);
              break;
            default:
              todo.push(task); // Por defecto, las tareas sin estado van a "Por hacer"
          }
        });
        
        setTodoTasks(todo);
        setInProgressTasks(inProgress);
        setDoneTasks(done);
        
      } catch (error) {
        // Si hay un error, simplemente continuar
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [authData, showTeamTasks]);

  // Manejar el cambio de estado de una tarea (mover entre columnas)
  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      // Encontrar la tarea a mover
      const taskToMove = tasks.find(t => t.id === taskId);
      if (!taskToMove) return;
      
      // Actualizar el estado local primero para una respuesta inmediata en la UI
      const updatedTask = { ...taskToMove, status: newStatus };
      
      // Actualizar el array de tareas
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
      
      // Actualizar las columnas
      const updateColumns = () => {
        // Eliminar la tarea de todas las columnas
        setTodoTasks(prev => prev.filter(t => t.id !== taskId));
        setInProgressTasks(prev => prev.filter(t => t.id !== taskId));
        setDoneTasks(prev => prev.filter(t => t.id !== taskId));
        
        // Añadir la tarea a la columna correspondiente
        switch (newStatus.toLowerCase()) {
          case 'to do':
          case 'todo':
          case 'pendiente':
          case 'por hacer':
            setTodoTasks(prev => [...prev, updatedTask]);
            break;
          case 'in progress':
          case 'en progreso':
          case 'en proceso':
            setInProgressTasks(prev => [...prev, updatedTask]);
            break;
          case 'done':
          case 'completado':
          case 'terminado':
            setDoneTasks(prev => [...prev, updatedTask]);
            break;
        }
      };
      
      updateColumns();
      
      // Actualizar en la base de datos
      await taskService.updateTask(taskId, { status: newStatus });
      
    } catch (error) {
      // Si hay error, recargar las tareas
      const loadTasks = async () => {
        // Código para recargar tareas...
      };
      loadTasks();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-theme-component p-6 rounded-lg shadow-md h-full flex flex-col">
        {/* Controles */}
        <div className="flex flex-wrap justify-between items-center gap-3 bg-theme-component-hover p-3 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-theme-component px-3 py-1.5 rounded-lg">
              <span className="text-sm text-theme-secondary">
                {showTeamTasks ? 'Tareas del equipo' : 'Mis tareas'}
              </span>
              <Switch 
                checked={showTeamTasks}
                onChange={() => {
                  setShowTeamTasks(!showTeamTasks);
                }}
                label=""
              />
            </div>
            
            {loading && (
              <div className="flex items-center gap-2 bg-theme-component px-3 py-1.5 rounded-lg">
                <div className="animate-pulse h-3 w-3 rounded-full bg-primary-color"></div>
                <span className="text-sm text-theme-secondary">Cargando...</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-theme-secondary bg-theme-component px-3 py-1.5 rounded-lg">
            {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'} en el tablero
          </div>
        </div>
        
        {/* Tablero Kanban */}
        <div className="flex-grow overflow-auto">
          <div className="flex gap-4 h-full">
            <KanbanColumn 
              title="Por hacer" 
              tasks={todoTasks} 
              onTaskMove={(taskId) => handleTaskMove(taskId, 'todo')}
              status="todo"
            />
            <KanbanColumn 
              title="En progreso" 
              tasks={inProgressTasks} 
              onTaskMove={(taskId) => handleTaskMove(taskId, 'in progress')}
              status="in progress"
            />
            <KanbanColumn 
              title="Completado" 
              tasks={doneTasks} 
              onTaskMove={(taskId) => handleTaskMove(taskId, 'done')}
              status="done"
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanView;

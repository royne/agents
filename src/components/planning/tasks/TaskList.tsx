import React, { useState, useEffect } from 'react';
import { FaListUl, FaPlus, FaSpinner } from 'react-icons/fa';
import TaskForm, { Task, TaskFormData } from './TaskForm';
import TaskItem from './TaskItem';
import { taskService } from '../../../services/database/taskService';
import { useAppContext } from '../../../contexts/AppContext';
import { Task as DBTask } from '../../../types/database';
import { supabase } from '../../../lib/supabase';

// Función para normalizar la prioridad de una tarea
const normalizePriority = (priority: any): 'high' | 'medium' | 'low' => {
  if (!priority) return 'medium';
  
  const priorityStr = String(priority).toLowerCase();
  
  if (['high', 'alta', 'importante', '3', 'h'].includes(priorityStr)) {
    return 'high';
  } else if (['medium', 'media', 'normal', '2', 'm'].includes(priorityStr)) {
    return 'medium';
  } else if (['low', 'baja', '1', 'l'].includes(priorityStr)) {
    return 'low';
  }
  
  return 'medium';
};

// Función para ordenar tareas por estado, prioridad y fecha
const sortTasks = (tasks: Task[]): Task[] => {
  // Valor numérico para prioridades (para ordenar)
  const priorityValue = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  return [...tasks].sort((a, b) => {
    // Primero ordenar por estado (completadas al final)
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Si ambas tienen el mismo estado, ordenar por prioridad
    if (a.status === b.status) {
      const aPriority = normalizePriority(a.priority);
      const bPriority = normalizePriority(b.priority);
      
      const priorityDiff = priorityValue[bPriority] - priorityValue[aPriority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Si tienen la misma prioridad, ordenar por fecha de vencimiento
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (a.due_date) {
        return -1; // Tareas con fecha antes que las sin fecha
      } else if (b.due_date) {
        return 1;
      }
    }
    
    return 0;
  });
};

interface TaskListProps {
  projectId?: string;
}

const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const { authData } = useAppContext();
  
  // Estados
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Efecto para cargar las tareas
  useEffect(() => {
    if (!authData?.isAuthenticated || !authData?.company_id) return;
    
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener el ID del usuario actual desde Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !authData.company_id) return;
        
        // Configurar el servicio con el usuario y compañía actuales
        taskService.setUserAndCompany(user.id, authData.company_id);
        
        // Obtener tareas según si estamos en vista de proyecto o tareas personales
        let tasksData: DBTask[];
        if (projectId) {
          tasksData = await taskService.getProjectTasks(projectId);
        } else {
          tasksData = await taskService.getUserTasks();
        }
        
        // Convertir las tareas de la BD al formato del componente
        const formattedTasks = tasksData.map(task => ({
          ...task,
          status: task.status || 'pending',
          priority: (task.priority as 'high' | 'medium' | 'low') || 'medium',
          start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : undefined,
          due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : undefined
        }));
        
        // Ordenar tareas: primero por estado (pendientes primero), luego por prioridad (alta primero) y finalmente por fecha de vencimiento
        const sortedTasks = sortTasks(formattedTasks);
        
        setTasks(sortedTasks);
      } catch (err) {
        console.error('Error al cargar tareas:', err);
        setError('No se pudieron cargar las tareas. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [authData?.isAuthenticated, authData?.company_id, projectId]);
  
  // Función para añadir una nueva tarea
  const addTask = async (taskData: TaskFormData) => {
    if (!authData?.isAuthenticated) return;
    
    try {
      setLoading(true);
      
      // Primero obtenemos el ID del usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No se pudo obtener la información del usuario.');
        setLoading(false);
        return;
      }
      
      // Ahora buscamos el perfil asociado a este usuario
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !userProfile) {
        console.error('Error al obtener perfil del usuario:', profileError);
        setError('No se pudo obtener el perfil del usuario.');
        setLoading(false);
        return;
      }
      
      // Preparar los datos para la BD
      const newTaskData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: 'pending',
        start_date: taskData.start_date ? new Date(taskData.start_date) : undefined,
        due_date: taskData.due_date ? new Date(taskData.due_date) : undefined,
        project_id: projectId,
        profile_id: projectId ? undefined : userProfile.id
      };
      
      // Guardar en la BD
      const savedTask = await taskService.createTask(newTaskData);
      
      if (savedTask) {
        // Añadir a la lista local
        const formattedTask: Task = {
          ...savedTask,
          status: savedTask.status || 'pending',
          priority: (savedTask.priority as 'high' | 'medium' | 'low') || 'medium',
          start_date: savedTask.start_date ? new Date(savedTask.start_date as Date).toISOString().split('T')[0] : undefined,
          due_date: savedTask.due_date ? new Date(savedTask.due_date as Date).toISOString().split('T')[0] : undefined
        };
        
        // Añadir la tarea y reordenar la lista
        setTasks(sortTasks([...tasks, formattedTask]));
      }
    } catch (err) {
      console.error('Error al crear tarea:', err);
      setError('No se pudo crear la tarea. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setShowForm(false);
    }
  };
  
  // Función para marcar una tarea como completada
  const toggleComplete = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      // Actualizar en la BD
      await taskService.updateTask(id, { status: newStatus });
      
      // Actualizar localmente y reordenar
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
      );
      
      // Reordenar las tareas después de cambiar el estado
      setTasks(sortTasks(updatedTasks));
    } catch (err) {
      console.error('Error al actualizar estado de tarea:', err);
      setError('No se pudo actualizar el estado de la tarea.');
    }
  };
  
  // Función para eliminar una tarea
  const deleteTask = async (id: string) => {
    try {
      // Eliminar de la BD
      await taskService.deleteTask(id);
      
      // Eliminar localmente
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      setError('No se pudo eliminar la tarea.');
    }
  };
  
  // Función para reordenar tareas cuando cambia el estado
  useEffect(() => {
    // Reordenar tareas cuando cambia el estado de alguna
    const reorderTasks = () => {
      setTasks(prevTasks => sortTasks([...prevTasks]));
    };
    
    // Llamamos a reordenar cuando cambian las tareas
    reorderTasks();
  }, [tasks.length]);

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-theme-primary flex items-center">
          <FaListUl className="mr-2 text-primary-color" />
          {projectId ? 'Tareas del Proyecto' : 'Mis Tareas'}
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark flex items-center"
          disabled={loading}
        >
          <FaPlus className="mr-2" /> Nueva Tarea
        </button>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Formulario para añadir tarea */}
      {showForm && (
        <TaskForm 
          onSave={addTask}
          onCancel={() => setShowForm(false)}
          projectId={projectId}
        />
      )}
      
      {/* Indicador de carga */}
      {loading && (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-3xl text-primary-color" />
        </div>
      )}
      
      {/* Lista de tareas */}
      {!loading && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-theme-secondary text-center py-4">No hay tareas {projectId ? 'en este proyecto' : 'pendientes'}.</p>
          ) : (
            tasks.map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                onToggleComplete={toggleComplete}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;

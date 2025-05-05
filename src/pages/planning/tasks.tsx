import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import { FaListUl, FaPlus, FaTrash, FaCheck, FaEdit, FaClock } from 'react-icons/fa';
import Link from 'next/link';

// Componente para la lista de tareas
const TaskList = () => {
  // Definir la interfaz para las tareas
  interface Task {
    id: number;
    title: string;
    completed: boolean;
    priority: string;
    dueDate: string;
  }

  // Estado para almacenar las tareas (simulado por ahora)
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Revisar métricas de ventas', completed: false, priority: 'alta', dueDate: '2025-05-10' },
    { id: 2, title: 'Actualizar inventario', completed: true, priority: 'media', dueDate: '2025-05-03' },
    { id: 3, title: 'Contactar proveedores', completed: false, priority: 'baja', dueDate: '2025-05-15' },
  ]);
  
  // Estado para la nueva tarea
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('media');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Definir la interfaz para las tareas
  interface Task {
    id: number;
    title: string;
    completed: boolean;
    priority: string;
    dueDate: string;
  }

  // Función para añadir una nueva tarea
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '') return;
    
    const task: Task = {
      id: Date.now(),
      title: newTask,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
    setNewTaskPriority('media');
    setNewTaskDueDate('');
    setShowForm(false);
  };
  
  // Función para marcar una tarea como completada
  const toggleComplete = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Función para eliminar una tarea
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
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
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-theme-primary flex items-center">
          <FaListUl className="mr-2 text-primary-color" />
          Lista de Tareas
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark flex items-center"
        >
          <FaPlus className="mr-2" /> Nueva Tarea
        </button>
      </div>
      
      {/* Formulario para añadir tarea */}
      {showForm && (
        <form onSubmit={addTask} className="mb-6 p-4 border border-theme-border rounded-md bg-theme-component shadow-sm">
          <div className="mb-4">
            <label htmlFor="task-title" className="block text-theme-secondary mb-2">Título de la tarea</label>
            <input
              id="task-title"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full p-2 border border-theme-border rounded-md bg-theme-input text-theme-primary focus:ring-2 focus:ring-primary-color focus:border-primary-color"
              placeholder="Escribe el título de la tarea..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="task-priority" className="block text-theme-secondary mb-2">Prioridad</label>
              <select
                id="task-priority"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="w-full p-2 border border-theme-border rounded-md bg-theme-input text-theme-primary focus:ring-2 focus:ring-primary-color focus:border-primary-color"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="task-due-date" className="block text-theme-secondary mb-2">Fecha límite</label>
              <input
                id="task-due-date"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full p-2 border border-theme-border rounded-md bg-theme-input text-theme-primary focus:ring-2 focus:ring-primary-color focus:border-primary-color"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-theme-border rounded-md text-theme-secondary hover:bg-theme-component-hover"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark"
            >
              Guardar
            </button>
          </div>
        </form>
      )}
      
      {/* Lista de tareas */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-theme-secondary text-center py-4">No hay tareas pendientes.</p>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`p-4 border border-theme-border rounded-md flex items-center justify-between ${task.completed ? 'bg-theme-component-hover opacity-70' : 'bg-theme-component'}`}
            >
              <div className="flex items-center">
                <button 
                  onClick={() => toggleComplete(task.id)}
                  className={`mr-3 p-1 rounded-full ${task.completed ? 'bg-primary-color text-white' : 'border border-theme-border text-theme-secondary'}`}
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
                <button 
                  className="p-2 text-theme-secondary hover:text-primary-color"
                  title="Editar"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-theme-secondary hover:text-red-500"
                  title="Eliminar"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function TasksPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Unlocked Ecom - Lista de Tareas</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl mb-2 border-l-4 border-primary-color pl-3">Lista de Tareas</h1>
            <p className="text-theme-secondary">
              Gestiona tus tareas pendientes y completa tu lista de pendientes.
            </p>
          </div>
          <Link href="/planning">
            <button className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">
              Volver
            </button>
          </Link>
        </div>

        <TaskList />
      </div>
    </DashboardLayout>
  );
}

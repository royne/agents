import React, { useState } from 'react';
import { FaListUl, FaPlus } from 'react-icons/fa';
import TaskForm, { Task } from './TaskForm';
import TaskItem from './TaskItem';

interface TaskListProps {
  initialTasks?: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ initialTasks = [] }) => {
  // Estado para almacenar las tareas
  const [tasks, setTasks] = useState<Task[]>(initialTasks.length > 0 ? initialTasks : [
    { id: 1, title: 'Revisar métricas de ventas', completed: false, priority: 'alta', dueDate: '2025-05-10' },
    { id: 2, title: 'Actualizar inventario', completed: true, priority: 'media', dueDate: '2025-05-03' },
    { id: 3, title: 'Contactar proveedores', completed: false, priority: 'baja', dueDate: '2025-05-15' },
  ]);
  
  // Estado para mostrar/ocultar el formulario
  const [showForm, setShowForm] = useState(false);
  
  // Función para añadir una nueva tarea
  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: Date.now(),
      completed: false,
      ...taskData
    };
    
    setTasks([...tasks, newTask]);
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
        <TaskForm 
          onSave={addTask}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      {/* Lista de tareas */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-theme-secondary text-center py-4">No hay tareas pendientes.</p>
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
    </div>
  );
};

export default TaskList;

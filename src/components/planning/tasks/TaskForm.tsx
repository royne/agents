import React, { useState } from 'react';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: string;
  dueDate: string;
}

interface TaskFormProps {
  onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('media');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;
    
    onSave({
      title,
      priority,
      dueDate
    });
    
    // Limpiar el formulario
    setTitle('');
    setPriority('media');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border border-theme-border rounded-md bg-theme-component shadow-sm">
      <div className="mb-4">
        <label htmlFor="task-title" className="block text-theme-secondary mb-2">Título de la tarea</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
          placeholder="Escribe el título de la tarea..."
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="task-priority" className="block text-theme-secondary mb-2">Prioridad</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
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
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button 
          type="button" 
          onClick={onCancel}
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
  );
};

export default TaskForm;

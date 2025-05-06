import React, { useState } from 'react';
import { Task as DBTask } from '../../../types/database';

// Interfaz para el formulario de tareas
export interface TaskFormData {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  start_date?: string;
  due_date?: string;
  project_id?: string;
}

// Interfaz para el componente que extiende la interfaz de la base de datos
export interface Task extends Omit<DBTask, 'status' | 'due_date' | 'start_date'> {
  status: string;
  due_date?: string;
  start_date?: string;
}

interface TaskFormProps {
  onSave: (task: TaskFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TaskFormData>;
  projectId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSave, onCancel, initialData, projectId }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(initialData?.priority || 'medium');
  const [startDate, setStartDate] = useState(initialData?.start_date || '');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;
    
    onSave({
      title,
      description: description.trim() !== '' ? description : undefined,
      priority,
      start_date: startDate || undefined,
      due_date: dueDate || undefined,
      project_id: projectId
    });
    
    // Limpiar el formulario
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStartDate('');
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
      
      <div className="mb-4">
        <label htmlFor="task-description" className="block text-theme-secondary mb-2">Descripción (opcional)</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
          placeholder="Describe los detalles de la tarea..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="task-priority" className="block text-theme-secondary mb-2">Prioridad</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
          >
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="task-start-date" className="block text-theme-secondary mb-2">Fecha de inicio</label>
          <input
            id="task-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
          />
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

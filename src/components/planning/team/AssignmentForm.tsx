import React, { useState } from 'react';

export interface Assignment {
  id: number;
  title: string;
  assignedTo: string;
  status: string;
  dueDate: string;
  priority: string;
}

interface AssignmentFormProps {
  teamMembers: string[];
  onSave: (assignment: Omit<Assignment, 'id' | 'status'>) => void;
  onCancel: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  teamMembers, 
  onSave, 
  onCancel 
}) => {
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    assignedTo: '',
    dueDate: '',
    priority: 'media'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignment.title.trim() === '' || newAssignment.assignedTo === '') return;
    
    onSave(newAssignment);
    
    // Limpiar el formulario
    setNewAssignment({
      title: '',
      assignedTo: '',
      dueDate: '',
      priority: 'media'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border border-theme-border rounded-md bg-theme-component shadow-sm">
      <div className="mb-4">
        <label htmlFor="assignment-title" className="block text-theme-secondary mb-2">Título de la tarea</label>
        <input
          id="assignment-title"
          type="text"
          value={newAssignment.title}
          onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
          placeholder="Escribe el título de la tarea..."
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="assignment-assignee" className="block text-theme-secondary mb-2">Asignar a</label>
          <select
            id="assignment-assignee"
            value={newAssignment.assignedTo}
            onChange={(e) => setNewAssignment({...newAssignment, assignedTo: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
            required
          >
            <option value="">Seleccionar miembro</option>
            {teamMembers.map((member, index) => (
              <option key={index} value={member}>{member}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="assignment-priority" className="block text-theme-secondary mb-2">Prioridad</label>
          <select
            id="assignment-priority"
            value={newAssignment.priority}
            onChange={(e) => setNewAssignment({...newAssignment, priority: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="assignment-due-date" className="block text-theme-secondary mb-2">Fecha límite</label>
          <input
            id="assignment-due-date"
            type="date"
            value={newAssignment.dueDate}
            onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
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

export default AssignmentForm;

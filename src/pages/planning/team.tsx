import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import { FaUsers, FaPlus, FaTrash, FaUserAlt, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

// Componente para la gestión de asignaciones
const TeamAssignments = () => {
  // Definir la interfaz para las asignaciones
  interface Assignment {
    id: number;
    title: string;
    assignedTo: string;
    status: string;
    dueDate: string;
    priority: string;
  }

  // Estado para almacenar las tareas asignadas (simulado por ahora)
  const [assignments, setAssignments] = useState<Assignment[]>([
    { 
      id: 1, 
      title: 'Revisar métricas de ventas', 
      assignedTo: 'Carlos Rodríguez', 
      status: 'pendiente', 
      dueDate: '2025-05-10',
      priority: 'alta'
    },
    { 
      id: 2, 
      title: 'Actualizar inventario', 
      assignedTo: 'Ana Gómez', 
      status: 'completada', 
      dueDate: '2025-05-03',
      priority: 'media'
    },
    { 
      id: 3, 
      title: 'Contactar proveedores', 
      assignedTo: 'Luis Martínez', 
      status: 'en progreso', 
      dueDate: '2025-05-15',
      priority: 'baja'
    },
  ]);
  
  // Estado para el formulario de nueva asignación
  const [showForm, setShowForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    assignedTo: '',
    dueDate: '',
    priority: 'media'
  });
  
  // Lista de miembros del equipo (simulado)
  const teamMembers = [
    'Carlos Rodríguez',
    'Ana Gómez',
    'Luis Martínez',
    'María López',
    'Juan Pérez'
  ];
  
  // Función para añadir una nueva asignación
  const addAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignment.title.trim() === '' || newAssignment.assignedTo === '') return;
    
    const assignment: Assignment = {
      id: Date.now(),
      title: newAssignment.title,
      assignedTo: newAssignment.assignedTo,
      status: 'pendiente',
      dueDate: newAssignment.dueDate,
      priority: newAssignment.priority
    };
    
    setAssignments([...assignments, assignment]);
    setNewAssignment({
      title: '',
      assignedTo: '',
      dueDate: '',
      priority: 'media'
    });
    setShowForm(false);
  };
  
  // Función para cambiar el estado de una asignación
  const changeStatus = (id: number, newStatus: string) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === id ? { ...assignment, status: newStatus } : assignment
    ));
  };
  
  // Función para eliminar una asignación
  const deleteAssignment = (id: number) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
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
  
  // Obtener clases de estado
  const getStatusClasses = (status: string): string => {
    switch(status) {
      case 'completada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'en progreso':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-theme-primary flex items-center">
          <FaUsers className="mr-2 text-primary-color" />
          Asignaciones de Equipo
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark flex items-center"
        >
          <FaPlus className="mr-2" /> Nueva Asignación
        </button>
      </div>
      
      {/* Formulario para añadir asignación */}
      {showForm && (
        <form onSubmit={addAssignment} className="mb-6 p-4 border border-theme-border rounded-md bg-theme-component shadow-sm">
          <div className="mb-4">
            <label htmlFor="assignment-title" className="block text-theme-secondary mb-2">Título de la tarea</label>
            <input
              id="assignment-title"
              type="text"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
              className="w-full p-2 border border-theme-border rounded-md bg-theme-input text-theme-primary focus:ring-2 focus:ring-primary-color focus:border-primary-color"
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
                className="w-full p-2 border border-theme-border rounded-md bg-theme-input text-theme-primary focus:ring-2 focus:ring-primary-color focus:border-primary-color"
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
                className="w-full p-2 border border-theme-border rounded-md bg-theme-input text-theme-primary focus:ring-2 focus:ring-primary-color focus:border-primary-color"
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
      
      {/* Lista de asignaciones */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="py-3 px-4 text-left text-theme-secondary">Tarea</th>
              <th className="py-3 px-4 text-left text-theme-secondary">Asignado a</th>
              <th className="py-3 px-4 text-left text-theme-secondary">Estado</th>
              <th className="py-3 px-4 text-left text-theme-secondary">Fecha límite</th>
              <th className="py-3 px-4 text-left text-theme-secondary">Prioridad</th>
              <th className="py-3 px-4 text-left text-theme-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-theme-secondary">
                  No hay asignaciones disponibles.
                </td>
              </tr>
            ) : (
              assignments.map(assignment => (
                <tr key={assignment.id} className="border-b border-theme-border hover:bg-theme-component-hover">
                  <td className="py-3 px-4 text-theme-primary">{assignment.title}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FaUserAlt className="mr-2 text-primary-color" />
                      <span className="text-theme-primary">{assignment.assignedTo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClasses(assignment.status)}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-theme-secondary">
                      <FaCalendarAlt className="mr-2" />
                      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClasses(assignment.priority)}`}>
                      {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <select
                        value={assignment.status}
                        onChange={(e) => changeStatus(assignment.id, e.target.value)}
                        className="p-1 text-sm border border-theme-border rounded-md bg-theme-input text-theme-primary focus:ring-2 focus:ring-primary-color focus:border-primary-color"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en progreso">En progreso</option>
                        <option value="completada">Completada</option>
                      </select>
                      <button 
                        onClick={() => deleteAssignment(assignment.id)}
                        className="p-1 text-theme-secondary hover:text-red-500"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function TeamPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Unlocked Ecom - Asignaciones de Equipo</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl mb-2 border-l-4 border-primary-color pl-3">Asignaciones de Equipo</h1>
            <p className="text-theme-secondary">
              Asigna tareas a miembros del equipo y realiza seguimiento de su progreso.
            </p>
          </div>
          <Link href="/planning">
            <button className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">
              Volver
            </button>
          </Link>
        </div>

        <TeamAssignments />
      </div>
    </DashboardLayout>
  );
}

import React, { useState } from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';
import AssignmentForm, { Assignment } from './AssignmentForm';
import AssignmentTable from './AssignmentTable';

interface TeamAssignmentsProps {
  initialAssignments?: Assignment[];
}

const TeamAssignments: React.FC<TeamAssignmentsProps> = ({ initialAssignments = [] }) => {
  // Estado para almacenar las asignaciones
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments.length > 0 ? initialAssignments : [
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
  
  // Estado para mostrar/ocultar el formulario
  const [showForm, setShowForm] = useState(false);
  
  // Lista de miembros del equipo (simulado)
  const teamMembers = [
    'Carlos Rodríguez',
    'Ana Gómez',
    'Luis Martínez',
    'María López',
    'Juan Pérez'
  ];
  
  // Función para añadir una nueva asignación
  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'status'>) => {
    const newAssignment: Assignment = {
      id: Date.now(),
      status: 'pendiente',
      ...assignmentData
    };
    
    setAssignments([...assignments, newAssignment]);
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
        <AssignmentForm 
          teamMembers={teamMembers}
          onSave={addAssignment}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      {/* Tabla de asignaciones */}
      <AssignmentTable 
        assignments={assignments}
        onChangeStatus={changeStatus}
        onDelete={deleteAssignment}
      />
    </div>
  );
};

export default TeamAssignments;

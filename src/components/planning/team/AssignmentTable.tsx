import React from 'react';
import { FaUserAlt, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { Assignment } from './AssignmentForm';

interface AssignmentTableProps {
  assignments: Assignment[];
  onChangeStatus: (id: number, newStatus: string) => void;
  onDelete: (id: number) => void;
}

const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  onChangeStatus,
  onDelete
}) => {
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
                      onChange={(e) => onChangeStatus(assignment.id, e.target.value)}
                      className="px-3 py-1 text-sm border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en progreso">En progreso</option>
                      <option value="completada">Completada</option>
                    </select>
                    <button 
                      onClick={() => onDelete(assignment.id)}
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
  );
};

export default AssignmentTable;

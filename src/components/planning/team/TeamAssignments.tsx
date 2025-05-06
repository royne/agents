import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaSpinner } from 'react-icons/fa';
import AssignmentForm, { Assignment } from './AssignmentForm';
import AssignmentTable from './AssignmentTable';
import { useAppContext } from '../../../contexts/AppContext';
import { supabase } from '../../../lib/supabase';
import { taskService } from '../../../services/database/taskService';
import { adminService, UserWithProfile } from '../../../services/database/adminService';
import { Task, TaskAssignee } from '../../../types/database';

interface TeamAssignmentsProps {}

// Interfaz para los perfiles de usuario en el contexto del equipo
interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

// Interfaz para las tareas asignadas
interface TeamAssignment extends Assignment {
  id: string;
  title: string;
  assignedTo: string;
  assignedToName: string;
  status: string;
  dueDate: string;
  priority: string;
}

const TeamAssignments: React.FC<TeamAssignmentsProps> = () => {
  const { authData } = useAppContext();
  
  // Estados
  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Efecto para cargar los miembros del equipo y las asignaciones
  useEffect(() => {
    if (!authData?.isAuthenticated || !authData?.company_id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener el ID del usuario actual desde Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Configurar el servicio de tareas con el usuario y compañía actuales
        const companyId = authData.company_id || '';
        taskService.setUserAndCompany(user.id, companyId);
        
        // Cargar los perfiles de la compañía usando el adminService existente
        const users = await adminService.getAllUsers(companyId);
        
        // Transformar los usuarios al formato requerido por el componente
        const teamMembers: TeamMember[] = users.map(user => ({
          id: user.id,
          name: user.name || user.email,
          role: user.role
        }));
        
        setTeamMembers(teamMembers);
        
        // Cargar las asignaciones (tareas con asignaciones)
        const tasksWithAssignees = await loadAssignments();
        setAssignments(tasksWithAssignees);
      } catch (err) {
        console.error('Error al cargar datos del equipo:', err);
        setError('No se pudieron cargar los datos del equipo. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [authData?.isAuthenticated, authData?.company_id]);
  
  // Función para cargar las asignaciones de tareas
  const loadAssignments = async (): Promise<TeamAssignment[]> => {
    // Obtener todas las tareas que tienen asignaciones
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id, title, description, status, priority, due_date,
        task_assignees(profile_id)
      `)
      .not('task_assignees', 'is', null)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error al cargar tareas asignadas:', error);
      return [];
    }
    
    if (!data) return [];
    
    // Transformar los datos al formato esperado por el componente
    return data.map(task => {
      // Obtener el primer asignado (podría haber más de uno)
      const assignee = task.task_assignees?.[0];
      // Asegurarnos de que profiles es un objeto y no un array
      const profileId = assignee?.profile_id || '';
      
      // Buscar el miembro del equipo correspondiente
      const teamMember = teamMembers.find(member => member.id === profileId);
      
      return {
        id: task.id,
        title: task.title,
        assignedTo: profileId,
        assignedToName: teamMember?.name || 'Sin asignar',
        status: task.status || 'pendiente',
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        priority: task.priority || 'media'
      };
    });
  };
  
  // Función para añadir una nueva asignación
  const addAssignment = async (assignmentData: Omit<Assignment, 'id' | 'status'>) => {
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
      
      // Crear la tarea
      const newTaskData = {
        title: assignmentData.title,
        description: 'Tarea asignada desde el módulo de equipo',
        priority: assignmentData.priority,
        status: 'pendiente',
        due_date: assignmentData.dueDate ? new Date(assignmentData.dueDate) : undefined,
        project_id: undefined,  // Esta es una tarea personal, no de proyecto
        profile_id: userProfile.id  // La tarea pertenece al creador
      };
      
      // Guardar la tarea en la BD
      const savedTask = await taskService.createTask(newTaskData);
      
      if (!savedTask) {
        setError('No se pudo crear la tarea.');
        setLoading(false);
        return;
      }
      
      // Asignar la tarea al miembro del equipo seleccionado
      const assignmentResult = await taskService.assignTask(savedTask.id, assignmentData.assignedTo);
      
      if (!assignmentResult) {
        setError('No se pudo asignar la tarea.');
        // Intentamos eliminar la tarea creada para no dejar basura
        await taskService.deleteTask(savedTask.id);
        setLoading(false);
        return;
      }
      
      // Buscar el nombre del asignado
      const assignedProfile = teamMembers.find(member => member.id === assignmentData.assignedTo);
      
      // Añadir a la lista local
      const newAssignment: TeamAssignment = {
        id: savedTask.id,
        title: savedTask.title,
        assignedTo: assignmentData.assignedTo,
        assignedToName: assignedProfile?.name || 'Sin nombre',
        status: 'pendiente',
        dueDate: assignmentData.dueDate || '',
        priority: assignmentData.priority
      };
      
      setAssignments([...assignments, newAssignment]);
      setShowForm(false);
    } catch (err) {
      console.error('Error al crear asignación:', err);
      setError('No se pudo crear la asignación. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cambiar el estado de una asignación
  const changeStatus = async (id: string, newStatus: string) => {
    try {
      // Actualizar en la BD
      await taskService.updateTask(id, { status: newStatus });
      
      // Actualizar localmente
      setAssignments(assignments.map(assignment => 
        assignment.id === id ? { ...assignment, status: newStatus } : assignment
      ));
    } catch (err) {
      console.error('Error al actualizar estado de asignación:', err);
      setError('No se pudo actualizar el estado de la asignación.');
    }
  };
  
  // Función para eliminar una asignación
  const deleteAssignment = async (id: string) => {
    try {
      // Eliminar de la BD
      await taskService.deleteTask(id);
      
      // Eliminar localmente
      setAssignments(assignments.filter(assignment => assignment.id !== id));
    } catch (err) {
      console.error('Error al eliminar asignación:', err);
      setError('No se pudo eliminar la asignación.');
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
          disabled={loading}
          className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-color-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus className="mr-2" /> Nueva Asignación
        </button>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Indicador de carga */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-primary-color text-2xl" />
          <span className="ml-2 text-theme-secondary">Cargando...</span>
        </div>
      )}
      
      {/* Formulario para añadir asignación */}
      {showForm && !loading && (
        <AssignmentForm 
          teamMembers={teamMembers.map(member => ({
            id: member.id,
            name: member.name
          }))}
          onSave={addAssignment}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      {/* Tabla de asignaciones */}
      {!loading && assignments.length > 0 && (
        <AssignmentTable 
          assignments={assignments}
          onChangeStatus={changeStatus}
          onDelete={deleteAssignment}
        />
      )}
      
      {/* Mensaje cuando no hay asignaciones */}
      {!loading && assignments.length === 0 && !showForm && (
        <div className="text-center py-8 text-theme-secondary">
          No hay asignaciones de tareas. Crea una nueva asignación para comenzar.
        </div>
      )}
    </div>
  );
};

export default TeamAssignments;

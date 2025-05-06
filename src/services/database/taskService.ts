import { supabase } from '../../lib/supabase';
import type { Task, TaskAssignee } from '../../types/database';

export class TaskService {
  private userId: string | null = null;
  private companyId: string | null = null;

  /**
   * Establece el usuario y la compañía para las operaciones del servicio
   */
  setUserAndCompany(userId: string, companyId: string) {
    this.userId = userId;
    this.companyId = companyId;
    return this;
  }

  /**
   * Obtiene todas las tareas personales del usuario actual y las tareas que le han sido asignadas
   */
  async getUserTasks() {
    if (!this.userId) {
      throw new Error('Usuario no establecido');
    }
    
    // Primero obtenemos el ID del perfil del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', this.userId)
      .single();
      
    if (profileError || !userProfile) {
      console.error('Error al obtener perfil del usuario:', profileError);
      return [];
    }
    
    const profileId = userProfile.id;
    
    // 1. Obtenemos las tareas asignadas al usuario actual (donde aparece como asignado)
    const { data: assignedToUser, error: assignedToUserError } = await supabase
      .from('task_assignees')
      .select('task_id')
      .eq('profile_id', profileId);
      
    if (assignedToUserError) {
      console.error('Error al obtener tareas asignadas al usuario:', assignedToUserError);
      // Continuamos sin las tareas asignadas
    }
    
    // Creamos un conjunto de IDs de tareas asignadas al usuario
    const assignedToUserTaskIds = new Set(
      (assignedToUser || []).map(item => item.task_id)
    );
    
    // 2. Obtenemos todas las tareas asignadas (para identificar cuáles no deben mostrarse)
    const { data: allAssignments, error: allAssignmentsError } = await supabase
      .from('task_assignees')
      .select('task_id, profile_id');
      
    if (allAssignmentsError) {
      console.error('Error al obtener todas las asignaciones:', allAssignmentsError);
      // Continuamos sin esta información
    }
    
    // Creamos un conjunto de IDs de tareas que han sido asignadas a alguien
    // (estas no deben mostrarse al creador a menos que él sea el asignado)
    const assignedTaskIds = new Set(
      (allAssignments || []).map(item => item.task_id)
    );
    
    // 3. Obtenemos todas las tareas del usuario
    const { data: userTasks, error: userTasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('profile_id', profileId)
      .order('due_date', { ascending: true });

    if (userTasksError) {
      console.error('Error al obtener tareas del usuario:', userTasksError);
      return [];
    }
    
    if (!userTasks || userTasks.length === 0) {
      // Si no hay tareas propias, obtenemos solo las asignadas
      if (assignedToUserTaskIds.size === 0) {
        return [];
      }
      
      // Obtenemos los detalles de las tareas asignadas al usuario
      const { data: assignedTasks, error: assignedTasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', Array.from(assignedToUserTaskIds))
        .order('due_date', { ascending: true });
        
      if (assignedTasksError || !assignedTasks) {
        console.error('Error al obtener detalles de tareas asignadas:', assignedTasksError);
        return [];
      }
      
      return assignedTasks.map(task => ({ ...task, is_assigned: true }));
    }
    
    // 4. Filtramos las tareas propias: 
    // - Incluimos las que NO están asignadas a nadie
    // - Incluimos las que están asignadas al propio usuario
    // - Excluimos las que están asignadas a otros usuarios
    const filteredOwnTasks = userTasks.filter(task => {
      // Si la tarea está asignada a alguien...
      if (assignedTaskIds.has(task.id)) {
        // ...la incluimos solo si está asignada al usuario actual
        return assignedToUserTaskIds.has(task.id);
      }
      // Si no está asignada a nadie, la incluimos
      return true;
    });
    
    // 5. Obtenemos las tareas asignadas al usuario que no son propias
    const assignedTaskIdsArray = Array.from(assignedToUserTaskIds);
    
    if (assignedTaskIdsArray.length === 0) {
      // Si no hay tareas asignadas, devolvemos solo las tareas propias filtradas
      return filteredOwnTasks.map(task => ({
        ...task,
        is_assigned: assignedToUserTaskIds.has(task.id)
      }));
    }
    
    // Obtenemos los detalles de las tareas asignadas al usuario
    const { data: assignedTasks, error: assignedTasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('id', assignedTaskIdsArray)
      .not('profile_id', 'eq', profileId) // Excluimos las que ya son propias
      .order('due_date', { ascending: true });
      
    if (assignedTasksError) {
      console.error('Error al obtener detalles de tareas asignadas:', assignedTasksError);
      // Devolvemos solo las tareas propias filtradas
      return filteredOwnTasks.map(task => ({
        ...task,
        is_assigned: assignedToUserTaskIds.has(task.id)
      }));
    }
    
    // 6. Combinamos las tareas propias filtradas y las asignadas
    const ownTasksWithFlag = filteredOwnTasks.map(task => ({
      ...task,
      is_assigned: assignedToUserTaskIds.has(task.id)
    }));
    
    const externalAssignedTasks = (assignedTasks || []).map(task => ({
      ...task,
      is_assigned: true
    }));
    
    // Combinamos ambos arrays
    return [...ownTasksWithFlag, ...externalAssignedTasks];
  }

  /**
   * Obtiene todas las tareas de un proyecto específico
   */
  async getProjectTasks(projectId: string) {
    if (!this.companyId) {
      throw new Error('Compañía no establecida');
    }

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignees(*, profiles:profile_id(id, full_name, avatar_url))
      `)
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error al obtener tareas del proyecto:', error);
      return [];
    }

    return data as (Task & { task_assignees: (TaskAssignee & { profiles: { id: string, full_name: string, avatar_url: string | null } })[] })[];
  }

  /**
   * Obtiene todas las tareas del equipo (de todos los miembros de la compañía)
   */
  async getTeamTasks() {
    if (!this.companyId) {
      throw new Error('Compañía no establecida');
    }
    
    // Primero obtenemos todos los perfiles de la compañía actual
    const { data: companyProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('company_id', this.companyId);
      
    if (profilesError) {
      console.error('Error al obtener perfiles de la compañía:', profilesError);
      return [];
    }
    
    if (!companyProfiles || companyProfiles.length === 0) {
      return [];
    }
    
    // Extraemos los IDs de los perfiles para filtrar las tareas
    const profileIds = companyProfiles.map(profile => profile.id);
    
    // Obtenemos todas las tareas de los miembros del equipo
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles:profile_id(id, name),
        task_assignees(*, assigned_to:profile_id(id, name))
      `)
      .in('profile_id', profileIds)
      .order('due_date', { ascending: true });
      
    if (tasksError) {
      console.error('Error al obtener tareas del equipo:', tasksError);
      return [];
    }
    
    // Procesamos las tareas para añadir información sobre quién está asignado
    const processedTasks = (tasks || []).map(task => {
      // Si la tarea tiene asignaciones, añadimos esa información
      if (task.task_assignees && task.task_assignees.length > 0) {
        return {
          ...task,
          is_assigned: true,
          assigned_to: task.task_assignees[0].assigned_to,
          // Renombrar name a full_name para mantener consistencia con la interfaz
          assigned_to_name: task.task_assignees[0].assigned_to?.name
        };
      }
      
      // Si no tiene asignaciones, la tarea es del creador
      return {
        ...task,
        is_assigned: false,
        // Renombrar name a full_name para mantener consistencia con la interfaz
        owner_name: task.profiles?.name
      };
    });
    
    return processedTasks;
  }

  /**
   * Obtiene una tarea específica por su ID
   */
  async getTask(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener tarea:', error);
      return null;
    }

    return data;
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    if (!this.userId) {
      throw new Error('Usuario no establecido');
    }

    // Aseguramos que se cumpla la restricción de la base de datos
    // Una tarea debe pertenecer a un proyecto O a un perfil, pero no a ambos
    if (task.project_id && task.profile_id) {
      throw new Error('Una tarea no puede pertenecer a un proyecto y a un perfil simultáneamente');
    }

    if (!task.project_id && !task.profile_id) {
      throw new Error('Una tarea debe pertenecer a un proyecto o a un perfil');
    }
    
    // Obtener el ID del perfil del usuario actual
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', this.userId)
      .single();
      
    if (profileError || !userProfile) {
      console.error('Error al obtener perfil del usuario:', profileError);
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    const taskWithCreator = {
      ...task,
      created_by: userProfile.id
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskWithCreator)
      .select()
      .single();

    if (error) {
      console.error('Error al crear tarea:', error);
      return null;
    }

    return data;
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task | null> {
    if (!this.userId) {
      throw new Error('Usuario no establecido');
    }

    // Si se está actualizando el estado a 'completed', añadimos la fecha de completado
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString() as unknown as Date;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar tarea:', error);
      return null;
    }

    return data;
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(id: string): Promise<boolean> {
    if (!this.userId) {
      throw new Error('Usuario no establecido');
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar tarea:', error);
      return false;
    }

    return true;
  }

  /**
   * Asigna una tarea a un usuario
   */
  async assignTask(taskId: string, profileId: string): Promise<TaskAssignee | null> {
    if (!this.userId) {
      throw new Error('Usuario no establecido');
    }
    
    // Obtener el ID del perfil del usuario que asigna la tarea
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', this.userId)
      .single();
      
    if (profileError || !userProfile) {
      console.error('Error al obtener perfil del usuario:', profileError);
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    const assignee = {
      task_id: taskId,
      profile_id: profileId,
      assigned_by: userProfile.id
    };

    const { data, error } = await supabase
      .from('task_assignees')
      .insert(assignee)
      .select()
      .single();

    if (error) {
      console.error('Error al asignar tarea:', error);
      return null;
    }

    return data;
  }

  /**
   * Elimina la asignación de una tarea a un usuario
   */
  async unassignTask(taskId: string, profileId: string): Promise<boolean> {
    if (!this.userId) {
      throw new Error('Usuario no establecido');
    }

    const { error } = await supabase
      .from('task_assignees')
      .delete()
      .eq('task_id', taskId)
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error al eliminar asignación de tarea:', error);
      return false;
    }

    return true;
  }
}

// Exportamos una instancia del servicio para uso global
export const taskService = new TaskService();

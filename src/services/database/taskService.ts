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
   * Obtiene todas las tareas personales del usuario actual
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

    // Ahora buscamos las tareas asociadas a este perfil
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('profile_id', userProfile.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error al obtener tareas del usuario:', error);
      return [];
    }

    return data as Task[];
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

    const assignee = {
      task_id: taskId,
      profile_id: profileId,
      assigned_by: this.userId
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

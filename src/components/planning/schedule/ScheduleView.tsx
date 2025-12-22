import React, { useState, useEffect } from 'react';
import ScheduleHeader from './ScheduleHeader';
import ScheduleGrid from './ScheduleGrid';
import { Event } from './ScheduleEvent';
import { CalendarProvider, CalendarEvent, useCalendar } from '../../../contexts/CalendarContext';
import { taskService } from '../../../services/database/taskService';
import { supabase } from '../../../lib/supabase';
import { useAppContext } from '../../../contexts/AppContext';
import { Switch } from '../../ui/Switch';
import { FaSmile, FaMeh, FaFrown } from 'react-icons/fa';

interface Room {
  id: string;
  name: string;
}

interface ScheduleViewProps {
  onAddEvent?: (roomId: string, hour: string) => void;
}

// Componente interno que utiliza el contexto del calendario
const ScheduleViewContent: React.FC<ScheduleViewProps> = ({ onAddEvent }) => {
  const { authData } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Obtener eventos del contexto del calendario
  const { events: calendarEvents, addEvent, moveEvent } = useCalendar();

  // Convertir eventos del formato CalendarEvent al formato Event
  const [scheduleEvents, setScheduleEvents] = useState<Event[]>([]);

  // Definir las horas del día como "salas" para nuestra vista de agenda
  const [rooms] = useState<Room[]>([
    { id: 'morning', name: 'Mañana' },
    { id: 'afternoon', name: 'Tarde' },
    { id: 'evening', name: 'Noche' },
  ]);

  // Función para cargar las tareas desde la base de datos
  const loadTasks = async () => {
    if (!authData?.isAuthenticated || !authData?.company_id) {
      return; // No cargar tareas si no hay autenticación
    }

    setLoading(true);
    try {
      // Obtener el usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('No hay usuario autenticado');
        return;
      }

      // Configurar el servicio de tareas con el usuario y compañía actuales
      taskService.setUserAndCompany(user.id, authData.company_id);

      // Cargar solo tareas personales
      const tasks = await taskService.getUserTasks();

      if (!Array.isArray(tasks)) {
        console.log('No se recibieron tareas o el formato es incorrecto');
        setScheduleEvents([]);
        return;
      }

      // Filtrar tareas para la fecha actual
      const todayTasks = tasks.filter(task => {
        if (!task.start_date) return false;

        const taskDate = new Date(task.start_date);
        return (
          taskDate.getDate() === currentDate.getDate() &&
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      });

      // Convertir tareas al formato de eventos para la agenda
      const events = todayTasks.map(task => {
        const startDate = new Date(task.start_date!);
        const endDate = task.due_date ? new Date(task.due_date) : new Date(startDate.getTime() + 60 * 60 * 1000);

        // Determinar la sección del día según la hora
        let roomId = 'morning';
        const hour = startDate.getHours();

        if (hour >= 12 && hour < 18) {
          roomId = 'afternoon';
        } else if (hour >= 18) {
          roomId = 'evening';
        }

        // Determinar el color según la prioridad
        let color = 'bg-blue-500';
        if (task.priority === 'high') {
          color = 'bg-red-500';
        } else if (task.priority === 'low') {
          color = 'bg-green-500';
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          roomId,
          startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
          endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
          date: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`,
          color,
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          is_assigned: 'is_assigned' in task ? task.is_assigned : false,
          assigned_to_name: task.assigned_to_name
        };
      });

      setScheduleEvents(events);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      setScheduleEvents([]); // Establecer un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Cargar tareas al iniciar o cuando cambia la fecha
  useEffect(() => {
    loadTasks();
  }, [currentDate]);

  // Navegación entre fechas
  const prevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Manejar el cambio de estado de una tarea
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    if (!authData?.isAuthenticated) {
      console.error('Usuario no autenticado');
      return;
    }

    try {
      // Buscar el evento en scheduleEvents
      const event = scheduleEvents.find(e => e.id === taskId);
      if (!event) {
        console.error('No se encontró el evento con ID:', taskId);
        return;
      }

      // Asegurarse de que el servicio de tareas esté configurado
      const { data: { user } } = await supabase.auth.getUser();
      if (user && authData.company_id) {
        taskService.setUserAndCompany(user.id, authData.company_id);

        // Actualizar en la base de datos
        const result = await taskService.updateTask(taskId, { status: newStatus });

        if (result) {
          // Actualizar el estado local solo si la actualización en la BD fue exitosa
          setScheduleEvents(prev =>
            prev.map(evt =>
              evt.id === taskId
                ? { ...evt, status: newStatus }
                : evt
            )
          );
        }
      }
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error);
    }
  };

  // Manejar el movimiento de una tarea (cambio de hora)
  const handleTaskMove = async (taskId: string, newRoomId: string, newStartTime: string) => {
    if (!authData?.isAuthenticated) {
      console.error('Usuario no autenticado');
      return;
    }

    try {
      // Buscar el evento en scheduleEvents
      const event = scheduleEvents.find(e => e.id === taskId);
      if (!event) {
        console.error('No se encontró el evento con ID:', taskId);
        return;
      }

      // Crear nuevas fechas de inicio y fin
      const [hours, minutes] = newStartTime.split(':').map(Number);
      const startDate = new Date(currentDate);
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1, 0, 0, 0); // Por defecto, 1 hora después

      // Asegurarse de que el servicio de tareas esté configurado
      const { data: { user } } = await supabase.auth.getUser();
      if (user && authData.company_id) {
        taskService.setUserAndCompany(user.id, authData.company_id);

        // Actualizar en la base de datos
        const result = await taskService.updateTask(taskId, {
          start_date: startDate,
          due_date: endDate // Usamos due_date en lugar de end_date según la interfaz Task
        });

        if (result) {
          // Actualizar el estado local solo si la actualización en la BD fue exitosa
          setScheduleEvents(prev =>
            prev.map(evt =>
              evt.id === taskId
                ? {
                  ...evt,
                  roomId: newRoomId,
                  startTime: newStartTime,
                  endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
                }
                : evt
            )
          );
        }
      }
    } catch (error) {
      console.error('Error al mover tarea:', error);
    }
  };

  // Función para manejar la adición de eventos desde la vista de horario
  const handleAddEvent = async (roomId: string, hour: string) => {
    if (onAddEvent) {
      onAddEvent(roomId, hour);
      return;
    }

    if (!authData?.isAuthenticated) {
      console.error('Usuario no autenticado');
      return;
    }

    try {
      // Asegurarse de que el servicio de tareas esté configurado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !authData.company_id) {
        console.error('No se pudo obtener el usuario o la compañía');
        return;
      }

      taskService.setUserAndCompany(user.id, authData.company_id);

      // Crear fechas de inicio y fin
      const [hours, minutes] = hour.split(':').map(Number);
      const start = new Date(currentDate);
      start.setHours(hours, minutes, 0, 0);

      const end = new Date(start);
      end.setHours(start.getHours() + 1, 0, 0, 0);

      // Crear una nueva tarea en la base de datos
      const newTask = {
        title: 'Nueva tarea',
        description: '',
        status: 'todo',
        priority: 'medium',
        start_date: start,
        due_date: end
      };

      const result = await taskService.createTask(newTask);

      if (result && result.id) {
        // Añadir la nueva tarea a la vista
        const newEvent: Event = {
          id: result.id,
          title: 'Nueva tarea',
          roomId,
          startTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
          endTime: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
          date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
          color: 'bg-blue-500',
          status: 'todo',
          priority: 'medium',
          description: ''
        };

        setScheduleEvents(prev => [...prev, newEvent]);
      } else {
        console.error('Error al crear la tarea: no se recibió un ID válido');
      }
    } catch (error) {
      console.error('Error al crear nueva tarea:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
      {/* Cabecera con fecha y controles */}
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <ScheduleHeader
          currentDate={currentDate}
          onPrevDay={prevDay}
          onNextDay={nextDay}
        />
      </div>

      {/* Barra de progreso con emojis */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        {scheduleEvents.length > 0 ? (
          <div className="flex justify-between items-center">
            {/* Cálculo del progreso */}
            {(() => {
              const completedTasks = scheduleEvents.filter(event =>
                event.status === 'done' ||
                event.status === 'completed' ||
                event.status === 'completado' ||
                event.status === 'terminado'
              ).length;

              const inProgressTasks = scheduleEvents.filter(event =>
                event.status === 'in progress' ||
                event.status === 'progress' ||
                event.status === 'en progreso' ||
                event.status === 'en proceso'
              ).length;

              const pendingTasks = scheduleEvents.length - completedTasks - inProgressTasks;

              const completedPercent = (completedTasks / scheduleEvents.length) * 100;
              const inProgressPercent = (inProgressTasks / scheduleEvents.length) * 100;
              const pendingPercent = (pendingTasks / scheduleEvents.length) * 100;

              // Determinar el emoji según el progreso
              let emoji;
              if (completedPercent >= 70) {
                emoji = <FaSmile className="text-green-400 text-2xl" />;
              } else if (completedPercent >= 30) {
                emoji = <FaMeh className="text-yellow-400 text-2xl" />;
              } else {
                emoji = <FaFrown className="text-red-400 text-2xl" />;
              }

              return (
                <>
                  {/* Contador de tareas y estado */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
                      {emoji}
                      <span className="text-sm font-medium text-white">
                        {completedTasks} de {scheduleEvents.length} completadas
                      </span>
                    </div>

                    {loading && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-300">Cargando...</span>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white whitespace-nowrap">
                      {Math.round(completedPercent)}%
                    </span>

                    <div className="w-48 bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div className="flex h-full">
                        <div
                          className="bg-green-500 h-4"
                          style={{ width: `${completedPercent}%` }}
                        ></div>
                        <div
                          className="bg-yellow-500 h-4"
                          style={{ width: `${inProgressPercent}%` }}
                        ></div>
                        <div
                          className="bg-red-500 h-4"
                          style={{ width: `${pendingPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="text-gray-400 italic">
              No hay tareas programadas para hoy
            </div>

            {loading && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-300">Cargando...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal con la agenda */}
      <div className="flex-grow overflow-auto p-4 bg-gray-800">
        <ScheduleGrid
          rooms={rooms}
          events={scheduleEvents}
          currentDate={currentDate}
          onAddEvent={handleAddEvent}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskMove={handleTaskMove}
        />
      </div>
    </div>
  );
};

// Componente principal que proporciona el contexto del calendario
const ScheduleView: React.FC<ScheduleViewProps> = (props) => {
  // No necesitamos eventos iniciales, ya que cargaremos tareas reales

  return (
    <CalendarProvider initialEvents={[]}>
      <ScheduleViewContent {...props} />
    </CalendarProvider>
  );
};

export default ScheduleView;

import React, { useState, useEffect } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { CalendarProvider, CalendarEvent } from '../../../contexts/CalendarContext';
import { taskService } from '../../../services/database/taskService';
import { supabase } from '../../../lib/supabase';
import { useAppContext } from '../../../contexts/AppContext';
import { Switch } from '../../ui/Switch';

// Definir una interfaz para los eventos que pueden venir en diferentes formatos
interface LegacyEvent {
  id: string;
  title: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  color?: string;
  description?: string;
}

interface MonthlyCalendarProps {
  events?: (CalendarEvent | LegacyEvent)[];
  showTeamTasks?: boolean;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ events: propEvents = [] }) => {
  const { authData } = useAppContext();
  // Inicializar con la fecha actual para mostrar el mes actual
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showTeamTasks, setShowTeamTasks] = useState(false);
  const [taskDates, setTaskDates] = useState<Date[]>([]);
  
  // Navegación entre meses
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Obtener información del mes actual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Cargar tareas cuando cambie el mes o el switch de tareas del equipo
  useEffect(() => {
    const loadTasks = async () => {
      if (!authData?.isAuthenticated || !authData?.company_id) {
        return;
      }
      
      try {
        setLoading(true);

        
        // Obtener el ID del usuario actual desde Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !authData.company_id) {
          return;
        }
        
        // Configurar el servicio con el usuario y compañía actuales
        taskService.setUserAndCompany(user.id, authData.company_id);
        
        // Obtener tareas según si queremos ver tareas personales o del equipo
        let tasksData = [];
        try {
          if (showTeamTasks) {
            tasksData = await taskService.getTeamTasks() || [];

          } else {
            tasksData = await taskService.getUserTasks() || [];

          }
        } catch (error) {

          tasksData = [];
        }
        
        // Asegurarse de que tasksData es un array
        if (!Array.isArray(tasksData)) {

          tasksData = [];
        }
        
        setTasks(tasksData);
        
        // Extraer las fechas de las tareas para ajustar el mes mostrado si es necesario
        const dates: Date[] = [];
        tasksData.forEach((task: any) => {
          if (task.due_date) {
            try {
              const date = new Date(task.due_date);
              if (!isNaN(date.getTime())) {
                dates.push(date);
              }
            } catch (e) {

            }
          }
          if (task.start_date) {
            try {
              const date = new Date(task.start_date);
              if (!isNaN(date.getTime())) {
                dates.push(date);
              }
            } catch (e) {

            }
          }
        });
        
        setTaskDates(dates);
        
        // Si hay fechas válidas y no estamos en el mes actual, ajustar al mes de la primera tarea
        if (dates.length > 0) {
          // Ordenar fechas de más reciente a más antigua
          dates.sort((a, b) => a.getTime() - b.getTime());
          
          // Verificar si alguna fecha está en el mes actual
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          // Si ninguna tarea está en el mes actual, ajustar al mes de la primera tarea
          const hasTaskInCurrentMonth = dates.some(date => 
            date.getMonth() === currentMonth && date.getFullYear() === currentYear
          );
          
          if (!hasTaskInCurrentMonth) {
            // Usar la fecha más cercana a hoy
            const closestDate = dates.reduce((closest, date) => {
              const closestDiff = Math.abs(closest.getTime() - now.getTime());
              const currentDiff = Math.abs(date.getTime() - now.getTime());
              return currentDiff < closestDiff ? date : closest;
            }, dates[0]);
            

            setCurrentDate(new Date(closestDate));
          }
        }
      } catch (error) {
        console.error('Error al cargar tareas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [authData, showTeamTasks]); // Quitar currentDate de las dependencias para evitar bucles

  // Convertir tareas a formato de eventos de calendario
  const tasksAsEvents: CalendarEvent[] = tasks.map(task => {
    console.log('Procesando tarea para calendario:', {
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      start_date: task.start_date
    });
    
    // Verificar si la tarea tiene fechas válidas
    if (!task.due_date && !task.start_date) {
      console.log('Tarea sin fechas, usando fecha actual:', task.id, task.title);
    }
    
    // Crear fechas de inicio y fin basadas en la fecha de vencimiento de la tarea
    // Asegurarse de que las fechas son objetos Date válidos
    let dueDate: Date;
    let startDate: Date;
    
    try {
      const now = new Date();
      
      // Función auxiliar para parsear fechas de manera segura
      const parseDate = (dateValue: any): Date | null => {
        if (!dateValue) return null;
        
        // Si ya es un objeto Date válido
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          return dateValue;
        }
        
        // Si es un string, intentar convertirlo
        if (typeof dateValue === 'string') {
          // Manejar diferentes formatos de fecha
          let parsedDate: Date | null = null;
          
          // Intentar formato ISO
          parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
          
          // Intentar formato DD/MM/YYYY
          if (dateValue.includes('/')) {
            const parts = dateValue.split('/');
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // Meses en JS son 0-11
              const year = parseInt(parts[2]);
              parsedDate = new Date(year, month, day);
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
              }
            }
          }
          
          // Intentar formato YYYY-MM-DD
          if (dateValue.includes('-')) {
            const parts = dateValue.split('-');
            if (parts.length === 3) {
              const year = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // Meses en JS son 0-11
              const day = parseInt(parts[2]);
              parsedDate = new Date(year, month, day);
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
              }
            }
          }
        }
        
        // Si es un timestamp (number)
        if (typeof dateValue === 'number') {
          const dateFromTimestamp = new Date(dateValue);
          if (!isNaN(dateFromTimestamp.getTime())) {
            return dateFromTimestamp;
          }
        }
        
        console.warn('No se pudo parsear la fecha:', dateValue);
        return null;
      };
      
      // Intentar parsear la fecha de vencimiento
      const parsedDueDate = parseDate(task.due_date);
      dueDate = parsedDueDate || now; // Usar fecha actual como fallback
      
      // Intentar parsear la fecha de inicio
      const parsedStartDate = parseDate(task.start_date);
      startDate = parsedStartDate || dueDate; // Usar fecha de vencimiento como fallback
      
      console.log('Fechas procesadas para tarea', task.id, ':', {
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString()
      });
    } catch (error) {
      console.error('Error al parsear fechas de la tarea:', error);
      dueDate = new Date();
      startDate = new Date();
    }
    
    // Establecer horas específicas para inicio y fin
    const finalStartDate = new Date(startDate);
    finalStartDate.setHours(9, 0, 0); // Por defecto, 9:00 AM
    
    const finalEndDate = new Date(dueDate);
    finalEndDate.setHours(17, 0, 0); // Por defecto, 5:00 PM
    
    console.log('Fechas finales para tarea', task.id, ':', {
      startDate: finalStartDate.toISOString(),
      endDate: finalEndDate.toISOString()
    });
    
    // Determinar el color según la prioridad
    let color = '#4299e1'; // Azul para prioridad media (por defecto)
    if (task.priority === 'high') {
      color = '#e53e3e'; // Rojo para prioridad alta
    } else if (task.priority === 'low') {
      color = '#38a169'; // Verde para prioridad baja
    }
    
    // Añadir información adicional para tareas asignadas
    let title = task.title;
    if (task.is_assigned) {
      // Si estamos viendo tareas del equipo, mostrar quién es el dueño o a quién está asignada
      if (showTeamTasks) {
        const assignedToName = task.assigned_to_name || task.assigned_to?.name || '';
        const ownerName = task.owner_name || task.profiles?.name || '';
        title = `${title} (${task.is_assigned ? 'Asignada a: ' + assignedToName : 'Dueño: ' + ownerName})`;
      } else {
        // Si estamos viendo tareas personales, indicar si es una tarea asignada
        title = `${title} (Asignada)`;
      }
    }
    
    // Crear el evento de calendario con las fechas procesadas
    const calendarEvent = {
      id: task.id,
      title: title,
      start: finalStartDate,
      end: finalEndDate,
      color: color,
      description: task.description || '',
      // Metadatos adicionales que podrían ser útiles
      priority: task.priority,
      is_assigned: task.is_assigned
    };
    
    console.log('Tarea convertida a evento de calendario:', {
      taskId: task.id,
      taskTitle: task.title,
      startDate: finalStartDate.toISOString(),
      endDate: finalEndDate.toISOString(),
      month: finalStartDate.getMonth() + 1,
      day: finalStartDate.getDate(),
      year: finalStartDate.getFullYear()
    });
    
    return calendarEvent;
  });
  
  console.log('Total de eventos generados:', tasksAsEvents.length);
  
  // Convertir eventos de props al formato CalendarEvent si es necesario
  const formattedPropEvents: CalendarEvent[] = propEvents.map(event => {
    // Si el evento ya tiene el formato correcto, devolverlo tal cual
    if ('start' in event && 'end' in event && event.start instanceof Date && event.end instanceof Date) {
      return event as CalendarEvent;
    }
    
    // Si no, convertirlo al formato correcto (asumiendo que es un LegacyEvent)
    const legacyEvent = event as LegacyEvent;
    const startDate = new Date();
    const endDate = new Date();
    
    // Establecer la fecha base
    if (legacyEvent.date) {
      const baseDate = new Date(legacyEvent.date);
      startDate.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
      endDate.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    }
    
    // Si hay hora de inicio y fin, establecerlas
    if (legacyEvent.startTime) {
      const [hours, minutes] = legacyEvent.startTime.split(':').map(Number);
      startDate.setHours(hours, minutes);
    }
    
    if (legacyEvent.endTime) {
      const [hours, minutes] = legacyEvent.endTime.split(':').map(Number);
      endDate.setHours(hours, minutes);
    } else {
      // Si no hay hora de fin, establecer 1 hora después de la hora de inicio
      endDate.setHours(startDate.getHours() + 1, startDate.getMinutes());
    }
    
    return {
      id: legacyEvent.id || String(Date.now()),
      title: legacyEvent.title,
      start: startDate,
      end: endDate,
      roomId: legacyEvent.roomId,
      color: legacyEvent.color,
      description: legacyEvent.description
    };
  });
  
  // Combinar eventos proporcionados como props con las tareas convertidas a eventos
  const formattedEvents: CalendarEvent[] = [...formattedPropEvents, ...tasksAsEvents];
  
  console.log('Total de eventos en el calendario:', formattedEvents.length);
  
  // Verificar que todos los eventos tienen fechas válidas
  formattedEvents.forEach((event, index) => {
    if (!(event.start instanceof Date) || isNaN(event.start.getTime())) {
      console.error(`Evento ${index} (${event.id}) tiene fecha de inicio inválida:`, event.start);
    }
    if (!(event.end instanceof Date) || isNaN(event.end.getTime())) {
      console.error(`Evento ${index} (${event.id}) tiene fecha de fin inválida:`, event.end);
    }
  });
  
  // Agrupar eventos por mes para depuración
  const eventsByMonth: Record<string, number> = {};
  formattedEvents.forEach(event => {
    if (event.start instanceof Date) {
      const monthKey = `${event.start.getFullYear()}-${event.start.getMonth() + 1}`;
      eventsByMonth[monthKey] = (eventsByMonth[monthKey] || 0) + 1;
    }
  });


  // Función para crear un nuevo evento (se implementaría según necesidades)
  const handleNewEvent = () => {

    // Aquí se implementaría la lógica para abrir un modal de creación de evento
  };

  return (
    <CalendarProvider initialEvents={formattedEvents}>
      <div className="bg-theme-component p-6 rounded-lg shadow-md h-full flex flex-col">
        {/* Encabezado con navegación y controles */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between w-full">
            <CalendarHeader 
              month={month} 
              year={year} 
              onPrevMonth={prevMonth} 
              onNextMonth={nextMonth}
              onNewEvent={handleNewEvent}
            />
          </div>
          
          <div className="flex flex-wrap justify-between items-center gap-3 bg-theme-component-hover p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-theme-component px-3 py-1.5 rounded-lg">
                <span className="text-sm text-theme-secondary">
                  {showTeamTasks ? 'Tareas del equipo' : 'Mis tareas'}
                </span>
                <Switch 
                  checked={showTeamTasks}
                  onChange={() => {
                    setShowTeamTasks(!showTeamTasks);
                  }}
                  label=""
                />
              </div>
              
              {loading && (
                <div className="flex items-center gap-2 bg-theme-component px-3 py-1.5 rounded-lg">
                  <div className="animate-pulse h-3 w-3 rounded-full bg-primary-color"></div>
                  <span className="text-sm text-theme-secondary">Cargando...</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-theme-secondary bg-theme-component px-3 py-1.5 rounded-lg">
              {formattedEvents.length} {formattedEvents.length === 1 ? 'evento' : 'eventos'} en el calendario
            </div>
          </div>
        </div>
        
        {/* Contenedor principal del calendario */}
        <div className="flex-grow overflow-auto">
          <div key={`calendar-${month}-${year}-${showTeamTasks ? 'team' : 'personal'}`}>
            <CalendarGrid year={year} month={month} events={formattedEvents} />
          </div>
        </div>
      </div>
    </CalendarProvider>
  );
};

export default MonthlyCalendar;

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DroppableCell from './DroppableCell';
import DraggableEvent from './DraggableEvent';
import { CalendarEvent, useCalendar } from '../../../contexts/CalendarContext';

interface CalendarGridProps {
  year: number;
  month: number;
  events?: CalendarEvent[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ year, month, events: propEvents }) => {
  // Usar el contexto del calendario para acceder a los eventos y funciones
  const { events: contextEvents, moveEvent } = useCalendar();
  
  // Usar eventos del contexto si no se proporcionan como props
  const events = propEvents || contextEvents || [];
  
  // Log para depurar eventos
  console.log('CalendarGrid - Eventos disponibles:', events?.length || 0, 'eventos');
  console.log('CalendarGrid - Mes actual:', month + 1, 'Año:', year);
  // Función para obtener los días del mes actual
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Función para obtener el primer día de la semana del mes
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Nombres de los días de la semana en español
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener información del mes
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Generar las celdas del calendario
  const calendarCells = [];
  
  // Agregar celdas vacías para los días anteriores al primer día del mes
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(
      <div 
        key={`empty-${i}`} 
        className="h-28 m-1 rounded-lg bg-transparent"
      />
    );
  }
  
  // Log para depurar el rango de días del mes
  console.log('CalendarGrid - Rango de días del mes:', {
    primerDia: new Date(year, month, 1).toISOString(),
    ultimoDia: new Date(year, month, daysInMonth).toISOString(),
    diasEnMes: daysInMonth,
    primerDiaSemana: firstDayOfMonth
  });

  // Función para manejar el movimiento de eventos
  const handleEventMove = (event: CalendarEvent, targetDate: Date, targetRoomId?: string) => {
    console.log('handleEventMove called:', { eventId: event.id, targetDate, targetRoomId });
    
    // Crear una nueva fecha de inicio manteniendo la hora original
    const newStart = new Date(targetDate);
    newStart.setHours(event.start.getHours(), event.start.getMinutes());
    
    // Calcular la duración del evento original
    const duration = event.end.getTime() - event.start.getTime();
    
    // Crear una nueva fecha de fin basada en la nueva fecha de inicio y la duración original
    const newEnd = new Date(newStart.getTime() + duration);
    
    console.log('Moving event:', {
      id: event.id,
      oldStart: event.start.toISOString(),
      newStart: newStart.toISOString(),
      oldEnd: event.end.toISOString(),
      newEnd: newEnd.toISOString()
    });
    
    // Llamar a la función moveEvent del contexto
    moveEvent(event.id, newStart, newEnd, targetRoomId);
    
    // Forzar una actualización del estado para reflejar los cambios
    // Esto es importante para que la interfaz de usuario se actualice correctamente
    setTimeout(() => {
      console.log('Forcing re-render after event move');
    }, 100);
  };

  // Agregar celdas para cada día del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === month && 
                    new Date().getFullYear() === year;
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // Filtrar eventos para este día
    const dayEvents = events ? events.filter(event => {
      try {
        // Verificar si el evento y su fecha de inicio existen
        if (!event || !event.start) {
          return false;
        }
        
        // Asegurarse de que la fecha de inicio es un objeto Date válido
        let eventDate: Date;
        
        if (event.start instanceof Date) {
          if (isNaN(event.start.getTime())) {
            return false;
          }
          eventDate = event.start;
        } else if (typeof event.start === 'string') {
          // Intentar convertir string a Date
          eventDate = new Date(event.start);
          if (isNaN(eventDate.getTime())) {
            return false;
          }
        } else {
          return false;
        }
        
        // Crear una fecha para el día actual del calendario (sin tiempo)
        const calendarDate = new Date(year, month, day);
        calendarDate.setHours(0, 0, 0, 0);
        
        // Crear una copia de la fecha del evento sin tiempo para comparar solo la fecha
        const eventDateNoTime = new Date(eventDate);
        eventDateNoTime.setHours(0, 0, 0, 0);
        
        // Comparar fechas ignorando la hora (usando getTime para comparación exacta)
        const isSameDay = calendarDate.getTime() === eventDateNoTime.getTime();
        
        return isSameDay;
      } catch (error) {
        return false;
      }
    }) : [];
    
    // Log para depuración si hay eventos en este día
    if (dayEvents.length > 0) {
      console.log(`Día ${day}/${month + 1}/${year} tiene ${dayEvents.length} eventos:`, 
        dayEvents.map(e => ({ id: e.id, title: e.title }))
      );
    }

    calendarCells.push(
      <DroppableCell 
        key={`day-${day}`} 
        date={currentDate}
        onDrop={handleEventMove}
        isToday={isToday}
        className={`rounded-lg ${isToday ? 'bg-primary-color bg-opacity-10' : isWeekend ? 'bg-theme-component-hover bg-opacity-30' : 'bg-theme-component'}`}
      >
        <div className="flex flex-col h-full">
          <div className={`text-sm font-semibold p-1 ${isToday ? 'text-primary-color' : 'text-theme-primary'}`}>
            {day}
          </div>
          {/* Mostrar eventos del día */}
          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1 p-1 max-h-20">
            {dayEvents.map((event) => (
              <DraggableEvent 
                key={`event-${event.id}`}
                event={event}
                onMove={handleEventMove}
                targetDate={currentDate}
                className="text-xs rounded-lg shadow-sm mb-1"
              />
            ))}
          </div>
        </div>
      </DroppableCell>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div data-component-name="CalendarGrid">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center font-medium text-theme-secondary py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Celdas del calendario */}
        <div className="grid grid-cols-7">
          {calendarCells}
        </div>
      </div>
    </DndProvider>
  );
};

export default CalendarGrid;

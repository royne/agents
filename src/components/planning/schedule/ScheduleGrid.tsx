import React from 'react';
import { FaPlus } from 'react-icons/fa';
import ScheduleEvent, { Event } from './ScheduleEvent';

interface Room {
  id: string;
  name: string;
}

interface ScheduleGridProps {
  rooms: Room[];
  events: Event[];
  currentDate: Date;
  onAddEvent?: (roomId: string, hour: string) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  rooms,
  events,
  currentDate,
  onAddEvent
}) => {
  // Generar las horas del día (de 6am a 6pm)
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 6; // Empezamos desde las 6am
    return `${hour}${hour === 12 ? 'pm' : 'am'}`;
  });

  // Verificar si hay un evento en una hora y sala específica
  const getEventForCell = (roomId: string, hour: string): Event | undefined => {
    const hourNum = parseInt(hour.replace('am', '').replace('pm', ''));
    const adjustedHour = hour.includes('pm') && hourNum !== 12 ? hourNum + 12 : hourNum;
    const timeStr = adjustedHour.toString().padStart(2, '0') + ':00';
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    return events.find(event => {
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      return event.roomId === roomId && 
             event.date === dateStr && 
             eventStartHour <= adjustedHour && 
             eventEndHour > adjustedHour;
    });
  };

  // Calcular la duración del evento en horas
  const getEventDuration = (event: Event): number => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    return endHour - startHour;
  };

  // Calcular la posición de inicio del evento (en qué columna comienza)
  const getEventStartColumn = (event: Event): number => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    return startHour - 6; // Restamos 6 porque nuestra primera columna es 6am
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-theme-component-hover">
            <th className="border border-theme-border p-2 text-left text-theme-secondary w-32">Salas</th>
            {hours.map(hour => (
              <th key={hour} className="border border-theme-border p-2 text-center text-theme-secondary min-w-[80px]">
                {hour}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id} className="hover:bg-theme-component-hover">
              <td className="border border-theme-border p-2 text-theme-primary font-medium">
                {room.name}
              </td>
              {hours.map((hour, hourIndex) => {
                const event = getEventForCell(room.id, hour);
                
                // Si hay un evento que comienza en esta celda
                if (event && getEventStartColumn(event) === hourIndex) {
                  const duration = getEventDuration(event);
                  return (
                    <td 
                      key={`${room.id}-${hour}`} 
                      className={`border border-theme-border p-0 relative`}
                      colSpan={duration}
                    >
                      <ScheduleEvent event={event} duration={duration} />
                    </td>
                  );
                } 
                // Si esta celda está ocupada por un evento que comenzó antes
                else if (event && getEventStartColumn(event) < hourIndex) {
                  return null; // No renderizamos nada, ya que está cubierto por el colSpan
                } 
                // Celda vacía
                else {
                  return (
                    <td 
                      key={`${room.id}-${hour}`} 
                      className="border border-theme-border p-1 text-center relative group"
                      onClick={() => onAddEvent && onAddEvent(room.id, hour)}
                    >
                      <div className="invisible group-hover:visible absolute inset-0 flex items-center justify-center bg-theme-component-hover bg-opacity-50">
                        <FaPlus className="text-primary-color" />
                      </div>
                    </td>
                  );
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleGrid;

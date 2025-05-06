import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ScheduleEvent, { Event } from './ScheduleEvent';
import DraggableScheduleEvent from './DraggableScheduleEvent';
import DroppableScheduleCell from './DroppableScheduleCell';

interface Room {
  id: string;
  name: string;
}

interface ScheduleGridProps {
  rooms: Room[];
  events: Event[];
  currentDate: Date;
  onAddEvent?: (roomId: string, hour: string) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  onTaskMove?: (taskId: string, newRoomId: string, newStartTime: string) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  rooms,
  events,
  currentDate,
  onAddEvent,
  onTaskStatusChange,
  onTaskMove
}) => {
  // Función para manejar el movimiento de eventos
  const handleEventMove = (event: Event, targetRoomId: string, targetHour: string) => {
    if (onTaskMove) {
      onTaskMove(event.id, targetRoomId, targetHour);
    }
  };

  // Generar las horas del día para cada sección (mañana, tarde, noche)
  const getHoursForSection = (roomId: string) => {
    switch (roomId) {
      case 'morning':
        return Array.from({ length: 5 }, (_, i) => {
          const hour = i + 7; // 7am a 11am
          return `${hour.toString().padStart(2, '0')}:00`;
        });
      case 'afternoon':
        return Array.from({ length: 6 }, (_, i) => {
          const hour = i + 12; // 12pm a 5pm
          return `${hour.toString().padStart(2, '0')}:00`;
        });
      case 'evening':
        return Array.from({ length: 6 }, (_, i) => {
          const hour = i + 18; // 6pm a 11pm
          return `${hour.toString().padStart(2, '0')}:00`;
        });
      default:
        return [];
    }
  };

  // Formatear la fecha para comparar con los eventos
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // Verificar si hay un evento para una celda específica
  const getEventForCell = (roomId: string, hour: string): Event | undefined => {
    const [hourStr] = hour.split(':');
    const adjustedHour = parseInt(hourStr, 10);

    return events.find(event => {
      if (event.date !== dateStr || event.roomId !== roomId) {
        return false;
      }

      const [eventStartHourStr] = event.startTime.split(':');
      const [eventEndHourStr] = event.endTime.split(':');

      const eventStartHour = parseInt(eventStartHourStr, 10);
      const eventEndHour = parseInt(eventEndHourStr, 10);

      return eventStartHour <= adjustedHour && eventEndHour > adjustedHour;
    });
  };

  // Obtener la columna de inicio para un evento
  const getEventStartColumn = (event: Event, roomId: string): number => {
    const hoursForSection = getHoursForSection(roomId);
    const [eventStartHourStr] = event.startTime.split(':');
    const eventStartHour = parseInt(eventStartHourStr, 10);

    return hoursForSection.findIndex(hour => {
      const [hourStr] = hour.split(':');
      return parseInt(hourStr, 10) === eventStartHour;
    });
  };

  // Calcular la duración de un evento en términos de columnas
  const getEventDuration = (event: Event, roomId: string): number => {
    const hoursForSection = getHoursForSection(roomId);
    const [eventStartHourStr] = event.startTime.split(':');
    const [eventEndHourStr] = event.endTime.split(':');

    const eventStartHour = parseInt(eventStartHourStr, 10);
    const eventEndHour = parseInt(eventEndHourStr, 10);

    // Encontrar el índice de inicio y fin en las horas de la sección
    const startIdx = hoursForSection.findIndex(hour => {
      const [hourStr] = hour.split(':');
      return parseInt(hourStr, 10) === eventStartHour;
    });

    const endIdx = hoursForSection.findIndex(hour => {
      const [hourStr] = hour.split(':');
      return parseInt(hourStr, 10) === eventEndHour;
    });

    // Si no se encontró el índice de fin, usar la longitud del array
    const actualEndIdx = endIdx === -1 ? hoursForSection.length : endIdx;

    // Calcular la duración (mínimo 1 columna)
    return Math.max(1, actualEndIdx - startIdx);
  };

  // Manejar el drop de un evento
  const handleDrop = (event: Event, targetRoomId: string, targetHour: string) => {
    handleEventMove(event, targetRoomId, targetHour);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {rooms.map(room => {
          const hoursForSection = getHoursForSection(room.id);
          
          return (
            <div key={room.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              {/* Encabezado de la sección */}
              <div className="bg-gray-600 px-4 py-3 border-b border-gray-500">
                <h3 className="text-base font-medium text-white">{room.name}</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Encabezados de horas */}
                  <thead>
                    <tr className="bg-gray-800">
                      {hoursForSection.map(hour => {
                        // Formatear la hora para mostrarla de forma más amigable
                        const [hourStr] = hour.split(':');
                        const hourNum = parseInt(hourStr);
                        const formattedHour = hourNum > 12 
                          ? `${hourNum - 12}:00 PM` 
                          : hourNum === 12 
                            ? '12:00 PM' 
                            : `${hourNum}:00 AM`;
                            
                        return (
                          <th 
                            key={hour} 
                            className="p-3 text-center text-xs font-medium text-gray-300 border-b border-gray-600"
                          >
                            {formattedHour}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  
                  {/* Celdas de eventos */}
                  <tbody>
                    <tr>
                      {hoursForSection.map((hour, hourIndex) => {
                        const event = getEventForCell(room.id, hour);
                        
                        // Si hay un evento que comienza en esta celda
                        if (event && getEventStartColumn(event, room.id) === hourIndex) {
                          const duration = getEventDuration(event, room.id);
                          return (
                            <td 
                              key={`${room.id}-${hour}`} 
                              className="p-0 relative"
                              colSpan={duration}
                            >
                              <DraggableScheduleEvent 
                                event={event} 
                                duration={duration} 
                                onStatusChange={onTaskStatusChange}
                                onMove={handleEventMove}
                              />
                            </td>
                          );
                        } 
                        // Si esta celda está ocupada por un evento que comenzó antes
                        else if (event && getEventStartColumn(event, room.id) < hourIndex) {
                          return null; // No renderizamos nada, ya que está cubierto por el colSpan
                        } 
                        // Si no hay evento, mostrar una celda vacía donde se pueden soltar eventos
                        else {
                          return (
                            <td 
                              key={`${room.id}-${hour}`} 
                              className="p-0 h-24 border border-gray-600 relative hover:bg-gray-600/30 transition-colors duration-200"
                            >
                              <DroppableScheduleCell 
                                roomId={room.id} 
                                hour={hour} 
                                onDrop={handleDrop}
                                onAddEvent={onAddEvent}
                              />
                            </td>
                          );
                        }
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </DndProvider>
  );
};

export default ScheduleGrid;

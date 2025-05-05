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
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  rooms,
  events,
  currentDate,
  onAddEvent
}) => {
  // Función para manejar el movimiento de eventos
  const handleEventMove = (event: Event, targetRoomId: string, targetHour: string) => {
    // Aquí implementaríamos la lógica para mover el evento
    // Por ahora, simplemente mostramos un mensaje en la consola
    console.log(`Moviendo evento ${event.id} a sala ${targetRoomId} a las ${targetHour}`);
    
    // Si tuviéramos una función para actualizar eventos, la llamaríamos aquí
    // updateEvent(event.id, { roomId: targetRoomId, startTime: newStartTime, endTime: newEndTime });
  };
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
    <DndProvider backend={HTML5Backend}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-md dark:shadow-gray-800">
          <thead>
          <tr className="bg-theme-component-hover bg-opacity-40 dark:bg-opacity-20">
            <th className="border-b border-gray-200 dark:border-gray-700 border-opacity-50 dark:border-opacity-40 p-3 text-left text-theme-secondary font-semibold w-32">Salas</th>
            {hours.map(hour => (
              <th key={hour} className="border-b border-gray-200 dark:border-gray-700 border-opacity-50 dark:border-opacity-40 p-3 text-center text-theme-secondary font-semibold min-w-[80px]">
                {hour}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id} className="hover:bg-theme-component-hover transition-all duration-200">
              <td className="border-r border-gray-200 dark:border-gray-700 p-3 text-theme-primary font-medium">
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
                      className={`p-0 relative`}
                      colSpan={duration}
                    >
                      <DraggableScheduleEvent event={event} duration={duration} />
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
                    <td key={`${room.id}-${hour}`} className="p-0">
                      <DroppableScheduleCell
                        roomId={room.id}
                        hour={hour}
                        onDrop={handleEventMove}
                        onAddEvent={onAddEvent}
                      />
                    </td>
                  );
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </DndProvider>
  );
};

export default ScheduleGrid;

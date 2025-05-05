import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';

interface Room {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  roomId: string;
  startTime: string; // formato "HH:mm"
  endTime: string; // formato "HH:mm"
  date: string; // formato "YYYY-MM-DD"
  color: string;
}

interface ScheduleViewProps {
  onAddEvent?: (roomId: string, hour: string) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  
  // Datos de ejemplo
  const [rooms] = useState<Room[]>([
    { id: '1', name: 'Auditorio A' },
    { id: '2', name: 'Auditorio B' },
    { id: '3', name: 'Auditorio C' },
    { id: '4', name: 'Auditorio D' },
    { id: '5', name: 'Room D1' },
    { id: '6', name: 'Room D2' },
    { id: '7', name: 'Auditorio E' },
    { id: '8', name: 'Auditorio F' },
    { id: '9', name: 'Auditorio G' },
    { id: '10', name: 'Auditorio H' },
    { id: '11', name: 'Auditorio I' },
  ]);

  const [events] = useState<Event[]>([
    { 
      id: '1', 
      title: 'event 1', 
      roomId: '4', 
      startTime: '07:00', 
      endTime: '14:00', 
      date: '2025-05-05',
      color: 'bg-blue-500'
    },
    { 
      id: '2', 
      title: 'event 2', 
      roomId: '7', 
      startTime: '09:00', 
      endTime: '13:00', 
      date: '2025-05-05',
      color: 'bg-blue-500'
    },
    { 
      id: '3', 
      title: 'event 3', 
      roomId: '3', 
      startTime: '12:00', 
      endTime: '16:00', 
      date: '2025-05-05',
      color: 'bg-orange-500'
    },
    { 
      id: '4', 
      title: 'event 4', 
      roomId: '8', 
      startTime: '09:00', 
      endTime: '11:00', 
      date: '2025-05-05',
      color: 'bg-red-500'
    },
    { 
      id: '5', 
      title: 'event 5', 
      roomId: '2', 
      startTime: '10:00', 
      endTime: '12:00', 
      date: '2025-05-05',
      color: 'bg-green-500'
    },
  ]);

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

  // Formatear la fecha actual
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
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
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      {/* Cabecera con navegación y selector de vista */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevDay}
            className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          >
            <FaChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-theme-primary">
            {formatDate(currentDate)}
          </h2>
          <button 
            onClick={nextDay}
            className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
        <div className="flex space-x-1 bg-theme-component-hover rounded-md overflow-hidden">
          <button 
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 text-sm ${viewMode === 'day' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
          >
            día
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
          >
            semana
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
          >
            mes
          </button>
        </div>
      </div>

      {/* Tabla de horarios */}
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
                        <div className={`${event.color} text-white p-1 h-full rounded-sm text-xs overflow-hidden`}>
                          {event.title}
                        </div>
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
    </div>
  );
};

export default ScheduleView;

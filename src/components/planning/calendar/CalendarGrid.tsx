import React from 'react';

interface CalendarGridProps {
  year: number;
  month: number;
  events?: any[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ year, month, events = [] }) => {
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
        className="h-24 border border-theme-border bg-theme-component-hover"
      />
    );
  }

  // Agregar celdas para cada día del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === month && 
                    new Date().getFullYear() === year;

    // Filtrar eventos para este día (implementación básica)
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event?.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        className={`h-24 border border-theme-border p-2 ${isToday ? 'bg-primary-color bg-opacity-10' : 'bg-theme-component'} hover:bg-theme-component-hover cursor-pointer transition-colors`}
      >
        <div className={`text-sm font-semibold ${isToday ? 'text-primary-color' : 'text-theme-primary'}`}>
          {day}
        </div>
        {/* Mostrar eventos del día */}
        <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
          {dayEvents.map((event, index) => (
            <div 
              key={`event-${day}-${index}`}
              className="text-xs p-1 rounded bg-primary-color bg-opacity-20 text-theme-primary truncate"
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center font-medium text-theme-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Celdas del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells}
      </div>
    </div>
  );
};

export default CalendarGrid;

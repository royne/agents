import React, { useState } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaPlus } from 'react-icons/fa';

interface CalendarHeaderProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onNewEvent?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  month, 
  year, 
  onPrevMonth, 
  onNextMonth,
  onNewEvent
}) => {
  // Nombres de los meses en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Estado para controlar si se muestra el selector de mes/año
  const [showSelector, setShowSelector] = useState(false);

  // Obtener la fecha actual
  const today = new Date();
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="w-full">
      {/* Cabecera principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <div className="flex items-center">
          <div className="bg-primary-color bg-opacity-10 p-2.5 rounded-lg mr-3 shadow-sm">
            <FaCalendarAlt className="text-xl text-primary-color" />
          </div>
          <div>
            <h2 
              className="text-xl font-bold text-theme-primary cursor-pointer hover:text-primary-color transition-colors flex items-center"
              onClick={() => setShowSelector(!showSelector)}
            >
              {monthNames[month]} {year}
              {isCurrentMonth && (
                <span className="ml-2 text-xs bg-theme-component-hover px-2 py-1 rounded-full text-theme-secondary">
                  Actual
                </span>
              )}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto">
          {onNewEvent && (
            <button 
              onClick={onNewEvent}
              className="px-3 py-1.5 bg-primary-color text-white rounded-lg hover:bg-primary-color-dark flex items-center shadow-sm text-sm"
            >
              <FaPlus className="mr-1.5" /> Nuevo Evento
            </button>
          )}
          
          <div className="flex bg-theme-component-hover rounded-lg p-1 shadow-sm">
            <button 
              onClick={onPrevMonth}
              className="p-2 rounded-lg hover:bg-theme-component transition-colors"
              aria-label="Mes anterior"
            >
              <FaArrowLeft className="text-theme-secondary" />
            </button>
            <button 
              onClick={onNextMonth}
              className="p-2 rounded-lg hover:bg-theme-component transition-colors"
              aria-label="Mes siguiente"
            >
              <FaArrowRight className="text-theme-secondary" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Selector de mes/año (opcional) */}
      {showSelector && (
        <div className="bg-theme-component p-4 rounded-lg shadow-md mb-4 grid grid-cols-3 gap-2 absolute z-10">
          {monthNames.map((name, index) => (
            <button 
              key={index}
              className={`p-2 rounded-lg ${month === index ? 'bg-primary-color text-white' : 'hover:bg-theme-component-hover'}`}
              onClick={() => {
                // Aquí se podría implementar la lógica para cambiar el mes
                setShowSelector(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;

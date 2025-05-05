import React, { useState } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaPlus } from 'react-icons/fa';

interface CalendarHeaderProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  month, 
  year, 
  onPrevMonth, 
  onNextMonth 
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
    <div className="mb-8">
      {/* Cabecera principal */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-primary-color bg-opacity-10 p-2 rounded-lg mr-3">
            <FaCalendarAlt className="text-xl text-primary-color" />
          </div>
          <div>
            <h2 
              className="text-xl font-bold text-theme-primary cursor-pointer hover:text-primary-color transition-colors"
              onClick={() => setShowSelector(!showSelector)}
            >
              {monthNames[month]} {year}
            </h2>
            <p className="text-sm text-theme-secondary">{isCurrentMonth ? 'Este mes' : ''}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-color-dark flex items-center shadow-sm"
          >
            <FaPlus className="mr-2" /> Nuevo Evento
          </button>
          <div className="flex space-x-1 bg-theme-component-hover rounded-lg p-1">
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
        <div className="bg-theme-component p-4 rounded-lg shadow-md mb-4 grid grid-cols-3 gap-2">
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

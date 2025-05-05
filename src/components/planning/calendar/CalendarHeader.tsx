import React from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

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

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-theme-primary flex items-center">
        <FaCalendarAlt className="mr-2 text-primary-color" />
        {monthNames[month]} {year}
      </h2>
      <div className="flex space-x-2">
        <button 
          onClick={onPrevMonth}
          className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          aria-label="Mes anterior"
        >
          <FaArrowLeft />
        </button>
        <button 
          onClick={onNextMonth}
          className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          aria-label="Mes siguiente"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ScheduleHeaderProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  currentDate,
  onPrevDay,
  onNextDay
}) => {
  // Formatear la fecha actual
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="flex items-center justify-center">
      <button 
        onClick={onPrevDay}
        className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        aria-label="Día anterior"
      >
        <FaChevronLeft size={16} />
      </button>
      
      <h2 className="mx-4 text-xl font-bold text-white">
        {formatDate(currentDate)}
      </h2>
      
      <button 
        onClick={onNextDay}
        className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        aria-label="Día siguiente"
      >
        <FaChevronRight size={16} />
      </button>
    </div>
  );
};

export default ScheduleHeader;

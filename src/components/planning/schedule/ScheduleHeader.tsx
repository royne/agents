import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ScheduleHeaderProps {
  currentDate: Date;
  viewMode: 'day' | 'week' | 'month';
  onPrevDay: () => void;
  onNextDay: () => void;
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  currentDate,
  viewMode,
  onPrevDay,
  onNextDay,
  onViewModeChange
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
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-2">
        <button 
          onClick={onPrevDay}
          className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          aria-label="Día anterior"
        >
          <FaChevronLeft />
        </button>
        <h2 className="text-xl font-bold text-theme-primary">
          {formatDate(currentDate)}
        </h2>
        <button 
          onClick={onNextDay}
          className="p-2 rounded-full bg-theme-component-hover hover:bg-primary-color hover:text-white transition-colors"
          aria-label="Día siguiente"
        >
          <FaChevronRight />
        </button>
      </div>
      <div className="flex space-x-1 bg-theme-component-hover rounded-md overflow-hidden">
        <button 
          onClick={() => onViewModeChange('day')}
          className={`px-3 py-1 text-sm ${viewMode === 'day' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
        >
          día
        </button>
        <button 
          onClick={() => onViewModeChange('week')}
          className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
        >
          semana
        </button>
        <button 
          onClick={() => onViewModeChange('month')}
          className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-primary-color text-white' : 'text-theme-secondary hover:text-theme-primary'}`}
        >
          mes
        </button>
      </div>
    </div>
  );
};

export default ScheduleHeader;

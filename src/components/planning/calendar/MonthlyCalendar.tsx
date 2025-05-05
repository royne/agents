import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';

interface MonthlyCalendarProps {
  events?: any[];
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Navegación entre meses
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Obtener información del mes actual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <CalendarHeader 
        month={month} 
        year={year} 
        onPrevMonth={prevMonth} 
        onNextMonth={nextMonth} 
      />
      <CalendarGrid 
        year={year} 
        month={month} 
        events={events} 
      />
    </div>
  );
};

export default MonthlyCalendar;

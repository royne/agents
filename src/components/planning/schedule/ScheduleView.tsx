import React, { useState } from 'react';
import ScheduleHeader from './ScheduleHeader';
import ScheduleGrid from './ScheduleGrid';
import { Event } from './ScheduleEvent';

interface Room {
  id: string;
  name: string;
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

  const handleViewModeChange = (mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
  };

  return (
    <div className="bg-theme-component p-6 rounded-lg shadow-md">
      <ScheduleHeader 
        currentDate={currentDate}
        viewMode={viewMode}
        onPrevDay={prevDay}
        onNextDay={nextDay}
        onViewModeChange={handleViewModeChange}
      />
      <ScheduleGrid 
        rooms={rooms}
        events={events}
        currentDate={currentDate}
        onAddEvent={onAddEvent}
      />
    </div>
  );
};

export default ScheduleView;

import React from 'react';

export interface Event {
  id: string;
  title: string;
  roomId: string;
  startTime: string; // formato "HH:mm"
  endTime: string; // formato "HH:mm"
  date: string; // formato "YYYY-MM-DD"
  color: string;
}

interface ScheduleEventProps {
  event: Event;
  duration: number;
}

const ScheduleEvent: React.FC<ScheduleEventProps> = ({ event, duration }) => {
  return (
    <div className={`${event.color} text-white p-2 h-full rounded-md text-xs overflow-hidden shadow-md dark:shadow-gray-900 font-medium`}>
      <div className="flex flex-col h-full">
        <div className="font-semibold mb-1">{event.title}</div>
        <div className="text-white text-opacity-80 text-[10px]">{event.startTime} - {event.endTime}</div>
      </div>
    </div>
  );
};

export default ScheduleEvent;

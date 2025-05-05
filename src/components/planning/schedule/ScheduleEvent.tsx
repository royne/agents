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
    <div className={`${event.color} text-white p-1 h-full rounded-sm text-xs overflow-hidden`}>
      {event.title}
    </div>
  );
};

export default ScheduleEvent;

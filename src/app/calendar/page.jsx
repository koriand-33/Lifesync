'use client';

import MyCalendar from '@/component/calendar/MyCalendar';

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendario personalizado 🗓️</h1>
      <MyCalendar />
    </div>
  );
}

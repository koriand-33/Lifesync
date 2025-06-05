import React, { useState } from 'react';

export default function MyCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleSelect = (day) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {today.toLocaleString('default', { month: 'long' })} {year}
      </h2>
      <div className="grid grid-cols-7 gap-2 text-center">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d) => (
          <div key={d} className="font-bold">{d}</div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDate?.getDate() === day;
          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className={`py-1 rounded-lg hover:bg-purple-200 ${
                isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <p className="mt-4 text-center text-sm text-gray-600">
          Seleccionaste: {selectedDate.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

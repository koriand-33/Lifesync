import React from 'react';
import { format } from 'date-fns';
import { CalendarDays, Clock, Star } from 'lucide-react';

const ModalDetalleEvento = ({ event, onClose }) => {
  const { title, start, end, color, extendedProps } = event;

  const formatDate = (date) =>
    format(new Date(date), "eeee dd MMMM yyyy, HH:mm");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-t-[6px]" style={{ borderColor: color || '#3b82f6' }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>

        <div className="space-y-3 text-gray-700 text-sm">
          <div className="flex items-start gap-2">
            <CalendarDays className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <p className="font-medium">Inicio:</p>
              <p>{formatDate(start)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-green-500 mt-1" />
            <div>
              <p className="font-medium">Fin:</p>
              <p>{formatDate(end)}</p>
            </div>
          </div>

          {extendedProps?.importancia && (
            <div className="flex items-start gap-2">
              <Star className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <p className="font-medium">Importancia:</p>
                <p>{extendedProps.importancia}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleEvento;

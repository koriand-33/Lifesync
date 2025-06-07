// components/ModalForm.js
import { useState, useEffect } from 'react';

const ModalForm = ({ date, event, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [start, setStart] = useState(event?.startStr || date);
  const [end, setEnd] = useState(event?.endStr || date);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      start,
      end,
      color: event?.backgroundColor || '#06b6d4',
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl mb-4">{event ? 'Editar evento' : 'Nuevo evento'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <div className="flex justify-between mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
            {event && (
              <button type="button" onClick={onDelete} className="bg-red-500 text-white px-4 py-2 rounded">
                Eliminar
              </button>
            )}
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;

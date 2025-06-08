'use client';
import { horas24 } from '@/utils/constants'; // crea este array o expórtalo

export default function EditTaskModal({
  task,
  onUpdate,
  onSave,
  onComplete,
  onDelete,
  onClose,
}) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md space-y-4 relative">
        <h2 className="text-xl font-semibold">Editar actividad</h2>

        <input
          type="text"
          value={task.titulo}
          onChange={e => onUpdate('titulo', e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          placeholder="Título de la actividad"
        />

        <select
          value={task.hora}
          onChange={e => onUpdate('hora', e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          {horas24.map(h => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <div className="flex justify-between mt-4 gap-2 flex-wrap">
          <button
            onClick={onSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            Guardar
          </button>

          {/* <button
            onClick={onComplete}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
          >
            Marcar como completada
          </button> */}

          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto"
          >
            Eliminar
          </button>

          <button
            onClick={onClose}
            className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 w-full sm:w-auto"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

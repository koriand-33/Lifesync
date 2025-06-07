// components/ModalForm.js
import { useState, useEffect } from 'react';
import { subirTarea } from '@/services/subirTarea';
import { eliminarTarea } from '@/services/eliminarTarea';
import { auth } from '../../../../conexion_BD/firebase';


const ModalForm = ({ date, event, onClose, onSave, onDelete, materias }) => {
  const [nuevaActividad, setNuevaActividad] = useState({
    titulo: event?.title || '',
    materia: event?.extendedProps?.materia || '',
    descripcion: event?.title?.replace(/^Tarea:\s*/, '') || '',
    fecha: event?.startStr?.split('T')[0] || date || '',
  });

  const handleInputNueva = (campo, valor) => {
    setNuevaActividad(prev => ({ ...prev, [campo]: valor }));
  };

const guardarNuevaActividad = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return alert("No hay usuario autenticado");

  const tarea = {
    titulo: nuevaActividad.titulo,
    descripcion: nuevaActividad.descripcion,
    materia: nuevaActividad.materia,
    fecha: nuevaActividad.fecha,
  };

  await subirTarea(userId, tarea);

  onSave?.(tarea); // si usas onSave para actualizar el frontend
  onClose();
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-md p-8 w-[90%] max-w-md">
        <div className='w-full flex justify-end'>
          {event && (
            <button
              onClick={async () => {
                const userId = auth.currentUser?.uid;
                if (!userId) return alert("No hay usuario autenticado");

                await eliminarTarea(userId, nuevaActividad.titulo);
                onDelete?.(); // para refrescar el frontend si lo necesitas
                onClose();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          )}
        </div>
        <h2 className="text-xl font-bold mb-4 flex justify-center items-center">{event ? 'Editar actividad' : 'Nueva actividad'}</h2>
        <p className='my-4'>Si es una tarea o evento ageno a tus materias registradas usa la Materia <span className='font-semibold'>"Evento"</span></p>

        <input
          type="text"
          value={nuevaActividad.titulo}
          onChange={e => handleInputNueva("titulo", e.target.value)}
          className="border rounded w-full px-3 py-2 mb-3"
          placeholder="Título"
        />

        <label className="text-sm font-medium mb-1 block">Materia</label>
        <select
          value={nuevaActividad.materia}
          onChange={e => handleInputNueva("materia", e.target.value)}
          className="border rounded w-full px-3 py-2 mb-3"
        >
          <option value="">Selecciona una materia</option>
          {Object.keys(materias).map(materia => (
            <option key={materia} value={materia}>
              {materia}
            </option>
          ))}
        </select>

        <textarea
          value={nuevaActividad.descripcion}
          onChange={e => handleInputNueva("descripcion", e.target.value)}
          className="border rounded w-full px-3 py-2 mb-3"
          placeholder="Descripción"
          rows={3}
        />

        <label className='text-sm font-medium'>Fecha</label>
        <input
          type="date"
          value={nuevaActividad.fecha}
          onChange={e => handleInputNueva("fecha", e.target.value)}
          className="border rounded w-full px-3 py-2 mt-1 mb-4"
        />

        <div className='flex gap-3 justify-between'>
          <button
            onClick={guardarNuevaActividad}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {event ? 'Guardar cambios' : 'Agregar'}
          </button>

          <button
            onClick={onClose}
            className="border-gray-400 border text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;

'use client';
import { format } from 'date-fns';
import { useState } from 'react';

export default function AddActivityModal({
  materias,
  nuevaActividad,
  onChange,
  onSave,
  onClose,
  event
}) {
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    
    if (!nuevaActividad.titulo?.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    
    if (!nuevaActividad.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    
    if (!nuevaActividad.duracion) {
      newErrors.duracion = 'La duración es requerida';
    } else if (isNaN(nuevaActividad.duracion) || nuevaActividad.duracion <= 0) {
      newErrors.duracion = 'Duración inválida';
    }
    
    if (!nuevaActividad.dificultad) {
      newErrors.dificultad = 'La dificultad es requerida';
    } else if (nuevaActividad.dificultad < 1 || nuevaActividad.dificultad > 10) {
      newErrors.dificultad = 'Debe ser entre 1 y 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateFields()) {
      onSave();
    }
  };

  const isSaveDisabled = !nuevaActividad.titulo?.trim() || 
                       !nuevaActividad.fecha || 
                       !nuevaActividad.duracion || 
                       !nuevaActividad.dificultad;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-md p-8 w-[90%] max-w-md">
        
        <h2 className="text-xl font-bold mb-4 flex justify-center items-center">
          {event ? 'Editar actividad' : 'Nueva actividad'}
        </h2>
        
        <p className='my-4'>
          Si es una tarea o evento ajeno a tus materias registradas usa la Materia 
          <span className='font-semibold'> "Evento"</span>
        </p>

        <label className="text-sm font-medium mb-1 block">Evento <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={nuevaActividad.titulo}
          onChange={e => onChange("titulo", e.target.value)}
          className={`border rounded w-full px-3 py-2 mb-1 ${errors.titulo ? 'border-red-500' : ''}`}
          placeholder="Título"
        />
        {errors.titulo && <p className="text-red-500 text-xs mb-2">{errors.titulo}</p>}

        <label className="text-sm font-medium mb-1 block">Materia</label>
        <select
          value={nuevaActividad.materia}
          onChange={e => onChange("materia", e.target.value)}
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
          onChange={e => onChange("descripcion", e.target.value)}
          className="border rounded w-full px-3 py-2 mb-3"
          placeholder="Descripción"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className='text-sm font-medium block'>Fecha <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={nuevaActividad.fecha || ''}
              onChange={e => onChange("fecha", e.target.value)}
              className={`border rounded w-full px-3 py-2 mt-1 ${errors.fecha ? 'border-red-500' : ''}`}
            />
            {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
          </div>
          
          <div>
            <label className='text-sm font-medium block'>Hora de entrega (opcional)</label>
            <input
              type="time"
              value={nuevaActividad.hora || ''}
              onChange={e => onChange("hora", e.target.value)}
              className="border rounded w-full px-3 py-2 mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Si no especificas hora, se usará 23:59</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className='text-sm font-medium block'>Duración (minutos) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              value={nuevaActividad.duracion || ''}
              onChange={e => onChange("duracion", e.target.value)}
              className={`border rounded w-full px-3 py-2 mt-1 ${errors.duracion ? 'border-red-500' : ''}`}
              placeholder="Ej. 60"
            />
            {errors.duracion && <p className="text-red-500 text-xs mt-1">{errors.duracion}</p>}
          </div>
          
          <div>
            <label className='text-sm font-medium block'>Dificultad (1-10) <span className="text-red-500">*</span></label>
            <select
              value={nuevaActividad.dificultad || ''}
              onChange={e => onChange("dificultad", e.target.value)}
              className={`border rounded w-full px-3 py-2 mt-1 ${errors.dificultad ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} {num === 10 && '(Máxima)'}
                </option>
              ))}
            </select>
            {errors.dificultad && <p className="text-red-500 text-xs mt-1">{errors.dificultad}</p>}
            <p className="text-xs text-gray-500 mt-1">10 = Mayor dificultad</p>
          </div>
        </div>

        <div className='flex gap-3 justify-between'>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${
              isSaveDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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
}
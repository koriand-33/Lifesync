import { useState, useEffect } from 'react';
import { subirTarea } from '@/services/subirTarea';
import { eliminarTarea } from '@/services/eliminarTarea';
import { auth } from '../../../../conexion_BD/firebase';
import { format } from 'date-fns';
import { XIcon } from 'lucide-react';

const ModalForm = ({ date, event, onClose, onSave, onDelete, materias }) => {

  useEffect(() => {
    console.log("Datos completos del evento:", event);
    console.log("Hora recibida:", event?.hora, "| Hora en extendedProps:", event?.extendedProps?.hora);
  }, [event]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // console.log("state recivido:", event?.extendedProps?.state );
  const esSoloLectura = event?.extendedProps?.state === true;
  // console.log("Es solo lectura:", esSoloLectura);
  
  const normalizeEventDate = (event) => {
    if (!event) return { date: '', time: '' };
    
    // Si tenemos startStr (formato ISO)
    if (event.startStr) {
      const [date, timePart] = event.startStr.split('T');
      const time = timePart ? timePart.substring(0, 5) : '';
      return { date, time };
    }
    
    // Si tenemos start (objeto Date)
    if (event.start) {
      const date = format(event.start, 'yyyy-MM-dd');
      const time = format(event.start, 'HH:mm');
      return { date, time };
    }
    
    return { date: '', time: '' };
  };

  const { date: eventDate, time: eventTime } = normalizeEventDate(event);

  const [nuevaActividad, setNuevaActividad] = useState({
    titulo: event?.title || '',
    materia: event?.extendedProps?.materia || '',
    descripcion: event?.extendedProps?.description || '',
    fecha: eventDate || date || '',
    hora: event?.hora || event?.extendedProps?.hora || '',
    allDay: event?.allDay || false,
    duracion: event?.extendedProps?.duracion || '', // Nuevo campo
    dificultad: event?.extendedProps?.dificultad || '' // Nuevo campo
  });

  const handleInputNueva = (campo, valor) => {
    setNuevaActividad(prev => ({ ...prev, [campo]: valor }));
  };

const guardarNuevaActividad = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return alert("No hay usuario autenticado");

  // Validación de campos requeridos
  if (!nuevaActividad.titulo.trim()) {
    return alert('El título es requerido');
  }

  if (!nuevaActividad.fecha) {
    return alert('La fecha es requerida');
  }

  if (!nuevaActividad.duracion) {
    return alert('La duración estimada es requerida');
  }

  if (!nuevaActividad.dificultad) {
    return alert('La dificultad es requerida');
  }

  // Validación de valores numéricos
  if (isNaN(nuevaActividad.duracion) || parseInt(nuevaActividad.duracion) <= 0) {
    return alert('La duración debe ser un número positivo');
  }

  if (isNaN(nuevaActividad.dificultad) || 
      parseInt(nuevaActividad.dificultad) < 1 || 
      parseInt(nuevaActividad.dificultad) > 10) {
    return alert('La dificultad debe estar entre 1 y 10');
  }

  // Si no hay hora especificada, usar 23:59 como default
  const horaEntrega = nuevaActividad.hora || '23:59';
  
  const tarea = {
    titulo: nuevaActividad.titulo,
    descripcion: nuevaActividad.descripcion,
    materia: nuevaActividad.materia || 'Evento',
    fecha: nuevaActividad.fecha,
    hora: horaEntrega, 
    fechaCompleta: `${nuevaActividad.fecha}T${horaEntrega}:00`,
    duracion: parseInt(nuevaActividad.duracion), 
    dificultad: parseInt(nuevaActividad.dificultad) 
  };

  await subirTarea(userId, tarea);
  onSave?.(tarea);
  onClose();
};

const completarActividad = async () => {
const userId = auth.currentUser?.uid;
  if (!userId) return alert("No hay usuario autenticado");

  // Validación de campos requeridos
  if (!nuevaActividad.titulo.trim()) {
    return alert('El título es requerido');
  }

  if (!nuevaActividad.fecha) {
    return alert('La fecha es requerida');
  }

  if (!nuevaActividad.duracion) {
    return alert('La duración estimada es requerida');
  }

  if (!nuevaActividad.dificultad) {
    return alert('La dificultad es requerida');
  }

  // Validación de valores numéricos
  if (isNaN(nuevaActividad.duracion) || parseInt(nuevaActividad.duracion) <= 0) {
    return alert('La duración debe ser un número positivo');
  }

  if (isNaN(nuevaActividad.dificultad) || 
      parseInt(nuevaActividad.dificultad) < 1 || 
      parseInt(nuevaActividad.dificultad) > 10) {
    return alert('La dificultad debe estar entre 1 y 10');
  }

  // Si no hay hora especificada, usar 23:59 como default
  const horaEntrega = nuevaActividad.hora || '23:59';
  
  const tarea = {
    titulo: nuevaActividad.titulo,
    descripcion: nuevaActividad.descripcion,
    materia: nuevaActividad.materia || 'Evento',
    fecha: nuevaActividad.fecha,
    hora: horaEntrega, 
    fechaCompleta: `${nuevaActividad.fecha}T${horaEntrega}:00`,
    duracion: parseInt(nuevaActividad.duracion), 
    dificultad: parseInt(nuevaActividad.dificultad),
    state: true
  };

  console.log("Tarea a completar:", tarea);

  await subirTarea(userId, tarea);
  onSave?.(tarea);
  onClose();
}



  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
      onClick={onClose} 
    >
      <div 
        className="bg-white rounded-xl shadow-md p-8 w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()} 
      >
{/* Botones de Eliminar y cerrar */}
        <div className='flex '>
          {/* Boton de eliminar */}
          <div className='w-full flex justify-start'>
            {!esSoloLectura && (
              <button
                onClick={async () => {
                  const userId = auth.currentUser?.uid;
                  if (!userId) return alert("No hay usuario autenticado");

                  await eliminarTarea(userId, event.title); 
                  onDelete?.();
                  onClose();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            )}
          </div>

          {/* Boton de cerrar */}
          <div className=' w-full flex justify-end'>
            <button
              onClick={onClose}
              className="mr-5text-xl font-bold"
              aria-label="Cerrar modal"
            >
              <XIcon className="w-6 h-6  text-black hover:text-gray-500" />
            </button>
          </div>
        </div>


{/* titulo y forms */}
        <h2 className="text-xl font-bold mb-4 flex justify-center items-center">
          {event ? 'Editar actividad' : 'Nueva actividad'}
        </h2>
        <p className='my-4'>
          Si es una tarea o evento ajeno a tus materias registradas usa la Materia 
          <span className='font-semibold'> "Evento"</span>
        </p>

        <label className="text-sm font-medium mb-1 block">Evento</label>
        <input
          type="text"
          value={nuevaActividad.titulo}
          onChange={e => handleInputNueva("titulo", e.target.value)}
          className="border rounded w-full px-3 py-2 mb-3"
          placeholder="Título"
          readOnly={esSoloLectura}
        />

        <label className="text-sm font-medium mb-1 block">Materia</label>
        <select
          value={nuevaActividad.materia}
          onChange={e => handleInputNueva("materia", e.target.value)}
          className="border rounded w-full px-3 py-2 mb-3"
          disabled={esSoloLectura}
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
          readOnly={esSoloLectura}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className='text-sm font-medium block'>Fecha</label>
            <input
              type="date"
              value={nuevaActividad.fecha}
              onChange={e => handleInputNueva("fecha", e.target.value)}
              className="border rounded w-full px-3 py-2 mt-1"
              readOnly={esSoloLectura}
            />
          </div>
          
          <div>
            <label className='text-sm font-medium block'>Hora de entrega (opcional)</label>
            <input
              type="time"
              value={nuevaActividad.hora}
              onChange={e => handleInputNueva("hora", e.target.value)}
              className="border rounded w-full px-3 py-2 mt-1"
              readOnly={esSoloLectura}
            />
            <p className="text-xs text-gray-500 mt-1">Si no especificas hora, se usará 23:59</p>
          </div>
        </div>

        {/* Nuevos campos añadidos aquí */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className='text-sm font-medium block'>Duración (minutos)</label>
            <input
              type="number"
              min="1"
              value={nuevaActividad.duracion}
              onChange={e => handleInputNueva("duracion", e.target.value)}
              className="border rounded w-full px-3 py-2 mt-1"
              placeholder="Ej. 60"
              readOnly={esSoloLectura}
            />
          </div>
          
          <div>
            <label className='text-sm font-medium block'>Dificultad (1-10)</label>
            <select
              value={nuevaActividad.dificultad}
              onChange={e => handleInputNueva("dificultad", e.target.value)}
              className="border rounded w-full px-3 py-2 mt-1"
              disabled={esSoloLectura}
            >
              <option value="">Seleccionar</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} {num === 10 && '(Máxima)'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">10 = Mayor dificultad</p>
          </div>
        </div>

        {esSoloLectura ? (
          <div className="text-center mt-4">
            <span className="text-green-700 font-semibold">✓ Actividad completada</span>
          </div>
        ) : (
        <div className='flex gap-3 justify-between'>
          <button
            onClick={guardarNuevaActividad}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {event ? 'Guardar cambios' : 'Agregar'}
          </button>

          {event &&(
            <button
              onClick={completarActividad}
              className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
            >
              Completado
            </button>
          )}

          <button
            onClick={onClose}
            className="border-gray-400 border text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
        )}

      </div>
    </div>
  );
};

export default ModalForm;
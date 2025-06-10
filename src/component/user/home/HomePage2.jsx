'use client';
import { useState } from 'react';
import { useDatosUsuario } from '@/hooks/home/useDatosUsuario';
import { useHorarioOrganizado } from './useHorarioOrganizado';
import Loading from '@/component/loading/loading';
import HourSlot from './HourSlot';
import ActivityCard from './ActivityCard';
import AddActivityModal from './AddActivityModal';
import EditTaskModal from './EditTaskModal';
import { subirTarea } from '@/services/subirTarea';
import { eliminarTarea } from '@/services/eliminarTarea';
import { auth } from '../../../../conexion_BD/firebase';
import { format } from 'date-fns';

export default function HomePage() {
  const { proximas, setProximas, horario, materias, cargando } = useDatosUsuario();
  const horarioHoy = useHorarioOrganizado(horario, proximas);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [nuevaActividad, setNuevaActividad] = useState({
    titulo: '',
    descripcion: '',
    materia: '',
    fecha: '',
    hora: '',
    duracion: '',
    dificultad: ''
  });

  const onNuevaChange = (campo, valor) => setNuevaActividad(prev => ({ ...prev, [campo]: valor }));

  const guardarNuevaActividad = async () => {
    if (!nuevaActividad.titulo || !nuevaActividad.fecha) return alert('Título y fecha requeridos');
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const hora = nuevaActividad.hora || '23:59';
      const tarea = {
        ...nuevaActividad,
        materia: nuevaActividad.materia || 'Evento',
        hora,
        fechaCompleta: `${nuevaActividad.fecha}T${hora}:00`,
        duracion: nuevaActividad.duracion ? parseInt(nuevaActividad.duracion) : null, // Convertir a número
        dificultad: nuevaActividad.dificultad ? parseInt(nuevaActividad.dificultad) : null // Convertir a número
      };
      
      await subirTarea(userId, tarea);
      setProximas(prev => [{ ...tarea, id: Date.now() }, ...prev]);
      setNuevaActividad({ 
        titulo: '', 
        descripcion: '', 
        materia: '', 
        fecha: '', 
        hora: '', 
        duracion: '', 
        dificultad: '' 
      });
      setAddModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Error al guardar actividad');
    }
  };

  const eliminarTask = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await eliminarTarea(userId, selectedTask.titulo);
    setProximas(prev => prev.filter(t => t.id !== selectedTask.id));
  };

  const marcarActividadComoCompletada = async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return alert("No hay usuario autenticado");

    const actividad = proximas.find(a => a.id === id);
    if (!actividad) return;

    const tareaActualizada = {
      ...actividad,
      state: true,
      // fechaCompleta: `${actividad.fecha}T${actividad.hora || '23:59'}:00`,
    };

    try {
      await subirTarea(userId, tareaActualizada);

      // Actualizar en el frontend
      setProximas(prev =>
        prev.map(t => t.id === id ? { ...t, state: true } : t)
      );
    } catch (e) {
      console.error('Error al marcar como completada:', e);
      alert('Hubo un error al actualizar la actividad');
    }
  };


  if (cargando) return <Loading />;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mt-5 text-gray-800 mb-10">Hoy</h1>

      <div className="relative flex items-start gap-6 overflow-x-auto pt-5 border-b border-gray-300">
        {horarioHoy.map(slot => (
          <HourSlot key={slot.hora} hora={slot.hora} actividades={slot.actividades} onClick={setSelectedTask} />
        ))}
        <img src="/calendario.png" alt="Calendario" className="w-20 h-20 ml-6" />
      </div>

      <div className="flex justify-center my-8">
        <button onClick={() => setAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
          + Agregar actividad próxima
        </button>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Tareas o actividades próximas</h2>
        <div className="space-y-4">
          {proximas.map(a => (
            // <ActivityCard key={a.id} actividad={a} onMarcarCompletada={(id) => setProximas(p => p.map(t => t.id === id ? { ...t} : t))} />
            <ActivityCard
              key={a.id}
              actividad={a}
              onMarcarCompletada={marcarActividadComoCompletada}
            />
          ))}
        </div>
      </section>

      {addModalOpen && (
        <AddActivityModal
          materias={materias}
          nuevaActividad={nuevaActividad}
          onChange={onNuevaChange}
          onSave={guardarNuevaActividad}
          onClose={() => setAddModalOpen(false)}
        />
      )}

      {editModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onUpdate={(campo, valor) => setSelectedTask(p => ({ ...p, [campo]: valor }))}
          onSave={() => setEditModalOpen(false)}
          onComplete={() => setEditModalOpen(false)}
          onDelete={() => {
            eliminarTask();
            setEditModalOpen(false);
          }}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
}

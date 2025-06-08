'use client';

import { useState,useEffect  } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../conexion_BD/firebase';
import { bajarTareas } from '@/services/bajarTareas';
import { subirTarea } from '@/services/subirTarea';
import { eliminarTarea } from '@/services/eliminarTarea';
import { Timestamp } from 'firebase/firestore';
import Loading from '@/component/loading/loading';
import { bajarHorario } from '@/services/bajarHorario';
import ModalForm from '../calendar/ModalForm';

const horas24 = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return `${h}:00`;
});


function ActividadDesplegable({ actividad, onMarcarCompletada }) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();

  const irACalendario = () => {
    router.push("/calendario");
  };

  return (
    <div className={`rounded-lg p-4 space-y-4 border ${actividad.completada ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
      <div>
        <p className="font-bold text-lg">
          {actividad.titulo} {actividad.completada && "✅"}
        </p>
        <p className="text-sm text-gray-700">{actividad.descripcion}</p>
      </div>
      <button
        className="text-blue-600 text-sm underline"
        onClick={() => setAbierto(prev => !prev)}
      >
        {abierto ? 'Ocultar detalles' : 'Mostrar más'}
      </button>

      {abierto && (
        <div className="space-y-3 text-sm">
          {actividad.materia && <p><strong>Materia:</strong> {actividad.materia}</p>}
          <p><strong>Fecha:</strong> {actividad.fecha}</p>
          {!actividad.completada && (
            <div className="flex gap-3">
              <button
                onClick={() => onMarcarCompletada(actividad.id)}
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              >
                Marcar como completada
              </button>
              <button
                onClick={irACalendario}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Ir al calendario
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [proximas, setProximas] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [horarioExistente, setHorarioExistente] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({
    titulo: "",
    descripcion: "",
    materia: "",
    fecha: ""
  });

  useEffect(() => {
    const fetchTareas = async () => 
    {
      setCargando(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setCargando(false);
          return;
        }

        // Obtener tareas
        const tareas = await bajarTareas(userId);
        const tareasConId = tareas.map((tarea, index) => ({
          ...tarea,
          id: index + 1,
          hora: '08:00', 
          completada: false,
        }));
        setProximas(tareasConId);

        // Obtener horario
        const horario = await bajarHorario(userId);
        console.log("Horario obtenido:", horario);
        
        const isObjectEmpty = (obj) => {
          return Object.values(obj).every(
            value => typeof value === 'object' && value !== null 
              ? Object.keys(value).length === 0 
              : !value
          );
        };

        if (horario && !isObjectEmpty(horario)) {
          const horarioClonado = JSON.parse(JSON.stringify(horario)); 
          const extras = horarioClonado.extras;

          for (const dia in extras) {
            const nuevasActividades = [];

            extras[dia].forEach((actividad) => {
              if (
                actividad.actividad === "Dormirse" &&
                actividad.inicio > actividad.fin
              ) {
                nuevasActividades.push(
                  {
                    actividad: "Dormirse",
                    inicio: actividad.inicio,
                    fin: "23:59",
                  },
                  {
                    actividad: "Despertarse",
                    inicio: "00:00",
                    fin: actividad.fin,
                  }
                );
              } else {
                nuevasActividades.push(actividad);
              }
            });

            extras[dia] = nuevasActividades;
          }

          setHorarioExistente(horarioClonado);
        } else {
          setHorarioExistente(null);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchTareas();
  }, []);


  const handleInputNueva = (campo, valor) => {
    setNuevaActividad(prev => ({ ...prev, [campo]: valor }));
  };

  const guardarNuevaActividad = async () => {
    if (!nuevaActividad.titulo || !nuevaActividad.fecha) {
      alert("Título y fecha requeridos");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const tarea = {
      titulo: nuevaActividad.titulo,
      descripcion: nuevaActividad.descripcion,
      materia: nuevaActividad.materia === "0" ? "Evento único" : nuevaActividad.materia,
      fecha: nuevaActividad.fecha,
    };

    await subirTarea(userId, tarea);

    setProximas(prev => [
      {
        ...tarea,
        id: Date.now(),
        completada: false,
        hora: '08:00',
      },
      ...prev
    ]);

    setNuevaActividad({ titulo: "", descripcion: "", materia: "", fecha: "" });
    setShowAddModal(false);
  };


  const abrirEditor = (actividad) => {
    setSelectedTask({ ...actividad });
    setShowModal(true);
  };

  const actualizarTarea = (campo, valor) => {
    setSelectedTask(prev => ({ ...prev, [campo]: valor }));
  };

  const guardarCambios = () => {
    setTasks(prev =>
      prev.map(t =>
        t.id === selectedTask.id ? selectedTask : t
      )
    );
    setShowModal(false);
  };

  const eliminarTareaFirebase = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await eliminarTarea(userId, selectedTask.titulo);
    setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    setProximas(prev => prev.filter(t => t.id !== selectedTask.id));
    setShowModal(false);
  };


  const marcarComoCompletada = () => {
    setTasks(prev =>
      prev.map(t =>
        t.id === selectedTask.id ? { ...t, completada: true } : t
      )
    );
    setShowModal(false);
  };

  const marcarActividadProxima = (id) => {
    setProximas(prev =>
      prev.map(act =>
        act.id === id ? { ...act, completada: true } : act
      )
    );
  };

  if (cargando) { return <Loading />; }

  return (
    <div className='w-full'>
      <h1 className='text-3xl font-bold mt-5 text-gray-800 mb-10'>Hoy</h1>

      <div className="relative flex items-start gap-6 overflow-x-auto pb-16 border-b border-gray-300">
        {horas24.map((hora, index) => {
          const actividad = tasks.find(a => a.hora === hora);
          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-3 min-w-[80px] relative cursor-pointer select-none ${actividad ? 'hover:bg-gray-200 rounded-lg' : ''}`}
              onClick={() => actividad && abrirEditor(actividad)}
              title={actividad ? actividad.titulo : ''}
            >
              <div className="text-lg font-semibold bg-gray-700 text-white rounded-full px-3 py-2">
                {hora}
              </div>
              <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${
                actividad ? (actividad.completada ? 'bg-green-400' : 'bg-blue-400') : 'bg-gray-300'
              }`}>
                {actividad?.completada ? "✅" : ""}
              </div>
              {actividad && (
                <div className="absolute top-24 w-28 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm text-center shadow-lg whitespace-normal">
                  {actividad.titulo}
                </div>
              )}
            </div>
          );
        })}
        <img src="/calendario.png" alt="Calendario" className="w-20 h-20 ml-6" />
      </div>

      <div className='flex justify-center my-8'>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        >
          + Agregar actividad próxima
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-md p-8 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva actividad próxima</h2>
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
              <option value="Visión Artificial">Visión Artificial</option>
              <option value="Procesamiento de Señales">Procesamiento de Señales</option>
              <option value="Algoritmos Bioinspirados">Algoritmos Bioinspirados</option>
              <option value="Aprendizaje Máquina">Aprendizaje Máquina</option>
              <option value="Teoría de la Computación">Teoría de la Computación</option>
              <option value="Tecnologías de Lenguaje Natural">Tecnologías de Lenguaje Natural</option>
              <option value="0">Evento único</option>
            </select>
            <textarea
              value={nuevaActividad.descripcion}
              onChange={e => handleInputNueva("descripcion", e.target.value)}
              className="border rounded w-full px-3 py-2 mb-3"
              placeholder="Descripción"
              rows={3}
            />
            <label className='text-sm font-medium'>Fecha de entrega</label>
            <input
              type="date"
              value={nuevaActividad.fecha}
              onChange={e => handleInputNueva("fecha", e.target.value)}
              className="border rounded w-full px-3 py-2 mt-1 mb-4"
            />
            <div className='flex gap-3'>
              <button
                onClick={guardarNuevaActividad}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="border-gray-400 border text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Tareas o actividades próximas</h2>
        <div className="space-y-4">
          {proximas.map(actividad => (
            <ActividadDesplegable
              key={actividad.id}
              actividad={actividad}
              onMarcarCompletada={marcarActividadProxima}
            />
          ))}
        </div>
      </div>

      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md space-y-4 relative">
            <h2 className="text-xl font-semibold">Editar actividad</h2>
            <input
              type="text"
              value={selectedTask.titulo}
              onChange={e => actualizarTarea('titulo', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder="Título de la actividad"
            />
            <select
              value={selectedTask.hora}
              onChange={e => actualizarTarea('hora', e.target.value)}
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
                onClick={guardarCambios}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
              >
                Guardar
              </button>
              <button
                onClick={marcarComoCompletada}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
              >
                Marcar como completada
              </button>
              <button
                onClick={eliminarTareaFirebase}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 w-full sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

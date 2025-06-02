'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const horas24 = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return `${h}:00`;
});

const actividadesIniciales = [
  { id: 1, titulo: "Reunión equipo", hora: "08:00", completada: false },
  { id: 2, titulo: "Revisión de código", hora: "11:00", completada: false },
  { id: 3, titulo: "Almuerzo", hora: "13:00", completada: false },
  { id: 4, titulo: "Llamada cliente", hora: "16:00", completada: false },
  { id: 5, titulo: "Reporte diario", hora: "20:00", completada: false },
];

const actividadesProximasIniciales = [
  {
    id: 101,
    titulo: "Entrega de proyecto",
    materia: "Algoritmos Bioinspirados",
    descripcion: "Finalizar y subir el proyecto final antes del viernes.",
    fecha: "2025-06-07",
    completada: false
  },
  {
    id: 102,
    titulo: "Examen parcial",
    materia: "Procesamiento de Señales",
    descripcion: "Estudiar temas 1 al 4. El examen es el lunes.",
    fecha: "2025-06-10",
    completada: false
  },
  {
    id: 103,
    titulo: "Preparar presentación",
    materia: "Visión Artificial",
    descripcion: "Revisar los papers y preparar diapositivas.",
    fecha: "2025-06-05",
    completada: false
  }
];

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
          <p><strong>Materia:</strong> {actividad.materia}</p>
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
  const [tasks, setTasks] = useState(actividadesIniciales);
  const [proximas, setProximas] = useState(actividadesProximasIniciales);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const eliminarTarea = () => {
    setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
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

  return (
    <div>
      <h1 className='text-3xl font-bold mt-5 text-gray-800 mb-10'>Hoy</h1>

      {/* Línea de tiempo */}
      <div className="relative flex items-start gap-6 overflow-x-auto pb-16 border-b border-gray-300">
        {horas24.map((hora, index) => {
          const actividad = tasks.find(a => a.hora === hora);
          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-3 min-w-[80px] relative cursor-pointer select-none ${
                actividad ? 'hover:bg-gray-200 rounded-lg' : ''
              }`}
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

      {/* Actividades próximas */}
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

      {/* Modal */}
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
                onClick={eliminarTarea}
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

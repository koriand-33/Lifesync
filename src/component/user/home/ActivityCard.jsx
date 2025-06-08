'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivityCard({ actividad, onMarcarCompletada }) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();

  const irACalendario = () => router.push('/user/calendario');

  return (
    <div
      className={`rounded-lg p-4 space-y-4 border
        ${actividad.completada ? 'bg-green-100 border-green-300'
                               : 'bg-gray-100 border-gray-300'}`}
    >
      <div>
        <p className="font-bold text-lg">
          {actividad.titulo} {actividad.completada && '✅'}
        </p>
        <p className="text-sm text-gray-700">{actividad.descripcion}</p>
      </div>

      <button
        className="text-blue-600 text-sm underline"
        onClick={() => setAbierto(!abierto)}
      >
        {abierto ? 'Ocultar detalles' : 'Mostrar más'}
      </button>

      {abierto && (
        <div className="space-y-3 text-sm">
          {actividad.materia && (
            <p>
              <strong>Materia:</strong> {actividad.materia}
            </p>
          )}
          <p>
            <strong>Fecha:</strong> {actividad.fecha}
          </p>

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

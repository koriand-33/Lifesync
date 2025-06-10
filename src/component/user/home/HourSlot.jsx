'use client';
import React, { useState } from 'react';

export default function HourSlot({
  hora,
  actividades = [],
}) {
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  // console.log('Actividades en HourSlot:', actividades);

  const getActivityStyles = (actividad) => {
    const baseStyles =
      'w-full rounded-lg flex items-center p-1 cursor-pointer transition-transform hover:scale-[1.02] overflow-hidden';

    if (actividad.completada) {
      return baseStyles + ' bg-green-100 border-l-4 border-green-500';
    }

    const typeStyles = {
      clase: 'bg-blue-100 border-l-4 border-blue-500',
      extra: 'bg-purple-100 border-l-4 border-purple-500',
      tarea: 'bg-yellow-100 border-l-4 border-yellow-500',
    };

    return baseStyles + (typeStyles[actividad.tipo] || ' bg-gray-100 border-l-4 border-gray-300');
  };

  const getIcon = (actividad) => {
    const icons = {
      clase: '📚',
      extra: '⚽',
      tarea: '📝',
      default: '○',
    };

    return actividad.state ? '✅' : (icons[actividad.tipo] || icons.default);
  };

  const displayHora = hora.split(':')[0] + ':00';

  // console.log('estado del hour slot', actividadSeleccionada.state);

  return (
    <div className="flex flex-col items-center gap-2 relative group w-full max-w-xs">
      {/* Hora */}
      <div className="text-sm font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1">
        {displayHora}
      </div>

      {/* Lista de actividades */}
      <div className="w-full max-h-[160px] space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {actividades.length > 0 ? (
          actividades.map((actividad, index) => (
            <div
              key={`${hora}-${actividad.tipo}-${index}`}
              className={getActivityStyles(actividad)}
              onClick={() => setActividadSeleccionada(actividad)}
              title={`${actividad.tipo}: ${actividad.titulo}\n${actividad.descripcion || 'Sin descripción'}\nHora: ${actividad.horaInicio || '--'} a ${actividad.horaFin || '--'}`}
            >
              <span className="text-lg mr-1">{getIcon(actividad)}</span>
              <span className="text-xs font-medium truncate">
                {actividad.titulo}
              </span>
            </div>
          ))
        ) : (
          <div className="w-full h-[100px] rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
            Sin actividades
          </div>
        )}
      </div>

      {/* Indicador de cantidad */}
      {actividades.length > 1 && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {actividades.length}
        </div>
      )}

      {/* Modal */}
      {actividadSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl relative animate-fade-in">
            <button
              onClick={() => setActividadSeleccionada(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              {getIcon(actividadSeleccionada)} {actividadSeleccionada.titulo}
            </h2>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Tipo:</strong> {actividadSeleccionada.tipo}
              </p>
              
              {actividadSeleccionada.materia && (
                <p className="text-sm text-gray-700">
                  <strong>Materia:</strong> {actividadSeleccionada.materia}
                </p>
              )}

              {actividadSeleccionada.tipo === 'tarea' && (
                <>
                  {actividadSeleccionada.fecha && (
                    <p className="text-sm text-gray-700">
                      <strong>Fecha entrega:</strong> {new Date(actividadSeleccionada.fecha).toLocaleDateString()}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-700">
                    <strong>Hora entrega:</strong> {actividadSeleccionada.hora || '23:59'}
                  </p>
                </>
              )}

              {actividadSeleccionada.duracion && (
                <p className="text-sm text-gray-700">
                  <strong>Duración estimada:</strong> {actividadSeleccionada.duracion} minutos
                </p>
              )}

              {actividadSeleccionada.dificultad && (
                <p className="text-sm text-gray-700">
                  <strong>Dificultad:</strong> 
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    actividadSeleccionada.dificultad >= 9 ? 'bg-red-100 text-red-800' :
                    actividadSeleccionada.dificultad >= 7 ? 'bg-orange-100 text-orange-800' :
                    actividadSeleccionada.dificultad >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {actividadSeleccionada.dificultad}/10
                  </span>
                </p>
              )}

              <p className="text-sm text-gray-700">
                <strong>Descripción:</strong> {actividadSeleccionada.descripcion || 'Sin descripción'}
              </p>

              <p className="text-sm text-gray-700"><strong>state:</strong>  {actividadSeleccionada.state}</p>
              {actividadSeleccionada.state !== undefined && (
                <p className={`text-sm font-medium ${
                  actividadSeleccionada.state ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {actividadSeleccionada.state ? '✅ Tarea completada' : '🟡 Pendiente'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

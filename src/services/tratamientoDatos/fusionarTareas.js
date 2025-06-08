/**
 * Devuelve una lista fusionada de tareas, priorizando las que tienen "done" con contenido.
 * @param {Array<Object>} tareasApi - Tareas obtenidas desde API.
 * @param {Array<Object>} tareasNormales - Tareas normales del usuario.
 * @returns {Array<Object>} Lista fusionada y deduplicada.
 */
export function fusionarTareas(tareasApi, tareasNormales) {
  const esDoneValido = (done) => {
    if (!done || typeof done !== 'object') return false;
    return Object.keys(done).length > 0;
  };

  const mapa = new Map();

  // Insertar tareas normales
  tareasNormales.forEach((tarea) => {
    mapa.set(tarea.titulo, tarea);
  });

  // Insertar o reemplazar con tareas API
  tareasApi.forEach((tareaApi) => {
    const existente = mapa.get(tareaApi.titulo);
    const tieneDone = esDoneValido(tareaApi.done);

    if (!existente) {
      mapa.set(tareaApi.titulo, tareaApi);
    } else {
      const existenteTieneDone = esDoneValido(existente.done);
      if (tieneDone && !existenteTieneDone) {
        mapa.set(tareaApi.titulo, tareaApi);
      }
    }
  });

  return Array.from(mapa.values());
}

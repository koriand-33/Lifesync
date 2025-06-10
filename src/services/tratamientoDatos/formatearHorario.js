function convertirFechaAFirebase(fechaString) {
  const fecha = new Date(fechaString);
  const seconds = Math.floor(fecha.getTime() / 1000);
  return { seconds, nanoseconds: 0 };
}

/**
 * Toma la entrada enviada a la API (datosEnviados) y la respuesta de la API (respuestaAPI)
 * y genera un objeto JSON en el formato esperado por el sistema.
 *
 * @param {Object} datosEnviados - Datos originales enviados a la API (incluye clases, extras, materias, etc.)
 * @param {Object} respuestaAPI - Respuesta de la API (incluye horarios_materias, colores, nombres)
 * @returns {Object} Objeto JSON con el formato unificado.
 */
export function generarFormatoFinal(datosEnviados, respuestaAPI, tareas = []) {
  console.log("Datos enviados a la API:", datosEnviados);
  console.log("Respuesta de la API:", respuestaAPI);
  console.log("Tareas locales:", tareas);

  const { materias, clases, extras, tiempo_fines } = datosEnviados;
  const { horarios_materias, colores, nombres, horarios_tareas  } = respuestaAPI;
  const tareasApi = horarios_tareas?.["Tareas Generales"] || [];
  const materiasFormateadas = {};

  // Unificar colores e importancia desde colores o materias
  for (const materia in materias) {
    materiasFormateadas[materia] = {
      color: materias[materia]?.color || colores?.[materia] || '#cccccc',
      importancia: materias[materia]?.prioridad ?? null,
    };
  }

  console.log("Respuesta completa de la API:", respuestaAPI);

  // Fusionar tareas locales con los "done" de la API
  const tareasConDone = {};

  for (const tarea of tareasApi || []) {

    const tareaLocal = tareas.find(t =>
      t.titulo?.trim().toLowerCase() === tarea.descripcion?.trim().toLowerCase()
    );

    if (!tareaLocal) {
      console.warn("No se encontró coincidencia para:", tarea.descripcion);
      continue;
    }

    const materiaColor = materiasFormateadas[tareaLocal.materia]?.color;

    tareasConDone[tareaLocal.titulo] = {
      ...tareaLocal,
      descripcion: tareaLocal.descripcion,
      duracion: tarea.tiempoDuracion,
      fecha: convertirFechaAFirebase(tareaLocal.fecha),
      fechaCompleta: convertirFechaAFirebase(tareaLocal.fechaCompleta),
      done: tarea.done,
      state: tareaLocal.state || false,
      color: materiaColor || '#cccccc'
    };
  }

    return {
        horario: {
        materias: materiasFormateadas,
        clases: clases,
        extras: extras,
        tiempo_fines: tiempo_fines || {},
        horarios_materias: horarios_materias || {},
        },
        tareas: tareasConDone,
    };
}

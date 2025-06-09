// services/HorarioAPI.js

import { bajarHorario } from './bajarHorario';
import { bajarTareasFiltradas } from './bajarTareasFiltradas';
import { subirHorarioCompleto } from './subirHorarioAPI';
import { generarFormatoFinal } from './tratamientoDatos/formatearHorario';
/**
 * Descarga tareas filtradas y horario, los prepara, los envía a la API de predicción,
 * y luego guarda el horario generado.
 * 
 * @param {string} uid - UID del usuario autenticado
 * @returns {Object} - { datosEnviados, respuestaAPI }
 */
export const procesarHorarioYEnviarAPI = async (uid) => {
  const API_URL = process.env.NEXT_PUBLIC_URL_API_PYTHON;

  try {
    // Descargar datos necesarios
    const [tareas, horario] = await Promise.all([
        bajarTareasFiltradas(uid),
        bajarHorario(uid),
    ]);

    // Preparar datos para API
    const datosParaAPI = {
      tareas: {},
      materias: {},
      clases: horario.clases,
      extras: horario.extras,
      tiempo_fines: horario.tiempo_fines || {}
    };

    tareas.forEach(tarea => {
      if (!datosParaAPI.tareas[tarea.materia]) {
        datosParaAPI.tareas[tarea.materia] = [];
      }
      datosParaAPI.tareas[tarea.materia].push({
        descripcion: tarea.titulo,
        tiempoDuracion: tarea.duracion || 60,
        fechaEntrega: tarea.fecha
      });
    });

    Object.keys(horario.materias).forEach(materia => {
      datosParaAPI.materias[materia] = {
        prioridad: horario.materias[materia].importancia || 1,
        color: horario.materias[materia].color || '#FFFFFF',
      };
    });

    // Enviar a la API externa
    const response = await fetch(`${API_URL}/predecir`, {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosParaAPI)
    });

    if (!response.ok) {
      let errorMsg = `Error en la API: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData.message || JSON.stringify(errorData)}`;
      } catch {
        errorMsg += ` - ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    const formatoFinal = generarFormatoFinal(datosParaAPI, data, tareas);

    await subirHorarioCompleto(uid, datosParaAPI, formatoFinal);

    return {
      datosEnviados: datosParaAPI,
      respuestaAPI: data
    };
  } catch (error) {
    console.error("Error en procesarHorarioYEnviarAPI:", error);
    throw error;
  }
};

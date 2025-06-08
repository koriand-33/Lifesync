import { bajarTareas } from "./bajarTareas";

/**
 * Devuelve un array de tareas filtradas (desde hoy y que no estén hechas).
 * @param {string} userId
 * @returns {Promise<Array<{
 *   titulo: string,
 *   descripcion: string,
 *   fecha: string,
 *   materia: string,
 *   hora: string,
 *   fechaCompleta: string,
 *   duracion: number | null,
 *   dificultad: number | null,
 *   done: boolean
 * }>>}
 */
export const bajarTareasFiltradas = async (userId) => {
  const todasLasTareas = await bajarTareas(userId);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normaliza a inicio del día

  const tareasFiltradas = todasLasTareas.filter(tarea => {
    const fechaTarea = new Date(tarea.fechaCompleta);
    fechaTarea.setHours(0, 0, 0, 0); // Normaliza también
    return fechaTarea >= hoy && tarea.done === false;
  });

  return tareasFiltradas;
};

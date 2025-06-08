import { doc, getDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Devuelve un array de tareas del usuario.
 * @param {string} userId
 * @returns {Promise<Array<{
 *   titulo: string,
 *   descripcion: string,
 *   fecha: string,
 *   materia: string,
 *   hora: string,
 *   fechaCompleta: string,
 *   duracion: number | null,
 *   dificultad: number | null
 *   done: boolean
 * }>>}
 */
export const bajarTareasAPI = async (userId) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return [];

    const data = docSnap.data();
    const tareasRaw = data.tareasApi || {};
    // console.log("Tareas crudas obtenidas:", tareasRaw);

    const toDateFromSeconds = (ts) => new Date(ts.seconds * 1000);

    const tareas = Object.entries(tareasRaw).map(([titulo, tarea]) => {
      const hora = tarea.hora || '23:59';
      const duracion = tarea.duracion || null;
      const dificultad = tarea.dificultad || null;

      const fechaCompleta = tarea.fechaCompleta
        ? toDateFromSeconds(tarea.fechaCompleta).toISOString()
        : toDateFromSeconds(tarea.fecha).toISOString().split('T')[0] + `T${hora}:00`;

      return {
        titulo,
        descripcion: tarea.descripcion,
        materia: tarea.materia,
        fecha: toDateFromSeconds(tarea.fecha).toISOString().split("T")[0],
        hora,
        fechaCompleta,
        duracion,
        dificultad,
        done: tarea.done || false,
      };
    });

    // console.log("Tareas API bajadas correctamente:", tareas);
    return tareas;
  } catch (error) {
    console.error("Error al bajar las tareas:", error);
    return [];
  }
};

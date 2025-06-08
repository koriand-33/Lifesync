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
 * }>>}
 */
export const bajarTareas = async (userId) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return [];

    const data = docSnap.data();
    const tareasRaw = data.tareas || {};

    const tareas = Object.entries(tareasRaw).map(([titulo, tarea]) => {
      // Para compatibilidad con tareas antiguas
      const hora = tarea.hora || '23:59';
      const duracion = tarea.duracion || null;
      const dificultad = tarea.dificultad || null;
      
      // Obtener fecha completa (nuevo formato) o construirla desde fecha+hora (formato antiguo)
      const fechaCompleta = tarea.fechaCompleta 
        ? tarea.fechaCompleta.toDate().toISOString() 
        : `${tarea.fecha.toDate().toISOString().split('T')[0]}T${hora}:00`;
      
      return {
        titulo,
        descripcion: tarea.descripcion,
        materia: tarea.materia,
        fecha: tarea.fecha.toDate().toISOString().split("T")[0], // Mantener por compatibilidad
        hora,
        fechaCompleta,
        duracion,
        dificultad
      };
    });

    return tareas;
  } catch (error) {
    console.error("Error al bajar las tareas:", error);
    return [];
  }
};
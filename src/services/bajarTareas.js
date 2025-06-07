import { doc, getDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Devuelve un array de tareas del usuario.
 * @param {string} userId
 * @returns {Promise<Array<{ titulo: string, descripcion: string, fecha: string, materia: string }>>}
 */
export const bajarTareas = async (userId) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return [];

    const data = docSnap.data();
    const tareasRaw = data.tareas || {};

    const tareas = Object.entries(tareasRaw).map(([titulo, tarea]) => ({
      titulo,
      descripcion: tarea.descripcion,
      materia: tarea.materia,
      fecha: tarea.fecha?.toDate().toISOString().split("T")[0] || "",
    }));

    return tareas;
  } catch (error) {
    console.error("Error al bajar las tareas:", error);
    return [];
  }
};

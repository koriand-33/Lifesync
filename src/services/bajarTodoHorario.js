import { doc, getDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Descarga el horario del usuario desde Firebase
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Objeto con materias, clases y extras
 */
export const bajarTodoHorario = async (userId) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      throw new Error("No se encontró el usuario");
    }

    const data = docSnap.data();

    const horario = data.HorarioSemanal || {};
    const tareas = data.tareas || {};

    return {
      horario: horario,
      tareas: tareas,
    };
  } catch (error) {
    console.error("Error al bajar el horario:", error);
    throw error;
  }
};

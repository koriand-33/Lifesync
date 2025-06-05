import { doc, getDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Descarga el horario del usuario desde Firebase
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Objeto con materias, clases y extras
 */
export const bajarHorario = async (userId) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      throw new Error("No se encontró el usuario");
    }

    const data = docSnap.data();

    const horario = data.HorarioSemanal || {};

    return {
      materias: horario.materias || {},
      clases: horario.clases || {},
      extras: horario.extras || {}
    };
  } catch (error) {
    console.error("Error al bajar el horario:", error);
    throw error;
  }
};

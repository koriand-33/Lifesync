import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Sube el horario del usuario a Firebase
 * @param {string} userId - ID del usuario
 * @param {Array} materias - Lista de materias [{nombre, color}]
 * @param {Object} clases - Horario con materias por día
 * @param {Object} extras - Actividades extra por día
 */
export const subirHorario = async (userId, materias, clases, extras) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);

    // Convertimos el array de materias en un objeto tipo map
    const materiasMap = {};
    materias.forEach(({ nombre, color }) => {
      materiasMap[nombre] = { color };
    });

    const horarioData = {
      materias: materiasMap,
      clases, // ya es un objeto organizado por días
      extras  // ya es un objeto organizado por días
    };

    await updateDoc(userRef, {
      HorarioSemanal: horarioData
    });

    console.log("Horario subido correctamente");
  } catch (error) {
    console.error("Error al subir el horario:", error);
    throw error;
  }
};

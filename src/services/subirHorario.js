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
    console.log("Subiendo horario para el usuario:", userId);
    console.log("Materias:", materias);
    console.log("Clases:", clases);
    console.log("Extras:", extras);
    const userRef = doc(db, "USUARIOS", userId);

    const horarioData = {
      materias,
      clases, 
      extras 
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

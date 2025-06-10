import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";
import { procesarHorarioYEnviarAPI } from "./HorarioAPI";
import { mostrarOverlayCarga, ocultarOverlayCarga} from "../utils/overlayCarga"

/**
 * Sube el horario del usuario a Firebase
 * @param {string} userId - ID del usuario
 * @param {Array} materias - Lista de materias [{nombre, color}]
 * @param {Object} clases - Horario con materias por día
 * @param {Object} extras - Actividades extra por día
 */
export const subirHorario = async (userId, materias, clases, extras, extrasAgrupadas) => {
  try {
    // console.log("Subiendo horario para el usuario:", userId);
    // console.log("Materias:", materias);
    // console.log("Clases:", clases);
    // console.log("Extras:", extras);
    // console.log("Extras agrupadas:", extrasAgrupadas);
    const userRef = doc(db, "USUARIOS", userId);

    const horarioData = {
      materias,
      clases, 
      extras,
      tiempo_fines: extrasAgrupadas
    };

    await updateDoc(userRef, {
      HorarioSemanal: horarioData
    });



    console.log("Horario subido correctamente");
    mostrarOverlayCarga();
    const { datosEnviados, respuestaAPI } = await procesarHorarioYEnviarAPI(userId);
    ocultarOverlayCarga(); 
  } catch (error) {
    console.error("Error al subir el horario:", error);
    throw error;
  }
};

import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";
import { procesarHorarioYEnviarAPI } from "./HorarioAPI";
import { mostrarOverlayCarga, ocultarOverlayCarga} from "../utils/overlayCarga"

/**
 * Crea o actualiza una tarea en Firebase para el usuario dado.
 * @param {string} userId - ID del usuario
 * @param {{
 *   titulo: string, 
 *   descripcion: string, 
 *   materia: string, 
 *   fecha: string, 
 *   hora: string, 
 *   fechaCompleta: string,
 *   duracion: number | null,
 *   dificultad: number | null
 * }} tarea
 */
export const subirTarea = async (userId, tarea) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);

    if(tarea.state === true)
    {
      console.warn("La tarea ya está subida y no se puede editar.");
    }
    
    // Convertir la fecha completa (YYYY-MM-DDTHH:mm:ss) a Timestamp
    const fechaCompletaTimestamp = Timestamp.fromDate(new Date(tarea.fechaCompleta));
    
    console.log("Subiendo tarea antes de agregar datos:", tarea);

    const nuevaTarea = {
      descripcion: tarea.descripcion,
      materia: tarea.materia,
      fecha: Timestamp.fromDate(new Date(tarea.fecha)),
      hora: tarea.hora,
      fechaCompleta: fechaCompletaTimestamp,
      duracion: tarea.duracion,
      dificultad: tarea.dificultad,
      done: null,
      state: tarea.state || false, 
    };

    console.log("Subiendo tarea despues de agregar datos:", nuevaTarea);

    await updateDoc(userRef, {
      [`tareas.${tarea.titulo}`]: nuevaTarea,
    });

    console.log("Tarea subida/editada correctamente");
    mostrarOverlayCarga();
    const { datosEnviados, respuestaAPI } = await procesarHorarioYEnviarAPI(userId);
    ocultarOverlayCarga(); 
    window.location.reload();
  } catch (error) {
    console.error("Error al subir la tarea:", error);
    throw error;
  }
};
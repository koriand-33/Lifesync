import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";
import { procesarHorarioYEnviarAPI } from "./HorarioAPI";

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
    
    // Convertir la fecha completa (YYYY-MM-DDTHH:mm:ss) a Timestamp
    const fechaCompletaTimestamp = Timestamp.fromDate(new Date(tarea.fechaCompleta));
    
    const nuevaTarea = {
      descripcion: tarea.descripcion,
      materia: tarea.materia,
      fecha: Timestamp.fromDate(new Date(tarea.fecha)),
      hora: tarea.hora,
      fechaCompleta: fechaCompletaTimestamp,
      duracion: tarea.duracion,
      dificultad: tarea.dificultad,
      done: false, 
    };

    await updateDoc(userRef, {
      [`tareas.${tarea.titulo}`]: nuevaTarea,
    });

    console.log("Tarea subida/editada correctamente");
    const { datosEnviados, respuestaAPI } = await procesarHorarioYEnviarAPI(userId);
    window.location.reload();
  } catch (error) {
    console.error("Error al subir la tarea:", error);
    throw error;
  }
};
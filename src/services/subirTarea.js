import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

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
      fecha: Timestamp.fromDate(new Date(tarea.fecha)), // Mantener por compatibilidad
      hora: tarea.hora, // Guardar la hora por separado
      fechaCompleta: fechaCompletaTimestamp, // Nueva fecha con hora
      duracion: tarea.duracion, // Nuevo campo
      dificultad: tarea.dificultad // Nuevo campo
    };

    await updateDoc(userRef, {
      [`tareas.${tarea.titulo}`]: nuevaTarea,
    });

    console.log("Tarea subida/editada correctamente");
    window.location.reload();
  } catch (error) {
    console.error("Error al subir la tarea:", error);
    throw error;
  }
};
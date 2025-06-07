// utils/subirTarea.js
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Crea o actualiza una tarea en Firebase para el usuario dado.
 * @param {string} userId - ID del usuario
 * @param {{ titulo: string, descripcion: string, materia: string, fecha: string }} tarea
 */
export const subirTarea = async (userId, tarea) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const fechaTimestamp = Timestamp.fromDate(new Date(tarea.fecha));

    const nuevaTarea = {
      descripcion: tarea.descripcion,
      materia: tarea.materia,
      fecha: fechaTimestamp,
    };

    await updateDoc(userRef, {
      [`tareas.${tarea.titulo}`]: nuevaTarea,
    });

    console.log("Tarea subida/editada correctamente");
  } catch (error) {
    console.error(" Error al subir la tarea:", error);
    throw error;
  }
};

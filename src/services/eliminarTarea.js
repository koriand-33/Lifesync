// utils/eliminarTarea.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";
import { deleteField } from "firebase/firestore";

/**
 * Elimina una tarea del usuario
 * @param {string} userId - ID del usuario
 * @param {string} titulo - Título exacto de la tarea a eliminar
 */
export const eliminarTarea = async (userId, titulo) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    await updateDoc(userRef, {
      [`tareas.${titulo}`]: deleteField(),
    });

    console.log("Tarea eliminada correctamente");
  } catch (error) {
    console.error(" Error al eliminar la tarea:", error);
    throw error;
  }
};

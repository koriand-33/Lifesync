import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

export const eliminarTarea = async (userId, tituloExacto) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    
    await updateDoc(userRef, {
      [`tareas.${tituloExacto}`]: deleteField()
    });

    console.log(`Tarea "${tituloExacto}" eliminada correctamente`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar:`, {
      error: error.message,
      tituloIntentado: tituloExacto
    });
    throw error;
  }
};
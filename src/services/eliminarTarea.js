import { doc, updateDoc, getDoc, deleteField } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

export const eliminarTarea = async (userId, tituloExacto) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("Usuario no encontrado");
    }

    const datos = userSnap.data();
    const tareas = datos.tareas;
    const tareasApi = datos.tareasApi || {};

    // console.log(" Estructura actual:");
    // console.log(" tareas (typeof):", typeof tareas, tareas);
    // console.log(" tareasApi:", tareasApi);

    // Verificación de tipo
    // if (Array.isArray(tareas)) {
    //   console.log(" 'tareas' es un array");
    // } else if (typeof tareas === "object" && tareas !== null) {
    //   console.log(" 'tareas' es un objeto, no un array");
    // } else {
    //   console.warn(" 'tareas' no tiene un formato esperado:", tareas);
    // }

    let nuevasTareas = tareas;

    // Si es array: filtrar
    if (Array.isArray(tareas)) {
      nuevasTareas = tareas.filter(t => t.titulo !== tituloExacto);
    }

    const updates = {};

    if (Array.isArray(tareas)) {
      updates.tareas = nuevasTareas;
    } else if (typeof tareas === "object" && tareas !== null && tareas[tituloExacto]) {
      updates[`tareas.${tituloExacto}`] = deleteField(); // si era objeto
    }

    if (tareasApi[tituloExacto]) {
      updates[`tareasApi.${tituloExacto}`] = deleteField();
    }

    if (Object.keys(updates).length === 0) {
      console.log(" No se encontró la tarea para eliminar en 'tareas' ni 'tareasApi'. No se realizaron cambios.");
      return false;
    }

    await updateDoc(userRef, updates);
    console.log(` Tarea "${tituloExacto}" eliminada correctamente`);
    return true;
  } catch (error) {
    console.error(` Error al eliminar:`, {
      error: error.message,
      tituloIntentado: tituloExacto
    });
    throw error;
  }
};

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Actualiza la actividad del usuario y maneja la lógica de rachas
 * @param {string} userId - ID del usuario
 */
export const actualizarActividadUsuario = async (userId) => {
  const userRef = doc(db, "USUARIOS", userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error("Usuario no encontrado");
  }

  const userData = userSnap.data();
  const ahora = new Date();
  const ultimaActividad = userData.fecha_actividad?.toDate();

  let nuevosDatos = {
    fecha_actividad: serverTimestamp()
  };

  if (!ultimaActividad) {
    nuevosDatos = {
      ...nuevosDatos,
      racha_actual: 1,
      maxima_racha: 1
    };
  } else {
    const diferenciaDias = Math.floor((ahora - ultimaActividad) / (1000 * 60 * 60 * 24));
    let rachaActual = userData.racha_actual || 1;
    let maximaRacha = userData.maxima_racha || 1;

    if (diferenciaDias === 1) {
      rachaActual += 1;
      if (rachaActual > maximaRacha) {
        maximaRacha = rachaActual;
      }
    } else if (diferenciaDias > 1) {
      rachaActual = 1;
    }
    nuevosDatos = {
      ...nuevosDatos,
      racha_actual: rachaActual,
      maxima_racha: maximaRacha
    };
  }

  await updateDoc(userRef, nuevosDatos);
};
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";
import { auth } from "../../conexion_BD/firebase";

/**
 * Verifica y actualiza la racha del usuario en Firebase.
 */
export const verificarYActualizarRacha = async () => {
  const user = auth.currentUser;
  if (!user) return;
  console.log("Verificando racha para el usuario:", user.uid);

  const userRef = doc(db, "USUARIOS", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) return;

  const data = docSnap.data();

  const fechaActividad = data.fecha_actividad?.toDate?.() || new Date(data.fecha_actividad);
  console.log("Fecha de última actividad:", fechaActividad);
  const hoy = new Date();
  const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    console.log("Fecha de hoy:", fechaHoy);
  const fechaPrev = new Date(fechaActividad.getFullYear(), fechaActividad.getMonth(), fechaActividad.getDate());

  const diffDias = Math.floor((fechaHoy - fechaPrev) / (1000 * 60 * 60 * 24));

  let nuevaRacha = data.racha_actual || 1;
  let nuevaMaxRacha = data.maxima_racha || 1;

  if (diffDias === 1) {
    nuevaRacha += 1;
  } else if (diffDias > 1) {
    nuevaRacha = 1;
  } else {
    // misma fecha, no hay cambio
    return;
  }

  if (nuevaRacha > nuevaMaxRacha) {
    nuevaMaxRacha = nuevaRacha;
    console.log("Nueva máxima racha alcanzada:", nuevaMaxRacha);
  }

  await updateDoc(userRef, {
    racha_actual: nuevaRacha,
    maxima_racha: nuevaMaxRacha,
    fecha_actividad: new Date()
  });

  console.log("Racha actualizada: ", nuevaRacha, "🔥 Máxima:", nuevaMaxRacha);
};

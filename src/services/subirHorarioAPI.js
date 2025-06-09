import { db } from "../../conexion_BD/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function subirHorarioCompleto(uid, entrada, salidaApi) {
  try {
    console.log("formato de API:", salidaApi);
    const data = {
      HorarioSemanalApi: {
        clases: salidaApi.horario.clases,
        materias: salidaApi.horario.materias,
        horarios_materias: salidaApi.horario.horarios_materias,
        extras: salidaApi.horario.extras,
        tiempo_fines: salidaApi.horario.tiempo_fines || {},
      },
      tareasApi: salidaApi.tareas,
    };

    console.log("Subiendo horario completo para el usuario:", data);

    const ref = doc(db, "USUARIOS", uid);
    await setDoc(ref, data, { merge: true });

    // console.log("Horario subido correctamente a Firebase.");
  } catch (error) {
    console.error("Error al subir el horario:", error);
  }
}


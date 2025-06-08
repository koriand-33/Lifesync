import { db } from "../../conexion_BD/firebase";
import { doc, setDoc } from "firebase/firestore";

function convertirNestedArrays(obj) {
  const nuevoObj = {};

  for (const [materia, dias] of Object.entries(obj)) {
    nuevoObj[materia] = {};

    for (const [dia, bloques] of Object.entries(dias)) {
      nuevoObj[materia][dia] = bloques.map(bloque => {
        if (Array.isArray(bloque) && bloque.length === 2) {
          return { inicio: bloque[0], fin: bloque[1] };
        }
        return bloque;
      });
    }
  }

  return nuevoObj;
}

export async function subirHorarioCompleto(uid, entrada, salidaApi) {
  try {
    // Convertir las secciones conflictivas
    const horariosMaterias = convertirNestedArrays(salidaApi.horarios_materias);
    const horariosTareas = convertirNestedArrays(salidaApi.horarios_tareas);

    const data = {
      HorarioSemanalApi: {
        entrada: entrada,
        salidaApi: {
          ...salidaApi,
          horarios_materias: horariosMaterias,
          horarios_tareas: horariosTareas
        }
      }
    };

    const ref = doc(db, "USUARIOS", uid);
    await setDoc(ref, data, { merge: true });

    console.log("✅ Horario subido correctamente a Firebase.");
  } catch (error) {
    console.error("❌ Error al subir el horario:", error);
  }
}


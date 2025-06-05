import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";
import { Timestamp } from "firebase/firestore"; // Importa Timestamp de Firebase

/**
 * Actualiza la información del perfil en Firebase si hay cambios
 * @param {string} userId - ID del usuario
 * @param {Object} nuevosDatos - Datos nuevos del usuario
 */
export const actualizarInfoPerfil = async (userId, nuevosDatos) => {
  try {
    const cleanData = Object.fromEntries(
      Object.entries(nuevosDatos).filter(([_, v]) => v !== undefined)
    );

    const userRef = doc(db, "USUARIOS", userId);

    // Manejo de la fecha de nacimiento
    let fechaNacimientoFirestore = null;
    if (cleanData.fechaNacimiento) {
      // Si es un objeto Date, conviértelo directamente a Timestamp
      if (cleanData.fechaNacimiento instanceof Date) {
        fechaNacimientoFirestore = Timestamp.fromDate(cleanData.fechaNacimiento);
      } 
      // Si es un string en formato ISO (ej. "2002-11-06"), créalo como UTC
      else if (typeof cleanData.fechaNacimiento === 'string') {
        const fecha = new Date(cleanData.fechaNacimiento);
        fechaNacimientoFirestore = Timestamp.fromDate(fecha);
      }
    }

    const datosFirebase = {
      nombre_viajero: cleanData.nombre,
      primer_Apellido_viajero: cleanData.primerApellido,
      segundo_Apellido_viajero: cleanData.segundoApellido,
      correo_viajero: cleanData.correo,
      telefono_viajero: cleanData.telefono,
      fecha_nacimiento_viajero: fechaNacimientoFirestore || null,
      sexo_viajero: cleanData.genero || "",
      descripcion: cleanData.descripcion,
      foto_perfil: cleanData.foto_perfil || "",
      location: cleanData.location || "",
    };

    await updateDoc(userRef, datosFirebase);
    console.log("Perfil actualizado en Firebase.");
  } catch (error) {
    console.error("Error al actualizar perfil en Firebase:", error);
    throw error;
  }
};
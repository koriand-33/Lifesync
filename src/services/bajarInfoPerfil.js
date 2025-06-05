import { doc, getDoc } from "firebase/firestore";
import { db } from "../../conexion_BD/firebase";

/**
 * Obtiene la información del perfil desde Firebase
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Datos del usuario formateados
 */
export const bajarInfoPerfil = async (userId) => {
  try {
    const userRef = doc(db, "USUARIOS", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      throw new Error("No se encontró el usuario");
    }

    const userData = docSnap.data();

    return {
      nombreCompleto: `${userData.nombre_viajero || ''} ${userData.primer_Apellido_viajero || ''} ${userData.segundo_Apellido_viajero || ''}`.trim(),
        nombre: userData.nombre_viajero || '',
        primerApellido: userData.primer_Apellido_viajero || '',
        segundoApellido: userData.segundo_Apellido_viajero || '',
        correo: userData.correo_viajero || '',
        telefono: userData.telefono_viajero || '',
        fechaRegistro: userData.fecha_registro|| null,
        // fechaNacimiento: userData.fecha_nacimiento_viajero || '',
        fechaNacimiento: userData.fecha_nacimiento_viajero 
        ? userData.fecha_nacimiento_viajero.toDate() 
        : null,
        genero: userData.sexo_viajero || '',
        descripcion: userData.descripcion || '',
        fotoPerfil: userData.foto_perfil || "/Profile/img_usuario.png",
        rachaActual: userData.racha_actual || 0,
        logros: userData.logros || null,
        clases: userData.HorarioClasss?.classes || null,
        HorarioClass: userData.HorarioClasss || null,
        location: userData.location || '',
    };

  } catch (error) {
    console.error("Error al bajar info del perfil:", error);
    throw error;
  }
};
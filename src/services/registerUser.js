
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../conexion_BD/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Añadir serverTimestamp

// Función para formatear nombres (primera letra mayúscula, resto minúsculas)
const formatearNombre = (texto) => {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

/**
 * Registra un nuevo usuario en Firebase Authentication y Firestore.
 * @param {Object} datosUsuario - Datos del formulario de registro.
 * @returns {Promise<string>} - UID del nuevo usuario.
 */
export const registerUser = async (datosUsuario) => {
  try {
    const { correo_viajero, pass_viajero,fecha_nacimiento_viajero, ...restoDatos } = datosUsuario;

    // 1. Primero verifica que todos los datos requeridos existan
    if (!correo_viajero || !pass_viajero) {
      throw new Error("Email y contraseña son requeridos");
    }

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      correo_viajero,
      pass_viajero
    );


    const user = userCredential.user;
    debugger;
    console.log("Fecha de nacimiento recibida:", fecha_nacimiento_viajero);
    let fechaNacimientoFirestore = null;
    if (fecha_nacimiento_viajero) {
      const fecha = new Date(fecha_nacimiento_viajero);
      if (!isNaN(fecha.getTime())) { // Verificación extra
        fechaNacimientoFirestore = fecha;
      } else {
        console.warn("Fecha inválida, se guardará como null");
      }
    }


    // Formatear nombres y apellidos
    const datosFormateados = {
      ...restoDatos,
      nombre_viajero: formatearNombre(restoDatos.nombre_viajero),
      primer_Apellido_viajero: formatearNombre(restoDatos.primer_Apellido_viajero),
      segundo_Apellido_viajero: formatearNombre(restoDatos.segundo_Apellido_viajero),
      fecha_nacimiento_viajero: fechaNacimientoFirestore,
      fecha_registro: serverTimestamp(), // Firebase Timestamp
      fecha_actividad: serverTimestamp(), // Firebase Timestamp
      racha_actual: 1, // Valor por defecto
      maxima_racha: 1, // Valor por defecto
      alta: true, 
    };

    // Guardar datos en Firestore
    console.log("Intentando guardar en Firestore:", datosFormateados);
    const userRef = doc(db, "USUARIOS", user.uid);
    await setDoc(userRef, {
      correo_viajero,
      uid: user.uid,
      ...datosFormateados,
    });
    console.log("Usuario guardado en Firestore correctamente");

    return user.uid;
  } catch (error) {
    console.error("Error completo:", error); // Debug detallado
    throw new Error(`Error al registrar: ${error.message}`);
  }
};

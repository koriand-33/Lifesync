// // src/services/registerUser.js
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "../../conexion_BD/firebase";
// import { doc, setDoc } from "firebase/firestore";

// /**
//  * Registra un nuevo usuario en Firebase Authentication y Firestore.
//  * @param {Object} datosUsuario - Datos del formulario de registro.
//  * @returns {Promise<string>} - UID del nuevo usuario.
//  */
// export const registerUser = async (datosUsuario) => {
//   try {
//     const { correo_viajero, pass_viajero, ...restoDatos } = datosUsuario;

//     // Crear usuario en Firebase Auth
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       correo_viajero,
//       pass_viajero
//     );
//     const user = userCredential.user;

//     // Guardar datos adicionales en Firestore
//     const userRef = doc(db, "USUARIOS", user.uid);
//     await setDoc(userRef, {
//       correo_viajero,
//       uid: user.uid,
//       ...restoDatos,
//     });

//     return user.uid;
//   } catch (error) {
//     console.error("Error al registrar usuario:", error);
//     throw error;
//   }
// };

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
    const { correo_viajero, pass_viajero, ...restoDatos } = datosUsuario;

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      correo_viajero,
      pass_viajero
    );
    const user = userCredential.user;

    const fechaNacimientoTimestamp = fecha_nacimiento_viajero 
      ? new Date(fecha_nacimiento_viajero) 
      : null;


    // Formatear nombres y apellidos
    const datosFormateados = {
      ...restoDatos,
      nombre_viajero: formatearNombre(restoDatos.nombre_viajero),
      primer_Apellido_viajero: formatearNombre(restoDatos.primer_Apellido_viajero),
      segundo_Apellido_viajero: formatearNombre(restoDatos.segundo_Apellido_viajero),
      fecha_nacimiento_viajero: fechaNacimientoTimestamp,
      fecha_registro: serverTimestamp(), // Firebase Timestamp
      fecha_actividad: serverTimestamp(), // Firebase Timestamp
      racha_actual: 1, // Valor por defecto
      maxima_racha: 1, // Valor por defecto
      alta: true, 
    };

    // Guardar datos en Firestore
    const userRef = doc(db, "USUARIOS", user.uid);
    await setDoc(userRef, {
      correo_viajero,
      uid: user.uid,
      ...datosFormateados,
    });

    return user.uid;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};
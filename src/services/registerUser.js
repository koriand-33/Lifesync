// src/services/registerUser.js
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../conexion_BD/firebase";
import { doc, setDoc } from "firebase/firestore";

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

    // Guardar datos adicionales en Firestore
    const userRef = doc(db, "USUARIOS", user.uid);
    await setDoc(userRef, {
      correo_viajero,
      uid: user.uid,
      ...restoDatos,
    });

    return user.uid;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

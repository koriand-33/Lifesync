import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../conexion_BD/firebase";

/**
 * Inicia sesión con correo y contraseña en Firebase.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export const inicioSesion = async (email, password) => {
  try {
    await setPersistence(auth, browserLocalPersistence); // Persistencia local
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

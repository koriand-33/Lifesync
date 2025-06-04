"use client";
import React, { useState } from "react";
// import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { inicioSesion } from "@/services/inicioUser";

const FormInicioSession = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetMessage, setResetMessage] = useState("");


  const handleResetPassword = async (e) => {
  e.preventDefault();
  try {
    await sendPasswordResetEmail(auth, resetEmail);
    setResetMessage("Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.");
    setResetEmail("");
    setTimeout(() => {
      setShowResetForm(false);
      setResetMessage("");
    }, 5000);
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error.message);
    setResetMessage("Error: " + error.message);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await inicioSesion(form.email, form.password);
      const user = userCredential.user;

      console.log("Usuario autenticado:", user);
    // Espera una fracción de segundo para que onAuthStateChanged lo capture
    setTimeout(() => {
      router.push("/user/home");
    }, 100); 
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Correo o contraseña incorrectos");
    }
  };
  

  return (
<div className="">

{/* inicio sesion pc */}
    <div className="max-w-md mx-auto p-8 rounded-lg ">
      <h2 className="text-2xl font-bold mb-6">Inicia Sesion</h2>

      <div className="flex gap-2 mb-4">
        <button className="w-full flex border border-text items-center justify-center gap-2 bg-detail py-2 px-4 rounded hover:bg-details">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>
        <button className="w-full flex items-center border border-text justify-center gap-2 bg-detail py-2 px-4 rounded hover:bg-details">
        <svg className="w-10 h-10 text-text fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path d="M25,3C12.85,3,3,12.85,3,25c0,11.03,8.125,20.137,18.712,21.728V30.831h-5.443v-5.783h5.443v-3.848 c0-6.371,3.104-9.168,8.399-9.168c2.536,0,3.877,0.188,4.512,0.274v5.048h-3.612c-2.248,0-3.033,2.131-3.033,4.533v3.161h6.588 l-0.894,5.783h-5.694v15.944C38.716,45.318,47,36.137,47,25C47,12.85,37.15,3,25,3z"></path>
        </svg>            
          Iniciar sesion con facebook
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <hr className="w-full border-gray-700" />
        <span className="text-sm text-gray-400 px-2">or</span>
        <hr className="w-full border-gray-700" />
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="block text-sm mb-1">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="name@company.com"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 rounded bg-details border border-gray-700 text-text mb-4"
          required
        />

        <label htmlFor="password" className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-details border border-gray-700 text-text mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Acceso
        </button>
      </form>

{/* Olvidaste la contraseña */}
      <div className="mt-4 text-center">
        <button 
          onClick={() => setShowResetForm(true)}
          className="text-sm text-blue-400 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
{/* formulario de restablecimiento de contraseña */}
      {showResetForm && (
        <div className="mt-6 p-4 bg-details rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Restablecer contraseña</h3>
          <form onSubmit={handleResetPassword}>
            <label htmlFor="resetEmail" className="block text-sm mb-1">
              Ingresa tu correo electrónico
            </label>
            <input
              type="email"
              id="resetEmail"
              name="resetEmail"
              placeholder="name@company.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-2 rounded bg-details border border-gray-700 text-text mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Enviar correo de recuperación
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                setResetMessage("");
              }}
              className="w-full mt-2 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </form>
          {resetMessage && (
            <p className={`mt-2 text-sm ${
              resetMessage.includes("Error") ? "text-red-400" : "text-green-400"
            }`}>
              {resetMessage}
            </p>
          )}
        </div>
      )}

    </div>

</div>
  );
};

export default FormInicioSession;

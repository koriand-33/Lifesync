"use client";
import React, { useState } from "react";
import TermsModal from "./notificacion/Terminos";
import PrivacyModal from "./notificacion/Privacidad";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/registerUser";
import { serverTimestamp } from "firebase/firestore";

// import Cookies from "js-cookie";

// interface FormData {
//   nombre_viajero: string;
//   primer_Apellido_viajero: string;
//   segundo_Apellido_viajero: string;
//   correo_viajero: string;
//   pass_viajero: string;
//   sexo_viajero: string;
//   fecha_nacimiento_viajero: string;
//   telefono_viajero: string;
// }

const FormInicioRegistro = () => {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [form, setForm] = useState({
    nombre_viajero: "",
    primer_Apellido_viajero: "",
    segundo_Apellido_viajero: "",
    correo_viajero: "",
    pass_viajero: "",
    sexo_viajero: "",
    fecha_nacimiento_viajero: null,
    telefono_viajero: "",
    fecha_registro: null,
    fecha_actividad:null,
    racha_actual: 1,
    maxima_racha: 1,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
      name === "fecha_nacimiento_viajero" ? new Date(value) :
      value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uid = await registerUser(form);
      console.log("Usuario registrado con UID:", uid);
      router.push("/user/home");
    } catch (error) {
      alert("Error al registrar el usuario: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Regístrate Usuario</h2>

      <div className="flex gap-2 mb-4">
        <button className="w-full border-text border flex items-center justify-center gap-2 bg- py-2 px-4 rounded hover:hover:bg-details">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Iniciar sesión con Google
        </button>
        <button className="w-full border-text border flex items-center justify-center gap-2 bg- py-2 px-4 rounded hover:hover:bg-details">
          <svg className="w-10 h-10 text-text fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path d="M25,3C12.85,3,3,12.85,3,25c0,11.03,8.125,20.137,18.712,21.728V30.831h-5.443v-5.783h5.443v-3.848 c0-6.371,3.104-9.168,8.399-9.168c2.536,0,3.877,0.188,4.512,0.274v5.048h-3.612c-2.248,0-3.033,2.131-3.033,4.533v3.161h6.588 l-0.894,5.783h-5.694v15.944C38.716,45.318,47,36.137,47,25C47,12.85,37.15,3,25,3z" />
          </svg>
          Iniciar sesión con Facebook
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <hr className="w-full border-gray-700" />
        <span className="text-sm text-gray-400 px-2">o</span>
        <hr className="w-full border-gray-700" />
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* campo primer nombre */}
        <label className="block text-sm mb-1" htmlFor="nombre_viajero">Nombre(s)</label>
        <input
          type="text"
          name="nombre_viajero"
          id="nombre_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          placeholder="Tu nombre(s)"
          value={form.nombre_viajero}
          onChange={handleChange}
          required
        />

        {/* Campo primer apellido */}
        <label className="block text-sm mb-1" htmlFor="nombre_viajero">Primer apellido</label>
        <input
          type="text"
          name="primer_Apellido_viajero"
          id="primer_Apellido_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          placeholder="Tu primer apellido"
          value={form.primer_Apellido_viajero}
          onChange={handleChange}
          required
        />

        {/* Campo segundo apellido */}
        <label className="block text-sm mb-1" htmlFor="nombre_viajero">Segundo apellido</label>
        <input
          type="text"
          name="segundo_Apellido_viajero"
          id="segundo_Apellido_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          placeholder="Tu segundo apellido"
          value={form.segundo_Apellido_viajero}
          onChange={handleChange}
          required
        />

        {/* Campo correo */}
        <label className="block text-sm mb-1" htmlFor="correo_viajero">Correo</label>
        <input
          type="email"
          name="correo_viajero"
          id="correo_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          placeholder="name@correo.com"
          value={form.correo_viajero}
          onChange={handleChange}
          required
        />

        
        {/* Campo contraseña */}
        <label className="block text-sm mb-1" htmlFor="pass_viajero">Contraseña</label>
        <input
          type="password"
          name="pass_viajero"
          id="pass_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          value={form.pass_viajero}
          onChange={handleChange}
          required
        />

        {/* campo sexo */}
        <label className="block text-sm mb-1" htmlFor="sexo">Sexo</label>
        <select
          name="sexo_viajero"
          id="sexo_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          value={form.sexo_viajero}
          onChange={handleChange}
          required
        >
          <option value="" disabled >Selecciona tu sexo</option>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
          <option value="otro">Otro</option>
        </select>

        
        {/* Campo fecha de nacimiento */}
        <label className="block text-sm mb-1" htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
        <input
          type="date"
          name="fecha_nacimiento_viajero"
          id="fecha_nacimiento_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          value={form.fecha_nacimiento_viajero ? form.fecha_nacimiento_viajero.toISOString().split('T')[0] : ''}
          onChange={handleChange}
          min="1900-01-01"
          max={new Date().toISOString().split('T')[0]}
          required
        />

      
        {/* Campo teléfono */}
        <label className="block text-sm mb-1" htmlFor="telefono">Teléfono</label>
        <input
          type="tel"
          name="telefono_viajero"
          id="telefono_viajero"
          className="w-full p-2 rounded bg- border border-text text-text mb-4"
          placeholder="10 dígitos"
          value={form.telefono_viajero}
          onChange={handleChange}
          required
        />

        
        {/* Campo Terminos y Politicas */}
        <div className="flex items-start mb-4">
          <input
            id="terms"
            type="checkbox"
            name="acceptTerms"
            // onChange={handleChange}
            className="mr-2 mt-1"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-400">
            Al registrarte, aceptas los{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="underline text-blue-600 hover:text-blue-800 text-sm"
            >
              Términos de uso
            </button>{" "}
            y{" "}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="underline text-blue-600 hover:text-blue-800 text-sm"
            >
              Política de privacidad
            </button>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Crear cuenta
        </button>
      </form>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};

export default FormInicioRegistro;

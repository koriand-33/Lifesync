"use client"
import React, { useEffect, useState } from 'react';
// import { bajarTareas, bajarHorario } from '../../conexion_BD/firebase';
import { bajarHorario } from '@/services/bajarHorario';
import { bajarTareasFiltradas } from '@/services/bajarTareasFiltradas';
import { auth } from '../../../conexion_BD/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CalendarDays, ClipboardList, Send } from 'lucide-react';
import Loading from '@/component/loading/loading';
import { subirHorarioCompleto } from '@/services/subirHorarioAPI';
import { procesarHorarioYEnviarAPI } from '@/services/HorarioAPI';
import { bajarTodoHorario } from '@/services/bajarTodoHorario';
import { generarFormatoFinal } from '@/services/tratamientoDatos/formatearHorario';

const HorarioActividades = () => {
  const [tareas, setTareas] = useState([]);
  const [horario, setHorario] = useState({ materias: {}, clases: {}, extras: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [apiRequest, setApiRequest] = useState(null);
  const [TodoHorario, setTodoHorario] = useState(null);
  const [showTodoHorario, setShowTodoHorario] = useState(false);
  const [datosFinales, setDatosFinales] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          setLoading(true);
          const [tareasData, horarioData, TodoHorario] = await Promise.all([
            bajarTareasFiltradas(user.uid),
            bajarHorario(user.uid),
            bajarTodoHorario(user.uid)
          ]);
          
          setTodoHorario(TodoHorario);
          setTareas(tareasData);
          setHorario(horarioData);
          
          console.log("Datos descargados correctamente:");
          console.log("Tareas:", tareasData);
          console.log("Horario:", horarioData);
          console.log("Todo Horario:", TodoHorario);
        } catch (err) {
          console.error("Error al cargar datos:", err);
          setError("Error al cargar los datos. Intenta nuevamente.");
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setError("No hay usuario autenticado");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const enviarDatosAPI = async () => {
    try {
      setSending(true);
      setApiResponse(null);
      setDatosFinales(null);
      
      const { datosEnviados, respuestaAPI } = await procesarHorarioYEnviarAPI(user.uid);

      setApiRequest(datosEnviados);
      setApiResponse(respuestaAPI);
      const formatoFinal = generarFormatoFinal(datosEnviados, respuestaAPI, tareas);

      
      setDatosFinales(formatoFinal);
      console.log("Datos finales generados:", formatoFinal);
    } catch (err) {
      console.error("Error al enviar a la API:", err);
      setError(`Error al comunicarse con la API: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-4">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center mt-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

 
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CalendarDays className="text-blue-500" />
        <span>Datos de Horario y Actividades</span>
      </h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowTodoHorario(!showTodoHorario)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          {showTodoHorario ? 'Ocultar TodoHorario' : 'Mostrar TodoHorario'}
        </button>

        <button
          onClick={enviarDatosAPI}
          disabled={sending}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${sending ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          <Send size={18} />
          {sending ? 'Enviando...' : 'Enviar a la API'}
        </button>
      </div>

      {/* Mostrar TodoHorario */}
      {showTodoHorario && TodoHorario && (
        <div className="mt-4 bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
          <h3 className="font-medium text-purple-800 mb-2">Contenido de TodoHorario:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(TodoHorario, null, 2)}
          </pre>
        </div>
      )}

      {/* Mostrar datos enviados a API */}
      {apiRequest && (
        <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-4">
          <h3 className="font-medium text-yellow-800 mb-2">Datos enviados a la API:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(apiRequest, null, 2)}
          </pre>
        </div>
      )}

      {/* Mostrar respuesta de API */}
      {apiResponse && (
        <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-medium text-green-800 mb-2">Respuesta de la API:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}

      {datosFinales && (
        <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-medium text-red-700 mb-2">Respuesta final formato:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(datosFinales, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default HorarioActividades;
"use client"
import React, { useEffect, useState } from 'react';
// import { bajarTareas, bajarHorario } from '../../conexion_BD/firebase';
import { bajarHorario } from '@/services/bajarHorario';
import { bajarTareas } from '@/services/bajarTareas';
import { auth } from '../../../conexion_BD/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CalendarDays, ClipboardList, Send } from 'lucide-react';
import Loading from '@/component/loading/loading';
import { subirHorarioCompleto } from '@/services/subirHorarioAPI';

const HorarioActividades = () => {
  const [tareas, setTareas] = useState([]);
  const [horario, setHorario] = useState({ materias: {}, clases: {}, extras: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [apiRequest, setApiRequest] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          setLoading(true);
          const [tareasData, horarioData] = await Promise.all([
            bajarTareas(user.uid),
            bajarHorario(user.uid)
          ]);
          setTareas(tareasData);
          setHorario(horarioData);
          
          console.log("Datos descargados correctamente:");
          console.log("Tareas:", tareasData);
          console.log("Horario:", horarioData);
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
      const uid = user.uid;
      setSending(true);
      setApiResponse(null);
      
      // Preparar los datos para enviar a la API
      const datosParaAPI = {
        tareas: {},
        materias: {},
        clases: horario.clases,
        extras: horario.extras
      };

      // Procesar tareas para el formato que espera la API
      tareas.forEach(tarea => {
        if (!datosParaAPI.tareas[tarea.materia]) {
          datosParaAPI.tareas[tarea.materia] = [];
        }
        
        datosParaAPI.tareas[tarea.materia].push({
          descripcion: tarea.titulo,
          tiempoDuracion: tarea.duracion || 60, // Valor por defecto si no hay duración
          fechaEntrega: tarea.fecha
        });
      });

      // Procesar materias (asumiendo que tienen prioridad)
      Object.keys(horario.materias).forEach(materia => {
        datosParaAPI.materias[materia] = {
          prioridad: horario.materias[materia].prioridad || 5 // Valor por defecto
        };
      });

      setApiRequest(datosParaAPI);
      console.log("Datos preparados para API:", datosParaAPI);
      // Enviar a la API Python
      const response = await fetch('http://localhost:5000/predecir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaAPI)
      });

      if (!response.ok) {
      // Intenta obtener el mensaje de error del cuerpo de la respuesta
      let errorMsg = `Error en la API: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData.message || JSON.stringify(errorData)}`;
      } catch (e) {
        // Si no se puede parsear el JSON, usar el status text
        errorMsg += ` - ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }


      const data = await response.json();
      setApiResponse(data);
      console.log("Respuesta de la API:", data);
      // await subirHorarioCompleto(uid, datosParaAPI, data);

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

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="text-green-500" />
          <h2 className="text-lg font-semibold">Datos descargados</h2>
        </div>
        <p className="text-gray-600">
          Los datos se han descargado y mostrado en la consola. Revisa la consola del navegador para ver los resultados.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
        <h3 className="font-medium text-blue-800 mb-2">Estado de la descarga:</h3>
        <p className="text-blue-600">Completada (ver consola)</p>
      </div>

      <button
        onClick={enviarDatosAPI}
        disabled={sending}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${sending ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white mb-4`}
      >
        <Send size={18} />
        {sending ? 'Enviando...' : 'Enviar a la API de recomendación'}
      </button>

      {apiRequest && (
        <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">Datos enviados a la API:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(apiRequest, null, 2)}
          </pre>
        </div>
      )}

      {apiResponse && (
        <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-medium text-green-800 mb-2">Respuesta de la API:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};


export default HorarioActividades;
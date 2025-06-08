import { bajarTareas } from '@/services/bajarTareas';
import { bajarHorario } from '@/services/bajarHorario';
import { useEffect, useState } from 'react';
import { auth } from '../../../conexion_BD/firebase';
import { fusionarTareas } from '@/services/tratamientoDatos/fusionarTareas';
import { bajarTareasAPI } from '@/services/bajarTareasAPIS';
import { bajarHorarioAPI } from '@/services/bajarHorarioAPI';


export const useDatosUsuario = () => {
  const [proximas, setProximas] = useState([]);
  const [horario, setHorario] = useState(null);
  const [materias, setMaterias] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      setCargando(true);
      try {
        // const tareas = await bajarTareas(userId);
        const tareasDelUsuario = await bajarTareasAPI(userId);
        const tareasDelUsuarioNormal = await bajarTareas(userId);

        const tareas = fusionarTareas(tareasDelUsuario, tareasDelUsuarioNormal);

        const tareasConId = tareas.map((t, i) => ({
          ...t, id: i + 1, hora: t.hora || '08:00', completada: false
        }));
        setProximas(tareasConId);

        // const horarioData = await bajarHorario(userId);
        const horarioData = await bajarHorarioAPI(userId);
        const isEmpty = Object.values(horarioData).every(v => typeof v === 'object' ? !Object.keys(v).length : !v);
        setHorario(isEmpty ? null : horarioData);

        setMaterias(horarioData?.materias || {
          "Visión Artificial": {}, "Procesamiento de Señales": {}, "Algoritmos Bioinspirados": {},
          "Aprendizaje Máquina": {}, "Teoría de la Computación": {}, "Tecnologías de Lenguaje Natural": {}, "Evento": {}
        });
        console.log("Tareas", tareas);
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };

    fetch();
  }, []);
    useEffect(() => {
        // console.log("Proximas tareas:", proximas);
        // console.log("Horario:", horario);
        // console.log("Materias:", materias);
    }, [proximas, horario, materias]);

  return { proximas, setProximas, horario, materias, cargando };
}

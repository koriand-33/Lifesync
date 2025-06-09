import React , {useEffect, useState}from 'react'
import { useRouter } from "next/navigation";
import Loading from '@/component/loading/loading';
import { auth } from '../../conexion_BD/firebase';
import { bajarHorario } from '@/services/bajarHorario';
import { bajarHorarioAPI } from '@/services/bajarHorarioAPI';
import HorarioForms from '@/component/user/schedule/HorarioForms';

const ProtegidoSchedule = ({children}) => {
  const router = useRouter();
  const [tieneHorario, setTieneHorario] = useState(false);
  const [horarioExistente, setHorarioExistente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const closeModal = () => false;

    const fetchHorario = async () => {
        setCargando(true);
        const isObjectEmpty = (obj) => {
          return Object.values(obj).every(
            value => typeof value === 'object' && value !== null 
              ? Object.keys(value).length === 0 
              : !value
          );
        };
        try {
          const userId = auth.currentUser?.uid;
          if (!userId) {
            setCargando(false);
            return;
          }
          const horario = await bajarHorario(userId);
          // console.log("Horario obtenido personal:", horario);
          const horarioAPI = await bajarHorarioAPI(userId);
          // console.log("Horario obtenido:", horario);
          if (horario && !isObjectEmpty(horario)) {
            setTieneHorario(true);
            setHorarioExistente(horario);
          } else {
            setTieneHorario(false);
            setHorarioExistente(null);
          }
        } catch (error) {
          console.error("Error al obtener el horario:", error);
          alert("\nPor favor recarga la pagina o comunicate con nosotros");
        } finally {
          setCargando(false);
        }
      };

    useEffect(() => {
        fetchHorario();
    }, []);

    useEffect(() => {
        if (tieneHorario) {
            router.replace("/user/home"); 
        }
    }, [tieneHorario]);


if (cargando) return <Loading />;

  return (
    <div className='flex flex-col items-center justify-center'>
        <h2 className='my-9 font-bold text-2xl'>Por favor ingresa tu Horario antes de acceder a la pagina</h2>
        <div className='w-screen'>
            <HorarioForms
                horarioExistente={horarioExistente} 
                onClose={closeModal} 
                onRefresh={fetchHorario} 
            />
        </div>
    </div>
  )
}

export default ProtegidoSchedule
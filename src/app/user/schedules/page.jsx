"use client";
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import HorarioForms from '@/component/user/schedule/HorarioForms';
import { bajarHorario } from '@/services/bajarHorario';
import { auth } from '../../../../conexion_BD/firebase';
import HorarioVista from '@/component/user/schedule/HorarioVista';
import Loading from '@/component/loading/loading';
import { bajarHorarioAPI } from '@/services/bajarHorarioAPI';

export default function Schedules() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tieneHorario, setTieneHorario] = useState(false);
  const [horarioExistente, setHorarioExistente] = useState(null);
  const modalRef = useRef(null);
  const [modalhorarioAPI, setmodalHorarioAPI] = useState(false);
  const [tineHorarioAPI, setTieneHorarioAPI] = useState(false);
  const [horarioExistenteAPI, setHorarioExistenteAPI] = useState(null);
  const [cargando, setCargando] = useState(true);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

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
      if (horarioAPI) {
        setTieneHorarioAPI(true);
        setHorarioExistenteAPI(horarioAPI);
        // console.log("Horario obtenido API:", horarioAPI);

      } else {
        setTieneHorarioAPI(false);
        setHorarioExistenteAPI(null);
      }
    } catch (error) {
      console.error("Error al obtener el horario:", error);
    } finally {
      setCargando(false);
    }
  };

  const handlecambiarHorario = () =>
  {
    setmodalHorarioAPI(!modalhorarioAPI);
    if (modalhorarioAPI) {
      fetchHorario();
    }
  }

  useEffect(() => {
    fetchHorario();
  }, []);

  if (cargando) return <Loading />;

  return (
    <div className="p-2 w-full">
      {!tieneHorario ? (
        <div className='flex flex-col sm:flex-row m-10 items-center justify-center shadow-lg '>
          <div className='hidden sm:block w-1/4 justify-start items-center'>
            <img src="/scheadule/Horario.png" alt="empty schedule" className='w-1/2 h-auto mb-4' />
          </div>
          <div className='flex w-1/2 flex-col items-center justify-center text-2xl font-bold mb-8'>
            <h1>¡Agrega tu horario!</h1>
            <p className='text-lg flex justify-center font-normal sm:mt-0 my-5'>
              Para comenzar, crea un horario personalizado.
            </p>
            <button 
              onClick={openModal}
              className='sm:hidden block bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 transition-colors'
            >
              Agregar horario
            </button>
          </div>
          <div className='hidden sm:block relative -bottom-20 sm:-right-20 lg:-right-36 justify-end items-center'>
            <button onClick={openModal}>
              <PlusCircleIcon className='h-32 text-blue-500 hover:text-blue-700 transition-colors' />
            </button>
          </div>
        </div>
      ) : (
        <>
          {tieneHorario && tineHorarioAPI && (
            <div className='flex flex-col sm:flex-row items-center sm:justify-end justify-center sm:pr-20 pr-0'>
              <button
                onClick={handlecambiarHorario}
                className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'
              >
                {modalhorarioAPI ? 'Ver horario personalizado' : 'Ver horario de la API'}
              </button>
            </div>
          )}
          {modalhorarioAPI ? (
            // Vista del horario de la API con modalhorarioAPI true
            <HorarioVista horario={horarioExistenteAPI} onEditar={openModal} API={modalhorarioAPI}/>
          ):(
            <HorarioVista horario={horarioExistente} onEditar={openModal} API={modalhorarioAPI}/>

          )}
        </>
      )}

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            {/* PASAMOS fetchHorario y closeModal */}
            <HorarioForms 
              horarioExistente={horarioExistente} 
              onClose={closeModal} 
              onRefresh={fetchHorario} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

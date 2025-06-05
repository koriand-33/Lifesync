"use client";
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import HorarioForms from '@/component/user/schedule/HorarioForms';
import { bajarHorario } from '@/services/bajarHorario';
import { auth } from '../../../../conexion_BD/firebase';

export default function Schedules() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tieneHorario, setTieneHorario] = useState(false); // nuevo estado
  const modalRef = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    const fetchHorario = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const horario = await bajarHorario(userId);
        if (horario) setTieneHorario(true);
      } catch (error) {
        console.error("Error al obtener el horario:", error);
      }
    };

    fetchHorario();
  }, []);

  return (
    <div className="p-2 w-full">
      {/* Ficha para agregar Horario */}
      {!tieneHorario && (
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
      )}

      {/* Modal */}
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
            <HorarioForms />
          </div>
        </div>
      )}
    </div>
  );
}

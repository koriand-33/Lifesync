"use client"
import React, { useState } from 'react'
// import TemplatePaciente from '@/app/templates/TemplatePaciente'
import Image from "next/image";
import {
    PencilSquareIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import Materias from '@/component/user/profile/materias';


const user = {
  name: 'Debbie Lewis',
  handle: 'deblewis',
  email: 'debbielewis@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=320&h=320&q=80',
}

const Page = () => {
  const [profile, setProfile] = useState({
    firstName: 'Debbie',
    lastName: 'Lewis',
    birthDate: '1990-01-01',
    gender: 'Female',
    phone: '123-456-7890',
    email: 'debbielewis@example.com',
    about: '',
    password: '',
    imageUrl: user.imageUrl,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prevProfile) => ({
        ...prevProfile,
        imageUrl: reader.result,
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
      <div>
        {/* Profile Info */}
        <div className="py-6 px-4 sm:p-6 lg:pb-8">
          <div className='flex flex-col lg:flex-row items-start justify-between w-full'>
            {/* texto de profiles */}
            <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">Profile</h2>
                <p className="mt-1 text-sm text-gray-500">
                This information will be displayed publicly so be careful what you share.
                </p>
            </div>

            {/* Boton de Edicion */}
            <div>
                <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    {!isEditing ? (
                        <>
                            <PencilSquareIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Edit
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Save
                        </>
                    )}

                    
                 {/* {isEditing ? 'Save' : 'Edit'} */}
                </button>
            </div>

          </div>

          <div className="mt-6 flex flex-col lg:flex-row w-full">

            {/* imagen */}
            {/*flex-grow lg:flex-grow-0 lg:flex-shrink-0 */}
            <div className="mt-6 flex flex-col justify-center items-center lg:mt-0 lg:mr-6 w-1/3 ">
            <p className={` ${isEditing ? "block" : "hidden"} mb-5`}>Click en la imagen para cambiar la imagen</p>

                <div className='flex items-center justify-center w-full '>
                    <div className="hidden relative rounded-full overflow-hidden lg:block w-10/12">
                        <Image 
                            width={140}
                            height={40}
                            className="relative rounded-full w-full " src={profile.imageUrl} alt="" />

                        <label
                        htmlFor="desktop-user-photo"
                        className={` ${isEditing ? "block" : "hidden"} absolute inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center text-sm font-medium text-white opacity-0 hover:opacity-100 focus-within:opacity-100 `}
                        >
                        <span>Change</span>
                        <span className="sr-only"> user photo</span>
                        <input
                            type="file"
                            id="desktop-user-photo"
                            name="user-photo"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                            onChange={handleImageChange}
                        />
                        </label>
                    </div>
                </div>
              
            </div>

            {/* informacion */}
            <div className="flex-grow space-y-6 w-2/3">

              <div className='mt-6 grid grid-cols-12 gap-6'>
                {/* Nombre y apellido */}
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="first-name"
                    value={profile.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="last-name"
                    value={profile.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>

                {/* genero */}
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Genero
                  </label>
                  <input
                    type="text"
                    name="gender"
                    id="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>

                {/* rol */}
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <input
                    type="text"
                    name="role"
                    id="role"
                    value={profile.role || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>

                {/* Fecha de nacimiento, genero, telefono */}
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="text"
                    name="birthDate"
                    id="birthDate"
                    value={profile.birthDate}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefono
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>

            {/* correo */}
                <div className="col-span-12 sm:col-span-12">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>
              </div>

            {/* about */}
              <div className="col-span-12 sm:col-span-12">
                <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                  About
                </label>
                <div className="mt-1">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    value={profile.about}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* contraseña*/}
                <div className="col-span-12 sm:col-span-12">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                    </label>
                    <input
                        type="text"
                        name="password"
                        id="password"
                        value={profile.password}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                </div>
            </div>
          </div>


        </div>

        {/* Materias Info */}
        <div className='p-5'>
          <Materias/>
        </div>

      </div>
  )
}

export default Page

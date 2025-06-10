"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Settings, Edit3, Camera, Award, Activity, Users,GraduationCap } from 'lucide-react';
import {
    PencilSquareIcon,
    PaperAirplaneIcon,
    CakeIcon,
    KeyIcon,
    UserIcon,
    FireIcon,
} from '@heroicons/react/24/outline'
import { HelpCircle } from 'lucide-react'; 
import { bajarInfoPerfil } from '@/services/bajarInfoPerfil';
import Loading from '@/component/loading/loading';
import { auth } from '../../../../conexion_BD/firebase';
import { actualizarInfoPerfil } from '@/services/actualizarInfoPerfil';
import { tareasCompletada } from '@/services/tareasCompletadas';
import { calcularScore } from '@/services/calcularScore';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nombreCompleto: '',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    telefono: '',
    fotoPerfil: '',
    rachaActual: 0,
    logros: null,
    clases: null,
    fechaRegistro: null,
    fechaNacimiento: null,
    genero: '',
    descripcion: '',
    imageUrl: '',
    // password: 'ROOT1234',
    HorarioClases: null,
    location: '',
  });
  const [userInfoRef, setUserInfoRef] = useState();
  const [tareasCompletadas, setTareasCompletadas] = useState(null);
  const [score, setScore] = useState(0);

  // Lista de colores disponibles
  const colorOptions = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const user = auth.currentUser;
        if (user?.uid) {
          const datos = await bajarInfoPerfil(user.uid);
          console.log("Datos del usuario:", datos.fechaRegistro);
           const fechaNacimiento = datos.fechaNacimiento 
          ? new Date(datos.fechaNacimiento) 
          : null;
        
          setUserInfo({
            ...datos,
            fechaNacimiento,
            fechaRegistro: datos.fechaRegistro?.toDate?.() || null,
            logros: datos.logros || null, // Asegurar que logros sea null si no existe
            clases: datos.clases || null  // Asegurar que clases sea null si no existe
          });
          setUserInfoRef({
            ...datos,
            fechaNacimiento,
            fechaRegistro: datos.fecha_registro?.toDate?.() || null,
            logros: datos.logros || null, // Asegurar que logros sea null si no existe
            clases: datos.clases || null  // Asegurar que clases sea null si no existe
          });
          const tareas = await tareasCompletada(user.uid);
          setTareasCompletadas(tareas);
          const score = calcularScore(tareas);
          setScore(score);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(cargarDatos);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Datos del usuario:", userInfo);
    console.log("Referencia de datos del usuario:", userInfoRef);
    console.log("Tareas completadas:", tareasCompletadas);
  }, [userInfo]);

  const logrosUI = userInfo.logros 
    ? Object.entries(userInfo.logros).map(([id, logro]) => ({
        id,
        title: logro.nombre || "Logro sin nombre",
        time: logro.fecha?.toDate?.().toLocaleDateString() || "Sin fecha",
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        description: logro.descripcion || ""
      }))
  : [];

  const stats = [
    { 
      icon: GraduationCap, 
      label: 'Materias', 
      value: userInfo.clases ? Object.keys(userInfo.clases).length : 0 
    },
    { 
      icon: Award, 
      label: 'Score ', 
      value: score || 0 
    },
    { 
      icon: FireIcon, 
      label: 'Racha Actual', 
      value: userInfo.rachaActual || 0 
    },
  ];

const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name === "fechaNacimiento") {
    if (value) {
      // Parsea la fecha directamente como UTC (ignorando zona horaria)
      const [year, month, day] = value.split('-');
      const fecha = new Date();
      fecha.setUTCFullYear(year);
      fecha.setUTCMonth(month - 1);
      fecha.setUTCDate(day);
      fecha.setUTCHours(12, 0, 0, 0); // Fijar hora neutral
      
      setUserInfo(prev => ({ ...prev, [name]: fecha }));
    } else {
      setUserInfo(prev => ({ ...prev, [name]: null }));
    }
  } else {
    setUserInfo(prev => ({ ...prev, [name]: value }));
  }
};
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserInfo((prevProfile) => ({
        ...prevProfile,
        imageUrl: reader.result,
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

const handleSave = () => {
  const {
    nombre,
    primerApellido,
    segundoApellido,
    correo,
    telefono,
    descripcion
  } = userInfo;

  // Validar campos vacíos
  if (
    !nombre.trim() ||
    !primerApellido.trim() ||
    !segundoApellido.trim() ||
    !correo.trim() ||
    !telefono.trim()
    //|| !descripcion.trim()
  ) {
    alert("Todos los campos deben estar completos.");
    return;
  }

  // Validar teléfono con 10 dígitos numéricos
  const telefonoLimpio = telefono.replace(/\D/g, ''); // eliminar espacios o guiones
  if (telefonoLimpio.length !== 10 || !/^\d+$/.test(telefonoLimpio)) {
    alert("El número de teléfono debe tener exactamente 10 dígitos numéricos.");
    return;
  }

  // lógica de guardado 
  console.log("Guardando datos:", userInfo);
  // Verificar cambios
  if (JSON.stringify(userInfo) === JSON.stringify(userInfoRef)) {
    console.log("Sin cambios detectados");
    setIsEditing(false);
    return;
  }

  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const formData = {
    nombre: userInfo.nombre,
    primerApellido: userInfo.primerApellido,
    segundoApellido: userInfo.segundoApellido,
    correo: userInfo.correo,
    telefono: userInfo.telefono,
    descripcion: userInfo.descripcion,
    foto_perfil: userInfo.imageUrl ?? "",
    fechaNacimiento: userInfo.fechaNacimiento ,
    genero: userInfo.genero,
    location: userInfo.location,
    // password: userInfo.password,
  };

  actualizarInfoPerfil(userId, formData)
  .then(() => {
    console.log("Datos guardados exitosamente.");
    setSaved(true);
    setUserInfoRef(userInfo);
    setIsEditing(false);
    // window.location.reload();
  })
  .catch((err) => {
    console.error("Error al guardar en Firebase:", err);
  });

};



if (loading) return <div><Loading/></div>;
  if (!userInfo) return <div>Error al cargar perfil</div>

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500"></div>
          <div className="relative pb-6 ">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-20 sm:space-y-0 sm:space-x-40 ">
              {/* Avatar */}
              <div className="absolute -top-16 -right-5 w-full ">
                
                <div className='flex w-full'>
                  {/* imagen */}
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full border-4 border-white flex items-center justify-center relative">
                    {isEditing ? (
                      <>
                        <input
                          type="file"
                          id="desktop-user-photo"
                          name="user-photo"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                          onChange={handleImageChange}
                          accept="image/*"  // Acepta solo imágenes
                        />
                        {!userInfo.imageUrl ? (
                          <User className="w-16 h-16 text-white" />
                          ) : (
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                            <img
                                className="rounded-full w-full h-full object-cover"
                                src={userInfo.imageUrl}
                                alt="Profile preview"
                              />
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
                        )}
                      </>
                    ) : (
                      !userInfo.imageUrl ? (
                        <User className="w-16 h-16 text-white" />
                      ) : (
                        <img
                          className="rounded-full w-full h-full object-cover"
                          src={userInfo.imageUrl}
                          alt="Profile image"
                        />
                      )
                    )}
                  </div>

                  <button
                    onClick={() => document.getElementById('desktop-user-photo').click()}
                    className= {` ${isEditing ? "block" : "hidden"} relative top-24 right-9 h-9 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50 `}>
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Boton de editar */}
                  <div className='flex-1 flex justify-end items-center mr-10'>
                    <button 
                      onClick={handleEdit}
                      className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
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
                    </button>
                  </div>

                </div> 
                
              </div>
              
              {/* User Info Name*/}
              <div className="flex-1 min-w-0 ml-5 sm:ml-0 w-full ">
                <div className="flex flex-col items-center justify-between">
                  
                  <div className="w-full mx-5 pt-3">
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">
                      {userInfo.nombreCompleto}
                    </h1>
                  </div>

                </div>
              </div>

            </div>

            {/* Descripcion del usuario */}
            <div className=' w-full mt-3 relative -bottom-5 mb-5 px-5'>
              {isEditing ? (
                <textarea
                  name="descripcion"
                  id="descripcion"
                  value={userInfo.descripcion}
                  onChange={handleChange}
                  className=" w-full block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm z-10 relative"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600 mt-3 whitespace-pre-line">
                  {userInfo.descripcion || "Cuéntanos más sobre ti..."}
                </p>              
              )}
            </div>


          </div>
        </div>

        {/* edicion de nombre */}
        <div className={` ${!isEditing? "hidden " : "block" }bg-white rounded-xl shadow-lg p-6 mb-8 `}>
          <div className="flex items-center space-x-3">
              <div className='w-full'>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <input
                    name="nombre"
                    id="nombre"
                    value={userInfo.nombre}
                    onChange={handleChange}
                    className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                  />
              </div>
              <div className='w-full'>
                  <p className="text-sm text-gray-600">Primer Apellido</p>
                  <input
                    name="primerApellido"
                    id="primerApellido"
                    value={userInfo.primerApellido}
                    onChange={handleChange}
                    className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                  />
              </div>
              <div className='w-full'>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <input
                    name="segundoApellido"
                    id="segundoApellido"
                    value={userInfo.segundoApellido}
                    onChange={handleChange}
                    className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                  />
              </div>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <stat.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4 relative">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>

                    {stat.label.trim() === "Score" && (
                      <div className="relative group">
                        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-max bg-black text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          (dificultad × duración) × 10 por tarea
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
              {/* <Settings className="w-5 h-5 text-gray-400" /> */}
            </div>
            
            {/* correo */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className='w-full'>
                  <p className="text-sm text-gray-600">Email</p>
                  {/* <p className="text-gray-900">{userInfo.email}</p> */}
                  {isEditing ? (
                    <input
                      name="correo"
                      id="correo"
                      value={userInfo.correo}
                      onChange={handleChange}
                      className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.correo}</p>
                  )}
                </div>
              </div>

              {/* Contraseña */}
              {/* <div className="flex items-center space-x-3">
                <KeyIcon className="w-5 h-5 text-gray-400" />
                <div className='w-full'>
                  <p className="text-sm text-gray-600">Contraseña</p>
                  {isEditing ? (
                    <input
                      name="password"
                      id="password"
                      value={userInfo.password}
                      onChange={handleChange}
                      className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.password ? '*****' : 'No hay contraseña'}</p>
                  )}
                </div>
              </div> */}
              
              {/* Telefono */}
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className='w-full'>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telefono"
                      id="telefono"
                      className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                      // placeholder="10 dígitos"
                      value={userInfo.telefono}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.telefono}</p>
                  )}
                </div>
              </div>
              
              {/* ubicacion */}
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className='w-full'>
                  <p className="text-sm text-gray-600">Ubicación</p>
                  {isEditing ? (
                    <input
                      name="location"
                      id="location"
                      value={userInfo.location}
                      onChange={handleChange}
                      className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.location}</p>
                  )}
                </div>
              </div>
              
              {/* Calendario */}
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className='w-full'>
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="text-gray-900">
                    {userInfo.fechaRegistro
                    ? userInfo.fechaRegistro.toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                      })
                    : "Fecha no disponible"}
                    {/* {userInfo.fechaRegistro?.toLocaleDateString?.() || 'Sin fecha'} */}

                  </p>
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="flex items-center space-x-3">
                <CakeIcon className="w-5 h-5 text-gray-400" />
                <div className='w-full'>
                  <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                  {isEditing ? (
                     <input
                        type="date"
                        name="fechaNacimiento"
                        className="block border w-full border-gray-300 rounded-md shadow-sm py-2 px-3 h-auto"
                        value={
                          userInfo.fechaNacimiento
                            ? // Formato YYYY-MM-DD sin conversiones de tiempo
                              `${userInfo.fechaNacimiento.getFullYear()}-${String(userInfo.fechaNacimiento.getMonth() + 1).padStart(2, '0')}-${String(userInfo.fechaNacimiento.getDate()).padStart(2, '0')}`
                            : ""
                        }
                        onChange={handleChange}
                        min="1900-01-01"
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                  ) : (
                    <p className="text-gray-900">
                      {userInfo.fechaNacimiento
                        ? userInfo.fechaNacimiento.toLocaleDateString("es-MX")
                        : "Sin fecha"}
                    </p>
                  )}
                </div>
              </div>

              {/* Genero */}
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div className='w-full'>
                  <p className="text-sm text-gray-600">Género</p>
                  {isEditing ? (
                    <select
                      name="genero"
                      id="genero"
                      className="w-full p-2 rounded bg- border border-text text-text mb-4"
                      value={userInfo.genero}
                      onChange={handleChange}
                    >
                      <option value="" disabled >Selecciona tu sexo</option>
                      <option value="femenino">Femenino</option>
                      <option value="masculino">Masculino</option>
                      <option value="otro">Otro</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{userInfo.genero}</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>

            <div className={` ${!logrosUI.length === 0 ? "flex items-center justify-center" : ""} h-5/6 `}>
              {logrosUI.length > 0 ? (
                <div className="space-y-4">
                  {logrosUI.map(logros => (
                    <div key={logros.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 ${logros.color} rounded-full mt-2`}></div>
                      <div>
                        <p className="text-gray-900">{logros.title}</p>
                        <p className="text-sm text-gray-500">{logros.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <img src="/Profile/noActividad.png" alt="No hay actividad" />
                  <p className="text-gray-500 text-center mt-4">No hay actividad reciente</p>
                </>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
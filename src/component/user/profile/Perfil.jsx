import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Settings, Edit3, Camera, Award, Activity, Users } from 'lucide-react';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+52 55 1234 5678',
    location: 'Ciudad de México, México',
    joinDate: 'Marzo 2023',
    bio: 'Apasionada por el crecimiento personal y el bienestar. Me encanta explorar nuevas experiencias y aprender algo nuevo cada día.'
  });

  const stats = [
    { icon: Activity, label: 'Actividades', value: '42' },
    { icon: Award, label: 'Logros', value: '15' },
    { icon: Users, label: 'Conexiones', value: '128' }
  ];

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Life</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-700">Inicio</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Datos</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Descubre Más</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Reseñas</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Preguntas</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Contacto</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">Registro</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Acceso
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative -mt-16">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
                <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{userInfo.name}</h1>
                    <p className="text-gray-600">{userInfo.bio}</p>
                  </div>
                  <button 
                    onClick={handleEdit}
                    className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditing ? 'Guardar' : 'Editar'}</span>
                  </button>
                </div>
              </div>
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
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
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{userInfo.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-gray-900">{userInfo.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ubicación</p>
                  <p className="text-gray-900">{userInfo.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="text-gray-900">{userInfo.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900">Completaste el módulo "Gestión del Tiempo"</p>
                  <p className="text-sm text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900">Ganaste el logro "Constancia"</p>
                  <p className="text-sm text-gray-500">Ayer</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900">Te uniste a la comunidad "Bienestar Digital"</p>
                  <p className="text-sm text-gray-500">Hace 3 días</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900">Actualizaste tu perfil</p>
                  <p className="text-sm text-gray-500">Hace 1 semana</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Comenzar Nueva Actividad
          </button>
          <button className="flex-1 bg-purple-100 text-purple-700 py-3 px-6 rounded-lg hover:bg-purple-200 transition-colors font-medium">
            Ver Mi Progreso
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';

// type LogoutButtonProps = {
//   className?: string;
//   iconClassName?: string;
//   text?: string;
//   showText?: boolean;
//   variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
// };

export default function LogoutButton({
  className = '',
  iconClassName = 'h-5 w-5',
  text = 'Cerrar sesión',
  showText = true,
  variant = 'primary',
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // const variantClasses = {
  //   primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  //   secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  //   danger: 'bg-red-600 hover:bg-red-700 text-white',
  //   ghost: 'hover:bg-gray-100 text-gray-700',
  // };

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary text-background',
    secondary: 'bg-secondary hover:bg-secondary text-background',
    danger: 'bg-danger hover:bg-red-700 text-background',
    ghost: 'bg-detail hover:bg-danger text-text hover:text-white',
  };
  

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        // router.push('/login');
        router.push('/session/Acceso');
        router.refresh();
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        cursor-pointer
        ${className}
        ${variantClasses[variant]}
        flex items-center gap-2 rounded-md px-4 py-2
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <ArrowRightCircleIcon 
        className={`${iconClassName} ${isLoading ? 'animate-pulse' : ''}`}
      />
      
      {showText && (
        <span className="whitespace-nowrap">
          {isLoading ? 'Cerrando...' : text}
        </span>
      )}
    </button>
  );
}
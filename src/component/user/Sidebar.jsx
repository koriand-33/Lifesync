"use client";

import LogoutButton from "./Button_Logout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,

} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const router = useRouter()

  const menuItems = [
    { name: "Home", icon: <HomeIcon className="h-5 w-5" />, path:"/user/home" },
    { name: "Calendario", icon: <CalendarIcon className="h-5 w-5" />, path:"/user/calendario" },
    { name: "Mis Horarios", icon: <ClockIcon className="h-5 w-5" />, path:"/user/scheadule" },
    // { name: "Notificaciones", icon: <BellIcon className="h-5 w-5" />, path:"/Usuario/notificaciones" },
  ];

  const bottomItems = [
    // { name: "Ajustes y ayuda", icon: <CogIcon className="h-5 w-5" />, path:"/Usuario/ajustes" },
    { name: "Perfil", icon: <UserIcon className="h-5 w-5" />, path:"/user/profile" },
  ];

  return (
    <div className={`flex h-screen bg-details text-text transition-all duration-300 ${open ? "w-64" : "w-20"}`}>
      <div className="flex flex-col w-full">
        {/* Botón de toggle */}
        <div className="flex items-center justify-between p-4 ">
          {open && <h1 className="text-xl font-bold">Menu</h1>}
          <button 
            onClick={() => setOpen(!open)}
            className="p-2 cursor-pointer rounded-lg hover:bg-text hover:text-background "
          >
            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>

        {/* Menú principal */}
        <nav className="flex-1 p-2 ">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name} className="relative group hover:text-details">
                <button
                  onClick={() => {
                    setActiveItem(item.name);
                    router.push(item.path);
                  }}
                  className={`flex items-center justify-start cursor-pointer w-full p-3 rounded-lg transition-colors hover:bg-text hover:text-background ${
                    activeItem === item.name 
                      ? "bg-primary text-white" 
                      : "hover:bg-gray-200"
                  } ${!open ? "justify-center" : "justify-start"}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {open && <span className="ml-3">{item.name}</span>}
                </button>
                
                {/* Tooltip para menú cerrado */}
                {!open && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block">
                    <div className="relative">
                      <div className="bg-details text-text text-sm px-3 py-2 rounded-md whitespace-nowrap">
                        {item.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-primary transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                )}
                {/* {!open && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg whitespace-nowrap">
                {item.name}
              </div>
            )} */}
              </li>
            ))}
          </ul>
        </nav>

        {/* Menú inferior */}
        <div className="p-2">
          <ul className="space-y-2">
            {bottomItems.map((item) => (
              <li key={item.name} className="relative group hover:text-details">
                <button
                  onClick={() => {
                    setActiveItem(item.name);
                    router.push(item.path); 
                  }}
                  className={`flex items-center cursor-pointer w-full p-3 rounded-lg transition-colors hover:bg-text hover:text-background
                  ${
                    activeItem === item.name 
                      ? "bg-primary text-white" 
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  } ${!open ? "justify-center" : "justify-start"}
                `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {open && <span className="ml-3">{item.name}</span>}
                </button>
                
                {/* Tooltip para menú cerrado */}
                {!open && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block">
                    <div className="relative">
                      <div className="bg-details text-text text-sm px-3 py-2 rounded-md whitespace-nowrap">
                        {item.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-primary transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
            
            {/* Logout Button */}
            <li className="relative">
              <div className={`group ${!open ? "flex justify-center" : ""}`}>
                <LogoutButton
                  variant="ghost"
                  className={`w-full hover:text-white ${!open ? "justify-center" : "justify-start"}`}
                  showText={open}
                />
                {/* Tooltip para menú cerrado */}
                {!open && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block">
                    <div className="relative">
                      <div className="bg-details text-text text-sm px-3 py-2 rounded-md whitespace-nowrap">
                        Cerrar sesion
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-primary transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
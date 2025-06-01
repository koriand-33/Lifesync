"use client";
import React, { useState } from 'react';
import { Disclosure, Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import {
    CheckBadgeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    StarIcon,
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    ArchiveBoxXMarkIcon,
    ArrowLeftOnRectangleIcon,
    BuildingOffice2Icon,
    EnvelopeIcon,
    FlagIcon,
    FolderIcon,
    CalendarDaysIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChartPieIcon,
} from "@heroicons/react/24/outline";
import Salir from '../user/salir/page';
import Borrar from '../user/delete/page';


const navigation = [
    // {
    //     name: 'Progreso',
    //     description: 'Revisa el seguimiento de tu progreso en las terapias.',
    //     href: '/user/inicio/paciente/progreso',
    //     icon: FlagIcon,
    // },
    // {
    //     name: 'Expediente',
    //     description: 'Consulta tu expediente clínico.',
    //     href: '/user/inicio/paciente/expediente',
    //     icon: FolderIcon,
    // },
    // {
    //     name: 'Citas',
    //     description: 'Agenda, modifica o cancela tus citas con terapeutas.',
    //     href: '/user/inicio/paciente/citas',
    //     icon: CalendarDaysIcon,
    // },
    // {
    //     name: 'Chats',
    //     description: 'Comunícate con tu terapeuta a través del chat.',
    //     href: '/user/inicio/paciente/chats',
    //     icon: ChatBubbleOvalLeftEllipsisIcon,
    // },
    // {
    //     name: 'Estadísticas del Sitio',
    //     description: 'Consulta estadísticas y datos relevantes del sitio.',
    //     href: '#',
    //     icon: ChartPieIcon,
    // },
];

const minmenu = [
    // {
    //     name: 'Perfil',
    //     description: 'Revisa y actualiza tus datos personales para una mejor experiencia.',
    //     href: '/user/inicio/paciente/perfil',
    //     icon: UserCircleIcon,
    // },
    {
        name: 'Cerrar Sesión',
        description: 'Cierra tu sesión de manera segura.',
        href: '#',
        icon: ArrowLeftOnRectangleIcon,
        action: () => {},
    },
    // {
    //     name: 'Eliminar Cuenta',
    //     description: 'Elimina tu cuenta permanentemente.',
    //     href: '#',
    //     icon: ArchiveBoxXMarkIcon,
    //     action: () => {},
    // },
    // {
    //     name: 'Ayuda',
    //     description: 'Encuentra respuestas a tus preguntas y obtén soporte.',
    //     href: '#',
    //     icon: BuildingOffice2Icon,
    // },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const TemplateAdmin = ({ children }) => {
    const [showSalir, setShowSalir] = useState(false);
    const [showBorrar, setShowBorrar] = useState(false);

    const handleLogout = () => {
        setShowSalir(true);
    };

    const handleDeleteAccount = () => {
        setShowBorrar(true); // Muestra el componente Borrar
    };

    const handleCloseSalir = () => {
        setShowSalir(false);
    };

    const handleCloseBorrar = () => {
        setShowBorrar(false); // Cierra el componente Borrar
    };

    return (
        <>
            <div className="fixed top-0 left-0 w-1/2 h-full bg-white" />
            <div className="fixed top-0 right-0 w-full h-full overflow-y-auto">
                <div className="relative min-h-full flex flex-col">
                    <Disclosure as="nav" className="flex-shrink-0 bg-primary">
                        {({ open }) => (
                            <>
                                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                                    <div className="relative flex items-center justify-between h-16">
                                        <div className="flex items-center px-2 lg:px-0 xl:w-64">
                                            <a href="/user/inicio/paciente" className="cursor-pointer">
                                                <Image
                                                    width={240}
                                                    height={40}
                                                    src="/logo2.png"
                                                    alt="logo of sitemark"
                                                />
                                            </a>
                                        </div>

                                        <div className="flex lg:hidden">
                                            <Disclosure.Button className="bg-primary inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white">
                                                <span className="sr-only">Open main menu</span>
                                                {open ? (
                                                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                                ) : (
                                                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                                )}
                                            </Disclosure.Button>
                                        </div>

                                        <div className="hidden lg:block lg:w-80">
                                            <div className="flex items-center justify-end">
                                                <Menu as="div" className="ml-4 relative flex-shrink-0">
                                                    <div>
                                                        <Menu.Button className="bg-white flex text-sm rounded-full text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white">
                                                            <span className="sr-only">Open user menu</span>
                                                            <Image
                                                                width={60}
                                                                height={60}
                                                                className="h-8 w-8 rounded-full"
                                                                src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80"
                                                                alt=""
                                                            />
                                                        </Menu.Button>
                                                    </div>
                                                    <Transition
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="transform opacity-0 scale-95"
                                                    >
                                                        <Menu.Items className="absolute z-10 right-0 transform mt-3 px-2 w-screen max-w-sm sm:px-0">
                                                            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                                                                <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                                                    {minmenu.map((item) => (
                                                                        <a
                                                                            key={item.name}
                                                                            href={item.href}
                                                                            onClick={item.name === 'Cerrar Sesión' ? handleLogout : item.name === 'Eliminar Cuenta' ? handleDeleteAccount : null}
                                                                            className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                                                                        >
                                                                            <item.icon className="flex-shrink-0 h-6 w-6 text-secondhover" aria-hidden="true" />
                                                                            <div className="ml-4">
                                                                                <p className="text-base font-medium text-gray-900">{item.name}</p>
                                                                                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </Menu.Items>
                                                    </Transition>
                                                </Menu>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Disclosure.Panel className="lg:hidden">
                                    <div className="px-2 pt-2 pb-3 space-y-1">
                                        {navigation.map((item) => (
                                            <Disclosure.Button
                                                key={item.name}
                                                as="a"
                                                href={item.href}
                                                className={classNames(
                                                    item.current
                                                        ? "text-white bg-indigo-800"
                                                        : "text-indigo-200 hover:text-primary hover:bg-white",
                                                    "block px-3 py-2 rounded-md text-base font-medium"
                                                )}
                                                aria-current={item.current ? "page" : undefined}
                                            >
                                                {item.name}
                                            </Disclosure.Button>
                                        ))}
                                    </div>
                                    <div className="pt-4 pb-3 border-t border-primary">
                                        <div className="px-2 space-y-1">
                                            {minmenu.map((item) => (
                                                <Disclosure.Button
                                                    key={item.name}
                                                    as="a"
                                                    href={item.href}
                                                    onClick={item.name === 'Cerrar Sesión' ? handleLogout : null}
                                                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-primary hover:bg-white"
                                                >
                                                    {item.name}
                                                </Disclosure.Button>
                                            ))}
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                        {/*
                        <div className="px-6 col-start-1 col-span-2 hidden lg:block">
                            <div className="w-full border-r-2 min-h-screen">
                                <div className="pl-4 pr-6 py-6 sm:pl-6 lg:pl-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 space-y-8">
                                            <div className="flex flex-col gap-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <img
                                                            className="h-12 w-12 rounded-full"
                                                            src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80"
                                                            alt=""
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-gray-900">Debbie Lewis</div>
                                                        <a href="#" className="group flex items-center space-x-2.5">
                                                            <EnvelopeIcon className="h-6 w-6 text-gray-500" />
                                                            <span className="text-sm text-gray-500 group-hover:text-gray-900 font-medium">
                                                                debbielewis
                                                            </span>
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <CheckBadgeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                    <span className="text-sm text-gray-500 font-medium">Pro Member</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    {navigation.map((item) => (
                                                        <a
                                                            key={item.name}
                                                            href={item.href}
                                                            className="mb-3 flex items-center p-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryhover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                                        >
                                                            <item.icon className="h-6 w-6 text-white mr-4" aria-hidden="true" />
                                                            <p className="text-base font-medium text-white hover:text-gray-200">{item.name}</p>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>*/}
                        <div className="col-start-3 col-span-full px-7 pt-5">
                            {showSalir && <Salir onClose={handleCloseSalir} />}
                            {showBorrar && <Borrar onClose={handleCloseBorrar} />}
                            {children}
                        </div>
                    </div> 
                </div>
        </>
    );
};

export default TemplateAdmin;

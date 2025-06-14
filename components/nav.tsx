'use client'
import Image from "next/image"
import kirat from "@/public/kirat.png"
import { useState, useEffect, useRef } from "react"
import Button from "./Button"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SunIcon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import jwt from 'jsonwebtoken';

interface DecodedToken {
    id: number;
    role: string;
    exp: number;
}

export default function Nav() {
    const router = useRouter()
    const [isNavOpen, setIsNavOpen] = useState<boolean>(false)
    const [auth, setAuth] = useState<boolean>(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token')
            if (token) {
                setAuth(true)
                try {
                    const decoded = jwt.decode(token) as DecodedToken;
                    if (decoded && decoded.role === 'ADMIN') {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("Failed to decode token:", error);
                    setIsAdmin(false);
                }
            } else {
                setAuth(false)
                setIsAdmin(false);
            }
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        setAuth(false)
        setIsAdmin(false);
        router.push('/signin')
    }

    const navOpen = () => {
        setIsNavOpen(!isNavOpen)
    }

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen)
    }

    const menuVariants = {
        hidden: { opacity: 0, y: -20, height: 0 },
        visible: { opacity: 1, y: 0, height: "auto" },
        exit: { opacity: 0, y: -20, height: 0 },
    }

    const userMenuVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -10 },
    }

    return <div className="w-screen py-3 border-b-1 border-slate-200 bg-[#f9f9fd] z-[999] top-0 sticky px-5">
        <div className="flex justify-between items-center">
            <div className="text-2xl font-bold tracking-tighter flex gap-1 items-center cursor-pointer" onClick={() => router.push('/')}>
                <Image src={kirat} alt="Kirat" className="h-10 w-10" />
                <p className="devs text-2xl font-bold">100xDevs</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="sm:hidden">
                    <svg onClick={navOpen} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="26" height="26" viewBox="0 0 50 50" className="cursor-pointer">
                        <path d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"></path>
                    </svg>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                    <div className="relative flex items-center bg-gray-100 rounded-full px-3 py-1">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search Anything"
                            className="ml-2 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                        />
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none">
                        <SunIcon className="h-6 w-6 text-gray-700" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none">
                        <BellIcon className="h-6 w-6 text-gray-700" />
                    </button>
                    {auth && (
                        <Link href="/courses" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                            Courses
                        </Link>
                    )}
                    {auth && isAdmin && (
                        <Link href="/admin" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                            Admin
                        </Link>
                    )}
                    {auth ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        variants={userMenuVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    >
                                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}>
                                            My Courses
                                        </Link>
                                        <button
                                            onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button text="Login" link="/signin" type="secondary" className="col-span-1"/>
                            <Button text="Join Now" link='/signup' type="primary" className='col-span-2'/>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <AnimatePresence>
            {isNavOpen && (
                <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`
                        absolute top-full left-0 w-full bg-[#f9f9fd] border-b border-slate-200
                        overflow-hidden py-2 sm:hidden
                    `}
                >
                    <div className="pt-4 px-5 pb-2">
                        {auth && isAdmin && (
                            <Link href="/admin" className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-left mb-2" onClick={navOpen}>
                                Admin
                            </Link>
                        )}
                        {auth && (
                            <Link href="/courses" className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-left mb-2" onClick={navOpen}>
                                Courses
                            </Link>
                        )}
                        {auth ? (
                            <>
                                <Link href="/dashboard" className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-left mb-2" onClick={navOpen}>
                                    My Courses
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-3 gap-1">
                                <Button text="Login" link="/signin" type="secondary" className="col-span-1"/>
                                <Button text="Join Now" link='/signup' type="primary" className='col-span-2'/>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
}
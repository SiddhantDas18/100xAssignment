'use client'
import Image from "next/image"
import kirat from "@/public/kirat.png"
import { useState } from "react"
import Button from "./Button"
import { motion, AnimatePresence } from "framer-motion"

export default function Nav() {
    const [isNavOpen, setIsNavOpen] = useState<boolean>(false)

    const navOpen = () => {
        setIsNavOpen(!isNavOpen)
        console.log(isNavOpen)
    }

    const menuVariants = {
        hidden: { opacity: 0, y: -20, height: 0 },
        visible: { opacity: 1, y: 0, height: "auto" },
        exit: { opacity: 0, y: -20, height: 0 },
    };

    return <div className="w-screen py-3 border-b-1 border-slate-200 px-5 bg-[#f9f9fd] z-[999] top-0 sticky relative sm:px-5">
        <div className="flex justify-between items-center">
            <div className="text-2xl font-bold tracking-tighter flex gap-1 items-center">
                <Image src={kirat} alt="Kirat" className="h-10 w-10" />
                <p className="devs text-2xl">100xDevs</p>
            </div>

            <div>
                <div className="sm:hidden">
                    <svg onClick={navOpen} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="26" height="26" viewBox="0 0 50 50">
                        <path d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"></path>
                    </svg>
                </div>

                <div className="hidden sm:block">
                <div className="flex gap-2">
                        <Button text="Login" link="/login" type="secondary" className="col-span-1"/>
                        <Button text="Join Now" link="/signup" type="primary" className='col-span-2'/>
                    </div>
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
                    <div className="pt-4 px-5 grid grid-cols-3 gap-1">
                        <Button text="Login" link="/login" type="secondary" className="col-span-1"/>
                        <Button text="Join Now" link="/signup" type="primary" className='col-span-2'/>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
}
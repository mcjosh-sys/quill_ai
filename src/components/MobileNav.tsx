"use client"
import { ArrowRight, Gem, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Icons } from "./Icons"

interface MobileNavProps {
    isAuth: boolean
    email: string | undefined
    name: string
    imageUrl: string
    isSubscribed: boolean
}

const MobileNav = ({ isAuth, email, name, imageUrl, isSubscribed }: MobileNavProps) => {

    const [isOpen, setOpen] = useState<boolean>(false)

    const toggleOpen = () => setOpen(prev => !prev)

    const pathname = usePathname()

    const closeCurrent = (href: string) => {
        if(pathname === href) toggleOpen()
    }

    useEffect(() => {
        if(isOpen) toggleOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[pathname])

    return (
        <div className="sm:hidden transition-all">
            {isOpen ? (
                <X onClick={toggleOpen}
                    className="relative z-50 h-5 w-5 text-zinc-700 animate-in" />
            ) : (
                <Menu
                onClick={toggleOpen}
                    className="relative z-50 h-5 w-5 text-zinc-700 animate-out" />
            )}

            {
                isOpen ? (
                    <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
                        <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
                            {!isAuth ? (
                                <>
                                    <li>
                                        <Link onClick={() => {
                                            closeCurrent('/sign-up')
                                        }} href='/sign-up' className="flex items-center w-full">
                                            Get started
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </li>

                                    <li className="my-3 h-px w-full bg-gray-300" />

                                    <li>
                                        <Link onClick={() => {
                                            closeCurrent('/sign-in')
                                        }} href='/sign-in' className="flex items-center w-full">
                                            Sign in
                                        </Link>
                                    </li>

                                    <li className="my-3 h-px w-full bg-gray-300" />

                                    <li>
                                        <Link onClick={() => {
                                            closeCurrent('/pricing')
                                        }} href='/pricing' className="flex items-center w-full">
                                            Pricing
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                    <>
                                        <li>
                                            <div className="flex items-center rounded-full h-10 w-10 aspect-square bg-slate-400">
                                                <Avatar className="relative h-10 w-10">
                                                    {imageUrl ? (<div className="relative aspect-square h-full w-full">
                                                        <Image fill src={imageUrl} alt="profile picture" referrerPolicy="no-referrer" />
                                                    </div>) : <AvatarFallback>
                                                        <span className="sr-only">{name}</span>
                                                        <Icons.user className="h-8 w-8 text-zinc-900" />
                                                    </AvatarFallback>}
                                                </Avatar>
                                                <div className="flex items-center justify-start gap-2 p-2">
                                                    <div className="flex flex-col space-y-0.5 leading-none">
                                                        {name && <p className="font-medium text-sm text-black">{name}</p>}
                                                        {email && (
                                                            <p className="w-[200px] truncate text-xs text-zinc-700">{email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                        <li className="my-3 h-px w-full bg-gray-300" />
                                        <li>
                                            <Link onClick={() => {
                                                closeCurrent('/dashboard')
                                            }} href='/dashboard' className="flex items-center w-full ">
                                                Dashboard
                                            </Link>
                                        </li>

                                        <li className="my-3 h-px w-full bg-gray-300" />

                                        <li>{isSubscribed ? (
                                            <Link href='/dashboard/billing'>Manage Subscription</Link>
                                        ) : (
                                            <Link href='/pricing' className="flex items-center">Upgrade <Gem className="text-blue-600 h-4 w-4 ml-1.5" /></Link>
                                        )}</li>
                                        <li className="my-3 h-px w-full bg-gray-300" />
                                        <li>
                                            <Link onClick={() => {
                                                closeCurrent('/sign-out')
                                            }} href='/sign-out' className="flex items-center w-full ">
                                                Sign out
                                            </Link>
                                        </li>
                                    </> 
                          )}
                        </ul>
                    </div>
                ) : null
            }
        </div>
    )
}

export default MobileNav
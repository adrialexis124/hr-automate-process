"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Users, FileText, CheckSquare, MessageSquare, Settings, Menu, X } from "lucide-react"

// Simulación del rol del usuario (reemplázalo con tu lógica real)
const userRole = "recursoshumanos" // Cambia esto dinámicamente según el usuario

const menuItems = [
  { icon: Home, name: "Dashboard", href: "/" },
  { icon: Users, name: "Requisiciones", href: "/requisiciones", roles: ["admin"] }, // Solo admin
  { icon: FileText, name: "Candidatos", href: "/candidatos" },
  { icon: CheckSquare, name: "Evaluaciones", href: "/evaluaciones" },
  { icon: MessageSquare, name: "Entrevistas", href: "/entrevistas" },
  { icon: Settings, name: "Configuración", href: "/configuracion" },
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  return (
    <>
      <motion.div
        className={`bg-card text-card-foreground h-screen ${
          isOpen ? "w-64" : "w-20"
        } transition-all duration-300 ease-in-out relative`}
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
      >
        <div className="p-4">
          <h1 className={`text-2xl font-bold ${isOpen ? "block" : "hidden"}`}>RecruTech</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute top-4 right-4 p-2 rounded-full bg-primary text-primary-foreground"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="mt-8">
          {menuItems
            .filter((item) => !item.roles || item.roles.includes(userRole)) // Filtra según el rol
            .map((item) => (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`flex items-center px-4 py-3 ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  } transition-colors duration-200`}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={24} className="mr-4" />
                  {isOpen && <span>{item.name}</span>}
                </motion.div>
              </Link>
            ))}
        </nav>
      </motion.div>
    </>
  )
}

export default Sidebar

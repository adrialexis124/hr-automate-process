"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, FileText, ClipboardList, Users, Layers, BarChart, LayoutDashboard, Menu, X } from "lucide-react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";

const Sidebar = () => {
  const [userGroup, setUserGroup] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { signOut } = useAuthenticator();

  useEffect(() => {
    async function fetchUserGroup() {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.payload;
  
        const groups = idToken?.["cognito:groups"];
        const group = Array.isArray(groups) ? String(groups[0]) : null; // Convertir a string
  
        console.log("Grupo del usuario:", group);
        setUserGroup(group);
      } catch (error) {
        console.error("Error obteniendo el grupo del usuario:", error);
      }
    }
  
    fetchUserGroup();
  }, []);

  // 📌 Definir el tipo de `menuItems`
  let menuItems: Array<{ icon: React.ElementType; name: string; href: string }> = [];

  if (userGroup === "solicitantes") {
    menuItems = [
      { icon: LayoutDashboard, name: "Dashboard", href: "/" },
      { icon: FileText, name: "Requisiciones", href: "/requisiciones" },
      { icon: ClipboardList, name: "Etapa 2", href: "/requisiciones" },
      { icon: Layers, name: "Etapa 3", href: "/requisiciones" },
    ];
  } else if (userGroup === "rrhh") {
    menuItems = [
      { icon: LayoutDashboard, name: "Dashboard", href: "/" },
      { icon: Users, name: "Solicitudes", href: "/solicitudes" },
      { icon: FileText, name: "Publicación Oferta", href: "/publicacion" },
      { icon: BarChart, name: "Generar Reporte", href: "/reporte" },
    ];
  } else if (userGroup === "psicologia") {
    menuItems = [
      { icon: LayoutDashboard, name: "Dashboard", href: "/" },
      { icon: ClipboardList, name: "Pruebas Psicotécnicas", href: "/pruebas" },
      { icon: BarChart, name: "Reporte", href: "/reporte" },
    ];
  }

  return (
    <>
      <motion.div
        className={`bg-card text-card-foreground h-screen ${isOpen ? "w-64" : "w-20"} transition-all duration-300 ease-in-out relative`}
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
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <motion.div
                className={`flex items-center px-4 py-3 ${
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                } transition-colors duration-200`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={24} className="mr-4" />
                {isOpen && <span>{item.name}</span>}
              </motion.div>
            </Link>
          ))}
          <br />
          <button onClick={signOut}>Sign out</button>
        </nav>
      </motion.div>
    </>
  );
};

export default Sidebar;
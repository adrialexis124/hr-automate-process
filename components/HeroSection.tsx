"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

export default function HeroSection() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const marquee = marqueeRef.current
    if (marquee) {
      const marqueeAnimation = marquee.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(-100%)" }],
        {
          duration: 20000,
          iterations: Number.POSITIVE_INFINITY,
        },
      )
      return () => marqueeAnimation.cancel()
    }
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-bg.jpg')",
            backgroundAttachment: "fixed",
          }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />
      </div>
      <div className="relative z-10 text-center">
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4 glitch-effect"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Proceso de Selección
        </motion.h1>
        <div className="overflow-hidden mb-8">
          <div ref={marqueeRef} className="whitespace-nowrap">
            Optimizando la búsqueda de talento • Transformando carreras • Construyendo equipos excepcionales
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" variant="default">
            Iniciar Proceso
          </Button>
        </motion.div>
      </div>
    </section>
  )
}


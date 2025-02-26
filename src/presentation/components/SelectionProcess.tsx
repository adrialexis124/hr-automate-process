"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"

const steps = [
  { title: "Requisición del Personal", icon: "📋" },
  { title: "Publicación de la Vacante", icon: "📢" },
  { title: "Evaluación de Candidatos", icon: "📊" },
  { title: "Entrevistas y Selección", icon: "🤝" },
  { title: "Notificación al Candidato", icon: "📩" },
]

export default function SelectionProcess() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Proceso de Selección</h2>
        <div className="relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="mb-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-2">{step.icon}</span>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Descripción detallada del paso {index + 1} del proceso de selección.</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <div className="absolute left-8 top-0 h-full w-0.5 bg-primary" />
        </div>
      </div>
    </section>
  )
}


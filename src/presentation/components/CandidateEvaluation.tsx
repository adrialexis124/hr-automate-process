"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"

const evaluationSteps = [
  { title: "Pruebas psicotécnicas", icon: "🧠" },
  { title: "Entrevista con Psicólogo", icon: "👥" },
  { title: "Entrevista con Jefe Inmediato", icon: "👔" },
  { title: "Entrevista con Director de RRHH", icon: "🤝" },
]

export default function CandidateEvaluation() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Evaluación de Candidatos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {evaluationSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-2">{step.icon}</span>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Descripción detallada del paso de evaluación {index + 1}.</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


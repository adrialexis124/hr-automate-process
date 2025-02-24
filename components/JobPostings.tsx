"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const jobs = [
  { title: "Desarrollador Frontend", category: "Tecnología", salary: "$50,000 - $70,000" },
  { title: "Gerente de Marketing", category: "Marketing", salary: "$60,000 - $80,000" },
  { title: "Analista Financiero", category: "Finanzas", salary: "$55,000 - $75,000" },
]

export default function JobPostings() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Vacantes Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Categoría: {job.category}</p>
                  <p>Salario: {job.salary}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Postularse</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/presentation/components/ui/select"

export default function Requisiciones() {
  const [requisiciones, setRequisiciones] = useState([
    { id: 1, cargo: "Desarrollador Frontend", area: "Tecnología", estado: "En revisión" },
    { id: 2, cargo: "Analista de Marketing", area: "Marketing", estado: "Aprobada" },
    { id: 3, cargo: "Gerente de Ventas", area: "Ventas", estado: "Pendiente" },
  ])

  return (
    <div className="space-y-8">
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Gestión de Requisiciones
      </motion.h1>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Requisición</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" placeholder="Nombre del cargo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Input id="area" placeholder="Área solicitante" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="funciones">Funciones del cargo</Label>
              <Textarea id="funciones" placeholder="Detalle las funciones principales" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil requerido</Label>
              <Textarea id="perfil" placeholder="Describa el perfil del candidato" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria-salarial">Categoría Salarial</Label>
              <Select>
                <SelectTrigger id="categoria-salarial">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="semi-senior">Semi-Senior</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Enviar Requisición</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requisiciones Activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">Área</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requisiciones.map((req) => (
                  <tr key={req.id} className="border-b">
                    <td className="p-2">{req.id}</td>
                    <td className="p-2">{req.cargo}</td>
                    <td className="p-2">{req.area}</td>
                    <td className="p-2">{req.estado}</td>
                    <td className="p-2">
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


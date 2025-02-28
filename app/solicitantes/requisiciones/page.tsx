"use client";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/presentation/components/ui/select"

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function Requisiciones() {
  const [requisiciones, setRequisiciones] = useState<Array<Schema["Requisicion"]["type"]>>([]);

  const [cargo, setCargo] = useState("");
  const [jefeInmediato, setJefeInmediato] = useState("");
  const [area, setArea] = useState("");
  const [funciones, setFunciones] = useState("");
  const [salario, setSalario] = useState("");
  const [estado, setEstado] = useState("");
  const [etapa, setEtapa] = useState("");

  function listRequisiciones() {
    client.models.Requisicion.observeQuery().subscribe({
      next: (data) => {
        const sortedRecords = data.items.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setRequisiciones(sortedRecords);
      },
    });
  }

  useEffect(() => {
    listRequisiciones();
  }, []);

  const createRequisicion = () => {
    client.models.Requisicion.create({
      cargo,
      jefeInmediato,
      area,
      funciones,
      salario,
      estado,
      etapa
    }).catch((error) => {
      console.error("Error saving record:", error);
    })
  }

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
                <Input 
                  id="cargo" 
                  placeholder="Nombre del cargo" 
                  value={cargo}
                  onChange={(e)=>setCargo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Input 
                  id="area" 
                  placeholder="Área solicitante" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jefeInmediato">Jefe Inmediato</Label>
              <Input 
                id="jefeInmediato" 
                placeholder="Nombre del jefe inmediato" 
                value={jefeInmediato}
                onChange={(e) => setJefeInmediato(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funciones">Funciones del cargo</Label>
              <Textarea 
                id="funciones" 
                placeholder="Detalle las funciones principales" 
                value={funciones}
                onChange={(e) => setFunciones(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salario">Salario</Label>
              <Input 
                id="salario" 
                placeholder="Salario ofertado" 
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select onValueChange={(value) => setEstado(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En revisión">En revisión</SelectItem>
                  <SelectItem value="Aprobada">Aprobada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa</Label>
              <Select onValueChange={(value) => setEtapa(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recepción">Recepción</SelectItem>
                  <SelectItem value="Evaluación">Evaluación</SelectItem>
                  <SelectItem value="Finalización">Finalización</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" onClick={createRequisicion}>Enviar Requisición</Button>
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
                {requisiciones.map((requisiciones) => (
                  <tr key={requisiciones.id} className="border-b">
                    <td className="p-2">{requisiciones.id}</td>
                    <td className="p-2">{requisiciones.cargo}</td>
                    <td className="p-2">{requisiciones.area}</td>
                    <td className="p-2">{requisiciones.estado}</td>
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


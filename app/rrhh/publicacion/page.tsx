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
  const [jefeInmediato, setJefeInmediato] = useState("A");
  const [area, setArea] = useState("TICS");
  const [funciones, setFunciones] = useState("");
  const [salario, setSalario] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [etapa, setEtapa] = useState("En Revisión");

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

  const createRequisicion = async (e: React.FormEvent) => {
    e.preventDefault(); // Evitar recarga de la página
  
    try {
      const newRequisicion = await client.models.Requisicion.create({
        cargo,
        jefeInmediato,
        area,
        funciones,
        salario,
        estado,
        etapa
      });
  
      console.log("Requisición creada:", newRequisicion);
  
      // Limpiar el formulario después de enviar
      setCargo("");
      setJefeInmediato("");
      setArea("");
      setFunciones("");
      setSalario("");
      setEstado("");
      setEtapa("");
  
    } catch (error) {
      console.error("Error al guardar la requisición:", error);
    }
  };

  const updateEtapa = async (id: string, nuevoEtapa: string) => {
    try {
      const updatedRequisicion = await client.models.Requisicion.update({
        id,
        etapa: nuevoEtapa
      });
  
      // Actualiza el estado local para reflejar el cambio en la UI
      setRequisiciones((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, estado: nuevoEtapa } : req
        )
      );
  
      console.log("Estado actualizado:", updatedRequisicion);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  return (
    <div className="space-y-8">
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Publicación Ofertas Laborales
      </motion.h1>

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
                  <th className="text-left p-2">Jefe Inmediato</th>
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">Área</th>
                  <th className="text-left p-2">Etapa</th>
                  <th className="text-left p-2">Funciones</th>
                  <th className="text-left p-2">Portal</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requisiciones
                    .filter((requisicion) => requisicion.etapa === "En Revisión 2") // Filtra solo las requisiciones en revisión
                    .map((requisicion) => (
                      <tr key={requisicion.id} className="border-b">
                      <td className="p-2">{requisicion.id}</td>
                      <td className="p-2">{requisicion.jefeInmediato}</td>
                      <td className="p-2">{requisicion.cargo}</td>
                      <td className="p-2">{requisicion.area}</td>
                      <td className="p-2">{requisicion.etapa}</td>
                      <td className="p-2">{requisicion.funciones}</td>
                      <td className="p-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                            />
                            Intranet
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                            />
                            Externo
                          </label>
                        </td>
                        <td className="p-2">{requisicion.estado}</td>
                        <td className="p-2">
                        <td className="p-2">
                            <Button variant="outline" size="sm" onClick={() => updateEtapa(requisicion.id, "Publicado")}>
                                Publicar
                            </Button>
                        </td>
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


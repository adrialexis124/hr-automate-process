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
import { sendEmailNotification } from "@/app/utils/notifications";
import { toast } from "react-hot-toast";
Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function Requisiciones() {
  const [requisiciones, setRequisiciones] = useState<Array<Schema["Requisicion"]["type"]>>([]);
  
  // Agregar estado para el modo de edición y la requisición seleccionada
  const [editMode, setEditMode] = useState(false);
  const [selectedRequisicion, setSelectedRequisicion] = useState<Schema["Requisicion"]["type"] | null>(null);

  const [cargo, setCargo] = useState("");
  const [jefeInmediato, setJefeInmediato] = useState("");
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
    e.preventDefault();

    try {
      const newRequisicion = await client.models.Requisicion.create({
        cargo,
        jefeInmediato,
        area,
        funciones,
        salario,
        estado: "Pendiente",
        etapa: "En Revisión 1"
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

  const updateEstado = async (id: string) => {
    try {
      const updatedRequisicion = await client.models.Requisicion.update({
        id,
        estado: "Pendiente",
        etapa: "En Revisión 1",
      });

      if (updatedRequisicion.data) {
        try {
          await sendEmailNotification({
            to: updatedRequisicion.data.jefeInmediato || '',
            subject: 'Requisición Actualizada',
            cargo: updatedRequisicion.data.cargo,
            area: updatedRequisicion.data.area,
            estado: 'En Revisión',
            etapa: 'En Revisión 1'
          });
          toast.success('Notificación enviada exitosamente');
        } catch (error) {
          console.error('Error al enviar notificación:', error);
          toast.error('Error al enviar la notificación');
        }
      }

      // Actualiza el estado local para reflejar el cambio en la UI
      setRequisiciones((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, estado: "Pendiente", etapa: "En Revisión 1" } : req
        )
      );

      console.log("Estado actualizado:", updatedRequisicion);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al actualizar la requisición");
    }
  };

  const handleEdit = (requisicion: Schema["Requisicion"]["type"]) => {
    setSelectedRequisicion(requisicion);
    setCargo(requisicion.cargo ?? "");
    setJefeInmediato(requisicion.jefeInmediato ?? "");
    setArea(requisicion.area ?? "TICS");
    setFunciones(requisicion.funciones ?? "");
    setSalario(requisicion.salario ?? "");
    setEstado(requisicion.estado ?? "Pendiente");
    setEtapa(requisicion.etapa ?? "En Revisión");
    setEditMode(true);
  };

  const updateRequisicion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequisicion) return;

    try {
      const updatedRequisicion = await client.models.Requisicion.update({
        id: selectedRequisicion.id,
        cargo,
        jefeInmediato,
        area,
        funciones,
        salario,
        estado: "Pendiente",
        etapa: "En Revisión 1"
      });

      console.log("Requisición actualizada:", updatedRequisicion);
      
      // Limpiar el formulario y salir del modo de edición
      setEditMode(false);
      setSelectedRequisicion(null);
      setCargo("");
      setJefeInmediato("");
      setArea("");
      setFunciones("");
      setSalario("");
      setEstado("");
      setEtapa("");
    } catch (error) {
      console.error("Error al actualizar la requisición:", error);
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
        Revisión de Solicitudes
      </motion.h1>

      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Requisición</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateRequisicion} className="space-y-4">
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jefeInmediato">Jefe Inmediato</Label>
                <Input
                  id="jefeInmediato"
                  value={jefeInmediato}
                  onChange={(e) => setJefeInmediato(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TICS">TICS</SelectItem>
                    <SelectItem value="RRHH">RRHH</SelectItem>
                    <SelectItem value="Finanzas">Finanzas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="funciones">Funciones</Label>
                <Textarea
                  id="funciones"
                  value={funciones}
                  onChange={(e) => setFunciones(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Guardar Cambios</Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                  <th className="text-left p-2">Funciones</th>
                  <th className="text-left p-2">Etapa</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requisiciones
                  .filter((requisicion) => 
                    requisicion.estado === "Cambios" || requisicion.etapa === "Necesita Cambios"
                  )
                  .map((requisicion) => (
                    <tr key={requisicion.id} className="border-b">
                        <td className="p-2">{requisicion.id}</td>
                        <td className="p-2">{requisicion.jefeInmediato}</td>
                        <td className="p-2">{requisicion.cargo}</td>
                        <td className="p-2">{requisicion.area}</td>
                        <td className="p-2">{requisicion.funciones}</td>
                        <td className="p-2">{requisicion.etapa}</td>
                        <td className="p-2">{requisicion.estado}</td>
                        <td className="p-2">
                        <Button 
                            onClick={() => handleEdit(requisicion)}>
                                Editar
                        </Button></td>
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


"use client";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/presentation/components/ui/select"
import { toast } from "sonner"

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function Requisiciones() {
  const [requisiciones, setRequisiciones] = useState<Array<Schema["Requisicion"]["type"]>>([]);
  const [loading, setLoading] = useState(false);

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

  const sendRejectionEmail = async (requisicion: Schema["Requisicion"]["type"]) => {
    try {
      if (!requisicion.jefeInmediato) {
        throw new Error('Email del jefe inmediato no disponible');
      }

      const emailContent = `
        <h2>Requisición Rechazada</h2>
        <p>La requisición para el siguiente cargo ha sido rechazada:</p>
        <ul>
          <li><strong>Cargo:</strong> ${requisicion.cargo || 'No especificado'}</li>
          <li><strong>Área:</strong> ${requisicion.area || 'No especificada'}</li>
          <li><strong>Estado:</strong> Rechazado</li>
        </ul>
        <p>Por favor, revise el sistema para más detalles.</p>
        <br>
        <p>Saludos cordiales,<br>Departamento de RRHH</p>
      `;
      console.log(requisicion.jefeInmediato);
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: requisicion.jefeInmediato,
          subject: `Requisición Rechazada - ${requisicion.cargo || 'Sin cargo especificado'}`,
          html: emailContent
        }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error('Error al enviar el email');
      }

      toast.success('Notificación enviada exitosamente');
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar la notificación');
    }
  };

  const updateEstado = async (id: string, nuevoEstado: string) => {
    try {
      setLoading(true);
      const estadoToEtapa: Record<string, string> = {
        Aprobado: "En Revisión 2",
        Negado: "Finalizado",
        Cambios: "Necesita Cambios",
      };

      const nuevoEtapa = estadoToEtapa[nuevoEstado] || "Desconocido";

      const updatedRequisicion = await client.models.Requisicion.update({
        id,
        estado: nuevoEstado,
        etapa: nuevoEtapa,
      });

      // Si la requisición fue rechazada, enviar email
      if (nuevoEstado === "Negado" && updatedRequisicion.data) {
        await sendRejectionEmail(updatedRequisicion.data);
      }

      // Actualiza la UI con el nuevo estado y etapa
      setRequisiciones((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, estado: nuevoEstado, etapa: nuevoEtapa } : req
        )
      );

      toast.success(`Requisición ${nuevoEstado.toLowerCase()} exitosamente`);
    } catch (error) {
      console.error("Error al actualizar estado y etapa:", error);
      toast.error("Error al actualizar la requisición");
    } finally {
      setLoading(false);
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
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requisiciones
                  .filter((requisicion) => requisicion.etapa === "En Revisión 1")
                  .map((requisicion) => (
                    <tr key={requisicion.id} className="border-b">
                      <td className="p-2">{requisicion.id}</td>
                      <td className="p-2">{requisicion.jefeInmediato}</td>
                      <td className="p-2">{requisicion.cargo}</td>
                      <td className="p-2">{requisicion.area}</td>
                      <td className="p-2">{requisicion.etapa}</td>
                      <td className="p-2">{requisicion.funciones}</td>
                      <td className="p-2">{requisicion.estado}</td>
                      <td className="p-2 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateEstado(requisicion.id, "Aprobado")}
                          disabled={loading}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateEstado(requisicion.id, "Cambios")}
                          disabled={loading}
                        >
                          Cambios
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateEstado(requisicion.id, "Negado")}
                          disabled={loading}
                        >
                          Negar
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


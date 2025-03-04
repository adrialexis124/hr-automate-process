"use client";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/presentation/components/ui/select"
import { toast } from "react-hot-toast"

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { sendEmailNotification } from "@/app/utils/notifications";
Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function Requisiciones() {
  const [requisiciones, setRequisiciones] = useState<Array<Schema["Requisicion"]["type"]>>([]);
  const [postulantes, setPostulantes] = useState<Array<Schema["Postulante"]["type"]>>([]);

  const [nombre, setNombre] = useState("");
  const [etapa, setEtapa] = useState("En Revisión");
  const [puntajeP1, setPuntajeP1] = useState("Pendiente");
  const [puntajeP2, setPuntajeP2] = useState("Pendiente");
  const [puntajeP3, setPuntajeP3] = useState("Pendiente");
  const [puntajeP4, setPuntajeP4] = useState("Pendiente");


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

  function listPostulantes() {
    client.models.Postulante.observeQuery().subscribe({
      next: (data) => {
        const sortedRecords = data.items.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setPostulantes(sortedRecords);
      },
    });
  }

  useEffect(() => {
    listPostulantes();
  }, []);

  const createPostulante = async (requisicionId: string) => {
  
    try {
      const newPostulante = await client.models.Postulante.create({
        requisicionId,
        nombre: window.prompt("Nombre postulante"),
        etapa,
        puntajeP1,
        puntajeP2,
        puntajeP3,
        puntajeP4,
      });
  
      console.log("Postulante creada:", newPostulante);
  
    } catch (error) {
      console.error("Error al guardar la requisición:", error);
    }
  };

  const updateEtapa = async (postulante: Schema["Postulante"]["type"]) => {
    try {
      // Actualizar el postulante a Completado
      const updatedPostulante = await client.models.Postulante.update({
        id: postulante.id,
        etapa: "Completado"
      });

      // Actualizar la requisición con el email del postulante aprobado
      if (postulante.requisicionId && postulante.email) {
        const updatedRequisicion = await client.models.Requisicion.update({
          id: postulante.requisicionId,
          emailAprobado: postulante.email,
          etapa: "Aprobado"
        });

        if (updatedRequisicion.data && postulante.email) {
          // Notificar al postulante aprobado
          try {
            await sendEmailNotification({
              to: postulante.email,
              subject: '¡Felicitaciones! - Postulación Aprobada',
              cargo: updatedRequisicion.data.cargo,
              area: updatedRequisicion.data.area,
              estado: 'Aprobado',
              etapa: 'Contratación',
              puntajes: {
                puntajeP1: postulante.puntajeP1,
                puntajeP2: postulante.puntajeP2,
                puntajeP3: postulante.puntajeP3,
                puntajeP4: postulante.puntajeP4
              }
            });

            // Notificar al jefe inmediato
            if (updatedRequisicion.data.jefeInmediato) {
              await sendEmailNotification({
                to: updatedRequisicion.data.jefeInmediato,
                subject: 'Candidato Aprobado para Contratación',
                cargo: updatedRequisicion.data.cargo,
                area: updatedRequisicion.data.area,
                estado: 'Aprobado',
                etapa: 'Contratación'
              });
            }
            
            toast.success('Notificaciones enviadas exitosamente');
          } catch (error) {
            console.error('Error al enviar notificaciones:', error);
            toast.error('Error al enviar las notificaciones');
          }
        }
      }
  
      // Actualiza el estado local para reflejar el cambio en la UI
      setPostulantes((prev) =>
        prev.map((p) =>
          p.id === postulante.id ? { ...p, etapa: "Completado" } : p
        )
      );
  
      toast.success("Postulante aprobado exitosamente");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al aprobar el postulante");
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
        Calificación de Candidatos
      </motion.h1>

      <Card>
        <CardHeader>
          <CardTitle>Candidatos evaluados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">RequisicionID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Prueba Psicotécnia</th>
                  <th className="text-left p-2">Prueba Técnica</th>
                  <th className="text-left p-2">Nota Talento Humano</th>
                  <th className="text-left p-2">Nota Jefe Inmediato</th>
                  <th className="text-left p-2">Etapa</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {postulantes
                    .filter((postulante) => postulante.etapa === "Aprobado")
                    .map((postulante) => (
                      <tr key={postulante.id} className="border-b">
                      <td className="p-2">{postulante.id}</td>
                      <td className="p-2">{postulante.requisicionId}</td>
                      <td className="p-2">{postulante.nombre}</td>
                      <td className="p-2">{postulante.email}</td>
                      <td className="p-2">{postulante.puntajeP1}</td>
                      <td className="p-2">{postulante.puntajeP2}</td>
                      <td className="p-2">{postulante.puntajeP3}</td>
                      <td className="p-2">{postulante.puntajeP4}</td>
                      <td className="p-2">{postulante.etapa}</td>
                      <td className="p-2">                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateEtapa(postulante)}
                        >
                          Contratar
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


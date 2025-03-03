"use client";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"
import { Button } from "@/src/presentation/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/presentation/components/ui/dialog"

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";

Amplify.configure(outputs);
const client = generateClient<Schema>();


export default function MisOfertas() {
  const { user } = useAuthenticator();
  const [misPostulaciones, setMisPostulaciones] = useState<Array<Schema["Postulante"]["type"] & { cargo?: string, area?: string, funciones?: string }>>([]);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [selectedRequisicion, setSelectedRequisicion] = useState<Schema["Requisicion"]["type"] | null>(null);

  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function getUserEmail() {
      setUserEmail("");
      try {
        const { tokens } = await fetchAuthSession(); // Obtiene la sesión de autenticación
        if (tokens?.idToken) {
          const payloadBase64 = tokens.idToken.toString().split(".")[1]; // Extrae la parte del payload (JWT)
          const decodedPayload = JSON.parse(atob(payloadBase64)); // Decodifica el JWT

          console.log("Payload del token:", decodedPayload); // 👀 Verifica qué datos tiene el token

          setUserEmail(decodedPayload.email);
        }
      } catch (error) {
        console.error("Error obteniendo el email:", error);
      }
    }

    getUserEmail();
  }, []);


  async function listMisPostulaciones() {
    if (!user?.username) return;

    try {
      // Obtener las postulaciones del usuario actual por su email y que estén aprobadas
      const postulaciones = await client.models.Postulante.observeQuery({
        filter: {
          and: [
            { etapa: { eq: "Aprobado" } }
          ]
        }
      }).subscribe({
        next: async (data) => {
          // Para cada postulación, obtener los detalles de la requisición
          const postulacionesConDetalles = await Promise.all(
            data.items.map(async (postulacion) => {
              if (!postulacion.requisicionId) return postulacion;
              const requisicion = await client.models.Requisicion.get({ id: postulacion.requisicionId });
              return {
                ...postulacion,
                cargo: requisicion?.data?.cargo || 'No especificado',
                area: requisicion?.data?.area || 'No especificado',
                funciones: requisicion?.data?.funciones || 'No especificado'
              };
            })
          );

          setMisPostulaciones(postulacionesConDetalles);
          console.log(postulacionesConDetalles);
        }
      });
    } catch (error) {
      console.error("Error al obtener postulaciones:", error);
    }
  }

  useEffect(() => {
    if (user?.username) {
      listMisPostulaciones();
    }
  }, [user]);

  const verDetalles = async (requisicionId: string | null | undefined) => {
    if (!requisicionId) return;
    try {
      const requisicion = await client.models.Requisicion.get({ id: requisicionId });
      if (requisicion?.data) {
        setSelectedRequisicion(requisicion.data);
        setShowDetalleDialog(true);
      }
    } catch (error) {
      console.error("Error al obtener detalles de la requisición:", error);
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
        Mis Postulaciones Aprobadas
      </motion.h1>

      <Card>
        <CardHeader>
          <CardTitle>Estado de mis postulaciones aprobadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">Área</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Prueba Psicotécnica</th>
                  <th className="text-left p-2">Prueba Técnica</th>
                  <th className="text-left p-2">Nota RRHH</th>
                  <th className="text-left p-2">Nota Jefe</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {misPostulaciones.map((postulacion) => (
                  <tr key={postulacion.id} className="border-b">
                    <td className="p-2">{postulacion.cargo}</td>
                    <td className="p-2">{postulacion.area}</td>
                    <td className="p-2">{postulacion.etapa}</td>
                    <td className="p-2">{postulacion.puntajeP1}</td>
                    <td className="p-2">{postulacion.puntajeP2}</td>
                    <td className="p-2">{postulacion.puntajeP3}</td>
                    <td className="p-2">{postulacion.puntajeP4}</td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verDetalles(postulacion.requisicionId)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Posición</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Cargo</h3>
              <p>{selectedRequisicion?.cargo}</p>
            </div>
            <div>
              <h3 className="font-semibold">Área</h3>
              <p>{selectedRequisicion?.area}</p>
            </div>
            <div>
              <h3 className="font-semibold">Funciones</h3>
              <p>{selectedRequisicion?.funciones}</p>
            </div>
            <div>
              <h3 className="font-semibold">Salario</h3>
              <p>{selectedRequisicion?.salario}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


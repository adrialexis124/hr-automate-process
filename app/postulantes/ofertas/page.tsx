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
  const [misPostulaciones, setMisPostulaciones] = useState<Array<Schema["Requisicion"]["type"]>>([]);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [selectedRequisicion, setSelectedRequisicion] = useState<Schema["Requisicion"]["type"] | null>(null);

  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function getUserEmail() {
      setUserEmail("");
      try {
        const { tokens } = await fetchAuthSession();
        if (tokens?.idToken) {
          const payloadBase64 = tokens.idToken.toString().split(".")[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          setUserEmail(decodedPayload.email);
        }
      } catch (error) {
        console.error("Error obteniendo el email:", error);
      }
    }

    getUserEmail();
  }, []);

  async function listMisPostulaciones() {
    if (!userEmail) return;

    try {
      // Obtener las requisiciones donde el usuario fue aprobado
      const requisiciones = await client.models.Requisicion.observeQuery({
        filter: {
          emailAprobado: { eq: userEmail }
        }
      }).subscribe({
        next: (data) => {
          setMisPostulaciones(data.items);
          console.log("Requisiciones donde fui aprobado:", data.items);
        }
      });
    } catch (error) {
      console.error("Error al obtener requisiciones:", error);
    }
  }

  useEffect(() => {
    if (userEmail) {
      listMisPostulaciones();
    }
  }, [userEmail]);

  const verDetalles = async (requisicion: Schema["Requisicion"]["type"]) => {
    setSelectedRequisicion(requisicion);
    setShowDetalleDialog(true);
  };

  const aceptarOferta = async (requisicion: Schema["Requisicion"]["type"]) => {
    try {
      await client.models.Requisicion.update({
        id: requisicion.id,
        etapa: "Contratado"
      });
      
      // Actualizar la lista local
      setMisPostulaciones(prev => 
        prev.map(req => 
          req.id === requisicion.id 
            ? { ...req, etapa: "Contratado" } 
            : req
        )
      );
    } catch (error) {
      console.error("Error al aceptar la oferta:", error);
      alert("Error al aceptar la oferta");
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
        Mis Posiciones Aprobadas
      </motion.h1>

      <Card>
        <CardHeader>
          <CardTitle>Posiciones donde fui aprobado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">Área</th>
                  <th className="text-left p-2">Jefe Inmediato</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {misPostulaciones.map((requisicion) => (
                  <tr key={requisicion.id} className="border-b">
                    <td className="p-2">{requisicion.cargo}</td>
                    <td className="p-2">{requisicion.area}</td>
                    <td className="p-2">{requisicion.jefeInmediato}</td>
                    <td className="p-2">{requisicion.etapa}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verDetalles(requisicion)}
                        >
                          Ver Detalles
                        </Button>
                        {requisicion.etapa === "Aprobado" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => aceptarOferta(requisicion)}
                          >
                            Aceptar Oferta
                          </Button>
                        )}
                      </div>
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


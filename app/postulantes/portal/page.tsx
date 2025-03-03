"use client";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/presentation/components/ui/dialog"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/presentation/components/ui/select"
import * as Auth from "aws-amplify/auth";
import { fetchAuthSession } from "@aws-amplify/auth"; // Nueva forma de obtener usuario en Amplify v5+

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { uploadData } from 'aws-amplify/storage';
import { generateClient as apiClient } from 'aws-amplify/api';
import { useAuthenticator } from "@aws-amplify/ui-react";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function Requisiciones() {
  const { user } = useAuthenticator();
  const [requisiciones, setRequisiciones] = useState<Array<Schema["Requisicion"]["type"]>>([]);
  const [postulantes, setPostulantes] = useState<Array<Schema["Postulante"]["type"]>>([]);

  const [nombre, setNombre] = useState("");
  const [etapa, setEtapa] = useState("En Revisión");
  const [puntajeP1, setPuntajeP1] = useState("Pendiente");
  const [puntajeP2, setPuntajeP2] = useState("Pendiente");
  const [puntajeP3, setPuntajeP3] = useState("Pendiente");
  const [puntajeP4, setPuntajeP4] = useState("Pendiente");

  const [showPostularDialog, setShowPostularDialog] = useState(false);
  const [selectedRequisicionId, setSelectedRequisicionId] = useState<string | null>(null);

  const [postulanteName, setPostulanteName] = useState("");
  const [postulanteTelefono, setPostulanteTelefono] = useState("");
  const [postulanteExperiencia, setPostulanteExperiencia] = useState("");
  const [cvFile, setCvFile] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCvFile(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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


  const createPostulante = async (requisicionId: string) => {
    if (!cvFile) {
      alert("Por favor, seleccione un CV");
      return;
    }

    if (!user?.username) {
      alert("Debe iniciar sesión para postular");
      return;
    }

    try {
      const newPostulante = await client.models.Postulante.create({
        requisicionId,
        nombre: postulanteName,
        email: userEmail,
        telefono: postulanteTelefono,
        experiencia: postulanteExperiencia,
        cvUrl: cvFile,
        etapa: "En Revision",
        puntajeP1: "Pendiente",
        puntajeP2: "Pendiente",
        puntajeP3: "Pendiente",
        puntajeP4: "Pendiente",
      });

      console.log("Postulante creado:", newPostulante);
      setShowPostularDialog(false);
      limpiarFormulario();
    } catch (error) {
      console.error("Error al crear el postulante:", error);
      alert("Error al enviar la postulación");
    }
  };

  const limpiarFormulario = () => {
    setPostulanteName("");
    setPostulanteTelefono("");
    setPostulanteExperiencia("");
    setCvFile(null);
    setSelectedRequisicionId(null);
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
        Creación de Candidatos
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
                  .filter((requisicion) => requisicion.etapa === "Publicado") // Filtra solo las requisiciones en revisión
                  .map((requisicion) => (
                    <tr key={requisicion.id} className="border-b">
                      <td className="p-2">{requisicion.id}</td>
                      <td className="p-2">{requisicion.jefeInmediato}</td>
                      <td className="p-2">{requisicion.cargo}</td>
                      <td className="p-2">{requisicion.area}</td>
                      <td className="p-2">{requisicion.etapa}</td>
                      <td className="p-2">{requisicion.funciones}</td>
                      <td className="p-2">{requisicion.estado}</td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequisicionId(requisicion.id);
                            setShowPostularDialog(true);
                          }}
                        >
                          Aplicar Posición
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader>
          <CardTitle>Candidatos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">RequisicionID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Prueba Psicotécnia</th>
                  <th className="text-left p-2">Prueba Técnica</th>
                  <th className="text-left p-2">Nota Talento Humano</th>
                  <th className="text-left p-2">Nota Jefe Inmediato</th>
                  <th className="text-left p-2">Etapa</th>
                </tr>
              </thead>
              <tbody>
                {postulantes
                  .filter((postulante) => postulante.etapa !== "Publicado") // Filtra solo las requisiciones en revisión
                  .map((postulante) => (
                    <tr key={postulante.id} className="border-b">
                      <td className="p-2">{postulante.id}</td>
                      <td className="p-2">{postulante.requisicionId}</td>
                      <td className="p-2">{postulante.nombre}</td>
                      <td className="p-2">{postulante.puntajeP1}</td>
                      <td className="p-2">{postulante.puntajeP2}</td>
                      <td className="p-2">{postulante.puntajeP3}</td>
                      <td className="p-2">{postulante.puntajeP4}</td>
                      <td className="p-2">{postulante.etapa}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPostularDialog} onOpenChange={setShowPostularDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Postular a la posición</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            if (selectedRequisicionId) createPostulante(selectedRequisicionId);
          }}>
            <div>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={postulanteName}
                onChange={(e) => setPostulanteName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={userEmail || ""}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={postulanteTelefono}
                onChange={(e) => setPostulanteTelefono(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="experiencia">Experiencia relevante</Label>
              <Textarea
                id="experiencia"
                value={postulanteExperiencia}
                onChange={(e) => setPostulanteExperiencia(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cv">CV (PDF)</Label>
              <Input
                id="cv"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowPostularDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Enviar postulación
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}


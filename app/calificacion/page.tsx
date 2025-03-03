"use client";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/presentation/components/ui/card"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/presentation/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/presentation/components/ui/dialog"

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
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

  // Agregar estado para el diálogo de calificación
  const [showCalificarDialog, setShowCalificarDialog] = useState(false);
  const [selectedPostulante, setSelectedPostulante] = useState<Schema["Postulante"]["type"] | null>(null);
  const [puntajes, setPuntajes] = useState({
    puntajeP1: "",
    puntajeP2: "",
    puntajeP3: "",
    puntajeP4: ""
  });

  // Agregar estado para el diálogo del PDF
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

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

  const updateEtapa = async (id: string, nuevoEtapa: string) => {
    try {
      const updatedPostulante = await client.models.Postulante.update({
        id,
        etapa: nuevoEtapa
      });
  
      // Actualiza el estado local para reflejar el cambio en la UI
      setRequisiciones((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, estado: nuevoEtapa } : req
        )
      );
  
      console.log("Estado actualizado:", updatedPostulante);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const handleCalificar = (postulante: Schema["Postulante"]["type"]) => {
    setSelectedPostulante(postulante);
    setPuntajes({
      puntajeP1: postulante.puntajeP1 || "",
      puntajeP2: postulante.puntajeP2 || "",
      puntajeP3: postulante.puntajeP3 || "",
      puntajeP4: postulante.puntajeP4 || ""
    });
    setShowCalificarDialog(true);
  };

  const validatePuntaje = (value: string): boolean => {
    const numero = Number(value);
    return !isNaN(numero) && numero >= 0 && numero <= 20;
  };

  const handlePuntajeChange = (campo: keyof typeof puntajes, valor: string) => {
    if (valor === "" || validatePuntaje(valor)) {
      setPuntajes(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const updatePostulante = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPostulante) return;

    // Validar que todos los campos tengan valores válidos
    const valores = Object.values(puntajes);
    if (valores.some(v => v === "" || !validatePuntaje(v))) {
      alert("Todos los campos deben tener valores entre 0 y 20");
      return;
    }

    const puntajesNumericos = {
      puntajeP1: Number(puntajes.puntajeP1),
      puntajeP2: Number(puntajes.puntajeP2),
      puntajeP3: Number(puntajes.puntajeP3),
      puntajeP4: Number(puntajes.puntajeP4)
    };

    // Verificar si todos los puntajes son >= 14
    const todosAprobados = Object.values(puntajesNumericos).every(p => p >= 14);

    try {
      const updatedPostulante = await client.models.Postulante.update({
        id: selectedPostulante.id,
        ...puntajes,
        etapa: todosAprobados ? "Aprobado" : "En Revisión"
      });

      // Si el postulante fue aprobado, actualizar la requisición con su email
      if (todosAprobados && selectedPostulante.requisicionId && selectedPostulante.email) {
        await client.models.Requisicion.update({
          id: selectedPostulante.requisicionId,
          etapa: "Aprobado"
        });
      }

      console.log("Postulante actualizado:", updatedPostulante);
      setShowCalificarDialog(false);
      setSelectedPostulante(null);
    } catch (error) {
      console.error("Error al actualizar el postulante:", error);
      alert("Error al guardar las calificaciones");
    }
  };

  const handleViewPdf = async (cvUrl: string) => {
    try {
      setSelectedPdfUrl(cvUrl);
      setShowPdfDialog(true);
    } catch (error) {
      console.error("Error al obtener el CV:", error);
      alert("Error al cargar el CV");
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
          <CardTitle>Candidatos a evaluar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">RequisicionID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">CV</th>
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
                    .filter((postulante) => postulante.etapa === "En Revision")
                    .map((postulante) => (
                      <tr key={postulante.id} className="border-b">
                        <td className="p-2">{postulante.id}</td>
                        <td className="p-2">{postulante.requisicionId}</td>
                        <td className="p-2">{postulante.nombre}</td>
                        <td className="p-2">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleViewPdf(postulante.cvUrl)}
                          >
                            Ver CV
                          </Button>
                        </td>
                        <td className="p-2">{postulante.puntajeP1}</td>
                        <td className="p-2">{postulante.puntajeP2}</td>
                        <td className="p-2">{postulante.puntajeP3}</td>
                        <td className="p-2">{postulante.puntajeP4}</td>
                        <td className="p-2">{postulante.etapa}</td>
                        <td className="p-2">                        
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCalificar(postulante)}
                            >
                              Calificar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
                  <th className="text-left p-2">Prueba Psicotécnia</th>
                  <th className="text-left p-2">Prueba Técnica</th>
                  <th className="text-left p-2">Nota Talento Humano</th>
                  <th className="text-left p-2">Nota Jefe Inmediato</th>
                  <th className="text-left p-2">Etapa</th>
                </tr>
              </thead>
              <tbody>
                {postulantes
                    .filter((postulante) => postulante.etapa === "Aprobado") // Filtra solo las requisiciones en revisión
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

      {/* Diálogo para mostrar el PDF */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="sm:max-w-[900px] sm:h-[800px]">
          <DialogHeader>
            <DialogTitle>Curriculum Vitae</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            {selectedPdfUrl && (
              <iframe
                src={selectedPdfUrl}
                className="w-full h-[700px]"
                title="CV Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCalificarDialog} onOpenChange={setShowCalificarDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Calificar Candidato</DialogTitle>
            {selectedPostulante && (
              <DialogDescription>
                Antes de calificar, asegúrese de revisar el CV del candidato.
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => {
                    setShowCalificarDialog(false);
                    handleViewPdf(selectedPostulante.cvUrl);
                  }}
                >
                  Ver CV
                </Button>
              </DialogDescription>
            )}
          </DialogHeader>
          <form className="space-y-4" onSubmit={updatePostulante}>
            <div>
              <Label htmlFor="puntajeP1">Prueba Psicotécnica (0-20)</Label>
              <Input
                id="puntajeP1"
                type="number"
                min="0"
                max="20"
                step="1"
                value={puntajes.puntajeP1}
                onChange={(e) => handlePuntajeChange('puntajeP1', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="puntajeP2">Prueba Técnica (0-20)</Label>
              <Input
                id="puntajeP2"
                type="number"
                min="0"
                max="20"
                step="1"
                value={puntajes.puntajeP2}
                onChange={(e) => handlePuntajeChange('puntajeP2', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="puntajeP3">Nota Talento Humano (0-20)</Label>
              <Input
                id="puntajeP3"
                type="number"
                min="0"
                max="20"
                step="1"
                value={puntajes.puntajeP3}
                onChange={(e) => handlePuntajeChange('puntajeP3', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="puntajeP4">Nota Jefe Inmediato (0-20)</Label>
              <Input
                id="puntajeP4"
                type="number"
                min="0"
                max="20"
                step="1"
                value={puntajes.puntajeP4}
                onChange={(e) => handlePuntajeChange('puntajeP4', e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCalificarDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Calificaciones
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


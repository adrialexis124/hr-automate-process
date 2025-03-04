import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import test, { describe } from 'node:test';

const client = generateClient<Schema>();

describe('Postulante Model Tests', () => {
  let createdPostulanteId: string;
  let requisicionId: string;

  beforeAll(async () => {
    // Crear una requisición para las pruebas
    const requisicion = await client.models.Requisicion.create({
      cargo: 'Test Cargo',
      jefeInmediato: 'Test Jefe',
      area: 'TICS',
      funciones: 'Test Funciones',
      salario: '1000-1500',
      estado: 'Pendiente',
      etapa: 'Publicado'
    });
    requisicionId = requisicion.id;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (createdPostulanteId) {
      await client.models.Postulante.delete({ id: createdPostulanteId });
    }
    if (requisicionId) {
      await client.models.Requisicion.delete({ id: requisicionId });
    }
  });

  test('should create a new postulante', async () => {
    const postulanteData = {
      requisicionId,
      nombre: 'Juan Test',
      email: 'juan@test.com',
      telefono: '1234567890',
      experiencia: '5 años en desarrollo',
      cvUrl: 'https://example.com/cv.pdf',
      etapa: 'En Revision',
      puntajeP1: 'Pendiente',
      puntajeP2: 'Pendiente',
      puntajeP3: 'Pendiente',
      puntajeP4: 'Pendiente'
    };

    const newPostulante = await client.models.Postulante.create(postulanteData);
    createdPostulanteId = newPostulante.id;

    expect(newPostulante).toHaveProperty('id');
    expect(newPostulante.nombre).toBe(postulanteData.nombre);
    expect(newPostulante.requisicionId).toBe(requisicionId);
  });

  test('should update postulante scores', async () => {
    const updateData = {
      id: createdPostulanteId,
      puntajeP1: '15',
      puntajeP2: '16',
      puntajeP3: '17',
      puntajeP4: '18',
      etapa: 'Aprobado'
    };

    const updatedPostulante = await client.models.Postulante.update(updateData);

    expect(updatedPostulante.puntajeP1).toBe('15');
    expect(updatedPostulante.etapa).toBe('Aprobado');
  });

  test('should get postulante with requisicion details', async () => {
    const postulante = await client.models.Postulante.get({ id: createdPostulanteId });
    
    expect(postulante).not.toBeNull();
    expect(postulante?.requisicionId).toBe(requisicionId);
  });

  test('should list postulantes by etapa', async () => {
    const response = await client.models.Postulante.observeQuery({
      filter: { etapa: { eq: 'Aprobado' } }
    }).subscribe();

    expect(Array.isArray(response.items)).toBe(true);
    expect(response.items.some(p => p.id === createdPostulanteId)).toBe(true);
  });
}); 

function beforeAll(arg0: () => Promise<void>) {
  throw new Error('Function not implemented.');
}
function afterAll(arg0: () => Promise<void>) {
  throw new Error('Function not implemented.');
}

function expect(newPostulante: { data: { requisicion: (options?: { authMode?: import("@aws-amplify/data-schema/runtime").AuthMode; authToken?: string; headers?: import("@aws-amplify/data-schema/runtime").CustomHeaders; } | undefined) => import("@aws-amplify/data-schema/runtime").SingularReturnValue<{ postulantes: (options?: { authMode?: import("@aws-amplify/data-schema/runtime").AuthMode; authToken?: string; limit?: number; nextToken?: string | null; headers?: import("@aws-amplify/data-schema/runtime").CustomHeaders; } | undefined) => import("@aws-amplify/data-schema/runtime").ListReturnValue<{ requisicion: /*elided*/ any; nombre?: import("@aws-amplify/data-schema").Nullable<string> | undefined; email?: import("@aws-amplify/data-schema").Nullable<string> | undefined; telefono?: import("@aws-amplify/data-schema").Nullable<string> | undefined; cvUrl?: import("@aws-amplify/data-schema").Nullable<string> | undefined; experiencia?: import("@aws-amplify/data-schema").Nullable<string> | undefined; etapa?: import("@aws-amplify/data-schema").Nullable<string> | undefined; puntajeP1?: import("@aws-amplify/data-schema").Nullable<string> | undefined; puntajeP2?: import("@aws-amplify/data-schema").Nullable<string> | undefined; puntajeP3?: import("@aws-amplify/data-schema").Nullable<string> | undefined; puntajeP4?: import("@aws-amplify/data-schema").Nullable<string> | undefined; requisicionId?: import("@aws-amplify/data-schema").Nullable<string> | undefined; readonly id: string; readonly createdAt: string; readonly updatedAt: string; }>; cargo?: import("@aws-amplify/data-schema").Nullable<string> | undefined; jefeInmediato?: import("@aws-amplify/data-schema").Nullable<string> | undefined; area?: import("@aws-amplify/data-schema").Nullable<string> | undefined; funciones?: import("@aws-amplify/data-schema").Nullable<string> | undefined; salario?: import("@aws-amplify/data-schema").Nullable<string> | undefined; estado?: import("@aws-amplify/data-schema").Nullable<string> | undefined; etapa?: import("@aws-amplify/data-schema").Nullable<string> | undefined; detalle?: import("@aws-amplify/data-schema").Nullable<string> | undefined; emailAprobado?: import("@aws-amplify/data-schema").Nullable<string> | undefined; readonly id: string; readonly createdAt: string; readonly updatedAt: string; } | null>; nombre: import("@aws-amplify/data-schema").Nullable<string>; email: import("@aws-amplify/data-schema").Nullable<string>; telefono: import("@aws-amplify/data-schema").Nullable<string>; cvUrl: import("@aws-amplify/data-schema").Nullable<string>; experiencia: import("@aws-amplify/data-schema").Nullable<string>; etapa: import("@aws-amplify/data-schema").Nullable<string>; puntajeP1: import("@aws-amplify/data-schema").Nullable<string>; puntajeP2: import("@aws-amplify/data-schema").Nullable<string>; puntajeP3: import("@aws-amplify/data-schema").Nullable<string>; puntajeP4: import("@aws-amplify/data-schema").Nullable<string>; requisicionId: import("@aws-amplify/data-schema").Nullable<string>; readonly id: string; readonly createdAt: string; readonly updatedAt: string; } | null; errors?: import("@aws-amplify/data-schema/runtime").GraphQLFormattedError[]; extensions?: { [key: string]: any; }; }) {
  throw new Error('Function not implemented.');
}


import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

describe('Requisicion Model Tests', () => {
  let createdRequisicionId: string;

  // Limpiar después de todas las pruebas
  afterAll(async () => {
    if (createdRequisicionId) {
      await client.models.Requisicion.delete({ id: createdRequisicionId });
    }
  });

  test('should create a new requisicion', async () => {
    const requisicionData = {
      cargo: 'Desarrollador Frontend',
      jefeInmediato: 'Juan Pérez',
      area: 'TICS',
      funciones: 'Desarrollo de interfaces de usuario',
      salario: '1000-1500',
      estado: 'Pendiente',
      etapa: 'En Revisión 1'
    };

    const newRequisicion = await client.models.Requisicion.create(requisicionData);
    createdRequisicionId = newRequisicion.id;

    expect(newRequisicion).toHaveProperty('id');
    expect(newRequisicion.cargo).toBe(requisicionData.cargo);
    expect(newRequisicion.area).toBe(requisicionData.area);
  });

  test('should update a requisicion', async () => {
    const updateData = {
      id: createdRequisicionId,
      estado: 'Aprobado',
      etapa: 'En Revisión 2'
    };

    const updatedRequisicion = await client.models.Requisicion.update(updateData);

    expect(updatedRequisicion.estado).toBe('Aprobado');
    expect(updatedRequisicion.etapa).toBe('En Revisión 2');
  });

  test('should get a requisicion by id', async () => {
    const requisicion = await client.models.Requisicion.get({ id: createdRequisicionId });

    expect(requisicion).not.toBeNull();
    expect(requisicion?.id).toBe(createdRequisicionId);
  });

  test('should list requisiciones with filter', async () => {
    const response = await client.models.Requisicion.observeQuery({
      filter: { etapa: { eq: 'En Revisión 2' } }
    }).subscribe();

    expect(Array.isArray(response.items)).toBe(true);
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].etapa).toBe('En Revisión 2');
  });
}); 
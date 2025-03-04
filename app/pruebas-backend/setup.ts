import { Amplify } from 'aws-amplify';
import { signIn } from 'aws-amplify/auth';
import outputs from '@/amplify_outputs.json';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar Amplify para pruebas
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.APPSYNC_ENDPOINT || outputs.aws_appsync_graphqlEndpoint,
      region: process.env.APPSYNC_REGION || outputs.aws_appsync_region,
      defaultAuthMode: 'userPool'
    }
  }
});

// Importar tipos de Jest
import { beforeAll, beforeEach, jest } from '@jest/globals';

// Login antes de todas las pruebas
beforeAll(async () => {
  try {
    const username = process.env.COGNITO_TEST_USERNAME;
    const password = process.env.COGNITO_TEST_PASSWORD;

    if (!username || !password) {
      throw new Error('Credenciales de prueba no encontradas en variables de entorno');
    }

    await signIn({
      username,
      password
    });
    console.log('Login successful');
  } catch (error) {
    console.error('Error en el login:', error);
    throw error;
  }
});

// Configuración global para pruebas
beforeEach(() => {
  // Limpiar cualquier estado entre pruebas
});

// Configuración de timeout más largo para operaciones asíncronas
jest.setTimeout(30000); 
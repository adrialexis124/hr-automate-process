import type { Config } from '@jest/types';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      diagnostics: false,
      transpileOnly: true
    }]
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../$1'
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts']
}

export default config; 
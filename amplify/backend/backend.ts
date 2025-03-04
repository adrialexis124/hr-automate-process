import { defineBackend } from '@aws-amplify/backend';
import { api } from './api/notifications/definition';
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({
  api,
  auth,
  data
}); 
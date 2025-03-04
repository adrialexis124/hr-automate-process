import { a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  NotificationRequest: a.customType({
    phoneNumber: a.string(),
    subject: a.string(),
    message: a.string()
  })
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30
    }
  }
}); 
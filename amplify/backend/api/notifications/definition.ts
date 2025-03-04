import { defineFunction, type ClientSchema } from '@aws-amplify/backend';
import { defineRestApi } from '@aws-amplify/backend-api';
import { sns } from '@aws-amplify/backend-sns';

const notificationFunction = defineFunction({
  name: 'notificationHandler',
  handler: async (event) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      };

      if (event.requestContext.http.method === 'OPTIONS') {
        return {
          statusCode: 200,
          headers,
          body: ''
        };
      }

      const body = JSON.parse(event.body || '{}');
      const { phoneNumber, subject, message } = body;

      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid phone number. Must be in E.164 format (e.g., +593XXXXXXXXX)'
          })
        };
      }

      await sns.publish({
        Message: `${subject}\n\n${message}`,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Notification sent successfully',
          phoneNumber
        })
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Failed to send notification',
          details: error.message
        })
      };
    }
  }
});

export const api = defineRestApi({
  name: 'notifications',
  routes: {
    '/notifications': {
      POST: notificationFunction
    }
  }
}); 
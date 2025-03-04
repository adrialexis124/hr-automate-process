const AWS = require('aws-sdk');
const sns = new AWS.SNS({ region: process.env.REGION || 'us-east-1' });

exports.handler = async (event) => {
    try {
        // Permitir CORS
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        };

        // Para las solicitudes OPTIONS (preflight)
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: ''
            };
        }

        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { phoneNumber, subject, message } = body;

        console.log('Received request:', { phoneNumber, subject, message });

        // Validar el número de teléfono
        if (!phoneNumber || !phoneNumber.startsWith('+')) {
            console.log('Invalid phone number:', phoneNumber);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Invalid phone number. Must be in E.164 format (e.g., +593XXXXXXXXX)' 
                })
            };
        }

        const params = {
            Message: `${subject}\n\n${message}`,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        };

        console.log('Sending SMS with params:', params);

        const result = await sns.publish(params).promise();
        console.log('SMS sent successfully:', result);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Notification sent successfully',
                messageId: result.MessageId,
                phoneNumber: phoneNumber
            })
        };
    } catch (error) {
        console.error('Error sending notification:', error);
        
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ 
                error: 'Failed to send notification',
                details: error.message
            })
        };
    }
}; 
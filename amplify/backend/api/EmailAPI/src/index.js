const AWS = require('aws-sdk');
const sns = new AWS.SNS({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { phoneNumber, subject, message } = body;

    const params = {
      Message: `${subject}\n\n${message}`,
      PhoneNumber: phoneNumber, // Formato E.164: +593XXXXXXXXX
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    };

    await sns.publish(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'SMS sent successfully' })
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: 'Failed to send SMS' })
    };
  }
}; 
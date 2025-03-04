const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { to, subject, message } = body;

    const params = {
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Body: {
          Text: {
            Data: message
          }
        },
        Subject: {
          Data: subject
        }
      },
      Source: process.env.SOURCE_EMAIL || 'rrhh@tudominio.com' // Reemplaza con tu email verificado en SES
    };

    await ses.sendEmail(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
}; 
interface EmailNotificationProps {
  to: string;
  subject: string;
  cargo?: string;
  area?: string;
  estado: string;
  etapa?: string;
  puntajes?: {
    puntajeP1?: string;
    puntajeP2?: string;
    puntajeP3?: string;
    puntajeP4?: string;
  };
}

export async function sendEmailNotification({
  to,
  subject,
  cargo = 'No especificado',
  area = 'No especificada',
  estado,
  etapa,
  puntajes
}: EmailNotificationProps) {
  try {
    let emailContent = `
      <h2>${subject}</h2>
      <p>Actualización de estado para la requisición:</p>
      <ul>
        <li><strong>Cargo:</strong> ${cargo}</li>
        <li><strong>Área:</strong> ${area}</li>
        <li><strong>Estado:</strong> ${estado}</li>
        ${etapa ? `<li><strong>Etapa:</strong> ${etapa}</li>` : ''}
    `;

    // Agregar sección de puntajes si están disponibles
    if (puntajes) {
      emailContent += `
        <li><strong>Puntajes:</strong></li>
        <ul>
          ${puntajes.puntajeP1 ? `<li>Prueba Psicotécnica: ${puntajes.puntajeP1}</li>` : ''}
          ${puntajes.puntajeP2 ? `<li>Prueba Técnica: ${puntajes.puntajeP2}</li>` : ''}
          ${puntajes.puntajeP3 ? `<li>Evaluación RRHH: ${puntajes.puntajeP3}</li>` : ''}
          ${puntajes.puntajeP4 ? `<li>Evaluación Jefe Inmediato: ${puntajes.puntajeP4}</li>` : ''}
        </ul>
      `;
    }

    emailContent += `
      </ul>
      <p>Por favor, revise el sistema para más detalles.</p>
      <br>
      <p>Saludos cordiales,<br>Departamento de RRHH</p>
    `;

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: emailContent
      }),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error('Error al enviar el email');
    }

    return true;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
} 
const nodemailer = require('nodemailer');

// Crear transportador de correo adaptado al ambiente
let transporter;

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar simulación con logs claros
  transporter = {
    sendMail: async (options) => {
      console.log('\n');
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║           📧 CÓDIGO DE VERIFICACIÓN (DEV MODE)             ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`  📬 Para: ${options.to}`);
      console.log(`  📋 Asunto: ${options.subject}`);
      console.log('');
      
      // Extraer el código del HTML
      const codigoMatch = options.html.match(/color: #7B3FE4;[\s\S]*?>([\d]+)</);
      if (codigoMatch && codigoMatch[1]) {
        console.log(`  ✅ CÓDIGO: ${codigoMatch[1]}`);
      }
      
      console.log('');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
      
      return { messageId: 'dev-mode' };
    },
  };
} else {
  // En producción, usar Mailtrap o Gmail
  const smtpHost = process.env.SMTP_HOST || 'live.smtp.mailtrap.io';
  const smtpPort = process.env.SMTP_PORT || 465;
  
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: true, // true para port 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Generar código aleatorio de 6 dígitos
const generarCodigo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar código de verificación por correo
const enviarCodigoVerificacion = async (correo, codigo, tipo) => {
  const subject = 'Código de Verificación - HoldMyIDBack';
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Verificación de Identidad - HoldMyIDBack</h2>
      <p>Se ha solicitado ${tipo.includes('Registro') ? 'crear tu cuenta' : 'agregar una nueva credencial ' + tipo.toLowerCase()} en tu cartera digital.</p>
      
      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #666;">Tu código de verificación es:</p>
        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #7B3FE4;">
          ${codigo}
        </p>
      </div>
      
      <p style="color: #666; font-size: 12px;">
        Este código expira en 10 minutos. Si no solicitaste esto, por favor ignora este correo.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 11px; margin: 0;">
        © 2026 HoldMyIDBack - Cartera Digital de Credenciales
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@holdmyidback.com',
      to: correo,
      subject,
      html,
    });
    return { success: true, message: 'Código enviado al correo' };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    return { success: false, message: 'Error al enviar el correo: ' + error.message };
  }
};

module.exports = {
  generarCodigo,
  enviarCodigoVerificacion,
};

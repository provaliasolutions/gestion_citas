
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Configuración del transporter SMTP con las variables seguras
const transporter = nodemailer.createTransport({
  host: functions.config().smtp.host,
  port: Number(functions.config().smtp.port),
  secure: functions.config().smtp.port === "465", // true si es puerto 465
  auth: {
    user: functions.config().smtp.user,
    pass: functions.config().smtp.pass,
  },
});

// 🚀 Enviar correo al CREAR cita
exports.sendAppointmentConfirmation = functions.firestore
    .document("appointments/{appointmentId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();

      const mailOptions = {
        from: `"Gestor de Citas" <${functions.config().smtp.user}>`,
        to: data.customer.email,
        subject: "✅ Confirmación de tu cita",
        html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2>Hola ${data.customer.name},</h2>
          <p>Tu cita ha sido <b>confirmada</b>.</p>
          <p><strong>Servicio:</strong> ${data.service.name}<br>
          <strong>Fecha:</strong> ${new Date(data.date).toLocaleDateString("es-ES")}<br>
          <strong>Hora:</strong> ${data.time}<br>
          <strong>Duración:</strong> ${data.service.duration} min</p>
          <hr>
          <p style="color:gray;font-size:12px;">Este es un correo automático.</p>
        </div>
      `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("📧 Email de confirmación enviado a:", data.customer.email);
      } catch (error) {
        console.error("❌ Error enviando email:", error);
      }
    });

// 🚀 Enviar correo al ELIMINAR cita
exports.sendAppointmentCancellation = functions.firestore
    .document("appointments/{appointmentId}")
    .onDelete(async (snap, context) => {
      const data = snap.data();

      const mailOptions = {
        from: `"Gestor de Citas" <${functions.config().smtp.user}>`,
        to: data.customer.email,
        subject: "❌ Cancelación de tu cita",
        html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2>Hola ${data.customer.name},</h2>
          <p>Tu cita para <b>${data.service.name}</b> ha sido cancelada.</p>
          <p><strong>Fecha:</strong> ${new Date(data.date).toLocaleDateString("es-ES")}<br>
          <strong>Hora:</strong> ${data.time}</p>
        </div>
      `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("📧 Email de cancelación enviado a:", data.customer.email);
      } catch (error) {
        console.error("❌ Error enviando email:", error);
      }
    });

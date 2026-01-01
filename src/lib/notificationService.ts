export class NotificationService {
  private static webhookUrl = process.env.NOTIFICATIONS_WEBHOOK_URL;

  static async send(message: string, title?: string, color: number = 0x3B82F6) {
    if (!this.webhookUrl) {
      console.warn('NOTIFICATIONS_WEBHOOK_URL no configurada. Saltando notificación.');
      return false;
    }

    try {
      const payload = {
        embeds: [
          {
            title: title || 'Notificación de DROPAPP',
            description: message,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Sistema de Alertas DROPAPP',
            },
          },
        ],
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      return false;
    }
  }

  static async notifyNewUser(email: string, name: string) {
    return this.send(
      `👤 **Nuevo Usuario Registrado**\n**Nombre:** ${name}\n**Email:** ${email}`,
      'Registro de Usuario',
      0x10B981 // Verde
    );
  }

  static async notifyNewSale(userId: string, plan: string, amount?: string) {
    return this.send(
      `💰 **Nuevo Plan Adquirido**\n**Usuario ID:** ${userId}\n**Plan:** ${plan.toUpperCase()}${amount ? `\n**Monto:** ${amount}` : ''}`,
      'Venta Aprobada',
      0xF59E0B // Dorado/Amarillo
    );
  }
}

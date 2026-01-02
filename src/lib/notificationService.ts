export class NotificationService {
  private static webhookUrl = process.env.NOTIFICATIONS_WEBHOOK_URL;

  static async send(message: string, title?: string, color: number = 0x3B82F6, fields: { name: string, value: string, inline?: boolean }[] = []) {
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
            fields: fields,
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
      `🚀 **¡Un nuevo usuario se ha unido a la plataforma!**`,
      'Nuevo Registro de Usuario',
      0x10B981, // Verde
      [
        { name: 'Nombre', value: name, inline: true },
        { name: 'Email', value: email, inline: true }
      ]
    );
  }

  static async notifyNewSale(userId: string, plan: string, amount?: string) {
    const fields = [
      { name: 'Usuario ID', value: userId, inline: false },
      { name: 'Plan', value: plan.toUpperCase(), inline: true }
    ];

    if (amount) {
      fields.push({ name: 'Monto', value: amount, inline: true });
    }

    return this.send(
      `💰 **¡Nueva venta procesada con éxito!**`,
      'Venta Aprobada',
      0xF59E0B, // Dorado/Amarillo
      fields
    );
  }
}

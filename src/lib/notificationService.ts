import { supabaseAdmin } from './supabaseAdmin';

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[NotificationService] Discord Error ${response.status}:`, errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('[NotificationService] Fetch Exception:', error);
      return false;
    }
  }

  static async notifyNewUser(email: string, name: string, country?: string, phone?: string) {
    const fields = [
      { name: 'Nombre', value: name, inline: true },
      { name: 'Email', value: email, inline: true }
    ];

    if (country) fields.push({ name: 'País', value: country, inline: true });
    if (phone) fields.push({ name: 'Celular', value: `[WhatsApp](https://wa.me/${phone.replace(/\+/g, '')}) (${phone})`, inline: true });

    return this.send(
      `🚀 **¡Un nuevo usuario se ha unido a la plataforma!**`,
      'Nuevo Registro de Usuario',
      0x10B981, // Verde
      fields
    );
  }

  static async notifyNewSale(userId: string, plan: string, amount?: string, isManual: boolean = false) {
    let name = 'Desconocido';
    let email = 'N/A';

    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('name, email')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        name = profile.name || name;
        email = profile.email || email;
      }
    } catch (err) {
      console.warn('[NotificationService] Error al obtener perfil:', err);
    }

    const fields = [
      { name: 'Nombre', value: name, inline: true },
      { name: 'Email', value: email, inline: true },
      { name: 'Plan', value: plan.toUpperCase(), inline: true }
    ];

    if (isManual) {
      fields.push({ name: 'Tipo', value: 'Activación Manual (Admin)', inline: true });
    }

    fields.push({ name: 'Usuario ID', value: userId, inline: false });

    if (isManual) {
       console.log(`[NotificationService] Salteando notificación de Discord por ser activación manual para ${email}`);
       return true;
    }

    return this.send(
      `💰 **¡Nueva venta procesada con éxito!**`,
      'Venta Aprobada',
      0xF59E0B, // Dorado/Amarillo
      fields
    );
  }
}

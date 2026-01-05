import crypto from 'crypto';

interface BoldAmount {
  currency: string;
  total_amount: number;
  tip_amount: number;
}

interface BoldLinkRequest {
  amount_type: 'CLOSE';
  amount: BoldAmount;
  reference: string;
  description: string;
  callback_url: string;
  payer_email?: string;
}

export class BoldService {
  private static API_URL = 'https://integrations.api.bold.co/online/link/v1';
  private static IDENTITY_KEY = (process.env.BOLD_IDENTITY_KEY || '').trim();
  private static SECRET_KEY = (process.env.BOLD_SECRET_KEY || '').trim();

  /**
   * Crea un link de pago en Bold.
   */
  static async createPaymentLink(data: {
    amount: number,
    currency?: string,
    reference: string,
    description: string,
    callbackUrl?: string,
    payerEmail?: string
  }) {
    if (!this.IDENTITY_KEY) {
      throw new Error('BOLD_IDENTITY_KEY no está configurada');
    }

    const body: BoldLinkRequest = {
      amount_type: 'CLOSE',
      amount: {
        currency: data.currency || 'USD',
        total_amount: data.amount,
        tip_amount: 0,
      },
      reference: data.reference,
      description: data.description,
    } as any;

    if (data.callbackUrl) {
      body.callback_url = data.callbackUrl;
    }

    if (data.payerEmail) {
      body.payer_email = data.payerEmail;
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `x-api-key ${this.IDENTITY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.debug('Bold API Response Status:', response.status);

    const result = await response.json();

    if (!response.ok) {
      console.error('Error Bold API:', result);
      throw new Error(result.message || 'Error al crear link de pago en Bold');
    }

    return result.payload.url;
  }

  /**
   * Verifica la firma de un webhook de Bold.
   */
  static verifySignature(body: string, signature: string): boolean {
    const keysToTry = [
      { name: 'SECRET_KEY', val: this.SECRET_KEY },
      { name: 'IDENTITY_KEY', val: this.IDENTITY_KEY },
      { name: 'EMPTY_STRING (Sandbox)', val: '' }
    ];

    const bodyBuffer = typeof body === 'string' ? Buffer.from(body) : body;

    try {
      for (const { name, val } of keysToTry) {
        // Opción A: Directo
        const sigA = crypto.createHmac('sha256', val).update(bodyBuffer).digest('hex');
        // Opción B: Base64 (Estándar de Bold)
        const bodyBase64 = bodyBuffer.toString('base64');
        const sigB = crypto.createHmac('sha256', val).update(bodyBase64).digest('hex');

        if (sigA.toLowerCase() === signature.toLowerCase() || sigB.toLowerCase() === signature.toLowerCase()) {
          console.log(`[BoldService] ✅ Firma válida verified using ${name}`);
          return true;
        }
      }

      console.error(`[BoldService] ❌ Error de validación de firma. Recibida: ${signature.substring(0, 16)}...`);
      return false;
    } catch (error) {
      console.error('Error verificando firma de Bold:', error);
      return false;
    }
  }
}

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
    if (!this.SECRET_KEY) {
      console.warn('BOLD_SECRET_KEY no está configurada, no se puede verificar firma');
      return false;
    }

    try {
      // 1. Convertir el cuerpo a Base64
      const base64Body = Buffer.from(body).toString('base64');
      
      // 2. Crear HMAC-SHA256 con la llave secreta
      const hmac = crypto.createHmac('sha256', this.SECRET_KEY);
      hmac.update(base64Body);
      const calculatedSignature = hmac.digest('hex');

      // 3. Comparar con la firma recibida
      return calculatedSignature === signature;
    } catch (error) {
      console.error('Error verificando firma de Bold:', error);
      return false;
    }
  }
}

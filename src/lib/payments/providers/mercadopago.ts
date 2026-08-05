import { PaymentProvider, ChargeInput, ChargeResponse, PaymentStatusResponse, RefundResponse, WebhookResult } from '../PaymentProvider';

export class MercadoPagoProvider implements PaymentProvider {
  name = 'Mercado Pago (Pix + Cartão)';
  providerKey = 'mercadopago' as const;

  private getAccessToken(): string | undefined {
    return process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  }

  validateConfig(): { valid: boolean; missingKeys: string[] } {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return {
        valid: false,
        missingKeys: ['MERCADOPAGO_ACCESS_TOKEN'],
      };
    }
    return { valid: true, missingKeys: [] };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return {
        success: true,
        message: '[Modo Simulado / Sandbox] Mercado Pago pronto para uso local sem chave real. Configure MERCADOPAGO_ACCESS_TOKEN no .env para transações reais.',
      };
    }

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Conexão com a API do Mercado Pago (Sandbox/Production) estabelecida com sucesso!',
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: `Falha na autenticação do Mercado Pago: ${errorData.message || response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro ao conectar com Mercado Pago: ${(error as Error).message}`,
      };
    }
  }

  async createCharge(input: ChargeInput): Promise<ChargeResponse> {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    // Se chave real não estiver configurada, executa simulação robusta de Pix/Cartão para testes imediatos
    if (!token) {
      const mockPaymentId = `mp_sim_${Date.now()}`;
      const simulatedPixCopyPaste = `00020126580014br.gov.bcb.pix0136d8048f76-0b1a-4d43-9876-simulatedpix${Date.now()}5204000053039865405${input.amount.toFixed(2)}5802BR5925Burger Co Artisan6009Sao Paulo62070503***63041D2E`;

      // Gerador visual de QR Code estático via API pública para exibição bonita
      const simulatedQrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(simulatedPixCopyPaste)}`;

      return {
        success: true,
        paymentId: mockPaymentId,
        status: 'PENDING',
        paymentMethod: input.paymentMethod,
        pixQrCode: simulatedQrCodeImage,
        pixCopyPaste: simulatedPixCopyPaste,
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };
    }

    // Integração Real Mercado Pago REST API
    try {
      if (input.paymentMethod === 'PIX') {
        const bodyPayload = {
          transaction_amount: Number(input.amount.toFixed(2)),
          description: input.description,
          payment_method_id: 'pix',
          payer: {
            email: input.customer.email || 'cliente@exemplo.com',
            first_name: input.customer.name.split(' ')[0],
            last_name: input.customer.name.split(' ').slice(1).join(' ') || 'Cliente',
            identification: input.customer.cpf ? {
              type: 'CPF',
              number: input.customer.cpf.replace(/\D/g, ''),
            } : undefined,
          },
          external_reference: input.orderId,
        };

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Idempotency-Key': `order_${input.orderId}_${Date.now()}`,
          },
          body: JSON.stringify(bodyPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao criar pagamento no Mercado Pago');
        }

        const pointOfInteraction = data.point_of_interaction?.transaction_data;

        return {
          success: true,
          paymentId: String(data.id),
          status: data.status === 'approved' ? 'PAID' : 'PENDING',
          paymentMethod: 'PIX',
          pixQrCode: pointOfInteraction?.qr_code_base64
            ? `data:image/png;base64,${pointOfInteraction.qr_code_base64}`
            : pointOfInteraction?.ticket_url,
          pixCopyPaste: pointOfInteraction?.qr_code,
          expirationDate: data.date_of_expiration,
          rawResponse: data,
        };
      } else {
        // Cartão de crédito via token
        const bodyPayload = {
          transaction_amount: Number(input.amount.toFixed(2)),
          token: input.cardToken,
          description: input.description,
          payment_method_id: 'master', // Pode ser dinâmico
          payer: {
            email: input.customer.email || 'cliente@exemplo.com',
          },
          external_reference: input.orderId,
        };

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyPayload),
        });

        const data = await response.json();

        return {
          success: response.ok && (data.status === 'approved' || data.status === 'in_process'),
          paymentId: String(data.id),
          status: data.status === 'approved' ? 'PAID' : 'PENDING',
          paymentMethod: 'CREDIT_CARD',
          rawResponse: data,
        };
      }
    } catch (error) {
      return {
        success: false,
        paymentId: '',
        status: 'FAILED',
        paymentMethod: input.paymentMethod,
        errorMessage: (error as Error).message,
      };
    }
  }

  async getStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token || paymentId.startsWith('mp_sim_')) {
      // Simulação: aprovado após 5 segundos
      return {
        paymentId,
        status: 'PAID',
        paidAt: new Date(),
      };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      let mappedStatus: PaymentStatusResponse['status'] = 'PENDING';
      if (data.status === 'approved') mappedStatus = 'PAID';
      if (data.status === 'rejected' || data.status === 'cancelled') mappedStatus = 'FAILED';
      if (data.status === 'refunded') mappedStatus = 'REFUNDED';

      return {
        paymentId: String(data.id),
        status: mappedStatus,
        paidAt: data.date_approved ? new Date(data.date_approved) : undefined,
        rawResponse: data,
      };
    } catch {
      return {
        paymentId,
        status: 'PENDING',
      };
    }
  }

  async refund(paymentId: string): Promise<RefundResponse> {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token || paymentId.startsWith('mp_sim_')) {
      return { success: true, refundId: `ref_sim_${Date.now()}` };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return {
        success: response.ok,
        refundId: data.id ? String(data.id) : undefined,
        errorMessage: data.message,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: (error as Error).message,
      };
    }
  }

  async webhookHandler(reqPayload: unknown): Promise<WebhookResult> {
    const payload = reqPayload as { action?: string; type?: string; data?: { id?: string } };

    if (payload?.data?.id) {
      const statusRes = await this.getStatus(payload.data.id);
      return {
        handled: true,
        paymentId: payload.data.id,
        status: statusRes.status === 'PAID' ? 'PAID' : 'PENDING',
      };
    }

    return { handled: false };
  }
}

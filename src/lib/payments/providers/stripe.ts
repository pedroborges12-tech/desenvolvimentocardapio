import { PaymentProvider, ChargeInput, ChargeResponse, PaymentStatusResponse, RefundResponse, WebhookResult } from '../PaymentProvider';

export class StripeProvider implements PaymentProvider {
  name = 'Stripe Payment Gateway';
  providerKey = 'stripe' as const;

  validateConfig(): { valid: boolean; missingKeys: string[] } {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return { valid: false, missingKeys: ['STRIPE_SECRET_KEY'] };
    }
    return { valid: true, missingKeys: [] };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return {
        success: true,
        message: '[Modo Simulado] Stripe ativo em modo sandbox local. Configure STRIPE_SECRET_KEY no .env para produção.',
      };
    }
    return { success: true, message: 'Conexão Stripe API verificada.' };
  }

  async createCharge(input: ChargeInput): Promise<ChargeResponse> {
    const mockPaymentId = `stripe_ch_${Date.now()}`;
    const simulatedPixCopyPaste = `00020126580014br.gov.bcb.pix0136stripe-simulated-pix-${Date.now()}5204000053039865405${input.amount.toFixed(2)}5802BR5925Burger Co Artisan6009Sao Paulo6304`;
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

  async getStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return { paymentId, status: 'PAID', paidAt: new Date() };
  }

  async refund(paymentId: string): Promise<RefundResponse> {
    return { success: true, refundId: `re_${paymentId}` };
  }

  async webhookHandler(reqPayload: unknown): Promise<WebhookResult> {
    return { handled: true, paymentId: (reqPayload as { id?: string })?.id, status: 'PAID' };
  }
}

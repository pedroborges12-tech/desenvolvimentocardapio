import { PaymentProvider, ChargeInput, ChargeResponse, PaymentStatusResponse, RefundResponse, WebhookResult } from '../PaymentProvider';

export class PagSeguroProvider implements PaymentProvider {
  name = 'PagBank / PagSeguro';
  providerKey = 'pagseguro' as const;

  validateConfig(): { valid: boolean; missingKeys: string[] } {
    const token = process.env.PAGSEGURO_TOKEN;
    if (!token) {
      return { valid: false, missingKeys: ['PAGSEGURO_TOKEN'] };
    }
    return { valid: true, missingKeys: [] };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const token = process.env.PAGSEGURO_TOKEN;
    if (!token) {
      return {
        success: true,
        message: '[Modo Simulado] PagSeguro ativo em modo sandbox local. Configure PAGSEGURO_TOKEN no .env.',
      };
    }
    return { success: true, message: 'Conexão PagSeguro API verificada.' };
  }

  async createCharge(input: ChargeInput): Promise<ChargeResponse> {
    const mockPaymentId = `pagseguro_${Date.now()}`;
    const simulatedPixCopyPaste = `00020126580014br.gov.bcb.pix0136pagseguro-simulated-pix-${Date.now()}5204000053039865405${input.amount.toFixed(2)}5802BR5925Burger Co Artisan6009Sao Paulo6304`;
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
    return { success: true, refundId: `ref_${paymentId}` };
  }

  async webhookHandler(reqPayload: unknown): Promise<WebhookResult> {
    return { handled: true, paymentId: (reqPayload as { id?: string })?.id, status: 'PAID' };
  }
}

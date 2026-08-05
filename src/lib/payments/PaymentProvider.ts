export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
}

export interface ChargeInput {
  orderId: string;
  amount: number;
  description: string;
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  customer: CustomerInfo;
  cardToken?: string; // Para pagamentos com cartão de crédito
}

export interface ChargeResponse {
  success: boolean;
  paymentId: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  pixQrCode?: string;     // Base64 ou Imagem QR Code
  pixCopyPaste?: string;  // Chave Pix Copia e Cola
  expirationDate?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paidAt?: Date;
  rawResponse?: unknown;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  errorMessage?: string;
}

export interface WebhookResult {
  handled: boolean;
  orderId?: string;
  paymentId?: string;
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
}

export interface PaymentProvider {
  name: string;
  providerKey: 'mercadopago' | 'stripe' | 'pagseguro';

  /**
   * Valida se todas as credenciais necessárias estão presentes no ambiente
   */
  validateConfig(): { valid: boolean; missingKeys: string[] };

  /**
   * Testa a conexão com a API do provedor (Sandbox/Live)
   */
  testConnection(): Promise<{ success: boolean; message: string }>;

  /**
   * Cria uma nova cobrança (Pix ou Cartão)
   */
  createCharge(input: ChargeInput): Promise<ChargeResponse>;

  /**
   * Consulta o status atual de uma cobrança pelo ID de pagamento
   */
  getStatus(paymentId: string): Promise<PaymentStatusResponse>;

  /**
   * Realiza estorno/reembolso de uma cobrança
   */
  refund(paymentId: string, amount?: number): Promise<RefundResponse>;

  /**
   * Processa notificações recebidas via Webhook/IPN
   */
  webhookHandler(reqPayload: unknown, headers?: Record<string, string>): Promise<WebhookResult>;
}

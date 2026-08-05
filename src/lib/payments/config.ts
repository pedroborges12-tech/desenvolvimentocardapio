export type SupportedPaymentProvider = 'mercadopago' | 'stripe' | 'pagseguro';

export interface PaymentConfig {
  activeProvider: SupportedPaymentProvider;
  environment: 'sandbox' | 'production';
}

export const paymentConfig: PaymentConfig = {
  activeProvider: (process.env.PAYMENT_PROVIDER as SupportedPaymentProvider) || 'mercadopago',
  environment: (process.env.PAYMENT_ENV as 'sandbox' | 'production') || 'sandbox',
};

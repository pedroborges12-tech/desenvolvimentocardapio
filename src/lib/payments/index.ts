import { PaymentProvider } from './PaymentProvider';
import { MercadoPagoProvider } from './providers/mercadopago';
import { StripeProvider } from './providers/stripe';
import { PagSeguroProvider } from './providers/pagseguro';
import { paymentConfig, SupportedPaymentProvider } from './config';

const providers: Record<SupportedPaymentProvider, PaymentProvider> = {
  mercadopago: new MercadoPagoProvider(),
  stripe: new StripeProvider(),
  pagseguro: new PagSeguroProvider(),
};

export function getActivePaymentProvider(): PaymentProvider {
  const activeKey = (process.env.PAYMENT_PROVIDER as SupportedPaymentProvider) || paymentConfig.activeProvider;
  const provider = providers[activeKey];

  if (!provider) {
    console.warn(`[Payment] Provedor '${activeKey}' não encontrado. Usando 'mercadopago' como padrão.`);
    return providers.mercadopago;
  }

  return provider;
}

export const activePaymentProvider = getActivePaymentProvider();

export * from './PaymentProvider';
export * from './config';

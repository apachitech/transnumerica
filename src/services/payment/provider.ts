import { Currency, MomoProvider } from '@/types';

export interface PaymentInitiateRequest {
  idempotencyKey: string;
  amountMinor: number;
  currency: Currency;
  paymentMethod: 'MOMO' | 'CARD' | 'CASH';
  momoProvider?: MomoProvider;
  phoneNumber?: string;
  referenceId: string; // e.g. bookingId or rideId
  description: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  promptMessage: string;
  operatorReference?: string;
  expiresAt: string;
}

export interface PaymentStatusResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amountMinor: number;
  currency: Currency;
  settledAt?: string;
  failureReason?: string;
}

export interface IPaymentProvider {
  name: string;
  initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;
  confirmCashPayment(rideId: string, driverId: string, amountMinor: number): Promise<boolean>;
}

/**
 * Mock Aggregator Payment Provider (e.g. simulating PawaPay / MaxiCash / Flutterwave for DR Congo)
 * Supports M-Pesa, Airtel Money, Orange Money, Africell Money, and Cash.
 */
export class MockMobileMoneyAggregator implements IPaymentProvider {
  public name = 'Transnumerica Congo Payment Aggregator (PawaPay/MaxiCash Mock)';
  private transactions = new Map<string, PaymentStatusResponse>();
  private idempotencyStore = new Map<string, PaymentInitiateResponse>();

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    // 1. Check idempotency
    if (this.idempotencyStore.has(req.idempotencyKey)) {
      return this.idempotencyStore.get(req.idempotencyKey)!;
    }

    const txId = `TX-RDC-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    if (req.paymentMethod === 'CASH') {
      const response: PaymentInitiateResponse = {
        success: true,
        transactionId: txId,
        status: 'PENDING',
        promptMessage: 'Paiement en espèces à remettre au chauffeur à destination.',
        operatorReference: `CASH-${req.referenceId}`,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      };
      this.transactions.set(txId, {
        transactionId: txId,
        status: 'PENDING',
        amountMinor: req.amountMinor,
        currency: req.currency,
      });
      this.idempotencyStore.set(req.idempotencyKey, response);
      return response;
    }

    if (req.paymentMethod === 'CARD') {
      const response: PaymentInitiateResponse = {
        success: true,
        transactionId: txId,
        status: 'SUCCESS',
        promptMessage: 'Paiement par carte bancaire débité avec succès via 3D Secure.',
        operatorReference: `CARD-${req.referenceId}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      this.transactions.set(txId, {
        transactionId: txId,
        status: 'SUCCESS',
        amountMinor: req.amountMinor,
        currency: req.currency,
        settledAt: new Date().toISOString(),
      });
      this.idempotencyStore.set(req.idempotencyKey, response);
      return response;
    }

    // Mobile Money flow
    const providerName = req.momoProvider || 'MOMO';
    const response: PaymentInitiateResponse = {
      success: true,
      transactionId: txId,
      status: 'PENDING',
      promptMessage: `Un message USSD push de validation ${providerName} a été envoyé au ${req.phoneNumber || 'votre numéro'}. Veuillez saisir votre code PIN secret sur votre téléphone pour valider.`,
      operatorReference: `MOMO-REF-${Math.floor(Math.random() * 899999 + 100000)}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    this.transactions.set(txId, {
      transactionId: txId,
      status: 'PENDING',
      amountMinor: req.amountMinor,
      currency: req.currency,
    });
    this.idempotencyStore.set(req.idempotencyKey, response);

    // Simulate async webhook settlement after 2 seconds
    setTimeout(() => {
      this.transactions.set(txId, {
        transactionId: txId,
        status: 'SUCCESS',
        amountMinor: req.amountMinor,
        currency: req.currency,
        settledAt: new Date().toISOString(),
      });
    }, 2500);

    return response;
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      return {
        transactionId,
        status: 'FAILED',
        amountMinor: 0,
        currency: 'CDF',
        failureReason: 'Transaction introuvable',
      };
    }
    return tx;
  }

  async confirmCashPayment(rideId: string, driverId: string, amountMinor: number): Promise<boolean> {
    console.log(`[Payment] Cash confirmed for ride ${rideId} by driver ${driverId}: ${amountMinor}`);
    return true;
  }
}

export const paymentProvider = new MockMobileMoneyAggregator();

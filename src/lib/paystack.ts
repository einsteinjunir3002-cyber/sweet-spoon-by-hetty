/**
 * Paystack Payment Service
 * All payment operations run server-side only.
 * Secret keys are NEVER exposed to the frontend.
 */

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

function getPaystackHeaders() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }
  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  }
}

export interface InitializePaymentParams {
  email: string
  amount: number // In GHS — will be converted to pesewas (x100)
  reference: string
  metadata?: Record<string, unknown>
  callbackUrl?: string
  channels?: string[]
}

export interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: 'success' | 'failed' | 'abandoned' | 'pending'
    reference: string
    amount: number // In pesewas
    message: string | null
    gateway_response: string
    paid_at: string | null
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: Record<string, unknown>
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
    }
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
    }
  }
}

/**
 * Initialize a Paystack transaction (server-side only)
 */
export async function initializePayment(params: InitializePaymentParams): Promise<PaystackInitResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: getPaystackHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // Convert GHS to pesewas
      reference: params.reference,
      callback_url: params.callbackUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/verify`,
      channels: params.channels ?? ['mobile_money', 'card'],
      metadata: {
        ...params.metadata,
        cancel_action: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancelled`,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Paystack initialization failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Verify a Paystack transaction (server-side only)
 */
export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: getPaystackHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Paystack verification failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Verify Paystack webhook signature
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require('crypto')
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET
  if (!secret) {
    console.error('PAYSTACK_WEBHOOK_SECRET not configured')
    return false
  }
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
  return hash === signature
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(orderNumber: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SS-${orderNumber}-${timestamp}-${random}`
}

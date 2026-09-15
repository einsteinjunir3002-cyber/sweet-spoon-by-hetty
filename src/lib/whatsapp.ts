/**
 * WhatsApp Message Builder
 * Generates structured WhatsApp messages for orders
 */

import { db } from '@/lib/db'

export interface WhatsAppOrderParams {
  customerName: string
  orderNumber?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    variant?: string
  }>
  deliveryType: 'DELIVERY' | 'PICKUP'
  deliveryAddress?: string
  deliveryArea?: string
  subtotal: number
  deliveryFee: number
  discountAmount?: number
  total: number
  notes?: string
}

/**
 * Build a formatted WhatsApp message for an order
 */
export function buildWhatsAppOrderMessage(params: WhatsAppOrderParams): string {
  const {
    customerName,
    orderNumber,
    items,
    deliveryType,
    deliveryAddress,
    deliveryArea,
    subtotal,
    deliveryFee,
    discountAmount = 0,
    total,
    notes,
  } = params

  const lines: string[] = [
    '🛍️ *ORDER FROM SWEET SPOON BY HETTY WEBSITE*',
    '',
    `👤 *Customer:* ${customerName}`,
  ]

  if (orderNumber) {
    lines.push(`📋 *Order #:* ${orderNumber}`)
  }

  lines.push('', '🛒 *Order Items:*')

  items.forEach((item) => {
    const variant = item.variant ? ` (${item.variant})` : ''
    lines.push(`  • ${item.name}${variant} × ${item.quantity} — GH₵${(item.price * item.quantity).toFixed(2)}`)
  })

  lines.push('', '─────────────────')
  lines.push(`Subtotal: GH₵${subtotal.toFixed(2)}`)

  if (discountAmount > 0) {
    lines.push(`Discount: -GH₵${discountAmount.toFixed(2)}`)
  }

  if (deliveryFee > 0) {
    lines.push(`Delivery: GH₵${deliveryFee.toFixed(2)}`)
  }

  lines.push(`*TOTAL: GH₵${total.toFixed(2)}*`)
  lines.push('─────────────────')
  lines.push('')

  if (deliveryType === 'DELIVERY') {
    lines.push('🚚 *Delivery*')
    if (deliveryArea) lines.push(`Area: ${deliveryArea}`)
    if (deliveryAddress) lines.push(`Address: ${deliveryAddress}`)
  } else {
    lines.push('🏪 *Pickup Order*')
  }

  if (notes) {
    lines.push('', `📝 *Notes:* ${notes}`)
  }

  lines.push('', '─────────────────')
  lines.push('Order placed via sweetspoonbyhetty.com')

  return lines.join('\n')
}

/**
 * Generate a WhatsApp URL for a phone number and message
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  // Remove spaces, dashes and leading zeros for Ghana numbers
  const cleaned = phoneNumber.replace(/[\s\-]/g, '')
  const withCountryCode = cleaned.startsWith('0')
    ? `233${cleaned.slice(1)}` // Ghana country code
    : cleaned

  const encoded = encodeURIComponent(message)
  return `https://wa.me/${withCountryCode}?text=${encoded}`
}

/**
 * Get WhatsApp number from site settings
 */
export async function getWhatsAppNumber(): Promise<string> {
  const settings = await db.siteSettings.findFirst()
  return settings?.whatsappNumber ?? '0535372613'
}

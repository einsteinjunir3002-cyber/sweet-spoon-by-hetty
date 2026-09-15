import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Check if the current user is authenticated
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  }
  return { error: null, session }
}

/**
 * Check if the current user is an OWNER
 * Use this for ALL admin API routes
 */
export async function requireOwner() {
  const { error, session } = await requireAuth()
  if (error) return { error, session: null }

  if (session!.user.role !== 'OWNER') {
    return {
      error: NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 }),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Generate a readable order number: SS-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.floor(Math.random() * 9000 + 1000).toString()
  return `SS-${datePart}-${randomPart}`
}

/**
 * Format a price as Ghana Cedis
 */
export function formatPrice(amount: number, currency = 'GH₵'): string {
  return `${currency}${amount.toFixed(2)}`
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Calculate discount amount from a coupon
 */
export function calculateDiscount(
  coupon: { type: string; value: number; maximumDiscount?: number | null },
  subtotal: number
): number {
  if (coupon.type === 'PERCENTAGE') {
    const discount = (subtotal * coupon.value) / 100
    if (coupon.maximumDiscount) {
      return Math.min(discount, coupon.maximumDiscount)
    }
    return discount
  }
  // FIXED
  return Math.min(coupon.value, subtotal)
}

/**
 * Truncate text to a given length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get order status display info
 */
export function getOrderStatusInfo(status: string): { label: string; color: string; description: string } {
  const statuses: Record<string, { label: string; color: string; description: string }> = {
    PENDING: { label: 'Pending', color: '#F59E0B', description: 'Order received, awaiting confirmation' },
    PAYMENT_PENDING: { label: 'Payment Pending', color: '#F59E0B', description: 'Awaiting payment confirmation' },
    PAID: { label: 'Paid', color: '#10B981', description: 'Payment confirmed' },
    CONFIRMED: { label: 'Confirmed', color: '#3B82F6', description: 'Order confirmed by Sweet Spoon' },
    PREPARING: { label: 'Preparing', color: '#8B5CF6', description: 'Your order is being prepared fresh' },
    READY: { label: 'Ready', color: '#10B981', description: 'Your order is ready!' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#F59E0B', description: 'On the way to you' },
    DELIVERED: { label: 'Delivered', color: '#10B981', description: 'Order delivered successfully' },
    CANCELLED: { label: 'Cancelled', color: '#EF4444', description: 'Order was cancelled' },
    REFUNDED: { label: 'Refunded', color: '#6B7280', description: 'Order was refunded' },
  }
  return statuses[status] ?? { label: status, color: '#6B7280', description: '' }
}

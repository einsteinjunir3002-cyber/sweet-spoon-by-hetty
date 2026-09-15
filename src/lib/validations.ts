import { z } from 'zod'

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Please enter your email or username'),
  password: z.string().min(1, 'Please enter your password'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^0\d{9}$/, 'Please enter a valid Ghana phone number (e.g. 0501234567)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter your current password'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ============================================================
// PRODUCT SCHEMAS
// ============================================================

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  size: z.string().optional(),
  weight: z.string().optional(),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  isVisible: z.boolean().default(true),
})

// ============================================================
// ORDER & CHECKOUT SCHEMAS
// ============================================================

export const checkoutSchemaObject = z.object({
  customerName: z.string().min(2, 'Please enter your full name'),
  customerEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  customerPhone: z.string().regex(/^0\d{9}$/, 'Please enter a valid Ghana phone number'),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  deliveryAddress: z.string().optional(),
  deliveryArea: z.string().optional(),
  deliveryZoneId: z.string().optional(),
  deliveryNotes: z.string().optional(),
  orderNotes: z.string().optional(),
  couponCode: z.string().optional(),
})

export const checkoutSchema = checkoutSchemaObject.refine((data) => {
  if (data.deliveryType === 'DELIVERY') {
    return !!data.deliveryAddress && !!data.deliveryZoneId
  }
  return true
}, {
  message: 'Delivery address and zone are required for delivery orders',
  path: ['deliveryAddress'],
})

// ============================================================
// COUPON SCHEMAS
// ============================================================

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive('Value must be greater than 0'),
  minimumOrder: z.number().min(0).optional().nullable(),
  maximumDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
})

// ============================================================
// DELIVERY ZONE SCHEMAS
// ============================================================

export const deliveryZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  areas: z.array(z.string()).min(1, 'At least one area is required'),
  fee: z.number().min(0, 'Fee cannot be negative'),
  estimatedTime: z.string().optional(),
  minimumOrder: z.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
})

// ============================================================
// CONTACT SCHEMA
// ============================================================

export const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Please enter a message of at least 10 characters'),
})

// ============================================================
// SITE SETTINGS SCHEMA
// ============================================================

export const siteSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tagline: z.string().optional(),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCta1Text: z.string().optional(),
  heroCta2Text: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutText: z.string().optional(),
  comingSoonEnabled: z.boolean().optional(),
  comingSoonMessage: z.string().optional(),
  announcementText: z.string().optional(),
  announcementEnabled: z.boolean().optional(),
  allowGuestCheckout: z.boolean().optional(),
  enableReviews: z.boolean().optional(),
})

// ============================================================
// TYPES
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type DeliveryZoneInput = z.infer<typeof deliveryZoneSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>

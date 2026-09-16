'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './product.module.css'

interface ProductVariant {
  id: string
  name: string
  value: string
  price: number
  isActive: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  description?: string
  features?: string[]
  tags?: string[]
  size?: string
  isFeatured: boolean
  isPublished: boolean
  images?: { id: string; url: string; altText?: string; isMain: boolean }[]
  category?: { name: string; slug: string }
  inventory?: { quantity: number; trackStock: boolean }
  variants?: ProductVariant[]
  reviews?: {
    id: string
    rating: number
    comment?: string
    createdAt: string
    user?: { name?: string }
  }[]
}

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [cartMsg, setCartMsg] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('0535372613')

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product) setProduct(d.product)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))

    fetch('/api/settings/public')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.whatsappNumber) setWhatsappNumber(d.settings.whatsappNumber)
      })
      .catch(() => {})
  }, [slug])

  const productPrice = typeof product?.price === 'number' ? product.price : Number(product?.price || 0)
  const currentPrice = selectedVariant?.price !== undefined
    ? (typeof selectedVariant.price === 'number' ? selectedVariant.price : Number(selectedVariant.price || 0))
    : productPrice

  const productImages = Array.isArray(product?.images) ? product.images : []
  const productReviews = Array.isArray(product?.reviews) ? product.reviews : []
  const productVariants = Array.isArray(product?.variants) ? product.variants : []
  const productFeatures = Array.isArray(product?.features) ? product.features : []

  const addToCart = () => {
    if (!product) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const cartItem = {
      id: product.id,
      name: product.name + (selectedVariant ? ` (${selectedVariant.value})` : ''),
      slug: product.slug,
      price: currentPrice,
      image: productImages.find((i) => i.isMain)?.url || productImages[0]?.url || '/placeholder-product.jpg',
      quantity,
      variantId: selectedVariant?.id,
      notes: notes || undefined,
    }
    const existing = cart.find(
      (item: { id: string; variantId?: string }) =>
        item.id === product.id && item.variantId === cartItem.variantId
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push(cartItem)
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setCartMsg('Added to cart! 🎉')
    setTimeout(() => setCartMsg(''), 3000)
  }

  const orderOnWhatsApp = () => {
    if (!product) return
    const itemName = product.name + (selectedVariant ? ` (${selectedVariant.value})` : '')
    const message = encodeURIComponent(
      `Hello! I'd like to order from Sweet Spoon by Hetty:\n\n` +
      `Product: ${itemName}\n` +
      `Quantity: ${quantity}\n` +
      `Price: GH₵${(currentPrice * quantity).toFixed(2)}\n` +
      (notes ? `\nNotes: ${notes}` : '') +
      `\n\nPlease confirm availability and delivery options.`
    )
    const cleanedNum = (whatsappNumber && typeof whatsappNumber === 'string') ? whatsappNumber.replace(/[^0-9]/g, '').replace(/^0/, '') : '0535372613'
    window.open(`https://wa.me/233${cleanedNum || '0535372613'}?text=${message}`, '_blank')
  }

  const isOutOfStock = Boolean(product?.inventory?.trackStock && product.inventory.quantity <= 0)

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingContent}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonText}>
            <div className={styles.skeletonLine} style={{ width: '60%', height: '2rem' }} />
            <div className={styles.skeletonLine} style={{ width: '30%', height: '1.5rem' }} />
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>🍨</div>
        <h1>Product Not Found</h1>
        <p>This product may have been removed or is no longer available.</p>
        <Link href="/shop" className={styles.backBtn}>Browse All Products</Link>
      </div>
    )
  }

  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / productReviews.length
      : 0

  const comparePrice = product.compareAtPrice ? (typeof product.compareAtPrice === 'number' ? product.compareAtPrice : Number(product.compareAtPrice || 0)) : null
  const isOnSale = Boolean(comparePrice && comparePrice > currentPrice)
  const currentImg = productImages[selectedImage] || productImages[0]

  return (
    <div className={styles.productPage}>
      <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
              </>
            )}
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <div className={styles.productLayout}>
            {/* Images */}
            <div className={styles.imagesSection}>
              <div className={styles.mainImageWrapper}>
                <Image
                  src={currentImg?.url || '/placeholder-product.jpg'}
                  alt={currentImg?.altText || product.name}
                  fill
                  className={styles.mainImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {isOutOfStock && (
                  <div className={styles.outOfStockBanner}>Out of Stock</div>
                )}
              </div>
              {productImages.length > 1 && (
                <div className={styles.thumbnails}>
                  {productImages.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      className={`${styles.thumbnail} ${selectedImage === idx ? styles.activeThumbnail : ''}`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <Image src={img.url} alt={img.altText || product.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className={styles.productDetails}>
              {product.category && (
                <span className={styles.categoryTag}>{product.category.name}</span>
              )}

              <h1 className={styles.productTitle}>{product.name}</h1>

              {productReviews.length > 0 && (
                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={s <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}>★</span>
                    ))}
                  </div>
                  <span className={styles.reviewCount}>({productReviews.length} review{productReviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}

              <div className={styles.priceSection}>
                <span className={styles.price}>GH₵{currentPrice.toFixed(2)}</span>
                {isOnSale && comparePrice !== null && (
                  <span className={styles.comparePrice}>GH₵{comparePrice.toFixed(2)}</span>
                )}
                {isOnSale && comparePrice !== null && (
                  <span className={styles.saveBadge}>
                    Save GH₵{(comparePrice - currentPrice).toFixed(2)}
                  </span>
                )}
              </div>

              {product.size && (
                <div className={styles.sizeInfo}>
                  <span className={styles.sizeLabel}>Size:</span>
                  <span className={styles.sizeValue}>{product.size}</span>
                </div>
              )}

              {product.description && (
                <div className={styles.description}>
                  <p>{product.description}</p>
                </div>
              )}

              {/* Features */}
              {productFeatures.length > 0 && (
                <div className={styles.features}>
                  <h3>Why You'll Love It</h3>
                  <ul>
                    {productFeatures.map((f, i) => (
                      <li key={i}>
                        <span className={styles.checkIcon}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Variants */}
              {productVariants.length > 0 && (
                <div className={styles.variantsSection}>
                  <h3>Options</h3>
                  <div className={styles.variantGrid}>
                    {productVariants.map((v) => {
                      const varPrice = typeof v.price === 'number' ? v.price : Number(v.price || 0)
                      return (
                        <button
                          key={v.id}
                          className={`${styles.variantBtn} ${selectedVariant?.id === v.id ? styles.variantActive : ''}`}
                          onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                        >
                          {v.value}
                          {varPrice !== productPrice && (
                            <span className={styles.variantPrice}> +GH₵{(varPrice - productPrice).toFixed(2)}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className={styles.quantitySection}>
                <label>Quantity</label>
                <div className={styles.quantityControl}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => {
                      const max = product.inventory?.trackStock ? product.inventory.quantity : 99
                      setQuantity((q) => Math.min(max, q + 1))
                    }}
                  >
                    +
                  </button>
                </div>
                {product.inventory?.trackStock && (
                  <span className={styles.stockInfo}>
                    {product.inventory.quantity > 0
                      ? `${product.inventory.quantity} in stock`
                      : 'Out of stock'}
                  </span>
                )}
              </div>

              {/* Notes */}
              <div className={styles.notesSection}>
                <label htmlFor="notes">Special instructions (optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. No sugar, extra thick, etc."
                  rows={2}
                />
              </div>

              {/* Actions */}
              {cartMsg && <div className={styles.cartMsg}>{cartMsg}</div>}

              <div className={styles.actionBtns}>
                <button
                  className={styles.addToCartBtn}
                  onClick={addToCart}
                  disabled={!!isOutOfStock}
                >
                  🛒 Add to Cart
                </button>
                <Link href="/checkout" className={styles.buyNowBtn}>
                  Buy Now
                </Link>
              </div>

              <button className={styles.whatsappBtn} onClick={orderOnWhatsApp}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order on WhatsApp
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          {productReviews.length > 0 && (
            <section className={styles.reviewsSection}>
              <h2>Customer Reviews</h2>
              <div className={styles.reviewsGrid}>
                {productReviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={s <= review.rating ? styles.starFilled : styles.starEmpty}>★</span>
                        ))}
                      </div>
                      <span className={styles.reviewerName}>{review.user?.name || 'Customer'}</span>
                    </div>
                    {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
                    <span className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-GH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
  )
}

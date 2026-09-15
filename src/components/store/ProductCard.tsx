import Image from 'next/image'
import Link from 'next/link'
import styles from './ProductCard.module.css'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  shortDescription?: string | null
  images: Array<{ url: string; altText?: string | null }>
  inventory?: { quantity: number; trackStock: boolean } | null
  isFeatured: boolean
  features?: string[]
}

interface ProductCardProps {
  product: Product
  currencySymbol?: string
}

export function ProductCard({ product, currencySymbol = 'GH₵' }: ProductCardProps) {
  const mainImage = product.images[0]
  const isOutOfStock = product.inventory?.trackStock
    ? (product.inventory?.quantity ?? 0) <= 0
    : false
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price

  const isFeaturesArray = Array.isArray(product.features)

  return (
    <Link href={`/products/${product.slug}`} className={styles.card} aria-label={product.name}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.altText ?? product.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <span>🥛</span>
          </div>
        )}

        {/* Badges */}
        <div className={styles.badges}>
          {product.isFeatured && (
            <span className={`badge badge-pink ${styles.badge}`}>Featured</span>
          )}
          {isOnSale && (
            <span className={`badge badge-error ${styles.badge}`}>Sale</span>
          )}
          {isOutOfStock && (
            <span className={`badge badge-gray ${styles.badge}`}>Sold Out</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>

        {product.shortDescription && (
          <p className={styles.description}>{product.shortDescription}</p>
        )}

        {/* Features (e.g. "150ml • Probiotic • Natural") */}
        {isFeaturesArray && product.features!.length > 0 && (
          <div className={styles.features}>
            {product.features!.slice(0, 3).map((f, i) => (
              <span key={i} className={styles.featureTag}>{f}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.pricing}>
          <span className={styles.price}>
            {currencySymbol}{(typeof product.price === 'number' ? product.price : Number(product.price || 0)).toFixed(2)}
          </span>
          {isOnSale && (
            <span className={styles.comparePrice}>
              {currencySymbol}{(typeof product.compareAtPrice === 'number' ? product.compareAtPrice : Number(product.compareAtPrice || 0)).toFixed(2)}
            </span>
          )}
        </div>

        <button
          className={`btn btn-primary btn-sm ${styles.addBtn}`}
          disabled={isOutOfStock}
          aria-label={`View ${product.name}`}
          onClick={(e) => e.preventDefault()} // Handled by Link
        >
          {isOutOfStock ? 'Sold Out' : 'View'}
        </button>
      </div>
    </Link>
  )
}

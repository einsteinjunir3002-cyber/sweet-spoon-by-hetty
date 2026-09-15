'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import WhatsAppFloat from '@/components/store/WhatsAppFloat'
import styles from './shop.module.css'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  description?: string
  isFeatured: boolean
  images: { url: string; altText?: string; isMain: boolean }[]
  category?: { name: string; slug: string }
  inventory?: { quantity: number; trackStock: boolean }
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sort, setSort] = useState('createdAt_desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cartMessage, setCartMessage] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...(search ? { search } : {}),
      })
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products ?? [])
      setTotalPages(data.pages ?? 1)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, sort, selectedCategory, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
  }, [])

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((item: { id: string }) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images.find((i) => i.isMain)?.url || product.images[0]?.url,
        quantity: 1,
      })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setCartMessage(`${product.name} added to cart!`)
    setTimeout(() => setCartMessage(''), 3000)
  }

  const getMainImage = (product: Product) => {
    return product.images.find((i) => i.isMain)?.url || product.images[0]?.url || '/placeholder-product.jpg'
  }

  const isOutOfStock = (product: Product) => {
    return product.inventory?.trackStock && product.inventory.quantity <= 0
  }

  return (
    <>
      <Header />
      <main className={styles.shopPage}>
        {/* Page Header */}
        <section className={styles.pageHeader}>
          <div className={styles.container}>
            <h1>Our Products</h1>
            <p>Freshly made daily — natural, probiotic and delicious</p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            {/* Search */}
            <div className={styles.searchBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            {/* Sort */}
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name A-Z</option>
            </select>
          </div>

          <div className={styles.shopLayout}>
            {/* Sidebar Categories */}
            <aside className={styles.sidebar}>
              <h3>Categories</h3>
              <ul className={styles.categoryList}>
                <li>
                  <button
                    className={selectedCategory === '' ? styles.active : ''}
                    onClick={() => { setSelectedCategory(''); setPage(1) }}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={selectedCategory === cat.slug ? styles.active : ''}
                      onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
                    >
                      {cat.name}
                      <span className={styles.count}>{cat._count.products}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Products Grid */}
            <div className={styles.productsSection}>
              {cartMessage && (
                <div className={styles.cartToast}>
                  <span>🛒</span> {cartMessage}
                </div>
              )}

              {loading ? (
                <div className={styles.loadingGrid}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.productSkeleton} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🍨</div>
                  <h3>No products found</h3>
                  <p>
                    {search
                      ? `No products match "${search}". Try a different search.`
                      : 'No products available in this category yet.'}
                  </p>
                  {(search || selectedCategory) && (
                    <button
                      className={styles.clearBtn}
                      onClick={() => { setSearch(''); setSelectedCategory(''); setPage(1) }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.productGrid}>
                    {products.map((product) => (
                      <div key={product.id} className={styles.productCard}>
                        <Link href={`/products/${product.slug}`} className={styles.productImageLink}>
                          <div className={styles.productImageWrapper}>
                            <Image
                              src={getMainImage(product)}
                              alt={product.name}
                              fill
                              className={styles.productImage}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            {product.isFeatured && (
                              <span className={styles.featuredBadge}>⭐ Featured</span>
                            )}
                            {isOutOfStock(product) && (
                              <div className={styles.outOfStockOverlay}>Out of Stock</div>
                            )}
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className={styles.saleBadge}>SALE</span>
                            )}
                          </div>
                        </Link>

                        <div className={styles.productInfo}>
                          {product.category && (
                            <span className={styles.productCategory}>{product.category.name}</span>
                          )}
                          <h3 className={styles.productName}>
                            <Link href={`/products/${product.slug}`}>{product.name}</Link>
                          </h3>
                          <div className={styles.productPricing}>
                            <span className={styles.price}>GH₵{product.price.toFixed(2)}</span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className={styles.comparePrice}>GH₵{product.compareAtPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <div className={styles.productActions}>
                            <button
                              className={styles.addToCartBtn}
                              onClick={() => addToCart(product)}
                              disabled={isOutOfStock(product)}
                            >
                              {isOutOfStock(product) ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <Link href={`/products/${product.slug}`} className={styles.viewBtn}>
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={styles.pageBtn}
                      >
                        ← Prev
                      </button>
                      <span className={styles.pageInfo}>
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={styles.pageBtn}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}

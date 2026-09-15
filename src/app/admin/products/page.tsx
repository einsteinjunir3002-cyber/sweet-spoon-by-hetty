'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './products-admin.module.css'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  description?: string | null
  size?: string | null
  weight?: string | null
  isPublished: boolean
  isFeatured: boolean
  categoryId?: string | null
  category?: Category | null
  images: Array<{ id: string; url: string; isMain: boolean }>
  inventory?: { quantity: number; lowStockThreshold: number; trackStock: boolean } | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [size, setSize] = useState('')
  const [weight, setWeight] = useState('')
  const [stock, setStock] = useState('50')
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Fetch products error:', err)
        setLoading(false)
      })
  }

  const fetchCategories = () => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be smaller than 5MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const openCreateForm = () => {
    setEditingId(null)
    setName('')
    setPrice('')
    setCompareAtPrice('')
    setCategoryId(categories[0]?.id || '')
    setDescription('')
    setSize('')
    setWeight('')
    setStock('50')
    setIsPublished(true)
    setIsFeatured(false)
    setImageUrl('')
    setError('')
    setIsFormOpen(true)
  }

  const openEditForm = (product: Product) => {
    setEditingId(product.id)
    setName(product.name)
    setPrice(product.price.toString())
    setCompareAtPrice(product.compareAtPrice ? product.compareAtPrice.toString() : '')
    setCategoryId(product.categoryId || '')
    setDescription(product.description || '')
    setSize(product.size || '')
    setWeight(product.weight || '')
    setStock(product.inventory?.quantity ? product.inventory.quantity.toString() : '0')
    setIsPublished(product.isPublished)
    setIsFeatured(product.isFeatured)
    setImageUrl(product.images[0]?.url || '')
    setError('')
    setIsFormOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) {
      setError('Product name and price are required')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      name,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      categoryId: categoryId || null,
      description,
      size,
      weight,
      stock: parseInt(stock) || 0,
      isPublished,
      isFeatured,
      imageUrl: imageUrl || undefined,
    }

    const endpoint = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PATCH' : 'POST'

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const resData = await res.json()

      if (!res.ok) {
        throw new Error(resData.error || 'Failed to save product')
      }

      setIsFormOpen(false)
      fetchProducts()
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      })
      fetchProducts()
    } catch (err) {
      console.error('Toggle status error:', err)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete or archive this product?')) return
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      fetchProducts()
    } catch (err) {
      console.error('Delete product error:', err)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      {/* Top Controls */}
      <div className={styles.controlsRow}>
        <input
          type="search"
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={openCreateForm} className={styles.createBtn}>
          ➕ Add New Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className={styles.loading}>Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>No products found. Add your first yogurt or Brukina product!</div>
      ) : (
        <div className={styles.productsTableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.prodThumb}>
                      {product.images[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div className={styles.placeholderThumb}>🥛</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    {product.size && <small className={styles.subText}>Size: {product.size}</small>}
                  </td>
                  <td>{product.category?.name || 'Uncategorized'}</td>
                  <td className={styles.priceCell}>
                    GH₵{product.price.toFixed(2)}
                    {product.compareAtPrice && (
                      <span className={styles.strikePrice}>GH₵{product.compareAtPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        (product.inventory?.quantity ?? 0) <= 5
                          ? styles.stockLow
                          : styles.stockOk
                      }
                    >
                      {product.inventory?.quantity ?? 0} left
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => togglePublished(product)}
                      className={`${styles.statusToggle} ${product.isPublished ? styles.activeStatus : styles.inactiveStatus}`}
                    >
                      {product.isPublished ? '● Online' : '○ Offline'}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button onClick={() => openEditForm(product)} className={styles.editBtn}>
                        Edit
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal / Form Drawer */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsFormOpen(false)} className={styles.closeBtn}>×</button>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSaveProduct} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Greek Yogurt (Strawberry)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Product Image Upload Section */}
              <div className={styles.formGroup}>
                <label>Product Photo (Device Upload or Image URL)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, border: '2px dashed #f472b6', borderRadius: 12, background: '#fff1f2', alignItems: 'center', textAlign: 'center' }}>
                  {imageUrl ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imageUrl} alt="Product Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, border: '2px solid #ec4899' }} />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: '#be185d', fontSize: '0.9rem' }}>
                      📸 Select a photo from your Phone or Computer
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="file-upload-btn"
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="file-upload-btn"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899, #be185d)',
                      color: '#fff',
                      padding: '8px 18px',
                      borderRadius: 20,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {imageUrl ? 'Change Photo' : 'Upload Image File'}
                  </label>

                  <div style={{ width: '100%', borderTop: '1px solid #fbcfe8', margin: '4px 0' }} />

                  <input
                    type="text"
                    placeholder="Or paste image web link (https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className={styles.input}
                    style={{ background: '#fff' }}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price (GH₵) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Compare At Price (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="30.00"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={styles.input}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Size / Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 500ml or 1 Liter"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Weight (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe taste, ingredients, probiotic benefits, and storage guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  Publish Product Online
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  Feature on Homepage Spotlight
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

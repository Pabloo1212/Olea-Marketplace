import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '../ProductCard'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'

// Mock the stores
jest.mock('@/stores/cartStore')
jest.mock('@/stores/favoritesStore')
jest.mock('@/stores/i18nStore', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const mockAddItem = jest.fn()
const mockToggleFavorite = jest.fn()
const mockIsFavorite = jest.fn()

// Mock product data
const mockProduct = {
  id: '1',
  name: 'Test Olive Oil',
  short_description: 'A delicious olive oil',
  price: 24.90,
  compare_at_price: 29.90,
  currency: 'EUR',
  stock: 50,
  olive_variety: 'Arbequina',
  harvest_year: 2023,
  origin_country: 'España',
  organic: true,
  intensity: 'medium',
  volume_ml: 500,
  is_published: true,
  avg_rating: 4.5,
  review_count: 12,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  slug: 'test-olive-oil',
  producer_id: 'prod-1',
  images: [
    {
      id: 'img-1',
      product_id: '1',
      image_url: 'https://example.com/image.jpg',
      alt_text: 'Test olive oil',
      position: 0,
    },
  ],
}

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock store functions
    ;(useCartStore as jest.Mock).mockReturnValue({
      addItem: mockAddItem,
    })
    
    ;(useFavoritesStore as jest.Mock).mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
    })
    
    mockIsFavorite.mockReturnValue(false)
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Olive Oil')).toBeInTheDocument()
    expect(screen.getByText('A delicious olive oil')).toBeInTheDocument()
    expect(screen.getByText('€24.90')).toBeInTheDocument()
    expect(screen.getByText('€29.90')).toBeInTheDocument()
    expect(screen.getByText('Arbequina')).toBeInTheDocument()
    expect(screen.getByText('España')).toBeInTheDocument()
    expect(screen.getByText('Organic')).toBeInTheDocument()
  })

  it('displays discount badge when compare_at_price is higher', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('-17%')).toBeInTheDocument()
  })

  it('does not display discount badge when no compare_at_price', () => {
    const productWithoutDiscount = { ...mockProduct, compare_at_price: null }
    render(<ProductCard product={productWithoutDiscount} />)
    
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('shows stock warning when stock is low', () => {
    const lowStockProduct = { ...mockProduct, stock: 5 }
    render(<ProductCard product={lowStockProduct} />)
    
    expect(screen.getByText('Only 5 left')).toBeInTheDocument()
  })

  it('shows out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getByText('Out of stock')).toBeInTheDocument()
  })

  it('calls addToCart when add to cart button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const addToCartButton = screen.getByText('productCard.addToCart')
    await user.click(addToCartButton)
    
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, 1)
  })

  it('does not call addToCart when product is out of stock', async () => {
    const user = userEvent.setup()
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    
    const outOfStockButton = screen.getByText('productCard.outOfStock')
    await user.click(outOfStockButton)
    
    expect(mockAddItem).not.toHaveBeenCalled()
  })

  it('calls toggleFavorite when favorite button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const favoriteButton = screen.getByLabelText('Add to favorites')
    await user.click(favoriteButton)
    
    expect(mockToggleFavorite).toHaveBeenCalledWith(mockProduct)
  })

  it('shows filled heart when product is favorited', () => {
    mockIsFavorite.mockReturnValue(true)
    render(<ProductCard product={mockProduct} />)
    
    const favoriteButton = screen.getByLabelText('Remove from favorites')
    const heartIcon = favoriteButton.querySelector('svg')
    
    expect(heartIcon).toHaveClass('fill-olive-600')
  })

  it('shows empty heart when product is not favorited', () => {
    mockIsFavorite.mockReturnValue(false)
    render(<ProductCard product={mockProduct} />)
    
    const favoriteButton = screen.getByLabelText('Add to favorites')
    const heartIcon = favoriteButton.querySelector('svg')
    
    expect(heartIcon).not.toHaveClass('fill-olive-600')
  })

  it('handles image error gracefully', async () => {
    render(<ProductCard product={mockProduct} />)
    
    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    await waitFor(() => {
      expect(image).toHaveAttribute('src', '/images/placeholder-bottle.png')
    })
  })

  it('renders compact variant correctly', () => {
    render(<ProductCard product={mockProduct} variant="compact" />)
    
    expect(screen.getByText('Test Olive Oil')).toBeInTheDocument()
    expect(screen.getByText('Arbequina • 500ml')).toBeInTheDocument()
    expect(screen.getByText('€24.90')).toBeInTheDocument()
  })

  it('renders featured variant correctly', () => {
    render(<ProductCard product={mockProduct} variant="featured" />)
    
    expect(screen.getByText('Test Olive Oil')).toBeInTheDocument()
    expect(screen.getByText('A delicious olive oil')).toBeInTheDocument()
  })

  it('handles invalid product data gracefully', () => {
    const invalidProduct = { ...mockProduct, price: -10 }
    
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(<ProductCard product={invalidProduct} />)
    
    expect(screen.getByText('Product data unavailable')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('shows loading state when adding to cart', async () => {
    mockAddItem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const addToCartButton = screen.getByText('productCard.addToCart')
    await user.click(addToCartButton)
    
    expect(screen.getByText('productCard.adding')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('productCard.addToCart')).toBeInTheDocument()
    })
  })

  it('shows loading state when toggling favorite', async () => {
    mockToggleFavorite.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const favoriteButton = screen.getByLabelText('Add to favorites')
    await user.click(favoriteButton)
    
    await waitFor(() => {
      expect(favoriteButton.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })
})

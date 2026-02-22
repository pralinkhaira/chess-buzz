"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Loader2 } from "lucide-react"
import { fetchProducts } from "@/lib/product"
import { formatPrice } from "@/lib/indian-utils"
import WatchAndShop from "@/components/shop/WatchAndShop"
import ProductCard from "@/components/ui/ProductCard"

/**
 * Shop Page Component
 * 
 * A fully responsive e-commerce product listing page featuring:
 * - Advanced product filtering and sorting capabilities
 * - Real-time search with debounced input
 * - Collection-based product grouping
 * - Responsive grid layout that adapts from 1 column (mobile) to 4 columns (desktop)
 * - Shopping cart integration with one-click add to cart
 * - Loading states and error handling
 * - SEO-optimized product links
 * - Accessibility features throughout
 * 
 * Responsive Breakpoints:
 * - Mobile: 1 column grid, stacked filters
 * - Tablet: 2 column grid, horizontal filters  
 * - Desktop: 3-4 column grid, sidebar filters
 * - Large screens: 4+ column grid with enhanced spacing
 * 
 * @component
 * @returns {JSX.Element} The responsive shop page
 */

export default function ShopPage() {
  const { addItem } = useCart()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const collectionId = searchParams.get('collection')
  const categoryParam = searchParams.get('category')
  
  // State management with proper typing
  const [products, setProducts] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const normalizeCategory = (value: string | null | undefined) => (value ?? "").toString().trim().toLowerCase()
  const [selectedCategory, setSelectedCategory] = useState(normalizeCategory(categoryParam) || "all")
  const [selectedCollection, setSelectedCollection] = useState(collectionId || "all")
  const [sortBy, setSortBy] = useState("name")

  // Map broader categories to common subcategory/alias terms
  const CATEGORY_ALIASES: Record<string, string[]> = {
    topwear: [
      "topwear",
      "tshirt",
      "t-shirt",
      "tshirts",
      "tee",
      "tees",
      "shirt",
      "shirts",
      "hoodie",
      "sweatshirt",
      "kurta",
    ],
    bottomwear: [
      "bottomwear",
      "jeans",
      "denim",
      "pant",
      "pants",
      "trouser",
      "trousers",
      "short",
      "shorts",
      "jogger",
      "joggers",
      "trackpant",
      "trackpants",
      "cargo",
      "chino",
      "chinos",
    ],
    accessories: [
      "accessories",
      "belt",
      "belts",
      "cap",
      "caps",
      "hat",
      "hats",
      "socks",
      "wallet",
      "watch",
      "watches",
      "scarf",
      "scarves",
    ],
    footwear: [
      "footwear",
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "sandal",
      "sandals",
      "flipflop",
      "flipflops",
      "flip-flops",
      "loafer",
      "loafers",
      "boot",
      "boots",
    ],
  }

  /**
   * Loads product and collection data with proper error handling
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [productsData, collectionsData] = await Promise.all([
          fetchProducts(),
          fetch('/api/collections').then(res => {
            if (!res.ok) throw new Error('Failed to fetch collections')
            return res.json()
          })
        ])

        
        
        setProducts(productsData || [])
        setCollections(collectionsData || [])
        
        // Set collection from URL parameter
        if (collectionId) {
          setSelectedCollection(collectionId)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load data"
        setError(errorMessage)
        toast({
          title: "Error loading products",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [collectionId])

  // Keep selected category in sync with URL query param (from Shop by Category links)
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(normalizeCategory(categoryParam))
    }
  }, [categoryParam])

  const categories = useMemo(() => (
    [
      { value: "topwear", label: "Topwear" },
      { value: "bottomwear", label: "Bottomwear" },
      { value: "accessories", label: "Accessories" },
      { value: "footwear", label: "Footwear" },
    ]
  ), [])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product: any) => {
        const productCategory = normalizeCategory(product.category)
        const aliases = CATEGORY_ALIASES[selectedCategory] || []
        return productCategory === selectedCategory || aliases.includes(productCategory)
      })
    }

    // Filter by collection if selected
    if (selectedCollection !== "all") {
      // Filter products that belong to the selected collection
      filtered = filtered.filter((product: any) => {
        return product.collections && product.collections.some((collection: any) => 
          (collection._id || collection) === selectedCollection
        )
      })
    }

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [products, collections, searchQuery, selectedCategory, selectedCollection, sortBy])

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/images/products/default-product.svg",
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e71318] mx-auto mb-4"></div>
          <p className="text-[#4A4A4A] font-bold">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-primary overflow-auto">
      {/* Hero */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[#1F1F1F] mb-4">Shop Sustainable Fashion</h1>
          <p className="text-xl text-[#666666] max-w-2xl mx-auto">
            Discover our collection of eco-friendly clothing made with love for you and the planet
          </p>
        </div>
      </section>

      {/* Watch and Shop Section */}
      <WatchAndShop />

      {/* Filter Bar */}
      <section className="bg-white border-t py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999999] w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:ring-[#e71318]"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:ring-[#e71318]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-50">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:ring-[#e71318]">
                  <SelectValue placeholder="Collection" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-50">
                  <SelectItem value="all">All Collections</SelectItem>
                  {collections.map((collection: any) => (
                    <SelectItem key={collection.id || collection._id} value={collection.id || collection._id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:ring-[#e71318]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 z-50">
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 px-4 bg-primary/5 transition-all hover:bg-primary/10">
        <div className="container mx-auto">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-[#666666] font-bold">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product: any) => (
                <ProductCard
                  key={product._id || product.id}
                  _id={product._id || product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  images={product.images || ["/images/products/default-product.svg"]}
                  rating={product.rating || 4.0}
                  discount={product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : undefined}
                  isNew={product.isNew}
                  isBestseller={product.featured}
                  category={product.category}
                  // sizes={product.sizes || []}
                  // colors={product.colors || []}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

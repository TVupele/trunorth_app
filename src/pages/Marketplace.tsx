import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/api';
import { formatCurrency, type Product } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Toys'];
const ratingFilters = [5, 4, 3, 2, 1];

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const balance = useWallet((state) => state.balance);
  const sendMoney = useWallet((state) => state.sendMoney);
  const isLoading = useWallet((state) => state.isLoading);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast({ title: 'Error', description: 'Failed to load products.', variant: 'destructive' });
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= minRating;
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [products, searchQuery, selectedCategory, priceRange, minRating]);

  const productImages = selectedProduct ? [selectedProduct.image, selectedProduct.image, selectedProduct.image] : [];

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast({ title: 'Added to cart', description: `${product.name} has been added to your cart.` });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cartTotal > balance) {
      toast({ title: 'Insufficient balance', description: 'Please top up your wallet.', variant: 'destructive' });
      return;
    }
    try {
      await sendMoney('Marketplace', cartTotal, `Purchase of ${cartItemCount} item(s)`);
      toast({ title: 'Purchase successful', description: 'Your order has been placed!' });
      setCart([]);
      setIsCartOpen(false);
    } catch (error) {
      toast({ title: 'Purchase failed', description: 'An error occurred.', variant: 'destructive' });
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="mt-1 text-muted-foreground">Discover amazing products from trusted sellers</p>
          </div>
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">{cartItemCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader><SheetTitle>Shopping Cart ({cartItemCount})</SheetTitle></SheetHeader>
              <div className="mt-6 flex flex-col h-[calc(100vh-12rem)]">
                <ScrollArea className="flex-1">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex gap-4 p-4 border rounded-lg">
                          <img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-md object-cover" />
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.product.seller}</p>
                            <p className="mt-1 font-semibold">{formatCurrency(item.product.price)}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</Button>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)}><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {cart.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span><span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Wallet Balance: {formatCurrency(balance)}</div>
                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading || cartTotal > balance}>
                      {isLoading ? 'Processing...' : 'Checkout with Wallet'}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 font-semibold text-sm">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button key={category} onClick={() => setSelectedCategory(category)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${selectedCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Price Range</h3>
              <Slider value={priceRange} onValueChange={setPriceRange} max={50000} step={1000} className="w-full" />
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                <span>{formatCurrency(priceRange[0])}</span><span>{formatCurrency(priceRange[1])}</span>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Minimum Rating</h3>
              <div className="space-y-2">
                {ratingFilters.map((rating) => (
                  <button key={rating} onClick={() => setMinRating(rating)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${minRating === rating ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                    <div className="flex items-center">{Array.from({ length: rating }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" />))}</div>
                    <span>& up</span>
                  </button>
                ))}
                <button onClick={() => setMinRating(0)} className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${minRating === 0 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>All Ratings</button>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</p>
            </div>
            {isLoadingProducts ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-64 w-full rounded-lg" />))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>Sold by {selectedProduct.seller}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img src={productImages[currentImageIndex]} alt={selectedProduct.name} className="h-full w-full object-cover" />
                    {productImages.length > 1 && (
                      <>
                        <Button variant="outline" size="sm" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={prevImage}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={nextImage}><ChevronRight className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {productImages.map((img, idx) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                        className={`h-20 w-20 overflow-hidden rounded-md border-2 ${currentImageIndex === idx ? 'border-primary' : 'border-transparent'}`}>
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">{Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      ))}</div>
                      <span className="text-sm text-muted-foreground">{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(selectedProduct.price)}</p>
                    <Badge variant="secondary" className="mt-2">{selectedProduct.category}</Badge>
                  </div>
                  <Separator />
                  <div><h4 className="mb-2 font-semibold">Description</h4><p className="text-muted-foreground">{selectedProduct.description}</p></div>
                  <div><h4 className="mb-2 font-semibold">Seller Information</h4><p className="text-sm text-muted-foreground">{selectedProduct.seller}</p></div>
                  <div>
                    <h4 className="mb-2 font-semibold">Availability</h4>
                    <p className="text-sm">{selectedProduct.stock > 0 ? (<span className="text-green-600">{selectedProduct.stock} in stock</span>) : (<span className="text-destructive">Out of stock</span>)}</p>
                  </div>
                  <Separator />
                  <Button className="w-full" size="lg" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} disabled={selectedProduct.stock === 0}>Add to Cart</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

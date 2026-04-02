import { Product, formatCurrency } from "@/lib/index";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const stockStatus = product.stock > 0 ? "In Stock" : "Out of Stock";
  const stockVariant = product.stock > 0 ? "secondary" : "destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge variant={stockVariant} className="shadow-md">
              {stockStatus}
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm shadow-md">
              {product.category}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 p-3 space-y-2">
          <div>
            <h3 className="font-semibold text-base line-clamp-2 text-foreground">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              by {product.seller}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-medium text-foreground">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({product.reviews})
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatCurrency(product.price, product.currency)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <Button
            className="w-full"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
import { Product, formatCurrency } from "@/lib/index";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const stockStatus = product.stock > 0 ? "In Stock" : "Out of Stock";
  const stockVariant = product.stock > 0 ? "secondary" : "destructive";

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <Card className="flex flex-row overflow-hidden border-border hover:shadow-md transition-all">
          <div className="w-24 h-24 flex-shrink-0 bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="flex-1 p-2 flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-sm line-clamp-1 text-foreground">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                by {product.seller}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">
                {formatCurrency(product.price, product.currency)}
              </span>
              <Badge variant={stockVariant} className="text-[10px]">{stockStatus}</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border hover:shadow-md transition-all">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge variant={stockVariant} className="text-[10px]">
              {stockStatus}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 p-2 space-y-1">
          <div>
            <h3 className="font-medium text-sm line-clamp-1 text-foreground">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              by {product.seller}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-xs font-medium text-foreground">
              {product.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="text-sm font-bold text-primary">
              {formatCurrency(product.price, product.currency)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-2 pt-0">
          <Button
            className="w-full text-xs h-8"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Add
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
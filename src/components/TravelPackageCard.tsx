import { motion } from "framer-motion";
import { MapPin, Clock, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TravelPackage, formatCurrency } from "@/lib/index";

interface TravelPackageCardProps {
  package: TravelPackage;
}

export function TravelPackageCard({ package: pkg }: TravelPackageCardProps) {
  const progressPercentage = (pkg.reviews / 100) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-border hover:shadow-lg transition-all duration-300 group">
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={pkg.image}
            alt={pkg.destination}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            {pkg.available ? (
              <Badge className="bg-primary text-primary-foreground">Available</Badge>
            ) : (
              <Badge variant="destructive">Sold Out</Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{pkg.rating.toFixed(1)}</span>
            <span className="text-xs text-white/80">({pkg.reviews} reviews)</span>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground line-clamp-1">
              {pkg.destination}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pkg.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{pkg.destination}</span>
            </div>
          </div>

          {pkg.highlights && pkg.highlights.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Highlights
              </p>
              <ul className="space-y-1">
                {pkg.highlights.slice(0, 3).map((highlight, index) => (
                  <li
                    key={index}
                    className="text-sm text-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span className="line-clamp-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold text-primary font-mono">
              {formatCurrency(pkg.price, pkg.currency)}
            </p>
          </div>
          <Button
            size="lg"
            disabled={!pkg.available}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Book Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
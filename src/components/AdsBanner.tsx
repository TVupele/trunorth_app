import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { adsBannerItems } from '@/data/index';

interface AdBanner {
  id: string;
  title: string;
  description: string;
  type: string;
  image_url: string;
  cta: string;
  link: string;
  is_active: boolean;
  display_order: number;
}

export function AdsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get('/public/ad-banners');
        const activeBanners = response.data.filter((b: AdBanner) => b.is_active);
        if (activeBanners.length > 0) {
          setBanners(activeBanners.sort((a: AdBanner, b: AdBanner) => a.display_order - b.display_order));
        } else {
          setBanners(adsBannerItems);
        }
      } catch (error) {
        setBanners(adsBannerItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (isPaused || banners.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide, banners.length]);

  if (isLoading || banners.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl bg-card animate-pulse">
        <div className="aspect-[21/9] md:aspect-[3/1] bg-muted" />
      </div>
    );
  }

  const currentSlide = banners[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[21/9] md:aspect-[3/1]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={currentSlide.image_url || currentSlide.image}
              alt={currentSlide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />

            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-2xl space-y-4"
                >
                  <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {currentSlide.type.charAt(0).toUpperCase() + currentSlide.type.slice(1)}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
                    {currentSlide.title}
                  </h2>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {currentSlide.description}
                  </p>
                  <div className="pt-1">
                    <Button asChild size="sm" className="font-semibold text-sm">
                      <Link to={currentSlide.link}>{currentSlide.cta}</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur transition-all hover:bg-background hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur transition-all hover:bg-background hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/50 hover:bg-muted-foreground'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

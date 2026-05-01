import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, Calendar, Users, Star, X } from 'lucide-react';
import { TravelPackageCard } from '@/components/TravelPackageCard';
import { useWallet } from '@/hooks/useWallet';
import type { TravelPackage } from '@/lib/index';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTravel } from '@/hooks/useTravel';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function Travel() {
  const { t } = useTranslation();
  const balance = useWallet((state) => state.balance);
  const sendMoney = useWallet((state) => state.sendMoney);
  const isWalletLoading = useWallet((state) => state.isLoading);
  const packages = useTravel((state) => state.packages);
  const isTravelLoading = useTravel((state) => state.isLoading);
  const travelError = useTravel((state) => state.error);
  const fetchPackages = useTravel((state) => state.fetchPackages);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState<'price' | 'popularity' | 'rating'>('popularity');
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [travelerCount, setTravelerCount] = useState(1);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const filteredPackages = packages
    .filter((pkg) => {
      const matchesSearch = !searchQuery ||
        (pkg.destination || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (pkg.description || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchesPrice = pkg.price >= priceRange[0] && pkg.price <= priceRange[1];
      return matchesSearch && matchesPrice && pkg.available;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const featuredPackages = packages.filter((pkg) => pkg.rating >= 4.8).slice(0, 3);


  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = async () => {
    if (!selectedPackage || !bookingDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a date for your trip.',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);
    try {
      await api.post('/travel/book', {
        packageId: selectedPackage.id,
        travelerCount,
        bookingDate,
      });

      toast({
        title: 'Booking Confirmed!',
        description: `Your trip to ${selectedPackage.destination} has been booked successfully.`,
      });

      setSelectedPackage(null);
      setBookingDate('');
      setTravelerCount(1);
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: String(error.response?.data?.error) || 'Unable to process your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isTravelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <p>Loading travel packages...</p>
        </div>
      )}
      {travelError && (
        <div className="p-4">
          <p className="text-destructive">{travelError}</p>
        </div>
      )}
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t('Travel Packages')}</h1>
            <p className="text-muted-foreground">{t('Discover amazing destinations and book your next adventure')}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('Featured Destinations')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <TravelPackageCard package={pkg} />
                </motion.div>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('Search destinations...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('Sort by')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">{t('Popularity')}</SelectItem>
                  <SelectItem value="price">{t('Price')}</SelectItem>
                  <SelectItem value="rating">{t('Rating')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-accent' : ''}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-3 block">{t('Price Range')}</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={100000}
                        step={5000}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div onClick={() => setSelectedPackage(pkg)} className="cursor-pointer">
                  <TravelPackageCard package={pkg} />
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{t('No packages found')}</h3>
              <p className="text-muted-foreground">{t('Try adjusting your search or filters')}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPackage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPackage.destination}</DialogTitle>
                <DialogDescription>{selectedPackage.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedPackage.image}
                    alt={selectedPackage.destination}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-sm">
                    {selectedPackage.duration}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium">{selectedPackage.rating}</span>
                    <span className="text-sm text-muted-foreground">({selectedPackage.reviews} reviews)</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('Package Highlights')}</h3>
                  <ul className="space-y-2">
                    {selectedPackage.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="booking-date" className="mb-2 block">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Travel Date
                    </Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="traveler-count" className="mb-2 block">
                      <Users className="h-4 w-4 inline mr-2" />
                      Number of Travelers
                    </Label>
                    <Select
                      value={travelerCount.toString()}
                      onValueChange={(value) => setTravelerCount(parseInt(value))}
                    >
                      <SelectTrigger id="traveler-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Traveler' : 'Travelers'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">{t('Price per person')}</span>
                      <span className="font-medium">{formatCurrency(selectedPackage.price)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">{t('Travelers')}</span>
                      <span className="font-medium">× {travelerCount}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{t('Total Amount')}</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(selectedPackage.price * travelerCount)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-lg p-3 text-sm">
                    <p className="text-muted-foreground">
                      Wallet Balance: <span className="font-semibold text-foreground">{formatCurrency(balance)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPackage(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking || !bookingDate}
                    className="flex-1"
                  >
                    {isBooking ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
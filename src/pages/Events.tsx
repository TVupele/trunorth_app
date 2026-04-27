import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Ticket, Search, Filter, X, QrCode, Download, LayoutGrid, List } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/api';
import type { Event } from '@/lib/index';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface PurchasedTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage?: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  quantity: number;
  totalAmount: number;
  qrCode: string;
  purchaseDate: string;
}

const categories = ['All', 'Concert', 'Conference', 'Sports', 'Festival', 'Workshop', 'General'];

export default function Events() {
  const { t } = useTranslation();
  const balance = useWallet((state) => state.balance);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const isLoading = useWallet((state) => state.isLoading);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<PurchasedTicket | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events.');
      } finally {
        setIsLoadingEvents(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/event-tickets');
        // Transform backend booking data to match PurchasedTicket interface
        const tickets = response.data.map((booking: any) => ({
          id: booking.id,
          eventId: booking.event_id || booking.eventId,
          eventTitle: booking.event_title || booking.eventTitle,
          eventImage: booking.event_image || booking.eventImage,
          eventDate: booking.event_date || booking.eventDate,
          eventLocation: booking.location || booking.eventLocation,
          quantity: booking.quantity,
          totalAmount: parseFloat(booking.total_amount || booking.totalAmount),
          qrCode: booking.qr_code || booking.qrCode,
          purchaseDate: booking.booking_date || booking.purchaseDate,
          // Calculate time from event_date or use default
          eventTime: new Date(booking.event_date || booking.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }));
        setPurchasedTickets(tickets);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };

    useEffect(() => {
      fetchEvents();
      fetchBookings();
    }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = !searchQuery ||
        (event.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (event.description || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesDate = !dateFilter || event.date >= dateFilter;
      const matchesLocation = !locationFilter || (event.location || '').toLowerCase().includes((locationFilter || '').toLowerCase());
      return matchesSearch && matchesCategory && matchesDate && matchesLocation;
    });
  }, [events, searchQuery, selectedCategory, dateFilter, locationFilter]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

   const handlePurchaseTicket = async () => {
    if (!selectedEvent) return;

    // Pre-check for sufficient balance locally for better UX
    const totalAmount = selectedEvent.ticketPrice * ticketQuantity;
    if (totalAmount > balance) {
      toast.error('Insufficient wallet balance');
      return;
    }
    if (ticketQuantity > selectedEvent.availableSeats) {
      toast.error('Not enough seats available');
      return;
    }

    try {
      // Call the backend purchaseTicket API
      const response = await api.post('/events/purchase', {
        event_id: selectedEvent.id,
        quantity: ticketQuantity,
      });

      // Success! Refresh both events (for seat count) and bookings (for My Tickets tab)
      await Promise.all([fetchEvents(), fetchBookings()]);

      toast.success('Ticket purchased successfully!', {
        description: `Booking ID: ${response.data.bookingId}`,
      });

      setShowPurchaseDialog(false);
      setSelectedEvent(null);
      setTicketQuantity(1);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to purchase ticket';
      toast.error(errorMsg);
    }
  };

  const handleEventClick = (event: Event) => {
    // If event is external and has an external URL, redirect to it
    if (event.isExternal && event.externalUrl) {
      window.open(event.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    // Otherwise, show the purchase dialog for internal events
    setSelectedEvent(event);
    setTicketQuantity(1);
    setShowPurchaseDialog(true);
  };
  const handleViewTicket = (ticket: PurchasedTicket) => { setSelectedTicket(ticket); setShowTicketDialog(true); };
  const handleDownloadTicket = (ticket: PurchasedTicket) => { toast.success(`Downloading ticket for ${ticket.eventTitle}`); };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-2 py-4 md:px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Event Tickets</h1>
            <p className="text-muted-foreground text-sm">Discover and book tickets for concerts, conferences, and more</p>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="browse" className="text-xs">Browse Events</TabsTrigger>
              <TabsTrigger value="tickets" className="text-xs">
                My Tickets
                {purchasedTickets.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{purchasedTickets.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {upcomingEvents.length > 0 && (
               <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                   <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                     {upcomingEvents.map((event, index) => (
                        <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }}>
                          <div className="cursor-pointer" onClick={() => handleEventClick(event)}><EventCard event={event} /></div>
                        </motion.div>
                     ))}
                   </div>
                 </motion.section>
              )}

              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>{categories.map((c) => (<SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>))}</SelectContent>
                      </Select>
                      <div className="flex border rounded-md">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-2" onClick={() => setViewMode('grid')}>
                          <LayoutGrid className="h-3 w-3" />
                        </Button>
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-2" onClick={() => setViewMode('list')}>
                          <List className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Label htmlFor="date-filter" className="text-xs mb-1 block">Date From</Label>
                      <Input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="location-filter" className="text-xs mb-1 block">Location</Label>
                      <Input id="location-filter" placeholder="Filter by location..." value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="h-8 text-xs" />
                    </div>
                    {(dateFilter || locationFilter) && (
                      <div className="flex items-end">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setDateFilter(''); setLocationFilter(''); }}><X className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </div>
                </div>

                {isLoadingEvents ? (
                  <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3`}>
                    {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-40 w-full rounded-lg" />))}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                      {filteredEvents.map((event, index) => (
                        <motion.div key={event.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }} layout>
                           <div className="cursor-pointer" onClick={() => handleEventClick(event)}><EventCard event={event} /></div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {filteredEvents.map((event, index) => (
                        <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }} layout>
                           <div onClick={() => handleEventClick(event)} className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <img src={event.image} alt={event.title} className="w-20 h-20 rounded-md object-cover" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                              <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-2 w-2" />{event.location}</p>
                              <p className="text-sm font-semibold">{formatCurrency(event.ticketPrice)}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {!isLoadingEvents && filteredEvents.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </motion.div>
                )}
              </motion.section>
            </TabsContent>

            <TabsContent value="tickets">
              {purchasedTickets.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                  <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground mb-6">Browse events and purchase tickets to see them here</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedTickets.map((ticket, index) => (
                    <motion.div key={ticket.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewTicket(ticket)}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{ticket.eventTitle}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(ticket.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>{ticket.eventTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" /><span className="line-clamp-1">{ticket.eventLocation}</span>
                              </div>
                            </div>
                            <QrCode className="h-8 w-8 text-primary" />
                          </div>
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{ticket.quantity}x</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Amount</span><span className="font-semibold">{formatCurrency(ticket.totalAmount)}</span></div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleViewTicket(ticket); }}><QrCode className="h-4 w-4 mr-2" />View QR</Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleDownloadTicket(ticket); }}><Download className="h-4 w-4 mr-2" />Download</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Purchase Ticket</DialogTitle><DialogDescription>Complete your ticket purchase for {selectedEvent?.title}</DialogDescription></DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden"><img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" /></div>
              <div className="space-y-4">
                <div><h3 className="font-semibold text-xl mb-2">{selectedEvent.title}</h3><p className="text-muted-foreground">{selectedEvent.description}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div></div>
                  <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{selectedEvent.location}</p></div></div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Number of Tickets</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Button variant="outline" size="icon" onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))} disabled={ticketQuantity <= 1}>-</Button>
                      <Input id="quantity" type="number" min="1" max={selectedEvent.availableSeats} value={ticketQuantity} onChange={(e) => setTicketQuantity(Math.max(1, Math.min(selectedEvent.availableSeats, parseInt(e.target.value) || 1)))} className="text-center w-24" />
                      <Button variant="outline" size="icon" onClick={() => setTicketQuantity(Math.min(selectedEvent.availableSeats, ticketQuantity + 1))} disabled={ticketQuantity >= selectedEvent.availableSeats}>+</Button>
                      <span className="text-sm text-muted-foreground">{selectedEvent.availableSeats} seats available</span>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Price per ticket</span><span className="font-medium">{formatCurrency(selectedEvent.ticketPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{ticketQuantity}x</span></div>
                    <Separator />
                    <div className="flex justify-between text-lg"><span className="font-semibold">Total</span><span className="font-bold">{formatCurrency(selectedEvent.ticketPrice * ticketQuantity)}</span></div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium">Wallet Balance</span><span className="font-mono font-semibold">{formatCurrency(balance)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>Cancel</Button>
            <Button onClick={handlePurchaseTicket} disabled={isLoading || !selectedEvent || (selectedEvent.ticketPrice * ticketQuantity) > balance}>
              {isLoading ? 'Processing...' : 'Purchase Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Your Ticket</DialogTitle><DialogDescription>Show this QR code at the event entrance</DialogDescription></DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <div className="w-48 h-48 flex items-center justify-center"><QrCode className="h-32 w-32 text-primary" /></div>
                </div>
                <p className="font-mono text-sm text-muted-foreground">{selectedTicket.qrCode}</p>
              </div>
              <div className="space-y-3">
                <div><p className="text-sm text-muted-foreground">Event</p><p className="font-semibold">{selectedTicket.eventTitle}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedTicket.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                  <div><p className="text-sm text-muted-foreground">Time</p><p className="font-medium">{selectedTicket.eventTime}</p></div>
                </div>
                <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{selectedTicket.eventLocation}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Quantity</p><p className="font-medium">{selectedTicket.quantity}x</p></div>
                  <div><p className="text-sm text-muted-foreground">Total Paid</p><p className="font-semibold">{formatCurrency(selectedTicket.totalAmount)}</p></div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>Close</Button>
            <Button onClick={() => selectedTicket && handleDownloadTicket(selectedTicket)}><Download className="h-4 w-4 mr-2" />Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

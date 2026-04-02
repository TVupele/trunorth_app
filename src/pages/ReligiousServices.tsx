import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { ReligiousServiceCard } from '@/components/ReligiousServiceCard';
import api from '@/lib/api';
import type { ReligiousService } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReligiousServices() {
  const [services, setServices] = useState<ReligiousService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [denominationFilter, setDenominationFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ReligiousService | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState('1');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [registeredServices, setRegisteredServices] = useState<string[]>([]);
  const [enableReminders, setEnableReminders] = useState(true);
  const [calendarIntegration, setCalendarIntegration] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/religious-services');
        setServices(response.data);
        try {
          const regRes = await api.get('/religious-services/my-registrations');
          setRegisteredServices(regRes.data.map((r: any) => r.id));
        } catch { /* user may not be authenticated */ }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        toast({ title: 'Error', description: 'Failed to load religious services.', variant: 'destructive' });
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, [toast]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = serviceTypeFilter === 'all' || service.type === serviceTypeFilter;
    const matchesDenomination = denominationFilter === 'all' || service.denomination === denominationFilter;

    const serviceDate = new Date(service.date);
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = serviceDate.toDateString() === today.toDateString();
    else if (dateFilter === 'tomorrow') matchesDate = serviceDate.toDateString() === tomorrow.toDateString();
    else if (dateFilter === 'week') matchesDate = serviceDate >= today && serviceDate <= nextWeek;

    return matchesSearch && matchesType && matchesDenomination && matchesDate;
  });

  const handleRegister = (service: ReligiousService) => {
    setSelectedService(service);
    setIsRegistrationOpen(true);
    setAttendeeCount('1');
    setSpecialRequirements('');
  };

  const handleConfirmRegistration = async () => {
    if (!selectedService) return;
    try {
      await api.post('/religious-services/register', { service_id: selectedService.id });
      setRegisteredServices([...registeredServices, selectedService.id]);
      toast({ title: 'Registration Successful', description: `You have registered for ${selectedService.name}` });
      setIsRegistrationOpen(false);
      setSelectedService(null);
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error.response?.data?.error || 'An error occurred.', variant: 'destructive' });
    }
  };

  const myRegisteredServices = services.filter((service) => registeredServices.includes(service.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Religious Services</h1>
            <p className="text-muted-foreground text-lg">Register for prayer services, sermons, study circles, and religious events</p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Search & Filters</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search services, venues, or descriptions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="prayer">Prayer</SelectItem>
                        <SelectItem value="sermon">Sermon</SelectItem>
                        <SelectItem value="study">Study</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Denomination</Label>
                    <Select value={denominationFilter} onValueChange={setDenominationFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Denominations</SelectItem>
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Christianity">Christianity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {myRegisteredServices.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />My Registered Services ({myRegisteredServices.length})</CardTitle>
                  <CardDescription>Services you have registered for with reminder settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch checked={enableReminders} onCheckedChange={setEnableReminders} id="reminders" />
                      <Label htmlFor="reminders" className="cursor-pointer">Enable Reminders</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={calendarIntegration} onCheckedChange={setCalendarIntegration} id="calendar" />
                      <Label htmlFor="calendar" className="cursor-pointer">Calendar Integration</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    {myRegisteredServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{service.name}</h4>
                            <Badge variant="outline" className="capitalize">{service.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(service.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{service.time}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{service.venue}</span>
                          </div>
                        </div>
                        {calendarIntegration && <Button variant="outline" size="sm">Add to Calendar</Button>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="mb-6"><h2 className="text-2xl font-semibold mb-4">Available Services ({filteredServices.length})</h2></div>

          {isLoadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} className="h-48 w-full rounded-lg" />))}
            </div>
          ) : filteredServices.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground text-lg">No services found matching your filters.</p></CardContent></Card>
          ) : (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
              {filteredServices.map((service) => (
                <motion.div key={service.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <div onClick={() => handleRegister(service)} className="cursor-pointer">
                    <ReligiousServiceCard service={service} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Register for Service</DialogTitle><DialogDescription>Complete your registration for {selectedService?.name}</DialogDescription></DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Service Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{new Date(selectedService.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{selectedService.time}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedService.venue}</span></div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span>{selectedService.registered} / {selectedService.capacity} registered</span></div>
                  </div>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{selectedService.type}</Badge>
                  {selectedService.denomination && <Badge variant="secondary">{selectedService.denomination}</Badge>}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendees">Number of Attendees</Label>
                  <Select value={attendeeCount} onValueChange={setAttendeeCount}>
                    <SelectTrigger id="attendees"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5,6,7,8,9,10].map((n) => (<SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'Person' : 'People'}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Special Requirements (Optional)</Label>
                  <Textarea id="requirements" placeholder="Any special accommodations..." value={specialRequirements} onChange={(e) => setSpecialRequirements(e.target.value)} rows={4} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistrationOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmRegistration}>Confirm Registration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

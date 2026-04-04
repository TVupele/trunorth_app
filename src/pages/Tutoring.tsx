import { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, BookOpen, Calendar, DollarSign } from 'lucide-react';
import { TutorCard } from '@/components/TutorCard';
import { useWallet } from '@/hooks/useWallet';
import type { Tutor } from '@/lib/index';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { useTutors } from '@/hooks/useTutors';

interface BookingSession {
  id: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  amount: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function Tutoring() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingDuration, setBookingDuration] = useState('1');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [upcomingSessions, setUpcomingSessions] = useState<BookingSession[]>([]);
  const tutors = useTutors((state) => state.tutors);
  const isTutorsLoading = useTutors((state) => state.isLoading);
  const tutorsError = useTutors((state) => state.error);
  const fetchTutors = useTutors((state) => state.fetchTutors);
  const sendMoney = useWallet((state) => state.sendMoney);
  const isWalletLoading = useWallet((state) => state.isLoading);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const allSubjects = Array.from(
    new Set(tutors.flatMap((tutor) => tutor.subjects))
  ).sort();

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      searchQuery === '' ||
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSubject =
      selectedSubject === 'all' || tutor.subjects.includes(selectedSubject);

    const matchesPrice =
      tutor.hourlyRate >= priceRange[0] && tutor.hourlyRate <= priceRange[1];

    const matchesRating = tutor.rating >= minRating;

    const matchesAvailability =
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && tutor.available) ||
      (availabilityFilter === 'unavailable' && !tutor.available);

    return (
      matchesSearch &&
      matchesSubject &&
      matchesPrice &&
      matchesRating &&
      matchesAvailability
    );
  });

  const featuredTutors = tutors.filter((tutor) => tutor.rating >= 4.8).slice(0, 3);

  const handleBookSession = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setBookingSubject(tutor.subjects[0]);
    setBookingDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTutor || !bookingDate || !bookingTime) return;

    const duration = parseInt(bookingDuration);
    const totalAmount = selectedTutor.hourlyRate * duration;

    try {
      await sendMoney(
        selectedTutor.name,
        totalAmount,
        `Tutoring session - ${bookingSubject} (${duration}h)`
      );

      const newSession: BookingSession = {
        id: `session-${Date.now()}`,
        tutorId: selectedTutor.id,
        tutorName: selectedTutor.name,
        subject: bookingSubject,
        date: bookingDate,
        time: bookingTime,
        duration,
        amount: totalAmount,
        status: 'upcoming',
      };

      setUpcomingSessions([newSession, ...upcomingSessions]);
      setBookingDialogOpen(false);
      setBookingSubject('');
      setBookingDuration('1');
      setBookingDate('');
      setBookingTime('');
      setBookingNotes('');
      setSelectedTutor(null);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const resetFilters = () => {
    setSelectedSubject('all');
    setPriceRange([0, 10000]);
    setMinRating(0);
    setAvailabilityFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      {isTutorsLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <p>Loading tutors...</p>
        </div>
      )}
      {tutorsError && (
        <div className="p-4">
          <p className="text-destructive">{tutorsError}</p>
        </div>
      )}
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Tutoring Marketplace</h1>
            <p className="text-muted-foreground text-lg">
              Find expert tutors for personalized learning sessions
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by tutor name or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {(selectedSubject !== 'all' ||
                  priceRange[0] !== 0 ||
                  priceRange[1] !== 10000 ||
                  minRating !== 0 ||
                  availabilityFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder="All subjects" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All subjects</SelectItem>
                            {allSubjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Price Range (per hour)</Label>
                        <div className="pt-2">
                          <Slider
                            min={0}
                            max={10000}
                            step={500}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="mb-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatCurrency(priceRange[0])}</span>
                            <span>{formatCurrency(priceRange[1])}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Minimum Rating</Label>
                        <Select
                          value={minRating.toString()}
                          onValueChange={(value) => setMinRating(parseFloat(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Any rating</SelectItem>
                            <SelectItem value="4">4+ stars</SelectItem>
                            <SelectItem value="4.5">4.5+ stars</SelectItem>
                            <SelectItem value="4.8">4.8+ stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Availability</Label>
                        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All tutors" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All tutors</SelectItem>
                            <SelectItem value="available">Available now</SelectItem>
                            <SelectItem value="unavailable">Unavailable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button variant="ghost" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {upcomingSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{session.tutorName}</div>
                          <div className="text-sm text-muted-foreground">
                            {session.subject} • {session.duration}h session
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(session.date).toLocaleDateString()} at {session.time}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-semibold">
                            {formatCurrency(session.amount)}
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {featuredTutors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Featured Tutors</h2>
                <Badge variant="secondary" className="text-sm">
                  Top Rated
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTutors.map((tutor) => (
                  <div key={tutor.id} onClick={() => handleBookSession(tutor)} className="cursor-pointer">
                    <TutorCard tutor={tutor} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">All Tutors</h2>
              <div className="text-sm text-muted-foreground">
                {filteredTutors.length} {filteredTutors.length === 1 ? 'tutor' : 'tutors'} found
              </div>
            </div>

            {filteredTutors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No tutors found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor, index) => (
                  <motion.div
                    key={tutor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleBookSession(tutor)}
                    className="cursor-pointer"
                  >
                    <TutorCard tutor={tutor} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Book Tutoring Session</DialogTitle>
            <DialogDescription>
              Schedule a session with {selectedTutor?.name}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
          {selectedTutor && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <img
                  src={selectedTutor.avatar}
                  alt={selectedTutor.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg">{selectedTutor.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span>
                      {selectedTutor.rating} ({selectedTutor.totalReviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedTutor.experience} experience</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-lg">
                    {formatCurrency(selectedTutor.hourlyRate)}
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={bookingSubject} onValueChange={setBookingSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTutor.subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Select value={bookingDuration} onValueChange={setBookingDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific topics or requirements for the session..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {bookingDuration}h × {formatCurrency(selectedTutor.hourlyRate)}/h
                  </div>
                </div>
                <div className="font-mono font-bold text-2xl">
                  {formatCurrency(selectedTutor.hourlyRate * parseInt(bookingDuration))}
                </div>
              </div>
            </div>
          )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={
                isWalletLoading || !bookingSubject || !bookingDate || !bookingTime
              }
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {isWalletLoading ? 'Processing...' : 'Confirm & Pay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

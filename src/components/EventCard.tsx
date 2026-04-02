import { Event, formatCurrency } from '@/lib/index';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const now = new Date();
      const diff = eventDateTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Event started');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [event.date, event.time]);

  const availabilityPercentage = (event.availableSeats / event.totalSeats) * 100;
  const isLowAvailability = availabilityPercentage < 20;

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {event.category}
            </Badge>
          </div>
          {timeLeft && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                <Clock className="w-3 h-3 mr-1" />
                {timeLeft}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {' at '}
              {event.time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>
              {event.availableSeats} / {event.totalSeats} seats available
            </span>
            {isLowAvailability && (
              <Badge variant="destructive" className="ml-auto text-xs">
                Low availability
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono">
              {formatCurrency(event.ticketPrice, event.currency)}
            </span>
            <span className="text-sm text-muted-foreground">per ticket</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={event.availableSeats === 0}
        >
          {event.availableSeats === 0 ? 'Sold Out' : 'Buy Ticket'}
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Star, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tutor, formatCurrency } from '@/lib/index';

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-accent text-accent'
            : 'fill-muted text-muted-foreground'
        }`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={tutor.avatar} alt={tutor.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(tutor.name)}
              </AvatarFallback>
            </Avatar>
            {tutor.available && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {tutor.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {renderStars(tutor.rating)}
              <span className="text-sm text-muted-foreground ml-1">
                ({tutor.totalReviews})
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{tutor.experience}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Subjects</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map((subject, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {tutor.bio}
        </p>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary font-mono">
            {formatCurrency(tutor.hourlyRate, tutor.currency)}
          </span>
          <span className="text-sm text-muted-foreground">/hour</span>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className="w-full"
          disabled={!tutor.available}
        >
          {tutor.available ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Book Session
            </>
          ) : (
            'Currently Unavailable'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

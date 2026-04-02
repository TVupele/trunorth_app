import { ReligiousService } from "@/lib/index";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

interface ReligiousServiceCardProps {
  service: ReligiousService;
}

export function ReligiousServiceCard({ service }: ReligiousServiceCardProps) {
  const capacityPercentage = (service.registered / service.capacity) * 100;
  const availableSlots = service.capacity - service.registered;
  const isFull = availableSlots <= 0;

  const getServiceTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      prayer: "bg-primary/10 text-primary border-primary/20",
      sermon: "bg-accent/10 text-accent border-accent/20",
      study: "bg-secondary/10 text-secondary border-secondary/20",
      event: "bg-chart-1/10 text-chart-1 border-chart-1/20",
      other: "bg-muted text-muted-foreground border-border",
    };
    return colorMap[type] || colorMap.other;
  };

  const getServiceTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      prayer: "Prayer",
      sermon: "Sermon",
      study: "Study",
      event: "Event",
      other: "Other",
    };
    return labelMap[type] || "Service";
  };

  const handleRegister = () => {
    console.log("Register for service:", service.id);
  };

  const handleMapClick = () => {
    const encodedVenue = encodeURIComponent(service.venue);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedVenue}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-border hover:shadow-lg transition-all duration-200 hover:ring-2 hover:ring-ring/50 aspect-square">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              {service.name}
            </h3>
            <Badge
              variant="outline"
              className={`shrink-0 text-xs ${getServiceTypeColor(service.type)}`}
            >
              {getServiceTypeLabel(service.type)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-2 pb-2 text-xs">
          <p className="text-muted-foreground line-clamp-2">
            {service.description}
          </p>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <button
                onClick={handleMapClick}
                className="text-muted-foreground hover:text-primary hover:underline text-left transition-colors truncate"
              >
                {service.venue}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{service.date} at {service.time}</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-medium text-foreground">
                {availableSlots > 0 ? (
                  <span className="text-primary">
                    {availableSlots} slots left
                  </span>
                ) : (
                  <span className="text-destructive">Full</span>
                )}
              </span>
            </div>
            <Progress
              value={capacityPercentage}
              className="h-1"
            />
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            onClick={handleRegister}
            disabled={isFull}
            className="w-full"
            size="sm"
            variant={isFull ? "outline" : "default"}
          >
            {isFull ? "Fully Booked" : "Register"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

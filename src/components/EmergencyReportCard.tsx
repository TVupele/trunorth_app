import { EmergencyReport, formatDate } from "@/lib/index";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MapPin, Clock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EmergencyReportCardProps {
  report: EmergencyReport;
}

const priorityConfig = {
  low: { color: "text-muted-foreground", bg: "bg-muted", variant: "secondary" as const, icon: CheckCircle2 },
  medium: { color: "text-warning", bg: "bg-warning/10", variant: "outline" as const, icon: AlertTriangle },
  high: { color: "text-destructive", bg: "bg-destructive/10", variant: "destructive" as const, icon: AlertTriangle },
  critical: { color: "text-destructive", bg: "bg-destructive/20", variant: "destructive" as const, icon: AlertTriangle },
};

const statusConfig = {
  pending: { variant: "outline" as const, icon: Clock },
  "in-progress": { variant: "default" as const, icon: Loader2 },
  resolved: { variant: "secondary" as const, icon: CheckCircle2 },
};

const typeLabels = {
  medical: "Medical Emergency",
  fire: "Fire Emergency",
  accident: "Accident",
  security: "Security Issue",
  other: "Other Emergency",
};

const statusConfig = {
  pending: { variant: "outline" as const, icon: Clock },
  "in-progress": { variant: "default" as const, icon: Loader2 },
  resolved: { variant: "secondary" as const, icon: CheckCircle2 },
};

export { EmergencyReportCard as default }; // Also export as default for backward compatibility
  const priorityStyle = priorityConfig[report.priority] || priorityConfig.medium;
  const PriorityIcon = priorityStyle.icon;
  const statusStyle = statusConfig[report.status] || statusConfig.pending;
  const StatusIcon = statusStyle.icon;
  const isHighPriority = report.priority === "high" || report.priority === "critical";

  const cardContent = (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{typeLabels[report.type] || report.type}</h3>
              <Badge variant={priorityStyle.variant} className={priorityStyle.bg}>
                <PriorityIcon className="w-3 h-3 mr-1" />
                {report.priority.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{report.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(report.timestamp)}</span>
              </div>
            </div>
          </div>
          <Badge variant={statusStyle.variant} className="shrink-0">
            <StatusIcon className={`w-3 h-3 mr-1 ${report.status === "in-progress" ? "animate-spin" : ""}`} />
            {report.status === "in-progress" ? "In Progress" : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-foreground line-clamp-2">{report.description}</p>
        
        {report.photos && report.photos.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {report.photos.slice(0, 3).map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Evidence ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border border-border"
              />
            ))}
            {report.photos.length > 3 && (
              <div className="w-20 h-20 rounded-md border border-border bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                +{report.photos.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Status Timeline</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs">Reported</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${report.status !== "pending" ? "bg-primary" : "bg-muted"}`} />
              <span className="text-xs">In Progress</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${report.status === "resolved" ? "bg-primary" : "bg-muted"}`} />
              <span className="text-xs">Resolved</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border">
        <Button variant="outline" className="w-full" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );

  if (isHighPriority && report.status === "pending") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert variant="destructive" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a {report.priority} priority emergency requiring immediate attention.
          </AlertDescription>
        </Alert>
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {cardContent}
    </motion.div>
  );
}

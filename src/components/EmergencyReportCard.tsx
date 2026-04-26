import { EmergencyReport, formatDate } from "@/lib/index";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MapPin, Clock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface EmergencyReportCardProps {
  report: EmergencyReport;
}

const priorityConfig = {
  low: { color: "text-green-600", bg: "bg-green-100", variant: "secondary" as const, icon: CheckCircle2 },
  medium: { color: "text-amber-600", bg: "bg-amber-100", variant: "default" as const, icon: AlertTriangle },
  high: { color: "text-red-600", bg: "bg-red-100", variant: "destructive" as const, icon: AlertTriangle },
  critical: { color: "text-red-700", bg: "bg-red-200", variant: "destructive" as const, icon: AlertTriangle },
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

export function EmergencyReportCard({ report }: EmergencyReportCardProps) {
  const [showDetails, setShowDetails] = useState(false);
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
                <span>{report.location || 'Unknown'}</span>
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
        <Button variant="outline" className="w-full" size="sm" onClick={() => setShowDetails(true)}>
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
     <>
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3 }}
       >
         {cardContent}
       </motion.div>

       <EmergencyReportDetailsDialog
         report={report}
         open={showDetails}
         onOpenChange={setShowDetails}
       />
     </>
   );
 }

// Full Report Details Dialog Component
function EmergencyReportDetailsDialog({ report, open, onOpenChange }: { report: EmergencyReport; open: boolean; onOpenChange: (open: boolean) => void }) {
  const priorityStyle = priorityConfig[report.priority] || priorityConfig.medium;
  const PriorityIcon = priorityStyle.icon;
  const statusStyle = statusConfig[report.status] || statusConfig.pending;
  const StatusIcon = statusStyle.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {typeLabels[report.type] || report.type} Report
          </DialogTitle>
          <DialogDescription>
            Submitted on {formatDate(report.timestamp)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Priority Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={priorityStyle.variant} className={priorityStyle.bg}>
              <PriorityIcon className="w-3 h-3 mr-1" />
              {report.priority.toUpperCase()} PRIORITY
            </Badge>
            <Badge variant={statusStyle.variant}>
              <StatusIcon className={`w-3 h-3 mr-1 ${report.status === "in-progress" ? "animate-spin" : ""}`} />
              {report.status === "in-progress" ? "In Progress" : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold">Description</h4>
            <p className="text-sm text-foreground bg-muted p-3 rounded-md">{report.description}</p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </h4>
            <p className="text-sm text-foreground bg-muted p-3 rounded-md font-mono">
              {report.location || 'Not specified'}
            </p>
            {report.coordinates && (
              <p className="text-xs text-muted-foreground">
                GPS: {report.coordinates.lat.toFixed(6)}, {report.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Photos */}
          {report.photos && report.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Evidence Photos ({report.photos.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {report.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border">
                    <img src={photo} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="font-semibold">Status Timeline</h4>
            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs">Reported</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${report.status !== "pending" ? "bg-primary" : "bg-muted"}`} />
                <span className="text-xs">In Progress</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${report.status === "resolved" ? "bg-primary" : "bg-muted"}`} />
                <span className="text-xs">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

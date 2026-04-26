import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, MapPin, Camera, Phone, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmergencyReportCard } from '@/components/EmergencyReportCard';
import api from '@/lib/api';
import type { EmergencyReport } from '@/lib/index';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const emergencyContacts = [
  { name: 'Police', number: '112', icon: '🚓' },
  { name: 'Fire Service', number: '112', icon: '🚒' },
  { name: 'Ambulance', number: '112', icon: '🚑' },
  { name: 'NEMA', number: '112', icon: '🆘' },
];

export default function Emergency() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'medical' as EmergencyReport['type'],
    priority: 'medium' as EmergencyReport['priority'],
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    description: '',
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/emergency');
        const data = response.data;
        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setFormData((prev) => ({ ...prev, location: 'GPS is not supported by your browser' }));
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    setFormData((prev) => ({ ...prev, location: 'Acquiring GPS signal...' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude,
        }));
        setIsDetectingLocation(false);
        toast.success('Location detected successfully');
      },
      (error) => {
        let errorMsg = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied. Please enable location permissions or enter manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable. Try again or enter manually.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out. Try again or enter manually.';
            break;
        }
        setFormData((prev) => ({ ...prev, location: '' }));
        setIsDetectingLocation(false);
        toast.error(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitReport = async () => {
    try {
      const response = await api.post('/emergency', {
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: formData.description,
      });
      setReports([response.data, ...reports]);
      setIsReportDialogOpen(false);
      setFormData({ type: 'medical', priority: 'medium', location: '', latitude: null, longitude: null, description: '' });
      toast({ title: 'Report Submitted', description: 'Your emergency report has been submitted successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: String(error.response?.data?.error) || 'Failed to submit report.', variant: 'destructive' });
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      medical: '🏥', fire: '🔥', accident: '🚗', security: '🔒', other: '⚠️',
    };
    return icons[type] || '⚠️';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 py-4 max-w-7xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">Emergency Reporting</h1>
          <p className="text-muted-foreground text-sm">Report emergencies and track their status in real-time</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          <Card className="lg:col-span-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Report Emergency
              </CardTitle>
              <CardDescription className="text-xs">Quick access to emergency reporting. Your report will be immediately processed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm md:text-base h-10 md:h-12">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report Emergency Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Submit Emergency Report</DialogTitle>
                    <DialogDescription className="text-xs">Provide detailed information to help emergency responders assist you quickly.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1">
                      <Label htmlFor="emergency-type" className="text-sm">Emergency Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as EmergencyReport['type'] }))}>
                        <SelectTrigger id="emergency-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">{getTypeIcon('medical')} Medical Emergency</SelectItem>
                          <SelectItem value="fire">{getTypeIcon('fire')} Fire</SelectItem>
                          <SelectItem value="accident">{getTypeIcon('accident')} Accident</SelectItem>
                          <SelectItem value="security">{getTypeIcon('security')} Security</SelectItem>
                          <SelectItem value="other">{getTypeIcon('other')} Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="priority" className="text-sm">Priority Level *</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as EmergencyReport['priority'] }))}>
                        <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Non-urgent</SelectItem>
                          <SelectItem value="medium">Medium - Moderate urgency</SelectItem>
                          <SelectItem value="high">High - Urgent attention needed</SelectItem>
                          <SelectItem value="critical">Critical - Life-threatening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="location" className="text-sm">Location *</Label>
                      <div className="flex gap-2">
                        <Input id="location" placeholder="Enter location or use GPS" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} />
                        <Button type="button" variant="outline" onClick={handleDetectLocation} disabled={isDetectingLocation}><MapPin className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="description" className="text-sm">Description *</Label>
                      <Textarea id="description" placeholder="Describe the emergency situation in detail..." rows={3} value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1 h-9" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                      <Button className="flex-1 h-9 bg-destructive hover:bg-destructive/90" onClick={handleSubmitReport} disabled={!formData.location || !formData.description}>Submit Report</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Important:</strong> For life-threatening emergencies, call emergency services directly at{' '}
                  <span className="font-mono font-semibold text-foreground text-xs">112</span> before submitting a report.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4" />Emergency Contacts</CardTitle>
              <CardDescription className="text-xs">Quick dial emergency services</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {emergencyContacts.map((contact) => (
                <Button key={contact.name} variant="outline" className="w-full h-auto p-2 flex flex-col items-center justify-center hover:bg-primary/5 hover:border-primary" asChild>
                  <a href={`tel:${contact.number}`} className="text-center">
                    <span className="text-2xl">{contact.icon}</span>
                    <p className="font-semibold mt-1 text-xs">{contact.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{contact.number}</p>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Your Reports</h2>
              <p className="text-muted-foreground text-xs">Track the status of your emergency reports</p>
            </div>
            <Badge variant="secondary" className="text-xs">{reports.length} {reports.length === 1 ? 'Report' : 'Reports'}</Badge>
          </div>

          {isLoading ? (
            <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-32 w-full" />))}</div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No Reports Yet</p>
                <p className="text-muted-foreground">Your emergency reports will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (<EmergencyReportCard key={report.id} report={report} />))}
            </div>
          )}
        </div>

        <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" />Safety Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Always prioritize your safety. Move to a safe location before reporting.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Provide accurate location information to help responders reach you quickly.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Include clear descriptions and photos when possible to assist emergency teams.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>For immediate life-threatening situations, call 112 directly before using the app.</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

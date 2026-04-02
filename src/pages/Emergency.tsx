import { useState, useEffect } from 'react';
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
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'medical' as EmergencyReport['type'],
    priority: 'medium' as EmergencyReport['priority'],
    location: '',
    description: '',
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/emergency');
        setReports(response.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }));
          setIsDetectingLocation(false);
        },
        () => {
          setFormData((prev) => ({ ...prev, location: 'Location detection failed' }));
          setIsDetectingLocation(false);
        }
      );
    } else {
      setFormData((prev) => ({ ...prev, location: 'Geolocation not supported' }));
      setIsDetectingLocation(false);
    }
  };

  const handleSubmitReport = async () => {
    try {
      const response = await api.post('/emergency', {
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        description: formData.description,
      });
      setReports([response.data, ...reports]);
      setIsReportDialogOpen(false);
      setFormData({ type: 'medical', priority: 'medium', location: '', description: '' });
      toast({ title: 'Report Submitted', description: 'Your emergency report has been submitted successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to submit report.', variant: 'destructive' });
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Emergency Reporting</h1>
          <p className="text-muted-foreground text-lg">Report emergencies and track their status in real-time</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Report Emergency
              </CardTitle>
              <CardDescription>Quick access to emergency reporting. Your report will be immediately processed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base md:text-lg h-12 md:h-14">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Report Emergency Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Submit Emergency Report</DialogTitle>
                    <DialogDescription>Provide detailed information to help emergency responders assist you quickly.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency-type">Emergency Type *</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level *</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <div className="flex gap-2">
                        <Input id="location" placeholder="Enter location or use GPS" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} />
                        <Button type="button" variant="outline" onClick={handleDetectLocation} disabled={isDetectingLocation}><MapPin className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea id="description" placeholder="Describe the emergency situation in detail..." rows={5} value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                      <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleSubmitReport} disabled={!formData.location || !formData.description}>Submit Report</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> For life-threatening emergencies, call emergency services directly at{' '}
                  <span className="font-mono font-semibold text-foreground">112</span> before submitting a report.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" />Emergency Contacts</CardTitle>
              <CardDescription>Quick dial emergency services</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {emergencyContacts.map((contact) => (
                <Button key={contact.name} variant="outline" className="w-full h-auto p-3 flex flex-col items-center justify-center hover:bg-primary/5 hover:border-primary" asChild>
                  <a href={`tel:${contact.number}`} className="text-center">
                    <span className="text-3xl">{contact.icon}</span>
                    <p className="font-semibold mt-1 text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{contact.number}</p>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Reports</h2>
              <p className="text-muted-foreground">Track the status of your emergency reports</p>
            </div>
            <Badge variant="secondary" className="text-sm">{reports.length} {reports.length === 1 ? 'Report' : 'Reports'}</Badge>
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

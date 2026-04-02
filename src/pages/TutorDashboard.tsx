import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, DollarSign, Calendar, Star, Pencil, Save } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface TutorStats {
  totalBookings: number;
  totalEarnings: number;
  rating: number;
}

interface TutorProfile {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  bio: string;
  available: boolean;
  experience: string;
}

export default function TutorDashboard() {
  const [stats, setStats] = useState<TutorStats | null>(null);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [statsRes, profileRes, bookingsRes] = await Promise.all([
        api.get('/tutor-management/stats'),
        api.get('/tutor-management/profile'),
        api.get('/tutor-management/bookings'),
      ]);
      setStats(statsRes.data);
      setProfile(profileRes.data);
      setBookings(bookingsRes.data);
      setEditData({
        subjects: profileRes.data.subjects?.join(', ') || '',
        hourly_rate: profileRes.data.hourlyRate || 0,
        experience_level: profileRes.data.experience || '',
        is_available: profileRes.data.available ?? true,
      });
    } catch (error) {
      console.error('Failed to fetch tutor data:', error);
      toast({ title: 'Error', description: 'Failed to load tutor data.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      await api.put('/tutor-management/profile', {
        subjects: editData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
        hourly_rate: parseFloat(editData.hourly_rate),
        experience_level: editData.experience_level,
        is_available: editData.is_available,
      });
      toast({ title: 'Success', description: 'Profile updated.' });
      setIsEditing(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to update.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-32 w-full" />))}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
            <p className="text-muted-foreground">Manage your tutoring sessions and profile</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.totalBookings || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{(stats?.rating || 0).toFixed(1)}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Manage your tutoring profile and availability</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" />Edit Profile</Button>
            ) : (
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{profile?.name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.bio || 'No bio set'}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Subjects (comma-separated)</Label>
                  <Input value={editData.subjects} onChange={(e) => setEditData({ ...editData, subjects: e.target.value })} placeholder="Mathematics, Physics, Chemistry" />
                </div>
                <div>
                  <Label>Hourly Rate (NGN)</Label>
                  <Input type="number" value={editData.hourly_rate} onChange={(e) => setEditData({ ...editData, hourly_rate: e.target.value })} />
                </div>
                <div>
                  <Label>Experience Level</Label>
                  <Input value={editData.experience_level} onChange={(e) => setEditData({ ...editData, experience_level: e.target.value })} placeholder="e.g., 5 years" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editData.is_available} onCheckedChange={(v) => setEditData({ ...editData, is_available: v })} />
                  <Label>Available for bookings</Label>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Subjects</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile?.subjects?.length ? profile.subjects.map((s, i) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    )) : <span className="text-sm text-muted-foreground">No subjects set</span>}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hourly Rate</Label>
                  <p className="font-semibold">{formatCurrency(profile?.hourlyRate || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p className="font-semibold">{profile?.experience || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={profile?.available ? 'default' : 'secondary'}>{profile?.available ? 'Available' : 'Unavailable'}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>Your upcoming and past tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No bookings yet</p>
                <p className="text-muted-foreground">Students will book sessions with you once your profile is set up</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.student_name}</TableCell>
                      <TableCell>{new Date(b.booking_date).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'}>{b.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

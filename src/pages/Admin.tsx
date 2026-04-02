import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, ShoppingBag, Calendar, Heart, Church, GraduationCap, Store,
  Plus, Pencil, Trash2, Check, X, BarChart3, TrendingUp, DollarSign, Image
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalTutors: number;
  totalProducts: number;
  totalEvents: number;
  activeCampaigns: number;
  totalServices: number;
  totalBookings: number;
  totalDonations: number;
  totalRevenue: number;
  pendingApprovals: number;
}

interface PendingRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  request_type: 'vendor' | 'tutor';
  status: string;
  created_at: string;
}

interface AdBanner {
  id: string;
  title: string;
  description: string;
  type: string;
  image_url: string;
  cta: string;
  link: string;
  is_active: boolean;
  display_order: number;
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [adBanners, setAdBanners] = useState<AdBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editDialog, setEditDialog] = useState<{ open: boolean; type: string; data: any }>({ open: false, type: '', data: null });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, productsRes, eventsRes, campaignsRes, servicesRes, pendingRes, bannersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/products'),
        api.get('/admin/events'),
        api.get('/admin/campaigns'),
        api.get('/admin/services'),
        api.get('/admin/pending-approvals'),
        api.get('/admin/ad-banners'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setEvents(eventsRes.data);
      setCampaigns(campaignsRes.data);
      setServices(servicesRes.data);
      setPendingRequests(pendingRes.data);
      setAdBanners(bannersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({ title: 'Error', description: 'Failed to load admin data.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast({ title: 'Success', description: `User role updated to ${role}` });
    } catch (error: any) {
      toast({ title: 'Error',         description: String(error.response?.data?.error) || 'Failed to update role', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: 'Success', description: 'User deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleApproveRequest = async (requestId: string, requestType: 'vendor' | 'tutor') => {
    try {
      const endpoint = requestType === 'vendor' 
        ? `/admin/pending-approvals/${requestId}/approve` 
        : `/admin/pending-approvals/${requestId}/approve-tutor`;
      await api.post(endpoint);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      toast({ title: 'Success', description: `${requestType} request approved` });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error',         description: String(error.response?.data?.error) || 'Failed to approve request', variant: 'destructive' });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.post(`/admin/pending-approvals/${requestId}/reject`);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      toast({ title: 'Success', description: 'Request rejected' });
    } catch (error: any) {
      toast({ title: 'Error',         description: String(error.response?.data?.error) || 'Failed to reject request', variant: 'destructive' });
    }
  };

  const handleSaveEntity = async () => {
    const { type, data } = editDialog;
    try {
      if (data.id) {
        await api.put(`/${type}/${data.id}`, data);
        toast({ title: 'Success', description: `${type} updated` });
      } else {
        await api.post(`/${type}`, data);
        toast({ title: 'Success', description: `${type} created` });
      }
      setEditDialog({ open: false, type: '', data: null });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: String(error.response?.data?.error) || 'Failed to save', variant: 'destructive' });
    }
  };

  const handleDeleteEntity = async (type: string, id: string) => {
    try {
      await api.delete(`/${type}/${id}`);
      toast({ title: 'Success', description: 'Deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleSaveBanner = async () => {
    const { data } = editDialog;
    try {
      if (data.id) {
        await api.put(`/admin/ad-banners/${data.id}`, data);
        toast({ title: 'Success', description: 'Banner updated' });
      } else {
        await api.post('/admin/ad-banners', data);
        toast({ title: 'Success', description: 'Banner created' });
      }
      setEditDialog({ open: false, type: '', data: null });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: String(error.response?.data?.error) || 'Failed to save banner', variant: 'destructive' });
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      await api.delete(`/admin/ad-banners/${bannerId}`);
      toast({ title: 'Success', description: 'Banner deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to delete banner', variant: 'destructive' });
    }
  };

  const openCreateDialog = (type: string) => {
    const defaults: Record<string, any> = {
      products: { name: '', description: '', price: 0, category: 'General', stock_quantity: 0, image_url: '' },
      events: { title: '', description: '', event_date: '', location: '', ticket_price: 0, total_seats: 0, category: 'General', image_url: '' },
      campaigns: { title: '', description: '', goal_amount: 0, end_date: '', category: 'General', image_url: '' },
      'religious-services': { name: '', type: 'prayer', venue: '', service_time: '', denomination: '', capacity: 0, description: '', organizer: '' },
      'ad-banners': { title: '', description: '', type: 'event', image_url: '', cta: 'Learn More', link: '/', is_active: true, display_order: 0 },
    };
    setEditDialog({ open: true, type, data: defaults[type] || {} });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} className="h-32 w-full" />))}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all aspects of the TruNORTH Super App</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Vendors</CardTitle><Store className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalVendors || 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tutors</CardTitle><GraduationCap className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalTutors || 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Products</CardTitle><ShoppingBag className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalProducts || 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Events</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalEvents || 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Campaigns</CardTitle><Heart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Donations</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats?.totalDonations || 0)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Revenue</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">Pending Approvals {pendingRequests.length > 0 && `(${pendingRequests.length})`}</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="banners">Ad Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Recent Users</CardTitle><CardDescription>Latest registered users</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Verified</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.slice(0, 5).map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                        <TableCell>{u.is_verified ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Pending Approvals</CardTitle><CardDescription>Vendor and Tutor requests waiting for approval</CardDescription></CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-muted-foreground">No pending requests</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Request Type</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {pendingRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.full_name}</TableCell>
                          <TableCell>{req.email}</TableCell>
                          <TableCell><Badge variant={req.request_type === 'vendor' ? 'default' : 'secondary'}>{req.request_type}</Badge></TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleApproveRequest(req.id, req.request_type)}>
                              <Check className="h-4 w-4 text-green-500 mr-1" />Approve
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRejectRequest(req.id)}>
                              <X className="h-4 w-4 text-red-500 mr-1" />Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>User Management</CardTitle><CardDescription>Manage all users and their roles</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Select value={u.role} onValueChange={(v) => handleUpdateUserRole(u.id, v)}>
                            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="tutor">Tutor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Product Management</CardTitle><CardDescription>Manage marketplace products</CardDescription></div>
                <Button onClick={() => openCreateDialog('products')}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Category</TableHead><TableHead>Stock</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(p.price))}</TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell>{p.stock_quantity}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditDialog({ open: true, type: 'products', data: p })}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntity('products', p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Event Management</CardTitle><CardDescription>Manage events and tickets</CardDescription></div>
                <Button onClick={() => openCreateDialog('events')}><Plus className="h-4 w-4 mr-2" />Add Event</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Location</TableHead><TableHead>Price</TableHead><TableHead>Seats</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {events.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.title}</TableCell>
                        <TableCell>{new Date(e.event_date).toLocaleDateString()}</TableCell>
                        <TableCell>{e.location}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(e.ticket_price || 0))}</TableCell>
                        <TableCell>{e.available_seats}/{e.total_seats}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditDialog({ open: true, type: 'events', data: e })}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntity('events', e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Campaign Management</CardTitle><CardDescription>Manage donation campaigns</CardDescription></div>
                <Button onClick={() => openCreateDialog('campaigns')}><Plus className="h-4 w-4 mr-2" />Add Campaign</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Goal</TableHead><TableHead>Raised</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(c.goal_amount))}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(c.raised_amount))}</TableCell>
                        <TableCell><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                        <TableCell className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditDialog({ open: true, type: 'campaigns', data: c })}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntity('campaigns', c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Religious Services Management</CardTitle><CardDescription>Manage religious services</CardDescription></div>
                <Button onClick={() => openCreateDialog('religious-services')}><Plus className="h-4 w-4 mr-2" />Add Service</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Venue</TableHead><TableHead>Denomination</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {services.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{s.type}</Badge></TableCell>
                        <TableCell>{s.venue}</TableCell>
                        <TableCell>{s.denomination}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditDialog({ open: true, type: 'religious-services', data: s })}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntity('religious-services', s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Ad Banners Management</CardTitle><CardDescription>Manage homepage advertisement banners</CardDescription></div>
                <Button onClick={() => openCreateDialog('ad-banners')}><Plus className="h-4 w-4 mr-2" />Add Banner</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Image</TableHead><TableHead>Active</TableHead><TableHead>Order</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {adBanners.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.title}</TableCell>
                        <TableCell><Badge variant="outline">{b.type}</Badge></TableCell>
                        <TableCell>
                          {b.image_url ? (
                            <img src={b.image_url} alt={b.title} className="h-10 w-16 object-cover rounded" />
                          ) : (
                            <Image className="h-6 w-6 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>{b.is_active ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}</TableCell>
                        <TableCell>{b.display_order}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditDialog({ open: true, type: 'ad-banners', data: b })}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBanner(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Generic Edit/Create Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editDialog.data?.id ? 'Edit' : 'Create'} {editDialog.type?.replace('-', ' ').replace(/s$/, '')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {editDialog.type === 'products' && (
              <>
                <div><Label>Name</Label><Input value={editDialog.data?.name || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, name: e.target.value } })} /></div>
                <div><Label>Description</Label><Textarea value={editDialog.data?.description || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, description: e.target.value } })} /></div>
                <div><Label>Price</Label><Input type="number" value={editDialog.data?.price || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, price: e.target.value } })} /></div>
                <div><Label>Category</Label><Input value={editDialog.data?.category || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, category: e.target.value } })} /></div>
                <div><Label>Stock</Label><Input type="number" value={editDialog.data?.stock_quantity || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, stock_quantity: e.target.value } })} /></div>
                <div><Label>Image URL</Label><Input value={editDialog.data?.image_url || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, image_url: e.target.value } })} /></div>
              </>
            )}
            {editDialog.type === 'events' && (
              <>
                <div><Label>Title</Label><Input value={editDialog.data?.title || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, title: e.target.value } })} /></div>
                <div><Label>Description</Label><Textarea value={editDialog.data?.description || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, description: e.target.value } })} /></div>
                <div><Label>Date & Time</Label><Input type="datetime-local" value={editDialog.data?.event_date ? new Date(editDialog.data.event_date).toISOString().slice(0, 16) : ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, event_date: e.target.value } })} /></div>
                <div><Label>Location</Label><Input value={editDialog.data?.location || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, location: e.target.value } })} /></div>
                <div><Label>Ticket Price</Label><Input type="number" value={editDialog.data?.ticket_price || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, ticket_price: e.target.value } })} /></div>
                <div><Label>Total Seats</Label><Input type="number" value={editDialog.data?.total_seats || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, total_seats: e.target.value } })} /></div>
                <div><Label>Category</Label><Input value={editDialog.data?.category || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, category: e.target.value } })} /></div>
              </>
            )}
            {editDialog.type === 'campaigns' && (
              <>
                <div><Label>Title</Label><Input value={editDialog.data?.title || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, title: e.target.value } })} /></div>
                <div><Label>Description</Label><Textarea value={editDialog.data?.description || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, description: e.target.value } })} /></div>
                <div><Label>Goal Amount</Label><Input type="number" value={editDialog.data?.goal_amount || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, goal_amount: e.target.value } })} /></div>
                <div><Label>End Date</Label><Input type="date" value={editDialog.data?.end_date ? new Date(editDialog.data.end_date).toISOString().slice(0, 10) : ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, end_date: e.target.value } })} /></div>
                <div><Label>Category</Label><Input value={editDialog.data?.category || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, category: e.target.value } })} /></div>
                <div><Label>Image URL</Label><Input value={editDialog.data?.image_url || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, image_url: e.target.value } })} /></div>
              </>
            )}
            {editDialog.type === 'religious-services' && (
              <>
                <div><Label>Name</Label><Input value={editDialog.data?.name || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, name: e.target.value } })} /></div>
                <div><Label>Type</Label>
                  <Select value={editDialog.data?.type || 'prayer'} onValueChange={(v) => setEditDialog({ ...editDialog, data: { ...editDialog.data, type: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="sermon">Sermon</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Venue</Label><Input value={editDialog.data?.venue || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, venue: e.target.value } })} /></div>
                <div><Label>Service Time</Label><Input type="datetime-local" value={editDialog.data?.service_time ? new Date(editDialog.data.service_time).toISOString().slice(0, 16) : ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, service_time: e.target.value } })} /></div>
                <div><Label>Denomination</Label><Input value={editDialog.data?.denomination || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, denomination: e.target.value } })} /></div>
                <div><Label>Capacity</Label><Input type="number" value={editDialog.data?.capacity || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, capacity: e.target.value } })} /></div>
                <div><Label>Organizer</Label><Input value={editDialog.data?.organizer || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, organizer: e.target.value } })} /></div>
                <div><Label>Description</Label><Textarea value={editDialog.data?.description || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, description: e.target.value } })} /></div>
              </>
            )}
            {editDialog.type === 'ad-banners' && (
              <>
                <div><Label>Title</Label><Input value={editDialog.data?.title || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, title: e.target.value } })} /></div>
                <div><Label>Description</Label><Textarea value={editDialog.data?.description || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, description: e.target.value } })} /></div>
                <div><Label>Type</Label>
                  <Select value={editDialog.data?.type || 'event'} onValueChange={(v) => setEditDialog({ ...editDialog, data: { ...editDialog.data, type: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="religious">Religious</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Image URL</Label><Input value={editDialog.data?.image_url || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, image_url: e.target.value } })} /></div>
                <div><Label>CTA Button Text</Label><Input value={editDialog.data?.cta || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, cta: e.target.value } })} /></div>
                <div><Label>Link</Label><Input value={editDialog.data?.link || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, link: e.target.value } })} /></div>
                <div><Label>Display Order</Label><Input type="number" value={editDialog.data?.display_order || 0} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, display_order: parseInt(e.target.value) } })} /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, type: '', data: null })}>Cancel</Button>
            <Button onClick={editDialog.type === 'ad-banners' ? handleSaveBanner : handleSaveEntity}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

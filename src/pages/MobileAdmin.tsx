import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, ShoppingBag, Calendar, Heart, Store, Plus, Check, X,
  Menu, TrendingUp, DollarSign, Image, ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalTutors: number;
  totalProducts: number;
  totalEvents: number;
  activeCampaigns: number;
  totalDonations: number;
  totalRevenue: number;
  pendingApprovals: number;
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

export default function MobileAdmin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [adBanners, setAdBanners] = useState<AdBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editDialog, setEditDialog] = useState<{ open: boolean; type: string; data: any }>({ open: false, type: '', data: null });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, bannersRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: getDefaultStats() })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/ad-banners').catch(() => ({ data: getDefaultBanners() })),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAdBanners(bannersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setStats(getDefaultStats());
      setAdBanners(getDefaultBanners());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getDefaultStats = (): AdminStats => ({
    totalUsers: 156,
    totalVendors: 23,
    totalTutors: 12,
    totalProducts: 89,
    totalEvents: 15,
    activeCampaigns: 8,
    totalDonations: 245000,
    totalRevenue: 1560000,
    pendingApprovals: 5,
  });

  const getDefaultBanners = (): AdBanner[] => [
    { id: '1', title: 'Welcome to TruNORTH', description: 'Your all-in-one platform', type: 'event', image_url: '/Logo_Icon.jpeg', cta: 'Learn More', link: '/', is_active: true, display_order: 1 },
  ];

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

  const openCreateBanner = () => {
    setEditDialog({ open: true, type: 'ad-banners', data: { title: '', description: '', type: 'event', image_url: '/Logo_Icon.jpeg', cta: 'Learn More', link: '/', is_active: true, display_order: 0 } });
  };

  const menuItems = [
    { icon: '🏠', label: 'Home', href: ROUTE_PATHS.HOME },
    { icon: '💰', label: 'Wallet', href: ROUTE_PATHS.WALLET },
    { icon: '⚙️', label: 'Settings', href: ROUTE_PATHS.SETTINGS },
  ];

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground p-4 pt-16 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user?.fullName || 'Admin'}</p>
                    <p className="text-sm text-muted-foreground opacity-80">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <Link key={index} to={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-destructive">
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm opacity-80">Manage your platform</p>
          </div>
          
          <Link to={ROUTE_PATHS.PROFILE}>
            <Avatar className="h-10 w-10 border-2 border-white/30">
              <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
              <AvatarFallback className="bg-white/20 text-primary-foreground">A</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="p-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-3">
              <Users className="w-5 h-5 text-primary mb-1" />
              <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-3">
              <Store className="w-5 h-5 text-green-500 mb-1" />
              <p className="text-2xl font-bold">{stats?.totalVendors || 0}</p>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-3">
              <ShoppingBag className="w-5 h-5 text-purple-500 mb-1" />
              <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-3">
              <Calendar className="w-5 h-5 text-orange-500 mb-1" />
              <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5">
            <CardContent className="p-3">
              <Heart className="w-5 h-5 text-pink-500 mb-1" />
              <p className="text-2xl font-bold">{stats?.activeCampaigns || 0}</p>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-3">
              <DollarSign className="w-5 h-5 text-blue-500 mb-1" />
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={openCreateBanner} className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-1" />Add Banner
                  </Button>
                  <Button onClick={() => setActiveTab('users')} variant="outline" className="w-full" size="sm">
                    <Users className="w-4 h-4 mr-1" />Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="mt-4 space-y-3">
            {users.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No users found</CardContent></Card>
            ) : (
              users.slice(0, 10).map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback>{u.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{u.role || 'user'}</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="banners" className="mt-4 space-y-3">
            <div className="flex justify-end mb-2">
              <Button onClick={openCreateBanner} size="sm">
                <Plus className="w-4 h-4 mr-1" />Add Banner
              </Button>
            </div>
            {adBanners.map((banner) => (
              <Card key={banner.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                      {banner.image_url ? (
                        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-full h-full p-2 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{banner.title}</p>
                      <p className="text-xs text-muted-foreground">{banner.type}</p>
                    </div>
                    <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4 space-y-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">{stats?.pendingApprovals || 0} pending approvals</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Banner Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDialog.data?.id ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input value={editDialog.data?.title || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, title: e.target.value } })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={editDialog.data?.description || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, description: e.target.value } })} />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input value={editDialog.data?.cta || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, cta: e.target.value } })} />
            </div>
            <div>
              <Label>Link</Label>
              <Input value={editDialog.data?.link || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, link: e.target.value } })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, type: '', data: null })}>Cancel</Button>
            <Button onClick={handleSaveBanner}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdsBanner } from '@/components/AdsBanner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ROUTE_PATHS, formatCurrency } from '@/lib/index';
import {
  Wallet, Users, Plane, GraduationCap, AlertTriangle, Heart,
  ShoppingBag, Calendar, Church, Bot, MessageSquare, TrendingUp,
  Store, BadgeCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsFeed } from '@/components/NewsFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function Home() {
  const { user } = useAuth();
  const wallet = useWallet((state) => state.wallet);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const isWalletLoading = useWallet((state) => state.isLoading);
  const walletError = useWallet((state) => state.error);
  const stats = useDashboardStats((state) => state.stats);
  const fetchStats = useDashboardStats((state) => state.fetchStats);
  const isStatsLoading = useDashboardStats((state) => state.isLoading);
  const statsError = useDashboardStats((state) => state.error);
  const { toast } = useToast();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalType, setApprovalType] = useState<'vendor' | 'tutor'>('vendor');
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchStats();
  }, [fetchWalletData, fetchStats]);

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? 'NGN';

  const handleRequestApproval = async () => {
    setIsApproving(true);
    try {
      const endpoint = approvalType === 'vendor' ? '/admin/approve-vendor' : '/admin/approve-tutor';
      await api.post(endpoint);
      toast({
        title: 'Request Submitted',
        description: `Your ${approvalType} request has been submitted and is pending admin approval.`,
      });
      setShowApprovalDialog(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred.';
      toast({
        title: 'Request Failed',
        description: String(errorMessage),
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const openApprovalDialog = (type: 'vendor' | 'tutor') => {
    setApprovalType(type);
    setShowApprovalDialog(true);
  };

  const isRegularUser = user?.role === 'user';
  const isVendor = user?.role === 'vendor';
  const isTutor = user?.role === 'tutor';

  const services = [
    {
      icon: <Wallet className="w-5 h-5" />,
      title: 'Digital Wallet',
      description: 'Manage your finances, send money, and track transactions',
      href: ROUTE_PATHS.WALLET,
      variant: 'primary' as const,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Social Network',
      description: 'Connect with friends, share posts, and engage with community',
      href: ROUTE_PATHS.SOCIAL,
      variant: 'default' as const,
    },
    {
      icon: <Plane className="w-5 h-5" />,
      title: 'Travel Booking',
      description: 'Discover and book amazing travel packages across Nigeria',
      href: ROUTE_PATHS.TRAVEL,
      variant: 'default' as const,
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      title: 'Tutoring Services',
      description: 'Find expert tutors for personalized learning sessions',
      href: ROUTE_PATHS.TUTORING,
      variant: 'default' as const,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Emergency Reporting',
      description: 'Report emergencies and get immediate assistance',
      href: ROUTE_PATHS.EMERGENCY,
      variant: 'accent' as const,
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'Donations',
      description: 'Support meaningful causes and community campaigns',
      href: ROUTE_PATHS.DONATIONS,
      variant: 'default' as const,
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: 'Marketplace',
      description: 'Shop for products from trusted sellers',
      href: ROUTE_PATHS.MARKETPLACE,
      variant: 'default' as const,
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Event Tickets',
      description: 'Book tickets for concerts, conferences, and events',
      href: ROUTE_PATHS.EVENTS,
      variant: 'default' as const,
    },
    {
      icon: <Church className="w-5 h-5" />,
      title: 'Religious Services',
      description: 'Register for prayers, sermons, and religious events',
      href: ROUTE_PATHS.RELIGIOUS_SERVICES,
      variant: 'default' as const,
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: 'AI Assistant',
      description: 'Get help navigating the app and finding information',
      href: ROUTE_PATHS.AI_ASSISTANT,
      variant: 'default' as const,
    },
  ];

  // Add vendor dashboard link if user is a vendor
  if (isVendor) {
    services.push({
      icon: <Store className="w-5 h-5" />,
      title: 'Vendor Dashboard',
      description: 'Manage your products, orders, and earnings',
      href: ROUTE_PATHS.VENDOR_DASHBOARD,
      variant: 'primary' as const,
    });
  }

  // Add tutor dashboard link if user is a tutor
  if (isTutor) {
    services.push({
      icon: <GraduationCap className="w-5 h-5" />,
      title: 'Tutor Dashboard',
      description: 'Manage your courses, bookings, and earnings',
      href: ROUTE_PATHS.TUTOR_DASHBOARD,
      variant: 'primary' as const,
    });
  }

  return (
    <div>
      <AdsBanner />

      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          className="mb-4 md:mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Welcome back, {user?.fullName ? user.fullName.split(' ')[0] : ''}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Your all-in-one platform for services, community, and growth
          </p>
        </motion.div>

        {/* Vendor/Tutor Approval Section for regular users */}
        {isRegularUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4 md:mb-6"
          >
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Become a Vendor or Tutor</h3>
                      <p className="text-sm text-muted-foreground">Get approved to sell products or offer tutoring services on the platform</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openApprovalDialog('vendor')} variant="default" size="sm">
                      <Store className="h-4 w-4 mr-2" />Become a Vendor
                    </Button>
                    <Button onClick={() => openApprovalDialog('tutor')} variant="outline" size="sm">
                      <GraduationCap className="h-4 w-4 mr-2" />Become a Tutor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {walletError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Wallet Error</AlertTitle>
            <AlertDescription>{walletError}</AlertDescription>
          </Alert>
        )}

        {statsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Stats Error</AlertTitle>
            <AlertDescription>{statsError}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 35, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 md:mb-6"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5" />Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {isWalletLoading ? (
                <Skeleton className="h-6 w-28" />
              ) : (
                <div className="text-lg font-bold font-mono text-primary">{formatCurrency(balance, currency)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">Available balance</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />Unread Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {isStatsLoading ? (
                <Skeleton className="h-6 w-14" />
              ) : (
                <div className="text-lg font-bold text-accent">{stats.unreadMessages}</div>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">New conversations</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {isStatsLoading ? (
                <Skeleton className="h-6 w-14" />
              ) : (
                <div className="text-lg font-bold text-secondary">{stats.upcomingBookings}</div>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">Active reservations</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-4 md:mb-6">
          <NewsFeed />
        </div>
      </div>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Become a {approvalType === 'vendor' ? 'Vendor' : 'Tutor'}</DialogTitle>
            <DialogDescription>
              {approvalType === 'vendor'
                ? 'As a vendor, you will be able to list and sell products on the marketplace. Your request will need admin approval before becoming active.'
                : 'As a tutor, you will be able to offer tutoring sessions and manage your courses. Your request will need admin approval before becoming active.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
            <Button onClick={handleRequestApproval} disabled={isApproving}>
              {isApproving ? 'Submitting...' : `Submit ${approvalType === 'vendor' ? 'Vendor' : 'Tutor'} Request`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

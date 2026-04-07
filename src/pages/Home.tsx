import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AdsBanner } from '@/components/AdsBanner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ROUTE_PATHS, formatCurrency } from '@/lib/index';
import {
  Users, Plane, GraduationCap, AlertTriangle, Heart,
  ShoppingBag, Calendar, Church, Bot, MessageSquare, TrendingUp,
  Store, BadgeCheck, Wallet,
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
  const { t } = useTranslation();
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
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'string' ? errorData : 'An error occurred.';
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
      title: t('Digital Wallet'),
      description: t('Manage your finances'),
      href: ROUTE_PATHS.WALLET,
      variant: 'primary' as const,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: t('Social Network'),
      description: t('Connect with friends'),
      href: ROUTE_PATHS.SOCIAL,
      variant: 'default' as const,
    },
    {
      icon: <Plane className="w-5 h-5" />,
      title: t('Travel Booking'),
      description: t('Discover trips'),
      href: ROUTE_PATHS.TRAVEL,
      variant: 'default' as const,
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      title: t('Tutoring'),
      description: t('Find expert tutors'),
      href: ROUTE_PATHS.TUTORING,
      variant: 'default' as const,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: t('Emergency Reporting'),
      description: t('Report incidents quickly'),
      href: ROUTE_PATHS.EMERGENCY,
      variant: 'accent' as const,
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: t('Donations'),
      description: t('Support meaningful causes'),
      href: ROUTE_PATHS.DONATIONS,
      variant: 'default' as const,
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: t('Marketplace'),
      description: t('Shop for products'),
      href: ROUTE_PATHS.MARKETPLACE,
      variant: 'default' as const,
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: t('Events'),
      description: t('Book tickets'),
      href: ROUTE_PATHS.EVENTS,
      variant: 'default' as const,
    },
    {
      icon: <Church className="w-5 h-5" />,
      title: t('Religious Services'),
      description: t('Register for services'),
      href: ROUTE_PATHS.RELIGIOUS_SERVICES,
      variant: 'default' as const,
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: t('AI Assistant'),
      description: t('Get help'),
      href: ROUTE_PATHS.AI_ASSISTANT,
      variant: 'default' as const,
    },
  ];

  // Add vendor dashboard link if user is a vendor
  if (isVendor) {
    services.push({
      icon: <Store className="w-5 h-5" />,
      title: t('Vendors'),
      description: t('Manage your products'),
      href: ROUTE_PATHS.VENDOR_DASHBOARD,
      variant: 'primary' as const,
    });
  }

  if (isTutor) {
    services.push({
      icon: <GraduationCap className="w-5 h-5" />,
      title: t('Tutors'),
      description: t('Manage your courses'),
      href: ROUTE_PATHS.TUTOR_DASHBOARD,
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

      <div className="mt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          className="mb-4 md:mb-6"
        >
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            {t('Welcome back')}, {user?.fullName ? user.fullName.split(' ')[0] : ''}!
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('Your all-in-one platform')}
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
                      <h3 className="font-semibold">{t('Become a Vendor or Tutor')}</h3>
                      <p className="text-sm text-muted-foreground">{t('Get approved to sell products')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openApprovalDialog('vendor')} variant="default" size="sm">
                      <Store className="h-4 w-4 mr-2" />{t('Become a Vendor')}
                    </Button>
                    <Button onClick={() => openApprovalDialog('tutor')} variant="outline" size="sm">
                      <GraduationCap className="h-4 w-4 mr-2" />{t('Become a Tutor')}
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
            <AlertTitle>{t('Wallet Error')}</AlertTitle>
            <AlertDescription>{walletError}</AlertDescription>
          </Alert>
        )}

        {statsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('Stats Error')}</AlertTitle>
            <AlertDescription>{statsError}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 35, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-4 md:mb-6"
        >
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />{t('Unread Messages')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {isStatsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold text-accent">{stats.unreadMessages}</div>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{t('New conversations')}</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />{t('Upcoming Bookings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {isStatsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold text-secondary">{stats.upcomingBookings}</div>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{t('Active reservations')}</p>
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
            <DialogTitle>{t('Become a')} {approvalType === 'vendor' ? t('Vendors') : t('Tutors')}</DialogTitle>
            <DialogDescription>
              {approvalType === 'vendor'
                ? t('Vendor description')
                : t('Tutor description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>{t('Cancel')}</Button>
            <Button onClick={handleRequestApproval} disabled={isApproving}>
              {isApproving ? t('Submitting') : t('Submit')} {approvalType === 'vendor' ? t('Vendor Request') : t('Tutor Request')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

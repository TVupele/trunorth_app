import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AdsBanner } from '@/components/AdsBanner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { useSocial } from '@/hooks/useSocial';
import api from '@/lib/api';
import { ROUTE_PATHS, formatCurrency } from '@/lib/index';
import {
  Users, Plane, GraduationCap, AlertTriangle, Heart,
  ShoppingBag, Calendar, Church, Bot, MessageSquare, TrendingUp,
  Store, BadgeCheck, Wallet, Send, Image as ImageIcon,
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
import { Textarea } from '@/components/ui/textarea';

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
  const { createPost: createSocialPost } = useSocial();
  const { toast } = useToast();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalType, setApprovalType] = useState<'vendor' | 'tutor'>('vendor');
  const [isApproving, setIsApproving] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

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
        title: t('Request Submitted'),
        description: t('Your {{type}} request has been submitted and is pending admin approval.', { type: approvalType }),
      });
      setShowApprovalDialog(false);
    } catch (error: any) {
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'string' ? errorData : t('An error occurred.');
      toast({
        title: t('Request Failed'),
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImage) {
      toast({ title: t('Error'), description: t('Please enter content or add an image'), variant: 'destructive' });
      return;
    }
    setIsCreatingPost(true);
    try {
      let imageUrl: string | undefined;
      if (postImage) {
        const formData = new FormData();
        formData.append('image', postImage);
        const response = await api.post('/posts/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = response.data.url;
      }
      // Use useSocial's createPost to ensure the post appears immediately in the feed
      await createSocialPost(postContent, imageUrl);
      toast({ title: t('Success'), description: t('Post created successfully!') });
      setShowPostDialog(false);
      setPostContent('');
      setPostImage(null);
      setPostImagePreview('');
    } catch (error: any) {
      toast({ title: t('Error'), description: String(error.response?.data?.error) || t('Failed to send money'), variant: 'destructive' });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const openPostDialog = () => {
    setShowPostDialog(true);
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
       title: t('Tutor Dashboard'),
       description: t('Manage your courses, bookings, and earnings'),
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

        {/* Create Post Section for all users */}
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
                  <Send className="h-8 w-8 text-primary" />
               <div>
                     <h3 className="font-semibold">{t('Share with the Community')}</h3>
                     <p className="text-sm text-muted-foreground">{t('Create a post to share updates')}</p>
                   </div>
                 </div>
                 <Button onClick={openPostDialog} variant="default" size="sm">
                   <Send className="h-4 w-4 mr-2" />{t('Create Post')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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

      {/* Create Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent>
       <DialogHeader>
         <DialogTitle>{t('Create Post')}</DialogTitle>
         <DialogDescription>{t('Share something with the community')}</DialogDescription>
       </DialogHeader>
          <div className="space-y-4 py-4">
             <Textarea
               placeholder={t("What's on your mind?")}
               value={postContent}
               onChange={(e) => setPostContent(e.target.value)}
               className="min-h-[100px] resize-none"
             />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                 <Button variant="outline" size="sm" type="button">
                   <ImageIcon className="h-4 w-4" />
                   <span className="ml-2">{t('Add Image')}</span>
                 </Button>
              </label>
              {postImagePreview && (
                <div className="relative w-12 h-12 rounded-md overflow-hidden">
                  <img src={postImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>{t('Cancel')}</Button>
            <Button onClick={handleCreatePost} disabled={!postContent.trim() || isCreatingPost}>
              {isCreatingPost ? t('Posting...') : t('Post')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

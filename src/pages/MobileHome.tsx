import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, X, User, Settings, Wallet, Users, Plane, GraduationCap, 
  AlertTriangle, Heart, ShoppingBag, Calendar, Church, Bot, 
  Bell, LogOut, ChevronRight, Plus, Send, Home, MessageSquare,
  TrendingUp, Store, BadgeCheck
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS, formatCurrency } from "@/lib/index";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import api from "@/lib/api";

interface MobileHomeProps {
  onNavigate?: (path: string) => void;
}

export default function MobileHome({ onNavigate }: MobileHomeProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const wallet = useWallet((state) => state.wallet);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const isWalletLoading = useWallet((state) => state.isLoading);
  
  const stats = useDashboardStats((state) => state.stats);
  const fetchStats = useDashboardStats((state) => state.fetchStats);
  const isStatsLoading = useDashboardStats((state) => state.isLoading);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchWalletData();
    fetchStats();
    
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const data = response.data;
        setNotificationCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setNotificationCount(0);
      }
    };
    fetchNotifications();
  }, [fetchWalletData, fetchStats]);

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? "NGN";

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  const isVendor = user?.role === 'vendor';
  const isTutor = user?.role === 'tutor';

  const services = [
    { icon: <Wallet className="w-5 h-5" />, title: "Wallet", subtitle: "Manage finances", href: ROUTE_PATHS.WALLET, color: "bg-primary" },
    { icon: <Users className="w-5 h-5" />, title: "Social", subtitle: "Connect & share", href: ROUTE_PATHS.SOCIAL, color: "bg-blue-500" },
    { icon: <Plane className="w-5 h-5" />, title: "Travel", subtitle: "Book trips", href: ROUTE_PATHS.TRAVEL, color: "bg-green-500" },
    { icon: <GraduationCap className="w-5 h-5" />, title: "Tutoring", subtitle: "Learn & teach", href: ROUTE_PATHS.TUTORING, color: "bg-purple-500" },
    { icon: <AlertTriangle className="w-5 h-5" />, title: "Emergency", subtitle: "Report issues", href: ROUTE_PATHS.EMERGENCY, color: "bg-red-500" },
    { icon: <Heart className="w-5 h-5" />, title: "Donations", subtitle: "Give support", href: ROUTE_PATHS.DONATIONS, color: "bg-pink-500" },
    { icon: <ShoppingBag className="w-5 h-5" />, title: "Marketplace", subtitle: "Shop products", href: ROUTE_PATHS.MARKETPLACE, color: "bg-orange-500" },
    { icon: <Calendar className="w-5 h-5" />, title: "Events", subtitle: "Book tickets", href: ROUTE_PATHS.EVENTS, color: "bg-teal-500" },
    { icon: <Church className="w-5 h-5" />, title: "Religious", subtitle: "Services", href: ROUTE_PATHS.RELIGIOUS_SERVICES, color: "bg-indigo-500" },
    { icon: <Bot className="w-5 h-5" />, title: "AI Helper", subtitle: "Get help", href: ROUTE_PATHS.AI_ASSISTANT, color: "bg-cyan-500" },
    ...(isVendor ? [{ icon: <Store className="w-5 h-5" />, title: "Vendor", subtitle: "Manage shop", href: ROUTE_PATHS.VENDOR_DASHBOARD, color: "bg-amber-500" }] : []),
    ...(isTutor ? [{ icon: <GraduationCap className="w-5 h-5" />, title: "Tutor", subtitle: "Dashboard", href: ROUTE_PATHS.TUTOR_DASHBOARD, color: "bg-violet-500" }] : []),
  ];

  const quickActions = [
    { icon: <Plus className="w-4 h-4" />, label: "Top Up", action: () => {} },
    { icon: <Send className="w-4 h-4" />, label: "Send", action: () => {} },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Messages", action: () => {} },
    { icon: <Calendar className="w-4 h-4" />, label: "Bookings", action: () => {} },
  ];

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: "Home", href: ROUTE_PATHS.HOME },
    { icon: <User className="w-5 h-5" />, label: "Profile", href: ROUTE_PATHS.PROFILE },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: ROUTE_PATHS.SETTINGS },
    { icon: <Wallet className="w-5 h-5" />, label: "Wallet", href: ROUTE_PATHS.WALLET },
    { icon: <Users className="w-5 h-5" />, label: "Social", href: ROUTE_PATHS.SOCIAL },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", href: "#" },
    { icon: <LogOut className="w-5 h-5" />, label: "Logout", action: handleLogout },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
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
                      <p className="font-semibold">{user?.fullName || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  {menuItems.map((item, index) => (
                    item.href ? (
                      <Link
                        key={index}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        key={index}
                        onClick={() => { item.action?.(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    )
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to={ROUTE_PATHS.HOME} className="flex items-center">
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary">
                <img src="/Logo_Icon.jpeg" alt="TruNORTH" className="h-full w-full object-contain" />
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
            <Link to={ROUTE_PATHS.PROFILE}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 px-6">
        {/* Welcome Section - Reduced Size */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-lg font-bold text-foreground">
            Welcome back, {user?.fullName ? user.fullName.split(' ')[0] : ''}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your all-in-one platform
          </p>
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4"
        >
          <Link to={ROUTE_PATHS.WALLET}>
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 shadow-lg">
              <p className="text-xs text-primary-foreground/80 mb-1">Wallet Balance</p>
              {isWalletLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-primary-foreground">
                  {formatCurrency(balance, currency)}
                </p>
              )}
              <div className="flex gap-3 mt-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.preventDefault(); action.action(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs text-primary-foreground"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Messages</span>
              </div>
              {isStatsLoading ? (
                <Skeleton className="h-6 w-8 mt-1" />
              ) : (
                <p className="text-xl font-bold text-accent">{stats.unreadMessages}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground">Bookings</span>
              </div>
              {isStatsLoading ? (
                <Skeleton className="h-6 w-8 mt-1" />
              ) : (
                <p className="text-xl font-bold text-secondary">{stats.upcomingBookings}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="mb-4">
          <h2 className="text-base font-semibold mb-3">Services</h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map((service, index) => (
              <Link key={index} to={service.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card rounded-xl p-4 border hover:border-primary/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg ${service.color} flex items-center justify-center text-white mb-2`}>
                    {service.icon}
                  </div>
                  <p className="font-medium text-sm">{service.title}</p>
                  <p className="text-xs text-muted-foreground">{service.subtitle}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links List */}
        <div className="mb-4">
          <h2 className="text-base font-semibold mb-3">Quick Access</h2>
          <div className="space-y-2">
            <Link to={ROUTE_PATHS.EMERGENCY} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Emergency Reporting</p>
                  <p className="text-xs text-muted-foreground">Report incidents quickly</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            
            <Link to={ROUTE_PATHS.ADMIN} className="flex items-center justify-between p-3 bg-card rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Admin Panel</p>
                  <p className="text-xs text-muted-foreground">Manage platform content</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Post Button FAB */}
      <Link to={ROUTE_PATHS.SOCIAL}>
        <Button
          size="lg"
          className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <Send className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
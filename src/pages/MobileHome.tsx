import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "@/components/Sidebar";
import { NewsFeed } from "@/components/NewsFeed";
import { AdsBanner } from "@/components/AdsBanner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import api from "@/lib/api";

interface MobileHomeProps {
  onNavigate?: (path: string) => void;
}

export default function MobileHome({ onNavigate }: MobileHomeProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <Link to={ROUTE_PATHS.MOBILE_HOME} className="h-8 w-auto">
              <img src="/Logo_Icon.jpeg" alt="TruNORTH" className="h-full w-auto object-contain" />
            </Link>
          </div>
          
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
            <Link to={ROUTE_PATHS.PROFILE}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                <AvatarFallback className="text-xs">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} mobile />

      {/* Main Content */}
      <div className="pt-14 px-3">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <h1 className="text-sm font-semibold text-foreground">
            {t('Welcome')}, {user?.fullName ? user.fullName.split(' ')[0] : ''}!
          </h1>
        </motion.div>

        {/* Ads Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-3"
        >
          <AdsBanner />
        </motion.div>

        {/* News Feed */}
        <div className="mb-2">
          <NewsFeed />
        </div>
      </div>

      {/* Post Button FAB */}
      <Link to={ROUTE_PATHS.SOCIAL}>
        <Button
          size="icon"
          className="fixed bottom-12 right-4 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
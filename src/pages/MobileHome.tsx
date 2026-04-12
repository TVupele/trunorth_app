import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, Send, Search, Home, Compass, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-background">
      {/* X-style Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left: Menu & Profile */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 hover:bg-muted"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to={ROUTE_PATHS.PROFILE}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                <AvatarFallback className="text-sm">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
          
          {/* Center: Logo */}
          <Link to={ROUTE_PATHS.MOBILE_HOME} className="absolute left-1/2 -translate-x-1/2">
            <img src="/Logo_Icon.jpeg" alt="TruNORTH" className="h-8 w-auto" />
          </Link>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search" 
              className="w-full bg-muted/50 border-none rounded-full pl-10 h-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} mobile />

      {/* Main Content - Full width like X */}
      <div className="pt-28">
        {/* Welcome Section */}
        <div className="px-3 pb-2 border-b border-border/50">
          <h1 className="text-xl font-bold text-foreground">
            {t('Home')}
          </h1>
        </div>

        {/* Ads Banner */}
        <div className="border-b border-border/50">
          <AdsBanner />
        </div>

        {/* News Feed - X style full width */}
        <NewsFeed />
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useSocial } from "@/hooks/useSocial";
import { AdsBanner } from "@/components/AdsBanner";
import { NewsFeed } from "@/components/NewsFeed";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { Home, Compass, Bell, AlertTriangle, Send } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { Sidebar } from "@/components/Sidebar";

export default function MobileHome() {
  const { t } = useTranslation();
  const { createPost, fetchPosts } = useSocial();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} mobile />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-20">
        {/* Page Title */}
        <div className="px-4 py-3 border-b border-border/50 lg:hidden">
          <h1 className="text-xl font-bold text-foreground">{t('Home')}</h1>
        </div>

        {/* Ads Banner */}
        <div className="border-b border-border/50">
          <AdsBanner />
        </div>

        {/* News Feed */}
        <div className="pb-24">
          <NewsFeed />
        </div>
      </main>

      {/* X-style bottom navigation */}
      <motion.nav
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 safe-area-bottom"
      >
        <div className="flex items-center justify-around h-14">
          {/* Home */}
          <NavLink
            to={ROUTE_PATHS.MOBILE_HOME}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <Home className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          {/* Explore */}
          <NavLink
            to={ROUTE_PATHS.EVENTS}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <Compass className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          {/* Post Button - Center */}
          <button 
            onClick={() => window.location.href = ROUTE_PATHS.SOCIAL}
            className="flex items-center justify-center -mt-4"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Send className="w-6 h-6 text-primary-foreground" />
            </div>
          </button>

          {/* Notifications */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <Bell className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          {/* Emergency - Red */}
          <NavLink
            to={ROUTE_PATHS.EMERGENCY}
            className="flex flex-col items-center justify-center w-14 h-full"
          >
            <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
            </div>
          </NavLink>
        </div>
      </motion.nav>
    </div>
  );
}
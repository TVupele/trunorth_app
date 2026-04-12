import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { 
  Home, Search, Bell, Mail, Plus, 
  Calendar, GraduationCap, AlertTriangle, Heart, Send,
  Compass
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { path: ROUTE_PATHS.MOBILE_HOME, label: "Home", icon: Home },
  { path: ROUTE_PATHS.EVENTS, label: "Explore", icon: Compass },
  { path: '/notifications', label: "Alerts", icon: Bell },
  { path: ROUTE_PATHS.SOCIAL, label: "Messages", icon: Mail },
];

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isSocialPage = location.pathname === ROUTE_PATHS.SOCIAL;

  useEffect(() => {
    if (isMobile) {
      if (location.pathname === ROUTE_PATHS.HOME) {
        navigate(ROUTE_PATHS.MOBILE_HOME, { replace: true });
      } else if (location.pathname === ROUTE_PATHS.WALLET) {
        navigate(ROUTE_PATHS.MOBILE_WALLET, { replace: true });
      } else if (location.pathname === ROUTE_PATHS.ADMIN || location.pathname === '/admin') {
        navigate(ROUTE_PATHS.MOBILE_ADMIN, { replace: true });
      }
    }
  }, [isMobile, location.pathname, navigate]);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  if (isMobile) {
    return (
      <MobileLayout>
        {children}
      </MobileLayout>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <TopBar onMenuToggle={handleMenuToggle} />
      
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      
      <div className="lg:ml-[250px] pt-16 md:pt-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-y-auto">
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
        <Footer />
      </div>

      {!isSocialPage && (
        <a
          href={ROUTE_PATHS.SOCIAL}
          className="fixed bottom-20 right-6 z-50 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors lg:bottom-6"
        >
          <Plus className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}

function MobileLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} mobile />

      <main className="flex-1 overflow-y-auto pt-20">
        {children}
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

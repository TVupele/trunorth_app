import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Plus, Home, Wallet, Users, Calendar, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { path: ROUTE_PATHS.MOBILE_HOME, label: "Home", icon: Home },
  { path: ROUTE_PATHS.EVENTS, label: "Events", icon: Calendar },
  { path: 'post', label: "Post", icon: Plus, isAction: true },
  { path: ROUTE_PATHS.MOBILE_WALLET, label: "Wallet", icon: Wallet },
  { path: ROUTE_PATHS.EMERGENCY, label: "Emergency", icon: AlertTriangle, isEmergency: true },
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
  const [showPostModal, setShowPostModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 px-4 pt-20 pb-20 overflow-y-auto">
        {children}
      </main>

      <motion.nav
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 z-40 safe-area-bottom"
      >
        <div className="flex items-center justify-around py-2 px-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            if (item.isAction) {
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className="flex flex-col items-center justify-center w-14 h-12 -mt-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </NavLink>
              );
            }
            if (item.isEmergency) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center w-14 h-12"
                >
                  <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
                    <Icon className="w-5 h-5 text-destructive-foreground" />
                  </div>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-14 h-12 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                    <span className={`text-xs mt-1 ${isActive ? "text-primary font-medium" : ""}`}>
                      {t(item.label)}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </motion.nav>

      <AnimatePresence>
        {showPostModal && (
          <MobilePostModal onClose={() => setShowPostModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MobilePostModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl p-4 pb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-sm text-muted-foreground">
            {t('Cancel')}
          </button>
          <h3 className="font-semibold">{t('Create Post')}</h3>
          <button className="text-sm text-primary font-medium">
            {t('Post')}
          </button>
        </div>
        <div className="space-y-4">
          <textarea
            placeholder="What's happening in your community?"
            className="w-full h-32 p-3 bg-muted rounded-xl resize-none text-sm"
          />
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-sm text-muted-foreground">
              {t('Add Media')}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

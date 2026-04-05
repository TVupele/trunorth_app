import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Plus, Home, Wallet, Users, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { path: ROUTE_PATHS.HOME, label: "Home", icon: Home },
  { path: ROUTE_PATHS.SOCIAL, label: "Feed", icon: Users },
  { path: "post", label: "Post", icon: Plus, isAction: true },
  { path: ROUTE_PATHS.EVENTS, label: "Events", icon: Calendar },
  { path: ROUTE_PATHS.WALLET, label: "Wallet", icon: Wallet },
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const isSocialPage = location.pathname === ROUTE_PATHS.SOCIAL;

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
      
      <div className="lg:ml-[250px] pt-16 h-[calc(100vh-4rem)] overflow-y-auto">
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
  const [showPostModal, setShowPostModal] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.header
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50"
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">TruNORTH</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Nigeria</span>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 pb-20 overflow-y-auto">
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
                <button
                  key={item.label}
                  onClick={() => setShowPostModal(true)}
                  className="flex flex-col items-center justify-center w-14 h-12 -mt-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </button>
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
                      {item.label}
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
            Cancel
          </button>
          <h3 className="font-semibold">Create Post</h3>
          <button className="text-sm text-primary font-medium">
            Post
          </button>
        </div>
        <div className="space-y-4">
          <textarea
            placeholder="What's happening in your community?"
            className="w-full h-32 p-3 bg-muted rounded-xl resize-none text-sm"
          />
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-sm text-muted-foreground">
              Add Media
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

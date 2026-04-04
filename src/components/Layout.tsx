import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isSocialPage = location.pathname === ROUTE_PATHS.SOCIAL;

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

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

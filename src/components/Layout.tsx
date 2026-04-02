import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </div>
  );
}

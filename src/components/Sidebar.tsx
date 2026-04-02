import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Wallet,
  Users,
  Plane,
  GraduationCap,
  AlertTriangle,
  Heart,
  ShoppingBag,
  Calendar,
  Church,
  Bot,
  User,
  Settings,
  X,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { path: ROUTE_PATHS.HOME, label: 'Home', icon: Home },
  { path: ROUTE_PATHS.WALLET, label: 'Wallet', icon: Wallet },
  { path: ROUTE_PATHS.SOCIAL, label: 'Social', icon: Users },
  { path: ROUTE_PATHS.TRAVEL, label: 'Travel', icon: Plane },
  { path: ROUTE_PATHS.TUTORING, label: 'Tutoring', icon: GraduationCap },
  { path: ROUTE_PATHS.EMERGENCY, label: 'Emergency', icon: AlertTriangle },
  { path: ROUTE_PATHS.DONATIONS, label: 'Donations', icon: Heart },
  { path: ROUTE_PATHS.MARKETPLACE, label: 'Marketplace', icon: ShoppingBag },
  { path: ROUTE_PATHS.EVENTS, label: 'Events', icon: Calendar },
  { path: ROUTE_PATHS.RELIGIOUS_SERVICES, label: 'Religious Services', icon: Church },
  { path: ROUTE_PATHS.AI_ASSISTANT, label: 'AI Assistant', icon: Bot },
  { path: ROUTE_PATHS.PROFILE, label: 'Profile', icon: User },
  { path: ROUTE_PATHS.SETTINGS, label: 'Settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const balance = useWallet((state) => state.balance);
  const currency = useWallet((state) => state.currency);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <img src="/Logo_Icon.jpeg" alt="Trunorth Logo" className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Trunorth</h1>
            <p className="text-xs text-muted-foreground">Super App</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="mx-4 mb-4 rounded-xl bg-gradient-to-br from-primary to-primary/80 p-4 shadow-lg">
        <p className="text-xs font-medium text-primary-foreground/80">Wallet Balance</p>
        <p className="mt-1 font-mono text-2xl font-bold text-primary-foreground">
          {formatCurrency(balance, currency)}
        </p>
      </div>

      <Separator className="mx-4" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 ${
                    isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground'
                  }`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 Trunorth. All rights reserved.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-[250px] border-r border-sidebar-border lg:block z-30 overflow-y-auto">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-sidebar-border lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
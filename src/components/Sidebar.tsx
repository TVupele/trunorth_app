import { useTranslation } from 'react-i18next';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mobile?: boolean;
}

const navigationItems = [
  { path: ROUTE_PATHS.HOME, label: 'Home', icon: Home },
  { path: ROUTE_PATHS.WALLET, label: 'Wallet', icon: Wallet },
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

export function Sidebar({ isOpen, onClose, mobile = false }: SidebarProps) {
  const { t } = useTranslation();

  const sidebarContent = (
    <div className={`flex h-full flex-col bg-sidebar ${mobile ? 'pt-2' : ''}`}>
      {mobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <Separator className="mx-4" />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4 w-4 ${
                    isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground'
                  }`} />
                  <span>{t(item.label)}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!mobile && (
        <div className="border-t border-sidebar-border p-3">
          <p className="text-center text-[10px] text-muted-foreground">
            © 2026 Trunorth. All rights reserved.
          </p>
        </div>
      )}
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
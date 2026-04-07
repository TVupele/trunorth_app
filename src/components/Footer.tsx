import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import { Home } from 'lucide-react';

const footerNavItems = [
  { path: ROUTE_PATHS.HOME, icon: <Home className="h-6 w-6" />, label: 'Home' },
  { path: ROUTE_PATHS.WALLET, icon: '/wallet_icon.jpeg', label: 'Wallet' },
  { path: ROUTE_PATHS.SOCIAL, icon: '/social_icon.jpeg', label: 'Social' },
  { path: ROUTE_PATHS.TRAVEL, icon: '/travel_icon.jpeg', label: 'Travel' },
  { path: ROUTE_PATHS.TUTORING, icon: '/tutor_icon.jpeg', label: 'Tutoring' },
  { path: ROUTE_PATHS.EMERGENCY, icon: '/emergency_report_icon.jpeg', label: 'Emergency' },
  { path: ROUTE_PATHS.DONATIONS, icon: '/donation_icon.jpeg', label: 'Donations' },
  { path: ROUTE_PATHS.MARKETPLACE, icon: '/cart_icon.jpeg', label: 'Marketplace' },
];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm lg:hidden">
      <nav className="grid grid-cols-4 items-center justify-items-center gap-y-1 py-2">
        {footerNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {typeof item.icon === 'string' ? (
              <img src={item.icon} alt={item.label} className="h-6 w-6" />
            ) : (
              item.icon
            )}
            <span>{t(item.label)}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}

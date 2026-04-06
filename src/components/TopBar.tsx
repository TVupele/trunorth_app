import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Wallet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS, formatCurrency, formatDate } from '@/lib/index';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from './LanguageSwitcher';
import api from '@/lib/api';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const balance = useWallet((state) => state.balance);
  const currency = useWallet((state) => state.currency);
  const transactions = useWallet((state) => state.transactions);
  const recentTransactions = transactions.slice(0, 5);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const data = response.data;
        setNotifications(Array.isArray(data) ? data : []);
        setNotificationCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setNotifications([]);
        setNotificationCount(0);
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, []);
  
  // Destructure the user and logout function directly from your new Zustand store
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Call the Zustand logout function (clears tokens and state)
    logout();
    
    // Redirect the user to the login screen
    navigate(ROUTE_PATHS.LOGIN || '/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="h-full flex items-center justify-between px-2 md:px-6">
        <div className="flex items-center gap-1 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Link to={ROUTE_PATHS.HOME} className="flex items-center">
            <img src="/Logo_Icon.jpeg" alt="Trunorth Logo" className="h-12 md:h-16 w-auto object-contain scale-125 origin-left" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  {/* Assuming your backend might eventually send an avatar property, otherwise it falls back */}
                  <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                  <AvatarFallback>{user?.fullName?.charAt(0) || <User className="h-4 w-4"/>}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block font-medium">{user?.fullName?.split(' ')[0] || 'User'}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.fullName || 'My Account'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={ROUTE_PATHS.PROFILE} className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={ROUTE_PATHS.SETTINGS} className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
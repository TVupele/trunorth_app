import { useState } from 'react';
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

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const balance = useWallet((state) => state.balance);
  const currency = useWallet((state) => state.currency);
  const transactions = useWallet((state) => state.transactions);
  const recentTransactions = transactions.slice(0, 5);
  const [notificationCount] = useState(3);
  
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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="hidden sm:inline-block font-bold text-lg">Trunorth</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 font-mono hover:bg-accent/10 transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">{formatCurrency(balance, currency)}</span>
                <span className="sm:hidden">{formatCurrency(balance, currency).replace(/\s/g, '')}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Wallet Balance</h4>
                  <p className="text-2xl font-bold font-mono">{formatCurrency(balance, currency)}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Recent Transactions</h4>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {recentTransactions.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {txn.type === 'send' && txn.recipient}
                              {txn.type === 'receive' && txn.sender}
                              {txn.type === 'top-up' && 'Top-up'}
                              {txn.type === 'payment' && txn.recipient}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(txn.timestamp)}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p
                              className={`text-sm font-mono font-semibold ${
                                txn.type === 'receive' || txn.type === 'top-up'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {txn.type === 'receive' || txn.type === 'top-up' ? '+' : '-'}
                              {formatCurrency(txn.amount, txn.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No recent transactions</p>
                  )}
                </div>

                <Link to={ROUTE_PATHS.WALLET}>
                  <Button className="w-full" size="sm">
                    View All Transactions
                  </Button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>

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
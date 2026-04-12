import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, Bell, Send, Search, Home, Compass, AlertTriangle, ArrowUpRight, ArrowDownLeft, Plus, Wallet as WalletIcon } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, ROUTE_PATHS } from '@/lib/index';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import type { Transaction } from '@/lib/index';

export default function MobileWallet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const balance = useWallet((state) => state.balance);
  const currency = useWallet((state) => state.currency);
  const transactions = useWallet((state) => state.transactions);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const { toast } = useToast();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const data = response.data;
        setNotificationCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setNotificationCount(0);
      }
    };
    fetchNotifications();
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = searchQuery === '' ||
      txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.sender?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).slice(0, 10);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Enter a valid amount.', variant: 'destructive' });
      return;
    }
    try {
      await api.post('/payments/bank-transfer', { amount });
      toast({ title: 'Top-up Successful', description: `${formatCurrency(amount, currency)} added via bank transfer` });
      setShowTopUpDialog(false);
      setTopUpAmount('');
      fetchWalletData();
    } catch (err: any) {
      toast({ title: 'Transfer Error', description: err.response?.data?.error || 'Transfer failed', variant: 'destructive' });
    }
  };

  const handleSendMoney = async () => {
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0 || !recipient) return;
    try {
      await api.post('/wallet/send', { recipient, amount, description: 'Mobile transfer' });
      toast({ title: 'Money Sent', description: `${formatCurrency(amount, currency)} sent to ${recipient}` });
      setShowSendDialog(false);
      setSendAmount('');
      setRecipient('');
      fetchWalletData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to send money', variant: 'destructive' });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'top-up': return <Plus className="w-4 h-4 text-primary" />;
      default: return <WalletIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'send':
      case 'payment': return 'text-red-500';
      case 'receive':
      case 'top-up': return 'text-green-500';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        {/* Top Row */}
        <div className="flex items-center justify-between px-4 py-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 hover:bg-muted"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to={ROUTE_PATHS.MOBILE_HOME}>
            <img src="/Logo_Icon.jpeg" alt="TruNORTH" className="h-8 w-auto" />
          </Link>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
            <Link to={ROUTE_PATHS.PROFILE}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                <AvatarFallback className="text-sm">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
        
        {/* Search Row */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search transactions" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border-none rounded-full pl-10 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} mobile />

      {/* Main Content */}
      <div className="pt-24 pb-20">
        {/* Wallet Balance Card */}
        <div className="px-4 pb-2 border-b border-border/50">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-4">
              <p className="text-xs opacity-80">Total Balance</p>
              <p className="text-2xl font-bold font-mono">{formatCurrency(balance, currency)}</p>
              <div className="flex gap-2 mt-3">
                <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-white text-primary hover:bg-white/90 h-9 text-sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Top Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Top Up Wallet</DialogTitle>
                      <DialogDescription>Add funds to your wallet</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        {[5000, 10000, 25000].map((amount) => (
                          <Button key={amount} variant="outline" size="sm" onClick={() => setTopUpAmount(amount.toString())}>
                            {formatCurrency(amount, currency)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>Cancel</Button>
                      <Button onClick={handleTopUp}>Top Up</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="flex-1 h-9 text-sm">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Money</DialogTitle>
                      <DialogDescription>Transfer to another user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Input placeholder="Recipient Email" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Input type="number" placeholder="Amount" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
                      <Button onClick={handleSendMoney}>Send</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
          <div className="space-y-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No transactions yet
              </div>
            ) : (
              filteredTransactions.map((txn) => (
                <div 
                  key={txn.id} 
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getTransactionIcon(txn.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{txn.description || txn.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {txn.timestamp && !isNaN(Date.parse(txn.timestamp)) 
                          ? new Date(txn.timestamp).toLocaleDateString() 
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-mono font-semibold text-sm ${getAmountColor(txn.type)}`}>
                      {txn.type === 'send' || txn.type === 'payment' ? '-' : '+'}
                      {formatCurrency(txn.amount, txn.currency)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
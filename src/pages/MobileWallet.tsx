import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Plus, Search, CreditCard, Building, Wallet as WalletIcon, Menu } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/index';
import api from '@/lib/api';
import type { Transaction } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

export default function MobileWallet() {
  const navigate = useNavigate();
  const { user, logout } = useAuthHook();
  const balance = useWallet((state) => state.balance);
  const currency = useWallet((state) => state.currency);
  const transactions = useWallet((state) => state.transactions);
  const isLoading = useWallet((state) => state.isLoading);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Transaction['type'] | 'all'>('all');
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [sendMoneyDialogOpen, setSendMoneyDialogOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const filteredTransactions = transactions.filter((txn) => {
    const matchesFilter = activeFilter === 'all' || txn.type === activeFilter;
    const matchesSearch = searchQuery === '' ||
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.sender?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSendMoney = async () => {
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0 || !recipient) return;
    try {
      await api.post('/wallet/send', { recipient, amount, description });
      toast({ title: 'Money Sent', description: `${formatCurrency(amount, currency)} sent to ${recipient}` });
      setSendAmount('');
      setRecipient('');
      setDescription('');
      setSendMoneyDialogOpen(false);
      fetchWalletData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to send money', variant: 'destructive' });
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Enter a valid amount.', variant: 'destructive' });
      return;
    }
    try {
      await api.post('/payments/bank-transfer', { amount });
      toast({ title: 'Top-up Successful', description: `${formatCurrency(amount, currency)} added via bank transfer` });
      setTopUpDialogOpen(false);
      setTopUpAmount('');
      fetchWalletData();
    } catch (err: any) {
      toast({ title: 'Transfer Error', description: err.response?.data?.error || 'Transfer failed', variant: 'destructive' });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'top-up': return <Plus className="w-4 h-4 text-primary" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-accent" />;
      default: return <CreditCard className="w-4 h-4 text-muted-foreground" />;
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

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'send':
      case 'payment': return '-';
      case 'receive':
      case 'top-up': return '+';
      default: return '';
    }
  };

  const getTransactionLabel = (txn: Transaction) => {
    if (txn.type === 'send' && txn.recipient) return `To: ${txn.recipient}`;
    if (txn.type === 'receive' && txn.sender) return `From: ${txn.sender}`;
    return txn.description || txn.type;
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  const menuItems = [
    { icon: "🏠", label: "Home", href: ROUTE_PATHS.HOME },
    { icon: "👤", label: "Profile", href: ROUTE_PATHS.PROFILE },
    { icon: "⚙️", label: "Settings", href: ROUTE_PATHS.SETTINGS },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground p-4 pt-16 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user?.fullName || 'User'}</p>
                    <p className="text-sm text-muted-foreground opacity-80">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-destructive"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 text-center px-4">
            <p className="text-sm opacity-80">Total Balance</p>
            <p className="text-2xl font-bold font-mono">{formatCurrency(balance, currency)}</p>
          </div>
          
          <Link to={ROUTE_PATHS.PROFILE}>
            <Avatar className="h-10 w-10 border-2 border-white/30">
              <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
              <AvatarFallback className="bg-white/20 text-primary-foreground">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold">
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
                  <Label>Amount ({currency})</Label>
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
                <Button variant="outline" onClick={() => setTopUpDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleTopUp}>Top Up</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={sendMoneyDialogOpen} onOpenChange={setSendMoneyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold">
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
                  <Label>Recipient Email</Label>
                  <Input placeholder="Enter email" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Amount ({currency})</Label>
                  <Input type="number" placeholder="Enter amount" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendMoneyDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendMoney}>Send</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Transaction History</h2>
        
        {/* Search and Filter */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search transactions..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as Transaction['type'] | 'all')} className="mb-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="send">Sent</TabsTrigger>
            <TabsTrigger value="receive">Received</TabsTrigger>
            <TabsTrigger value="top-up">Top-up</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Transaction List - Simple list without cards */}
        <div className="space-y-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((txn) => (
              <div 
                key={txn.id} 
                className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/30 px-2 -mx-2 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(txn.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{getTransactionLabel(txn)}</p>
                    <p className="text-xs text-muted-foreground">
                      {txn.timestamp && !isNaN(Date.parse(txn.timestamp)) 
                        ? new Date(txn.timestamp).toLocaleDateString() 
                        : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-mono font-semibold text-sm ${getAmountColor(txn.type)}`}>
                    {getAmountPrefix(txn.type)}{formatCurrency(txn.amount, txn.currency)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
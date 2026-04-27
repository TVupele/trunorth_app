import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { Home, Compass, Bell, AlertTriangle, ArrowUpRight, ArrowDownLeft, Plus, Wallet as WalletIcon } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';

export default function MobileWallet() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const balance = useWallet((state) => state.balance);
  const currency = useWallet((state) => state.currency);
  const transactions = useWallet((state) => state.transactions);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const { toast } = useToast();

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
      {/* Page Title */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t('Wallet')}</h1>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatarUrl} alt={user?.fullName || ''} />
          <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm opacity-80">{t('Total Balance')}</p>
              <p className="text-3xl font-bold">{formatCurrency(balance, currency)}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={() => setShowTopUpDialog(true)}>
                {t('Add Funds')}
              </Button>
              <Button variant="outline" size="sm" className="bg-background/10 border-white/20 hover:bg-background/20" onClick={() => setShowSendDialog(true)}>
                {t('Send')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h2 className="font-semibold">{t('Recent Transactions')}</h2>
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No transactions yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.slice(0, 5).map((txn) => (
                <Card key={txn.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getTransactionIcon(txn.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{txn.type}</p>
                        <p className="text-xs text-muted-foreground">{txn.description}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${getAmountColor(txn.type)}`}>
                      {txn.type === 'send' || txn.type === 'payment' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Up Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('Add Funds')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>Cancel</Button>
            <Button onClick={handleTopUp}>{t('Add Funds')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Money Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('Send Money')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Recipient (email or ID)" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <Input type="number" placeholder="Amount" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button onClick={handleSendMoney}>{t('Send')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

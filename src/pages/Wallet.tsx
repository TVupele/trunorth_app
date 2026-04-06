import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Plus, Search, TrendingUp, CreditCard, Building, Wallet as WalletIcon } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { TransactionListItem } from '@/components/TransactionListItem';
import { formatCurrency } from '@/lib/index';
import api from '@/lib/api';
import type { Transaction } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Wallet() {
  const balance = useWallet((state) => state.balance);
  const currency = useWallet((state) => state.currency);
  const transactions = useWallet((state) => state.transactions);
  const monthlySpending = useWallet((state) => state.monthlySpending);
  const isLoading = useWallet((state) => state.isLoading);
  const error = useWallet((state) => state.error);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const clearError = useWallet((state) => state.clearError);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Transaction['type'] | 'all'>('all');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [sendMoneyDialogOpen, setSendMoneyDialogOpen] = useState(false);
  const [requestMoneyDialogOpen, setRequestMoneyDialogOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestRecipient, setRequestRecipient] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('paystack');
  const [bankTransferRef, setBankTransferRef] = useState('');
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [paypalProcessing, setPaypalProcessing] = useState(false);
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

  const handleRequestMoney = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0 || !requestRecipient) {
      toast({ title: 'Invalid Request', description: 'Select a recipient and enter a valid amount.', variant: 'destructive' });
      return;
    }
    try {
      await api.post('/wallet/request', { recipient: requestRecipient, amount, description: requestDescription });
      toast({ title: 'Request Sent', description: `Request for ${formatCurrency(amount, currency)} sent to ${requestRecipient}` });
      setRequestAmount('');
      setRequestRecipient('');
      setRequestDescription('');
      setRequestMoneyDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to send request', variant: 'destructive' });
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Enter a valid amount.', variant: 'destructive' });
      return;
    }

    if (paymentMethod === 'paystack') {
      // Paystack handles its own flow via the component
      return;
    }

    if (paymentMethod === 'stripe') {
      setStripeProcessing(true);
      try {
        const intentRes = await api.post('/payments/stripe/create-intent', { amount, currency: 'ngn' });
        // In production, this would open Stripe Elements or Checkout
        // For now, confirm the payment on the backend
        await api.post('/payments/stripe/confirm', {
          paymentIntentId: intentRes.data.clientSecret,
          amount,
        });
        toast({ title: 'Top-up Successful', description: `${formatCurrency(amount, currency)} added via Stripe` });
        setTopUpDialogOpen(false);
        setTopUpAmount('');
        fetchWalletData();
      } catch (err: any) {
        toast({ title: 'Stripe Error', description: err.response?.data?.error || 'Payment failed', variant: 'destructive' });
      } finally {
        setStripeProcessing(false);
      }
      return;
    }

    if (paymentMethod === 'paypal') {
      setPaypalProcessing(true);
      try {
        const orderRes = await api.post('/payments/paypal/create-order', { amount, currency: 'NGN' });
        // In production, this would redirect to PayPal for approval
        // For now, capture immediately
        await api.post('/payments/paypal/capture', {
          orderId: orderRes.data.orderId,
          amount,
        });
        toast({ title: 'Top-up Successful', description: `${formatCurrency(amount, currency)} added via PayPal` });
        setTopUpDialogOpen(false);
        setTopUpAmount('');
        fetchWalletData();
      } catch (err: any) {
        toast({ title: 'PayPal Error', description: err.response?.data?.error || 'Payment failed', variant: 'destructive' });
      } finally {
        setPaypalProcessing(false);
      }
      return;
    }

    if (paymentMethod === 'bank_transfer') {
      try {
        await api.post('/payments/bank-transfer', { amount, reference: bankTransferRef });
        toast({ title: 'Top-up Successful', description: `${formatCurrency(amount, currency)} added via bank transfer` });
        setTopUpDialogOpen(false);
        setTopUpAmount('');
        setBankTransferRef('');
        fetchWalletData();
      } catch (err: any) {
        toast({ title: 'Transfer Error', description: err.response?.data?.error || 'Transfer failed', variant: 'destructive' });
      }
      return;
    }

    if (paymentMethod === 'card_topup') {
      setStripeProcessing(true);
      try {
        const intentRes = await api.post('/payments/stripe/create-intent', { amount, currency: 'ngn' });
        await api.post('/payments/stripe/confirm', {
          paymentIntentId: intentRes.data.clientSecret,
          amount,
        });
        toast({ title: 'Top-up Successful', description: `${formatCurrency(amount, currency)} added via card` });
        setTopUpDialogOpen(false);
        setTopUpAmount('');
        fetchWalletData();
      } catch (err: any) {
        toast({ title: 'Card Error', description: err.response?.data?.error || 'Card payment failed', variant: 'destructive' });
      } finally {
        setStripeProcessing(false);
      }
      return;
    }
  };

  return (
    <div className="bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-6 md:space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Wallet</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Manage your finances and transactions</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium opacity-90">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="font-mono text-3xl md:text-5xl font-bold tracking-tight">
                {formatCurrency(balance, currency)}
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Top Up Dialog */}
                <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-1 flex-1">
                      <Plus className="h-3 w-3" />
                      Top Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Top Up Wallet</DialogTitle>
                      <DialogDescription>Add funds to your wallet balance</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="topup-amount">Amount ({currency})</Label>
                        <Input
                          id="topup-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        {[5000, 10000, 25000, 50000].map((amount) => (
                          <Button key={amount} variant="outline" size="sm" onClick={() => setTopUpAmount(amount.toString())}>
                            {formatCurrency(amount, currency)}
                          </Button>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={paymentMethod === 'paystack' ? 'default' : 'outline'}
                            className="justify-start gap-2 h-auto py-3"
                            onClick={() => setPaymentMethod('paystack')}
                          >
                            <CreditCard className="h-4 w-4" />
                            <div className="text-left">
                              <div className="text-sm font-medium">Paystack</div>
                              <div className="text-xs text-muted-foreground">Cards & Bank</div>
                            </div>
                          </Button>
                          <Button
                            variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                            className="justify-start gap-2 h-auto py-3"
                            onClick={() => setPaymentMethod('stripe')}
                          >
                            <CreditCard className="h-4 w-4" />
                            <div className="text-left">
                              <div className="text-sm font-medium">Stripe</div>
                              <div className="text-xs text-muted-foreground">Int'l Cards</div>
                            </div>
                          </Button>
                          <Button
                            variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                            className="justify-start gap-2 h-auto py-3"
                            onClick={() => setPaymentMethod('paypal')}
                          >
                            <WalletIcon className="h-4 w-4" />
                            <div className="text-left">
                              <div className="text-sm font-medium">PayPal</div>
                              <div className="text-xs text-muted-foreground">Global</div>
                            </div>
                          </Button>
                          <Button
                            variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                            className="justify-start gap-2 h-auto py-3"
                            onClick={() => setPaymentMethod('bank_transfer')}
                          >
                            <Building className="h-4 w-4" />
                            <div className="text-left">
                              <div className="text-sm font-medium">Bank Transfer</div>
                              <div className="text-xs text-muted-foreground">Direct</div>
                            </div>
                          </Button>
                          <Button
                            variant={paymentMethod === 'card_topup' ? 'default' : 'outline'}
                            className="justify-start gap-2 h-auto py-3 col-span-2"
                            onClick={() => setPaymentMethod('card_topup')}
                          >
                            <CreditCard className="h-4 w-4" />
                            <div className="text-left">
                              <div className="text-sm font-medium">Card Top-up</div>
                              <div className="text-xs text-muted-foreground">Debit/Credit Card</div>
                            </div>
                          </Button>
                        </div>

                        {paymentMethod === 'bank_transfer' && (
                          <div className="space-y-2">
                            <Label htmlFor="transfer-ref">Transfer Reference (Optional)</Label>
                            <Input
                              id="transfer-ref"
                              placeholder="Enter bank transfer reference"
                              value={bankTransferRef}
                              onChange={(e) => setBankTransferRef(e.target.value)}
                            />
                            <div className="rounded-lg bg-muted p-3 text-sm">
                              <p className="font-medium mb-1">Bank Details:</p>
                              <p>Bank: First Bank of Nigeria</p>
                              <p>Account: 2034567890</p>
                              <p>Name: TruNorth Super App Ltd</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTopUpDialogOpen(false)}>Cancel</Button>
                      <Button
                        onClick={handleTopUp}
                        disabled={!topUpAmount || parseFloat(topUpAmount) <= 0 || stripeProcessing || paypalProcessing}
                      >
                        {stripeProcessing || paypalProcessing ? 'Processing...' : `Top Up ${topUpAmount ? formatCurrency(parseFloat(topUpAmount), currency) : ''}`}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Send Money Dialog */}
                <Dialog open={sendMoneyDialogOpen} onOpenChange={setSendMoneyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-1 flex-1">
                      <ArrowUpRight className="h-3 w-3" />
                      Send
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Money</DialogTitle>
                      <DialogDescription>Transfer funds to another user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Email</Label>
                        <Input id="recipient" placeholder="Enter recipient email" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="send-amount">Amount ({currency})</Label>
                        <Input id="send-amount" type="number" placeholder="Enter amount" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" placeholder="What's this for?" value={description} onChange={(e) => setDescription(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSendMoneyDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSendMoney} disabled={isLoading}>{isLoading ? 'Processing...' : 'Send Money'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Request Money Dialog */}
                <Dialog open={requestMoneyDialogOpen} onOpenChange={setRequestMoneyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-1 flex-1">
                      <ArrowDownLeft className="h-3 w-3" />
                      Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Money</DialogTitle>
                      <DialogDescription>Request money from another user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="request-recipient">From (Email)</Label>
                        <Input id="request-recipient" placeholder="Enter user email" value={requestRecipient} onChange={(e) => setRequestRecipient(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="request-amount">Amount ({currency})</Label>
                        <Input id="request-amount" type="number" placeholder="Enter amount" value={requestAmount} onChange={(e) => setRequestAmount(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="request-description">Description (Optional)</Label>
                        <Input id="request-description" placeholder="What's this for?" value={requestDescription} onChange={(e) => setRequestDescription(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRequestMoneyDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleRequestMoney} disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Request'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and filter your recent transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as Transaction['type'] | 'all')}>
                  <TabsList className="inline-flex w-max min-w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="send" className="flex-1">Sent</TabsTrigger>
                    <TabsTrigger value="receive" className="flex-1">Received</TabsTrigger>
                    <TabsTrigger value="top-up" className="flex-1">Top-up</TabsTrigger>
                    <TabsTrigger value="payment" className="flex-1">Payment</TabsTrigger>
                    <TabsTrigger value="request" className="flex-1">Request</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <ul className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No transactions found</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TransactionListItem key={transaction.id} transaction={transaction} />
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Spending
              </CardTitle>
              <CardDescription>Your spending trend over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value, currency)}
                  />
                  <Bar dataKey="spending" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

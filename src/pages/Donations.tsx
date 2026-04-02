import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Heart, TrendingUp } from 'lucide-react';
import { CampaignCard } from '@/components/CampaignCard';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/api';
import type { Campaign } from '@/lib/index';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const categories = ['all', 'education', 'health', 'disaster relief', 'community', 'religious'];
const presetAmounts = [1000, 5000, 10000, 25000, 50000];

interface DonationHistory {
  id: string;
  campaignTitle: string;
  amount: number;
  currency: string;
  date: string;
  anonymous: boolean;
  receiptId: string;
}

export default function Donations() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);

  const balance = useWallet((state) => state.balance);
  const isLoading = useWallet((state) => state.isLoading);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, historyRes] = await Promise.all([
          api.get('/campaigns'),
          api.get('/campaigns/history').catch(() => ({ data: [] })),
        ]);
        setCampaigns(campaignsRes.data);
        setDonationHistory(historyRes.data);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        toast({ title: 'Error', description: 'Failed to load campaigns.', variant: 'destructive' });
      } finally {
        setIsLoadingCampaigns(false);
      }
    };
    fetchData();
  }, [toast]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || campaign.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredCampaigns = campaigns.slice(0, 2);

  const handleDonate = async () => {
    if (!selectedCampaign) return;
    const amount = donationAmount || (customAmount ? parseFloat(customAmount) : 0);
    if (!amount || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid donation amount.', variant: 'destructive' });
      return;
    }
    if (amount > balance) {
      toast({ title: 'Insufficient Balance', description: 'Your wallet balance is insufficient.', variant: 'destructive' });
      return;
    }
    try {
      await api.post('/campaigns/donate', {
        campaign_id: selectedCampaign.id,
        amount,
        is_anonymous: isAnonymous,
      });
      const newDonation: DonationHistory = {
        id: `donation-${Date.now()}`,
        campaignTitle: selectedCampaign.title,
        amount,
        currency: 'NGN',
        date: new Date().toISOString(),
        anonymous: isAnonymous,
        receiptId: `RCP-2026-${String(donationHistory.length + 1).padStart(3, '0')}`,
      };
      setDonationHistory([newDonation, ...donationHistory]);
      setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, raised: c.raised + amount, donors: c.donors + 1 } : c));
      toast({ title: 'Donation Successful', description: `Thank you for donating ${formatCurrency(amount)}!` });
      setSelectedCampaign(null);
      setDonationAmount(null);
      setCustomAmount('');
      setIsAnonymous(false);
    } catch (error: any) {
      toast({ title: 'Donation Failed', description: error.response?.data?.error || 'An error occurred.', variant: 'destructive' });
    }
  };

  const totalDonated = donationHistory.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Donations</h1>
            <p className="text-muted-foreground">Support meaningful causes and make a difference in your community</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(totalDonated)}</div>
                <p className="text-xs text-muted-foreground">{donationHistory.length} donations made</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">Across {categories.length - 1} categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <div className="h-4 w-4 rounded-full bg-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-mono">{formatCurrency(balance)}</div>
                <p className="text-xs text-muted-foreground">Available for donations</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="campaigns" className="space-y-6">
            <TabsList>
              <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
              <TabsTrigger value="history">Donation History</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-6">
              {featuredCampaigns.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Featured Campaigns</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {featuredCampaigns.map((campaign) => (
                      <motion.div key={campaign.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                        <CampaignCard campaign={campaign} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-semibold">All Campaigns</h2>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoadingCampaigns ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-48 w-full rounded-lg" />))}
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No campaigns found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCampaigns.map((campaign, index) => (
                      <motion.div key={campaign.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                        <div onClick={() => setSelectedCampaign(campaign)} className="cursor-pointer">
                          <CampaignCard campaign={campaign} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {donationHistory.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No donations yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Start making a difference by donating to a campaign</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {donationHistory.map((donation) => (
                    <Card key={donation.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{donation.campaignTitle}</CardTitle>
                            <CardDescription>{new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                          </div>
                          {donation.anonymous && <Badge variant="secondary">Anonymous</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold font-mono">{formatCurrency(donation.amount, donation.currency)}</p>
                            <p className="text-sm text-muted-foreground mt-1">Receipt ID: {donation.receiptId}</p>
                          </div>
                          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Download Receipt</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCampaign.title}</DialogTitle>
                <DialogDescription>{selectedCampaign.organizer}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img src={selectedCampaign.image} alt={selectedCampaign.title} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round((selectedCampaign.raised / selectedCampaign.goal) * 100)}%</span>
                  </div>
                  <Progress value={(selectedCampaign.raised / selectedCampaign.goal) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{formatCurrency(selectedCampaign.raised, selectedCampaign.currency)}</span>
                    <span className="text-muted-foreground">of {formatCurrency(selectedCampaign.goal, selectedCampaign.currency)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedCampaign.donors} donors</p>
                </div>
                <div><h3 className="font-semibold mb-2">About this campaign</h3><p className="text-sm text-muted-foreground">{selectedCampaign.description}</p></div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Select donation amount</Label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {presetAmounts.map((amount) => (
                        <Button key={amount} variant={donationAmount === amount ? 'default' : 'outline'} onClick={() => { setDonationAmount(amount); setCustomAmount(''); }} className="font-mono">{formatCurrency(amount)}</Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-amount">Or enter custom amount</Label>
                      <Input id="custom-amount" type="number" placeholder="Enter amount" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setDonationAmount(null); }} className="font-mono" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked as boolean)} />
                    <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">Make this donation anonymous</Label>
                  </div>
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Donation amount</span>
                      <span className="font-mono font-medium">{formatCurrency(donationAmount || (customAmount ? parseFloat(customAmount) : 0))}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Wallet balance</span>
                      <span className="font-mono font-medium">{formatCurrency(balance)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Cancel</Button>
                <Button onClick={handleDonate} disabled={isLoading}>{isLoading ? 'Processing...' : 'Donate Now'}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

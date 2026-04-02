import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        api.get('/vendor/stats'),
        api.get('/vendor/products'),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch vendor data:', error);
      toast({ title: 'Error', description: 'Failed to load vendor data.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const { data } = editDialog;
    if (!data.name || !data.price) {
      toast({ title: 'Error', description: 'Name and price are required.', variant: 'destructive' });
      return;
    }
    try {
      if (data.id) {
        await api.put(`/vendor/products/${data.id}`, data);
        toast({ title: 'Success', description: 'Product updated.' });
      } else {
        await api.post('/vendor/products', data);
        toast({ title: 'Success', description: 'Product created.' });
      }
      setEditDialog({ open: false, data: null });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to save.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/vendor/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Success', description: 'Product deleted.' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  const openCreate = () => {
    setEditDialog({ open: true, data: { name: '', description: '', price: 0, category: 'General', stock_quantity: 0, image_url: '' } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-32 w-full" />))}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and track your sales</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.totalProducts || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.totalOrders || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Products</CardTitle>
            <CardDescription>Manage your product listings on the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No products yet</p>
                <p className="text-muted-foreground mb-4">Start selling by adding your first product</p>
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(p.price))}</TableCell>
                      <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                      <TableCell>{p.stock_quantity}</TableCell>
                      <TableCell>{parseFloat(p.rating || 0).toFixed(1)}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditDialog({ open: true, data: p })}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editDialog.data?.id ? 'Edit' : 'Add'} Product</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Name</Label><Input value={editDialog.data?.name || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, name: e.target.value } })} /></div>
            <div><Label>Description</Label><Textarea value={editDialog.data?.description || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, description: e.target.value } })} /></div>
            <div><Label>Price (NGN)</Label><Input type="number" value={editDialog.data?.price || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, price: e.target.value } })} /></div>
            <div><Label>Category</Label><Input value={editDialog.data?.category || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, category: e.target.value } })} /></div>
            <div><Label>Stock Quantity</Label><Input type="number" value={editDialog.data?.stock_quantity || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, stock_quantity: e.target.value } })} /></div>
            <div><Label>Image URL</Label><Input value={editDialog.data?.image_url || ''} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, image_url: e.target.value } })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, data: null })}>Cancel</Button>
            <Button onClick={handleSave}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

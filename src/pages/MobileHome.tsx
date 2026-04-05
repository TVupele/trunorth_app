import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWallet } from "@/hooks/useWallet";
import { ROUTE_PATHS, formatCurrency } from "@/lib/index";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MobileHome() {
  const wallet = useWallet((state) => state.wallet);
  const fetchWalletData = useWallet((state) => state.fetchWalletData);
  const isWalletLoading = useWallet((state) => state.isLoading);
  
  const stats = useDashboardStats((state) => state.stats);
  const fetchStats = useDashboardStats((state) => state.fetchStats);
  const isStatsLoading = useDashboardStats((state) => state.isLoading);

  useEffect(() => {
    fetchWalletData();
    fetchStats();
  }, [fetchWalletData, fetchStats]);

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? "NGN";

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">
            Welcome to TruNORTH!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your all-in-one platform
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 mb-4 shadow-lg"
        >
          <p className="text-xs text-primary-foreground/80 mb-1">Wallet Balance</p>
          {isWalletLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-bold text-primary-foreground">
              {formatCurrency(balance, currency)}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Messages</span>
              </div>
              {isStatsLoading ? (
                <Skeleton className="h-6 w-8 mt-1" />
              ) : (
                <p className="text-xl font-bold text-accent">{stats.unreadMessages}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground">Bookings</span>
              </div>
              {isStatsLoading ? (
                <Skeleton className="h-6 w-8 mt-1" />
              ) : (
                <p className="text-xl font-bold text-secondary">{stats.upcomingBookings}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Link
          to={ROUTE_PATHS.WALLET}
          className="block w-full py-3 bg-primary text-primary-foreground text-center rounded-xl font-medium mb-4"
        >
          Open Wallet
        </Link>
      </motion.div>
    </div>
  );
}
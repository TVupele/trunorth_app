import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Clock, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/notifications');
        const data = response.data;
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'secondary';
      case 'warning':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            {t('Notifications')}
          </h1>
          <p className="text-muted-foreground text-sm">Stay updated with your activity</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up! No new notifications at this time.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`transition-colors ${notification.read ? 'bg-card' : 'bg-primary/5 border-primary/20'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                        <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs capitalize">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">{notification.message}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

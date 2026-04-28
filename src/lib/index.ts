import i18n from '@/i18n';

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
  VENDOR_DASHBOARD: '/vendor/dashboard',
  TUTOR_DASHBOARD: '/tutor/dashboard',
  WALLET: '/wallet',
  TRAVEL: '/travel',
  TUTORING: '/tutoring',
  EMERGENCY: '/emergency',
  DONATIONS: '/donations',
  MARKETPLACE: '/marketplace',
  EVENTS: '/events',
  RELIGIOUS_SERVICES: '/religious-services',
  AI_ASSISTANT: '/ai-assistant',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SOCIAL: '/social',
  NOTIFICATIONS: '/notifications',
  MOBILE_HOME: '/mobile',
  MOBILE_FEED: '/mobile/feed',
  MOBILE_WALLET: '/mobile/wallet',
  MOBILE_EVENTS: '/mobile/events',
  MOBILE_SOCIAL: '/mobile/social',
  MOBILE_ADMIN: '/mobile/admin',
} as const;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  phone?: string;
  role: 'user' | 'admin' | 'moderator' | 'service_provider' | 'tutor' | 'seller';
  verified: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'top-up' | 'payment' | 'request';
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'requested';
  timestamp: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  imageUrl?: string;
  likes: number;
  comments: Comment[];
  retweets: number;
  isLiked: boolean;
  isRetweeted: boolean;
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface TravelPackage {
  id: string;
  destination: string;
  image: string;
  price: number;
  currency: string;
  duration: string;
  description: string;
  highlights: string[];
  rating: number;
  reviews: number;
  available: boolean;
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  hourlyRate: number;
  currency: string;
  rating: number;
  totalReviews: number;
  bio: string;
  available: boolean;
  experience: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  seller: string;
  sellerId: string;
  rating: number;
  reviews: number;
  category: string;
  stock: number;
  description: string;
}

export interface Event {
   id: string;
   title: string;
   image: string;
   date: string;
   time: string;
   location: string;
   ticketPrice: number;
   currency: string;
   availableSeats: number;
   totalSeats: number;
   category: string;
   description: string;
   isExternal?: boolean;
   externalUrl?: string;
 }

export interface Campaign {
  id: string;
  title: string;
  image: string;
  description: string;
  goal: number;
  raised: number;
  currency: string;
  donors: number;
  category: string;
  endDate: string;
  organizer: string;
}

export interface EmergencyReport {
  id: string;
  type: 'medical' | 'fire' | 'accident' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  timestamp: string;
  reporterId: string;
  photos?: string[];
}

export interface ReligiousService {
  id: string;
  name: string;
  type: 'prayer' | 'sermon' | 'study' | 'event' | 'other';
  venue: string;
  date: string;
  time: string;
  capacity: number;
  registered: number;
  description: string;
  denomination?: string;
  organizer: string;
}

export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return 'Unknown';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);
};

export const getStatusBadgeVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    'in-progress': 'default',
    completed: 'secondary',
    resolved: 'secondary',
    failed: 'destructive',
    critical: 'destructive',
    high: 'destructive',
    medium: 'outline',
    low: 'secondary',
    requested: 'default',
  };

  return statusMap[(status || '').toLowerCase()] || 'default';
};

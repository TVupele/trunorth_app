import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface VendorRouteProps {
  children: React.ReactNode;
}

export function VendorRoute({ children }: VendorRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

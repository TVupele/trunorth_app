import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface TutorRouteProps {
  children: React.ReactNode;
}

export function TutorRoute({ children }: TutorRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'tutor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

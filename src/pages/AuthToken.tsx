import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AuthToken() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      setAuthToken(token).then(() => {
        navigate('/');
      });
    } else {
      // Handle error case
      navigate('/login?error=auth_failed');
    }
  }, [location, navigate, setAuthToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Authenticating...</p>
    </div>
  );
}

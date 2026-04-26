import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      toast({
        title: 'Registration failed',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      await register({ fullName, email, pass: password });
      toast({
        title: 'Registration successful!',
        description: 'You are now logged in.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: String(error.response?.data?.error || error.message),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'https://trunorth-super-app.onrender.com';
  const googleAuthUrl = `${apiUrl.replace(/\/+$/, '')}/api/auth/google`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t('Sign Up')}</CardTitle>
          <CardDescription>
            {t('Create your account')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">{t('Full Name')}</Label>
              <Input
                id="full-name"
                placeholder="Max Robinson"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('Email Address')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('Password')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" onClick={handleRegister} disabled={isLoading}>
              {isLoading ? t('Creating account') : t('Create an account')}
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('Or continue with')}
                </span>
              </div>
            </div>
            <a href={googleAuthUrl} className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                {t('Sign up with Google')}
              </Button>
            </a>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('Already have an account')}?{' '}
            <Link to="/login" className="underline">
              {t('Sign In')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

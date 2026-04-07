import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Lock, Bell, Globe, Moon, Sun, Shield, Eye, History, Mail, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'en' | 'ha'>('en');
  const [notifications, setNotifications] = useState({
    wallet: { push: true, email: true, sms: false },
    social: { push: true, email: false, sms: false },
    travel: { push: true, email: true, sms: false },
    tutoring: { push: true, email: true, sms: false },
    emergency: { push: true, email: true, sms: true },
    donations: { push: false, email: true, sms: false },
    marketplace: { push: true, email: false, sms: false },
    events: { push: true, email: true, sms: false },
    religious: { push: true, email: true, sms: false },
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    dataSharing: false,
    activityStatus: true,
  });
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully.',
    });
  };

  const handleEmailVerification = () => {
    toast({
      title: 'Verification Email Sent',
      description: 'Please check your inbox to verify your email address.',
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    toast({
      title: 'Theme Changed',
      description: `Switched to ${newTheme} mode.`,
    });
  };

  const handleLanguageChange = (value: 'en' | 'ha') => {
    setLanguage(value);
    toast({
      title: 'Language Changed',
      description: `Language set to ${value === 'en' ? 'English' : 'Hausa'}.`,
    });
  };

  const toggleNotification = (module: keyof typeof notifications, type: 'push' | 'email' | 'sms') => {
    setNotifications(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [type]: !prev[module][type],
      },
    }));
  };

  const togglePrivacy = (key: keyof typeof privacy, value?: string | boolean) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value !== undefined ? value : !prev[key],
    }));
  };

  const toggleSecurity = (key: keyof typeof security) => {
    setSecurity(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast({
      title: 'Security Setting Updated',
      description: `${key === 'twoFactorAuth' ? 'Two-factor authentication' : 'Login alerts'} ${!security[key] ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and security settings</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="account" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Account Settings</h3>
                  <p className="text-sm text-muted-foreground">Password and email verification</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="Enter current password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                  </div>
                  <Button type="submit" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </form>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Verification</h4>
                      <p className="text-sm text-muted-foreground">Verify your email address for security</p>
                    </div>
                    <Button variant="outline" onClick={handleEmailVerification}>
                      <Mail className="w-4 h-4 mr-2" />
                      Verify Email
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notifications" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Manage push, email, and SMS notifications</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {Object.entries(notifications).map(([module, settings]) => (
                  <div key={module} className="space-y-3">
                    <h4 className="font-medium capitalize">{module === 'religious' ? 'Religious Services' : module}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Push</span>
                        </div>
                        <Switch
                          checked={settings.push}
                          onCheckedChange={() => toggleNotification(module as keyof typeof notifications, 'push')}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Email</span>
                        </div>
                        <Switch
                          checked={settings.email}
                          onCheckedChange={() => toggleNotification(module as keyof typeof notifications, 'email')}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">SMS</span>
                        </div>
                        <Switch
                          checked={settings.sms}
                          onCheckedChange={() => toggleNotification(module as keyof typeof notifications, 'sms')}
                        />
                      </div>
                    </div>
                    {module !== 'religious' && <Separator />}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="language" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Globe className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Language Selection</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <Label htmlFor="language">Application Language</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ha">Hausa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="theme" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {theme === 'light' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Theme</h3>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <div>
                    <h4 className="font-medium">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</h4>
                    <p className="text-sm text-muted-foreground">Current theme setting</p>
                  </div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="privacy" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Eye className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Privacy Settings</h3>
                  <p className="text-sm text-muted-foreground">Control your profile visibility and data sharing</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) => togglePrivacy('profileVisibility', value)}
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-muted-foreground">Share usage data to improve services</p>
                  </div>
                  <Switch
                    checked={privacy.dataSharing}
                    onCheckedChange={() => togglePrivacy('dataSharing')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Activity Status</h4>
                    <p className="text-sm text-muted-foreground">Show when you're active</p>
                  </div>
                  <Switch
                    checked={privacy.activityStatus}
                    onCheckedChange={() => togglePrivacy('activityStatus')}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">Two-factor authentication and login history</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={() => toggleSecurity('twoFactorAuth')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Login Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    checked={security.loginAlerts}
                    onCheckedChange={() => toggleSecurity('loginAlerts')}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login History</h4>
                      <p className="text-sm text-muted-foreground">View recent login activity</p>
                    </div>
                    <Button variant="outline">
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      {[
                        { device: 'Chrome on Windows', location: 'Lagos, Nigeria', time: '2 hours ago', current: true },
                        { device: 'Safari on iPhone', location: 'Abuja, Nigeria', time: '1 day ago', current: false },
                        { device: 'Chrome on Android', location: 'Kano, Nigeria', time: '3 days ago', current: false },
                      ].map((login, index) => (
                        <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{login.device}</p>
                              {login.current && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                  <Check className="w-3 h-3" />
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{login.location}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{login.time}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>
    </div>
  );
}
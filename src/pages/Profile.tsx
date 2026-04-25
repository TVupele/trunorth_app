import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Phone, Calendar, Edit2, Check, X, Shield, Award } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/index';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Define the type for the user profile data
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  phone_number: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/users/profile');
  return data;
};

const updateProfile = async (profileData: Partial<UserProfile> & { avatarUrl?: string }): Promise<UserProfile> => {
   const { data } = await api.put('/users/profile', profileData);
   return data;
 };

export default function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    phoneNumber: '',
    avatarUrl: undefined as string | undefined
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { data: profile, isLoading, isError, error } = useQuery<UserProfile, Error>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
      updateUser({
        fullName: updatedProfile.full_name,
        avatarUrl: updatedProfile.avatar_url || undefined,
      });
      toast({ title: 'Success', description: 'Profile updated successfully!' });
      setIsEditing(false);
    },    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update profile.',
        variant: 'destructive',
      });
    },
  });

   useEffect(() => {
     if (profile) {
       setFormData({
         fullName: profile.full_name || '',
         bio: profile.bio || '',
         phoneNumber: profile.phone_number || '',
         avatarUrl: profile.avatar_url
       });
       setAvatarPreview(profile.avatar_url || null);
     }
   }, [profile]);

   const handleSave = async () => {
     let avatarUrl = formData.avatarUrl || undefined;
     
     // If a new avatar file is selected, upload it first
     if (avatarFile) {
       try {
         setIsUploadingAvatar(true);
         const formDataObj = new FormData();
         formDataObj.append('image', avatarFile);
         const response = await api.post('/posts/upload', formDataObj, {
           headers: { 'Content-Type': 'multipart/form-data' }
         });
         avatarUrl = response.data.url;
       } catch (error: any) {
         toast({
           title: 'Error',
           description: String(error.response?.data?.error) || 'Failed to upload avatar',
           variant: 'destructive',
         });
         setIsUploadingAvatar(false);
         return;
       } finally {
         setIsUploadingAvatar(false);
       }
     }
     
     updateMutation.mutate({
         fullName: formData.fullName,
         bio: formData.bio,
         phoneNumber: formData.phoneNumber,
         avatarUrl: avatarUrl
     });
   };

   const handleCancel = () => {
     if (profile) {
       setFormData({
         fullName: profile.full_name || '',
         bio: profile.bio || '',
         phoneNumber: profile.phone_number || '',
         avatarUrl: profile.avatar_url
       });
       setAvatarFile(null);
       setAvatarPreview(profile.avatar_url || null);
     }
     setIsEditing(false);
     setIsUploadingAvatar(false);
   };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Error: {error.message}</div>;
  }
  
  if (!profile) {
      return <div className="p-8">No profile data found.</div>
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('Profile')}</h1>
            <p className="text-muted-foreground mt-1">{t('Manage your account information and settings')}</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              {t('Edit Profile')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
                {t('Save')}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2" disabled={updateMutation.isPending}>
                <X className="h-4 w-4" />
                {t('Cancel')}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('Personal Information')}</CardTitle>
                <CardDescription>{t('Update your profile details and avatar')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center gap-6">
                   <div className="relative">
                     <Avatar className="h-24 w-24">
                       <AvatarImage src={avatarPreview || profile.avatar_url || undefined} alt={profile.full_name} />
                       <AvatarFallback>{profile.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                     </Avatar>
                     {isEditing && (
                       <div className="absolute bottom-0 right-0">
                         <label className="cursor-pointer">
                           <input
                             type="file"
                             accept="image/*"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 setAvatarFile(file);
                                 setAvatarPreview(URL.createObjectURL(file));
                               }
                             }}
                             className="hidden"
                           />
                           <Button type="button" size="icon" variant="secondary" className="h-8 w-8 rounded-full pointer-events-none">
                             <Camera className="h-4 w-4" />
                           </Button>
                         </label>
                         {isUploadingAvatar && (
                           <div className="absolute -bottom-4 -right-4 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                         )}
                       </div>
                     )}
                   </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{profile.full_name}</h3>
                      {profile.is_verified && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {t('Verified')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t('Member since')} {formatDate(profile.created_at)}</p>
                    <Badge variant="outline" className="mt-2">
                      {profile.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('Full Name')}</Label>
                    <Input id="name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={!isEditing || updateMutation.isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('Email Address')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={profile.email} disabled className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('Phone Number')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} disabled={!isEditing || updateMutation.isPending} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Account Created')}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} disabled className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('Bio')}</Label>
                  <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!isEditing || updateMutation.isPending} rows={4} placeholder={t('Tell us about yourself...')} />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings Temporarily Removed */}
            
          </div>
          <div className="space-y-6">
            
            {/* Activity Summary Temporarily Removed */}

            <Card>
              <CardHeader>
                <CardTitle>{t('Account Status')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('Verified Account')}</p>
                    <p className="text-xs text-muted-foreground">{t('Your identity has been verified')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('Active Member')}</p>
                    <p className="text-xs text-muted-foreground">Member for {Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity Temporarily Removed */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileSkeleton() {
    const { t } = useTranslation();
    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-32 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Personal Information')}</CardTitle>
                            <CardDescription>{t('Update your profile details and avatar')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-52" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>{t('Full Name')}</Label><Skeleton className="h-10" /></div>
                                <div className="space-y-2"><Label>{t('Email Address')}</Label><Skeleton className="h-10" /></div>
                                <div className="space-y-2"><Label>{t('Phone Number')}</Label><Skeleton className="h-10" /></div>
                                <div className="space-y-2"><Label>{t('Account Created')}</Label><Skeleton className="h-10" /></div>
                            </div>
                            <div className="space-y-2"><Label>{t('Bio')}</Label><Skeleton className="h-24" /></div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>{t('Account Status')}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-40" /></div></div>
                            <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-32" /></div></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
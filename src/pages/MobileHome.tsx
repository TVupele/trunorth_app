import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { Menu, Bell, Send, Search, Home, Compass, AlertTriangle, Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSocial } from "@/hooks/useSocial";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sidebar } from "@/components/Sidebar";
import { NewsFeed } from "@/components/NewsFeed";
import { AdsBanner } from "@/components/AdsBanner";
import api from "@/lib/api";

interface MobileHomeProps {
  onNavigate?: (path: string) => void;
}

export default function MobileHome({ onNavigate }: MobileHomeProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPost, fetchPosts } = useSocial();
  
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [showPostDialog, setShowPostDialog] = useState(false);
   const [postContent, setPostContent] = useState('');
   const [postImage, setPostImage] = useState<File | null>(null);
   const [postImagePreview, setPostImagePreview] = useState('');
   const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const data = response.data;
        setNotificationCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setNotificationCount(0);
      }
    };
    fetchNotifications();
  }, []);

  const handleCreatePost = async () => {
    if (postContent.trim()) {
      let imageUrl: string | undefined;
      if (postImage) {
        const formData = new FormData();
        formData.append('image', postImage);
        try {
          const response = await api.post('/posts/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          imageUrl = response.data.url;
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }
      createPost(postContent, imageUrl);
      setPostContent('');
      setPostImage(null);
      setPostImagePreview('');
      setShowPostDialog(false);
      setTimeout(() => fetchPosts(), 500);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        {/* Top Row */}
        <div className="flex items-center justify-between px-4 py-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 hover:bg-muted"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
            <Link to={ROUTE_PATHS.MOBILE_HOME}>
              <img src="/Logo_Icon.jpeg" alt="TruNORTH" className="h-8 w-auto" />
            </Link>
            
             <div className="flex items-center gap-1">
               <Button variant="ghost" size="icon" className="relative h-10 w-10">
                 <Bell className="h-5 w-5" />
                 {notificationCount > 0 && (
                   <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                     {notificationCount > 9 ? '9+' : notificationCount}
                   </span>
                 )}
               </Button>
             </div>
            
             <div className="flex items-center gap-1">
               <Link to={ROUTE_PATHS.PROFILE}>
                 <Avatar className="h-9 w-9">
                   <AvatarImage src={(user as any)?.avatar_url} alt={user?.fullName} />
                   <AvatarFallback className="text-sm">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                 </Avatar>
               </Link>
             </div>
        </div>
        
        {/* Search Row */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search" 
              className="w-full bg-muted/50 border-none rounded-full pl-10 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} mobile />

      {/* Main Content */}
      <div className="pt-24 pb-20">
        {/* Title */}
        <div className="px-4 pb-2 border-b border-border/50">
          <h1 className="text-xl font-bold text-foreground">{t('Home')}</h1>
        </div>

        {/* Ads Banner */}
        <div className="border-b border-border/50">
          <AdsBanner />
        </div>

        {/* News Feed */}
        <NewsFeed />
      </div>

      {/* X-style bottom navigation */}
      <motion.nav
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 safe-area-bottom"
      >
        <div className="flex items-center justify-around h-14">
          {/* Home */}
          <NavLink
            to={ROUTE_PATHS.MOBILE_HOME}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <Home className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          {/* Explore */}
          <NavLink
            to={ROUTE_PATHS.EVENTS}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <Compass className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          {/* Post Button - Center */}
          <button 
            onClick={() => setShowPostDialog(true)}
            className="flex items-center justify-center -mt-4"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Send className="w-6 h-6 text-primary-foreground" />
            </div>
          </button>

          {/* Notifications */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <Bell className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          {/* Emergency - Red */}
          <NavLink
            to={ROUTE_PATHS.EMERGENCY}
            className="flex flex-col items-center justify-center w-14 h-full"
          >
            <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
            </div>
          </NavLink>
        </div>
      </motion.nav>

      {/* Post Dialog Modal */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="What's on your mind?" 
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[120px]"
            />
            {postImagePreview && (
              <div className="relative">
                <img 
                  src={postImagePreview} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setPostImage(null);
                    setPostImagePreview('');
                  }}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm">
                <ImageIcon className="h-4 w-4" />
                <span>Add Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePost} disabled={!postContent.trim()}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
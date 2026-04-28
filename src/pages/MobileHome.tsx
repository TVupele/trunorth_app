import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useSocial } from "@/hooks/useSocial";
import { AdsBanner } from "@/components/AdsBanner";
import { NewsFeed } from "@/components/NewsFeed";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { Home, Compass, Bell, AlertTriangle, Send, Image as ImageIcon, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MobileHome() {
  const { t } = useTranslation();
  const { createPost, fetchPosts } = useSocial();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t("Image must be less than 5MB"), variant: "destructive" });
        return;
      }
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setPostImagePreview("");
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImage) {
      toast({ title: t("Please enter some content or add an image"), variant: "destructive" });
      return;
    }
    if (postContent.trim().length > 500) {
      toast({ title: t("Post content must be less than 500 characters"), variant: "destructive" });
      return;
    }

    setIsPosting(true);
    try {
      let imageUrl = undefined;
      if (postImage) {
        const formData = new FormData();
        formData.append("image", postImage);
        const response = await api.post("/posts/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imageUrl = response.data.url;
      }
      await createPost(postContent, imageUrl);
      setPostDialogOpen(false);
      setPostContent("");
      setPostImage(null);
      setPostImagePreview("");
      toast({ title: t("Post created successfully!") });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({ title: t("Failed to create post"), variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} mobile />

      <main className="flex-1 overflow-y-auto pt-20">
        <div className="px-4 py-3 border-b border-border/50 lg:hidden">
          <h1 className="text-xl font-bold text-foreground">{t("Home")}</h1>
        </div>

        <div className="border-b border-border/50">
          <AdsBanner />
        </div>

        <div className="pb-24">
          <NewsFeed />
        </div>
      </main>

      <motion.nav
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 safe-area-bottom"
      >
        <div className="flex items-center justify-around h-14">
          <NavLink
            to={ROUTE_PATHS.MOBILE_HOME}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${isActive ? "text-primary" : "text-muted-foreground"}`
            }
          >
            {({ isActive }) => (
              <Home className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          <NavLink
            to={ROUTE_PATHS.EVENTS}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${isActive ? "text-primary" : "text-muted-foreground"}`
            }
          >
            {({ isActive }) => (
              <Compass className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

          <button
            onClick={() => setPostDialogOpen(true)}
            className="flex items-center justify-center -mt-4"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Send className="w-6 h-6 text-primary-foreground" />
            </div>
          </button>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full ${isActive ? "text-primary" : "text-muted-foreground"}`
            }
          >
            {({ isActive }) => (
              <Bell className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </NavLink>

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

      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg">{t("Create Post")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1 py-2">
            <Textarea
              placeholder={t("What's on your mind?")}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[100px] resize-none text-sm"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{postContent.length}/500</span>
            </div>

            {postImagePreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mt-3"
              >
                <img
                  src={postImagePreview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 pt-3 border-t">
            <div className="flex-1">
              <Label
                htmlFor="post-image"
                className="flex items-center gap-1 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ImageIcon className="h-4 w-4" />
                <span>{postImage ? t("Change Image") : t("Add Image")}</span>
              </Label>
              <input
                id="post-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <Button
              onClick={handleCreatePost}
              disabled={(!postContent.trim() && !postImage) || isPosting}
              className="whitespace-nowrap"
            >
              {isPosting ? t("Posting...") : t("Post")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
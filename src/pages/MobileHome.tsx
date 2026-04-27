import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useSocial } from "@/hooks/useSocial";
import { AdsBanner } from "@/components/AdsBanner";
import { NewsFeed } from "@/components/NewsFeed";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function MobileHome() {
  const { t } = useTranslation();
  const { createPost, fetchPosts } = useSocial();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Title */}
      <div className="px-4 py-3 border-b border-border/50">
        <h1 className="text-xl font-bold text-foreground">{t('Home')}</h1>
      </div>

      {/* Ads Banner */}
      <div className="border-b border-border/50">
        <AdsBanner />
      </div>

      {/* News Feed */}
      <div className="pb-4">
        <NewsFeed />
      </div>
    </div>
  );
}

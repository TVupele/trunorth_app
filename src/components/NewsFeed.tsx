import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Repeat, Share, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from '@/lib/index';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/index';

export function NewsFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedPosts, setDisplayedPosts] = useState(10);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLoadMore = () => {
    setDisplayedPosts((prev) => prev + 10);
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-3 py-3 border-b border-border/50">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {posts.length === 0 ? (
        <div className="text-center py-12 px-3">
          <p className="text-muted-foreground text-sm">No posts yet</p>
          <p className="text-muted-foreground text-xs mt-1">Be the first to share something!</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {posts.slice(0, displayedPosts).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-3 py-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={post.user?.avatar_url} alt={post.user?.full_name} />
                    <AvatarFallback className="text-sm">
                      {post.user?.full_name?.charAt(0) || post.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {post.user?.full_name || post.full_name || 'User'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        @{post.user?.full_name?.toLowerCase().replace(/\s/g, '') || 'user'}
                      </span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(post.created_at)}
                      </span>
                      <button className="ml-auto text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5">
                      {post.content}
                    </p>

                    {/* Post Image */}
                    {post.image_url && (
                      <div className="mt-2 rounded-2xl overflow-hidden border border-border/50">
                        <img 
                          src={post.image_url} 
                          alt="Post" 
                          className="w-full h-auto max-h-80 object-cover"
                        />
                      </div>
                    )}

                    {/* Action Buttons - X style */}
                    <div className="flex items-center justify-between mt-2 -ml-2">
                      <button 
                        onClick={(e) => { e.preventDefault(); }}
                        className="flex items-center gap-1 p-2 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{post.comments_count || 0}</span>
                      </button>
                      
                      <button className="flex items-center gap-1 p-2 rounded-full text-muted-foreground hover:text-green-500 hover:bg-green-500/10">
                        <Repeat className="h-4 w-4" />
                        <span className="text-xs">0</span>
                      </button>
                      
                      <button 
                        onClick={(e) => { e.preventDefault(); handleLike(post.id); }}
                        className="flex items-center gap-1 p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="text-xs">{post.likes_count || 0}</span>
                      </button>
                      
                      <button className="flex items-center gap-1 p-2 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10">
                        <Share className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {posts.length > displayedPosts && (
            <div className="py-4 text-center">
              <Button 
                onClick={handleLoadMore} 
                variant="ghost" 
                className="text-primary hover:text-primary/80"
              >
                Show more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
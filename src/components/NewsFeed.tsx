import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat2, Share2, MessageCircle, Heart, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocial } from '@/hooks/useSocial';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/index';
import { useToast } from '@/hooks/use-toast';

export function NewsFeed() {
  const { user } = useAuth();
  const { posts, toggleLike, toggleRetweet, fetchPosts } = useSocial();
  const { toast } = useToast();
  const [displayedPosts, setDisplayedPosts] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    setDisplayedPosts((prev) => prev + 10);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to like post', variant: 'destructive' });
    }
  };

  const handleRetweet = async (postId: string, isRetweeted: boolean) => {
    try {
      await toggleRetweet(postId);
      toast({
        title: isRetweeted ? 'Retweet removed' : 'Retweeted!',
        duration: 1500,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to retweet', variant: 'destructive' });
    }
  };

  const handleComment = (postId: string) => {
    toast({
      title: 'Comments',
      description: 'Comments are now available!',
      duration: 2000,
    });
  };

  const handleShare = async (post: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.userName}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(`${post.content}\n\nShared via TruNorth`).then(() => {
        toast({ title: 'Copied to clipboard', duration: 2000 });
      });
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
                className="px-3 py-3 border-b border-border/50 hover:bg-muted/30"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={post.userAvatar} alt={post.userName} />
                    <AvatarFallback className="text-sm">
                      {post.userName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {post.userName || 'Anonymous'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        @{((post.userName || '').toLowerCase().replace(/\s/g, ''))}
                      </span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(post.timestamp)}
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
                    {post.imageUrl && (
                      <div className="mt-2 rounded-2xl overflow-hidden border border-border/50">
                        <img 
                          src={post.imageUrl} 
                          alt="Post" 
                          className="w-full h-auto max-h-80 object-cover"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-2 -ml-2">
                      <button 
                        onClick={(e) => { e.preventDefault(); handleComment(post.id); }}
                        className="flex items-center gap-1 p-2 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{post.comments?.length || 0}</span>
                      </button>
                       
                      <button 
                        onClick={(e) => { e.preventDefault(); handleRetweet(post.id, post.isRetweeted); }}
                        className={`flex items-center gap-1 p-2 rounded-full hover:bg-green-500/10 ${post.isRetweeted ? 'text-green-600' : 'text-muted-foreground hover:text-green-500'}`}
                      >
                        <Repeat2 className="h-4 w-4" />
                        <span className="text-xs">{post.retweets || 0}</span>
                      </button>
                       
                      <button 
                        onClick={(e) => { e.preventDefault(); handleLike(post.id, post.isLiked); }}
                        className={`flex items-center gap-1 p-2 rounded-full hover:bg-red-500/10 ${post.isLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs">{post.likes || 0}</span>
                      </button>
                       
                      <button 
                        onClick={(e) => { e.preventDefault(); handleShare(post); }}
                        className="flex items-center gap-1 p-2 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                      >
                        <Share2 className="h-4 w-4" />
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
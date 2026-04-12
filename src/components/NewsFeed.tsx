import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from '@/components/PostCard';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function NewsFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedPosts, setDisplayedPosts] = useState(3);

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
    setDisplayedPosts((prev) => prev + 3);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Feed</h2>
        {Array.from({ length: 2 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full rounded-lg" />))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Feed</h2>
      {posts.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-xs">
          <p>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {posts.slice(0, displayedPosts).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>

          {posts.length > displayedPosts && (
            <div className="flex justify-center pt-2">
              <Button onClick={handleLoadMore} variant="outline" className="text-xs h-8">More</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

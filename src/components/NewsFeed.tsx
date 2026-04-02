import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from '@/components/PostCard';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function NewsFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedPosts, setDisplayedPosts] = useState(5);

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
    setDisplayedPosts((prev) => prev + 5);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">News Feed</h2>
        {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-40 w-full rounded-lg" />))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">News Feed</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {posts.slice(0, displayedPosts).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>

          {posts.length > displayedPosts && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleLoadMore} variant="outline">Load More Posts</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

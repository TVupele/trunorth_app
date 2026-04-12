import { useState } from 'react';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { Post, formatDate } from '@/lib/index';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toggleLike, addComment } = useSocial();
  const authorName = post.userId === user?.id ? (user?.fullName || 'You') : post.userName;
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    addComment(post.id, commentText);
    setCommentText('');
    setIsSubmitting(false);
    setShowComments(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.userName}`,
        text: post.content,
      }).catch(() => {});
    }
  };

  return (
    <Card className="overflow-hidden border-border hover:shadow-sm transition-all duration-200 py-2">
      <CardHeader className="pb-2 px-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.userAvatar} alt={authorName} />
            <AvatarFallback className="text-xs">{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-xs">{authorName}</p>
            <p className="text-[10px] text-muted-foreground">{formatDate(post.timestamp)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 py-1">
        <p className="text-xs">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img src={post.imageUrl} alt="Post" className="w-full h-auto max-h-48 object-cover" />
          </div>
        )}
      </CardContent>
      <CardFooter className="px-3 py-1">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="h-6 px-1 text-xs"
          >
            <Heart className={`h-3 w-3 mr-1 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            {post.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="h-6 px-1 text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {post.comments}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-6 px-1 text-xs"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden px-3 pb-2"
          >
            <div className="space-y-2 max-h-32 overflow-y-auto py-1">
              {post.comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex gap-1.5">
                  <Avatar className="h-5 w-5 flex-shrink-0">
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                    <AvatarFallback className="text-[8px]">{comment.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted rounded px-2 py-1">
                    <p className="text-[10px]">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-1 mt-1">
              <Textarea
                placeholder="Comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[40px] resize-none text-xs py-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleComment}
                disabled={!commentText.trim() || isSubmitting}
                className="h-8 w-8 flex-shrink-0"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
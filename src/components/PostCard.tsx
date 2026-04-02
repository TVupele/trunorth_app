import { useState } from 'react';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { Post, formatDate } from '@/lib/index';
import { useSocial } from '@/hooks/useSocial';
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
  const { toggleLike, addComment } = useSocial();
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
    <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.userAvatar} alt={post.userName} />
            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{post.userName}</p>
            <p className="text-xs text-muted-foreground">{formatDate(post.timestamp)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <div className="rounded-lg overflow-hidden max-h-96">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-auto object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
          <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 gap-2 ${post.isLiked ? 'text-destructive' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Like</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs font-medium">Share</span>
          </Button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 overflow-hidden"
            >
              <Separator />

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-xs">{comment.userName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[60px] resize-none"
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
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
}
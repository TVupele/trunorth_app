import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share2, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Post, formatDate } from '@/lib/index';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toggleLike, toggleRetweet, addComment } = useSocial();
  const { toast } = useToast();
  const authorName = post.userId === user?.id ? (user?.fullName || t('You')) : post.userName;
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleRetweet = () => {
    toggleRetweet(post.id);
    toast({
      title: post.isRetweeted ? 'Retweet removed' : 'Retweeted!',
      duration: 1500,
    });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    addComment(post.id, commentText);
    setCommentText('');
    setIsSubmitting(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('Post by')} ${post.userName}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${post.content}\n\nShared via TruNorth`).then(() => {
        toast({ title: 'Copied to clipboard', duration: 2000 });
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
            onClick={() => setShowCommentModal(true)}
            className="h-6 px-1 text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {post.comments.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetweet}
            className={`h-6 px-1 text-xs ${post.isRetweeted ? 'text-green-600' : ''}`}
          >
            <Repeat2 className={`h-3 w-3 mr-1 ${post.isRetweeted ? 'fill-green-500 text-green-500' : ''}`} />
            {post.retweets}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-6 px-1 text-xs"
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>

      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>{post.content}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      <AvatarFallback className="text-xs">
                        {comment.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-lg p-3">
                      <p className="text-xs font-medium">{comment.userName}</p>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(comment.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No comments yet</p>
            )}
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t">
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
              className="h-10 w-10 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
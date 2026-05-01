import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Image as ImageIcon, Send } from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/index';

export default function Social() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { posts, conversations, messages, fetchPosts, createPost, uploadImage, sendMessage, markMessagesAsRead } = useSocial();
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'my-posts' | 'messages'>('feed');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [displayedPosts, setDisplayedPosts] = useState(10);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (postContent.trim()) {
      let imageUrl: string | undefined;
      if (postImage) {
        try {
          imageUrl = await uploadImage(postImage);
        } catch (error) {
          console.error('Image upload failed:', error);
          toast({
            title: 'Image upload failed',
            description: 'Your post will be created without the image.',
            duration: 3000,
          });
        }
      }
      createPost(postContent, imageUrl);
      setPostContent('');
      setPostImage(null);
      setPostImagePreview('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = () => {
    if (messageContent.trim() && selectedConversation) {
      const conversation = conversations.find((c) => c.id === selectedConversation);
      if (conversation) {
        sendMessage(
          conversation.participantId,
          conversation.participantName,
          conversation.participantAvatar,
          messageContent
        );
        setMessageContent('');
      }
    }
  };

  const handleLoadMore = () => {
    setDisplayedPosts((prev) => prev + 10);
  };

  const filteredPosts = posts.filter(
    (post) =>
      !searchQuery ||
      (post.content || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (post.userName || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const myPosts = posts.filter((post) => post.userId === 'user-1');

  const conversationMessages = selectedConversation
    ? messages[selectedConversation] || []
    : [];

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-7xl mx-auto space-y-4">
         <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.2 }}
         >
           <h1 className="text-lg font-bold text-foreground mb-1">{t('Social')}</h1>
           <p className="text-xs text-muted-foreground">{t('Connect & share')}</p>
         </motion.div>

         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList className="grid w-full grid-cols-3 mb-4">
             <TabsTrigger value="feed" className="text-xs py-1.5">{t('Feed')}</TabsTrigger>
             <TabsTrigger value="my-posts" className="text-xs py-1.5">{t('My Posts')}</TabsTrigger>
             <TabsTrigger value="messages" className="text-xs py-1.5">{t('Messages')}</TabsTrigger>
           </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
               <Card className="py-2">
                 <CardHeader className="py-2 px-3">
                   <CardTitle className="text-sm">{t('Create Post')}</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2 px-3">
                   <Textarea
                     placeholder={t("What's on your mind?")}
                     value={postContent}
                     onChange={(e) => setPostContent(e.target.value)}
                     className="min-h-[60px] resize-none text-sm"
                   />
                   <div className="flex items-center gap-2">
                     <label className="flex items-center gap-1 cursor-pointer">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleImageChange}
                         className="hidden"
                       />
                       <Button variant="outline" size="sm" className="h-7 text-xs" type="button">
                         <ImageIcon className="h-3 w-3" />
                         <span className="ml-1">{t('Image')}</span>
                       </Button>
                     </label>
                    {postImagePreview && (
                      <div className="relative w-8 h-8 rounded overflow-hidden">
                        <img src={postImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Button
                      onClick={handleCreatePost}
                      disabled={!postContent.trim()}
                      size="sm"
                      className="h-7 text-xs ml-auto"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

             <div className="flex items-center gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder={t("Search posts and users...")}
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10"
                 />
               </div>
             </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredPosts.slice(0, displayedPosts).map((post, index) => (
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
            </div>

             {filteredPosts.length > displayedPosts && (
               <div className="flex justify-center pt-4">
                 <Button onClick={handleLoadMore} variant="outline">
                   {t('Load More Posts')}
                 </Button>
               </div>
             )}

             {filteredPosts.length === 0 && (
               <Card className="p-12 text-center">
                 <p className="text-muted-foreground">{t('No posts found matching your search.')}</p>
               </Card>
             )}
          </TabsContent>

          <TabsContent value="my-posts" className="space-y-4">
            {myPosts.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {myPosts.map((post, index) => (
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
             ) : (
               <Card className="p-12 text-center">
                 <p className="text-muted-foreground mb-4">{t("You haven't created any posts yet.")}</p>
                 <Button onClick={() => setActiveTab('feed')}>{t('Create Your First Post')}</Button>
               </Card>
             )}
          </TabsContent>

          <TabsContent value="messages">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="md:col-span-1">
                 <CardHeader>
                   <CardTitle>{t('Conversations')}</CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                   <ScrollArea className="h-[600px]">
                     {conversations.length > 0 ? (
                      <div className="space-y-1 p-4">
                        {conversations.map((conversation) => (
                          <motion.div
                            key={conversation.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              onClick={() => {
                                setSelectedConversation(conversation.id);
                                markMessagesAsRead(conversation.id);
                              }}
                              className={`w-full p-3 rounded-lg text-left transition-colors ${
                                selectedConversation === conversation.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={conversation.participantAvatar} />
                                  <AvatarFallback>
                                    {conversation.participantName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">
                                      {conversation.participantName}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                      <Badge variant="destructive" className="ml-2">
                                        {conversation.unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {conversation.lastMessage}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(conversation.lastMessageTime)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </motion.div>
                         ))}
                       </div>
                     ) : (
                       <div className="p-8 text-center text-muted-foreground">
                         {t('No conversations yet')}
                       </div>
                     )}
                  </ScrollArea>
                </CardContent>
              </Card>

               <Card className="md:col-span-2">
                 <CardHeader>
                   <CardTitle>
                     {selectedConversation
                       ? conversations.find((c) => c.id === selectedConversation)?.participantName
                       : t('Select a conversation')}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {selectedConversation ? (
                    <>
                      <ScrollArea className="h-[480px] pr-4">
                        <div className="space-y-4">
                          {conversationMessages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${
                                message.senderId === 'user-1' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.senderId === 'user-1'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatDate(message.timestamp)}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>

                       <div className="flex items-center gap-2">
                         <Input
                           placeholder={t('Type a message...')}
                           value={messageContent}
                           onChange={(e) => setMessageContent(e.target.value)}
                           onKeyPress={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handleSendMessage();
                             }
                           }}
                           className="flex-1"
                         />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageContent.trim()}
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                   ) : (
                     <div className="h-[540px] flex items-center justify-center text-muted-foreground">
                       {t('Select a conversation to start messaging')}
                     </div>
                   )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

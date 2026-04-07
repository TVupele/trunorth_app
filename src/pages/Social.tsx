import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Image as ImageIcon, Send, MessageCircle, Heart, Trash2, Plus } from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
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
  const { posts, conversations, messages, fetchPosts, createPost, sendMessage, markMessagesAsRead } = useSocial();
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
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
        const formData = new FormData();
        formData.append('image', postImage);
        try {
          const response = await api.post('/posts/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          imageUrl = response.data.url;
        } catch (error) {
          console.error('Image upload failed:', error);
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
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myPosts = posts.filter((post) => post.userId === 'user-1');

  const conversationMessages = selectedConversation
    ? messages[selectedConversation] || []
    : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Social Network</h1>
          <p className="text-muted-foreground">Connect, share, and engage with the community</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0) > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Create Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" type="button">
                        <ImageIcon className="h-4 w-4" />
                        <span className="ml-2">Add Image</span>
                      </Button>
                    </label>
                    {postImagePreview && (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden">
                        <img src={postImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Button
                      onClick={handleCreatePost}
                      disabled={!postContent.trim()}
                      className="gap-2 ml-auto"
                    >
                      <Send className="h-4 w-4" />
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts and users..."
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
                  Load More Posts
                </Button>
              </div>
            )}

            {filteredPosts.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No posts found matching your search.</p>
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
                <p className="text-muted-foreground mb-4">You haven't created any posts yet.</p>
                <Button onClick={() => setActiveTab('feed')}>Create Your First Post</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
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
                        No conversations yet
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
                      : 'Select a conversation'}
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
                          placeholder="Type a message..."
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
                      Select a conversation to start messaging
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

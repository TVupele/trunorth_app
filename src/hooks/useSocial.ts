import { create } from 'zustand';
import { Post, Comment } from '@/lib/index';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface SocialState {
  posts: Post[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  currentUserId: string;
  fetchPosts: () => Promise<void>;
  createPost: (content: string, image?: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleLike: (postId: string) => void;
  toggleRetweet: (postId: string) => void;
  sendMessage: (recipientId: string, recipientName: string, recipientAvatar: string, content: string) => void;
  markMessagesAsRead: (conversationId: string) => void;
  deletePost: (postId: string) => void;
}

export const useSocial = create<SocialState>((set, get) => ({
  posts: [],
  conversations: [],
  messages: {},
  currentUserId: 'user-1',

    fetchPosts: async () => {
      try {
        const response = await api.get('/posts');
        const posts = response.data.map((post: any) => ({
          id: post.id,
          userId: post.userId || post.user_id,
          userName: post.userName || post.full_name || `User_${(post.userId || post.user_id)?.slice(0, 8)}`,
          userAvatar: post.userAvatar || post.avatar_url || post.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.userName || post.full_name || post.userId || post.user_id || 'default')}`,
          content: post.content,
          imageUrl: post.imageUrl || post.image_url || undefined,
          likes: post.likes || post.likes_count || 0,
          comments: post.comments || [],
          retweets: post.retweets || post.retweets_count || 0,
          isLiked: post.isLiked || false,
          isRetweeted: post.isRetweeted || false,
          timestamp: post.timestamp || post.created_at,
        }));
        set({ posts });
      } catch (error) {
        console.error('Failed to fetch posts', error);
      }
    },

    createPost: async (content: string, image?: string) => {
      try {
        const response = await api.post('/posts', { content, image_url: image });
        const savedPost = response.data;
        const authUser = useAuth.getState().user;
         const newPost: Post = {
           id: savedPost.id,
           userId: savedPost.user_id,
           userName: savedPost.full_name || authUser?.fullName || 'User',
           userAvatar: savedPost.avatar_url || authUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(authUser?.fullName || authUser?.id || 'User'),
           content: savedPost.content,
           imageUrl: savedPost.imageUrl || savedPost.image_url || undefined,
           likes: savedPost.likes_count || savedPost.likes || 0,
           comments: savedPost.comments || [],
           retweets: savedPost.retweets_count || savedPost.retweets || 0,
           isLiked: savedPost.isLiked || false,
           isRetweeted: savedPost.isRetweeted || false,
           timestamp: savedPost.created_at || savedPost.timestamp,
         };
        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      } catch (error) {
        console.error('Failed to create post:', error);
        const authUser = useAuth.getState().user;
        const newPost: Post = {
          id: `post-${Date.now()}`,
          userId: get().currentUserId,
          userName: authUser?.fullName || 'User',
          userAvatar: authUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(authUser?.fullName || authUser?.id || 'User'),
          content,
          imageUrl: image,
          likes: 0,
          comments: [],
          retweets: 0,
          isLiked: false,
          isRetweeted: false,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      }
    },

    addComment: async (postId: string, content: string) => {
      const authUser = useAuth.getState().user;
      const newComment = {
        id: `comment-temp-${Date.now()}`,
        userId: get().currentUserId,
        userName: authUser?.fullName || 'User',
        userAvatar: authUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(authUser?.fullName || authUser?.id || 'User'),
        content,
        timestamp: new Date().toISOString(),
      };

      // Optimistically add comment
     set((state) => ({
       posts: state.posts.map((post) =>
         post.id === postId
           ? {
               ...post,
               comments: [...post.comments, newComment],
             }
           : post
       ),
     }));

     try {
       const response = await api.post(`/posts/${postId}/comment`, { content });
       const realComment = response.data.comment;
       set((state) => ({
         posts: state.posts.map((post) =>
           post.id === postId
             ? {
                 ...post,
                 comments: post.comments.map((c) =>
                   c.id === newComment.id ? realComment : c
                 ),
               }
             : post
         ),
       }));
     } catch (error) {
       set((state) => ({
         posts: state.posts.map((post) =>
           post.id === postId
             ? {
                 ...post,
                 comments: post.comments.filter((c) => c.id !== newComment.id),
               }
             : post
         ),
       }));
       console.error('Failed to add comment:', error);
     }
   },

   toggleLike: async (postId: string) => {
     const post = get().posts.find(p => p.id === postId);
     if (!post) return;

     set((state) => ({
       posts: state.posts.map((p) =>
         p.id === postId
           ? {
               ...p,
               isLiked: !p.isLiked,
               likes: p.isLiked ? p.likes - 1 : p.likes + 1,
             }
           : p
       ),
     }));

     try {
       if (post.isLiked) {
         await api.delete(`/posts/${postId}/like`);
       } else {
         await api.post(`/posts/${postId}/like`);
       }
     } catch (error) {
       set((state) => ({
         posts: state.posts.map((p) =>
           p.id === postId
             ? {
                 ...p,
                 isLiked: !p.isLiked,
                 likes: p.isLiked ? p.likes + 1 : p.likes - 1,
               }
             : p
         ),
       }));
       console.error('Failed to toggle like:', error);
     }
   },

   toggleRetweet: async (postId: string) => {
     const post = get().posts.find(p => p.id === postId);
     if (!post) return;

     set((state) => ({
       posts: state.posts.map((p) =>
         p.id === postId
           ? {
               ...p,
               isRetweeted: !p.isRetweeted,
               retweets: p.isRetweeted ? p.retweets - 1 : p.retweets + 1,
             }
           : p
       ),
     }));

     try {
       if (post.isRetweeted) {
         await api.delete(`/posts/${postId}/retweet`);
       } else {
         await api.post(`/posts/${postId}/retweet`);
       }
     } catch (error) {
       set((state) => ({
         posts: state.posts.map((p) =>
           p.id === postId
             ? {
                 ...p,
                 isRetweeted: !p.isRetweeted,
                 retweets: p.isRetweeted ? p.retweets + 1 : p.retweets - 1,
               }
             : p
         ),
       }));
       console.error('Failed to toggle retweet:', error);
     }
   },

    sendMessage: (recipientId: string, recipientName: string, recipientAvatar: string, content: string) => {
      const conversationId = `conv-${recipientId}`;
      const authUser = useAuth.getState().user;
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: get().currentUserId,
        senderName: authUser?.fullName || 'User',
        senderAvatar: authUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(authUser?.fullName || authUser?.id || 'User'),
        recipientId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      };

      set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      const existingConversation = state.conversations.find(
        (conv) => conv.id === conversationId
      );

      const updatedConversation: Conversation = existingConversation
        ? {
            ...existingConversation,
            lastMessage: content,
            lastMessageTime: newMessage.timestamp,
          }
        : {
            id: conversationId,
            participantId: recipientId,
            participantName: recipientName,
            participantAvatar: recipientAvatar,
            lastMessage: content,
            lastMessageTime: newMessage.timestamp,
            unreadCount: 0,
          };

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, newMessage],
        },
        conversations: existingConversation
          ? state.conversations.map((conv) =>
              conv.id === conversationId ? updatedConversation : conv
            )
          : [updatedConversation, ...state.conversations],
      };
    });
  },

  markMessagesAsRead: (conversationId: string) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) => ({
          ...msg,
          read: true,
        })),
      },
    }));
  },

  deletePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },
}));

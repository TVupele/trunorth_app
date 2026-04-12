import { create } from 'zustand';
import { Post, Comment } from '@/lib/index';
import api from '@/lib/api';

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
        userId: post.user_id,
        userName: post.full_name,
        userAvatar: post.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        content: post.content,
        image: post.image_url,
        likes: post.likes_count,
        comments: [], // Comments will be fetched separately
        timestamp: post.created_at,
        isLiked: false, // This will be handled later
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
      const newPost: Post = {
        id: savedPost.id,
        userId: savedPost.user_id,
        userName: savedPost.full_name || 'Current User',
        userAvatar: savedPost.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
        content: savedPost.content,
        image: savedPost.image_url,
        likes: 0,
        comments: [],
        timestamp: savedPost.created_at,
        isLiked: false,
      };
      set((state) => ({
        posts: [newPost, ...state.posts],
      }));
    } catch (error) {
      console.error('Failed to create post:', error);
      const newPost: Post = {
        id: `post-${Date.now()}`,
        userId: get().currentUserId,
        userName: 'Current User',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
        content,
        image,
        likes: 0,
        comments: [],
        timestamp: new Date().toISOString(),
        isLiked: false,
      };
      set((state) => ({
        posts: [newPost, ...state.posts],
      }));
    }
  },

  addComment: (postId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: get().currentUserId,
      userName: 'Current User',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
      content,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ),
    }));
  },

  toggleLike: (postId: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      ),
    }));
  },

  sendMessage: (recipientId: string, recipientName: string, recipientAvatar: string, content: string) => {
    const conversationId = `conv-${recipientId}`;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: get().currentUserId,
      senderName: 'Current User',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
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

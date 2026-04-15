import { create } from 'zustand';
import axios from '../lib/axios';

const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  isSending: false,
  isCreating: false,
  error: null,

  fetchChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get('/chats');
      set({ chats: data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  fetchChatById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`/chats/${id}`);
      set({ currentChat: data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  createNewChat: async (navigate) => {
    set({ isCreating: true });
    try {
      const { data } = await axios.post('/chats', { title: 'New Guidance Session' });
      set((state) => ({ chats: [data, ...state.chats], currentChat: data, isCreating: false }));
      if (navigate) navigate(`/c/${data._id}`);
    } catch (error) {
      console.error(error);
      set({ isCreating: false });
    }
  },

  sendMessage: async (prompt, chatId = null) => {
    set({ isSending: true, error: null });
    
    // Optimistic UI update
    const userMsg = { role: 'user', content: prompt, _id: Date.now().toString() };
    if (get().currentChat) {
      set((state) => ({
        currentChat: { ...state.currentChat, messages: [...state.currentChat.messages, userMsg] }
      }));
    }

    try {
      const { data } = await axios.post('/ai/respond', { prompt, chatId });
      set({ currentChat: data.chat, isSending: false });
      // Always refresh chat list so title updates show
      get().fetchChats();
      return data.chat._id;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isSending: false });
      return null;
    }
  },

  deleteChat: async (id) => {
    try {
      await axios.delete(`/chats/${id}`);
      set((state) => ({
        chats: state.chats.filter((c) => c._id !== id),
        currentChat: state.currentChat?._id === id ? null : state.currentChat
      }));
    } catch (error) {
      console.error(error);
    }
  },
  
  clearCurrentChat: () => set({ currentChat: null })
}));

export default useChatStore;

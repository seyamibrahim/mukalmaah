import { create } from "zustand";
import axios from "../lib/axios";

const useAuthStore = create((set) => ({
  userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      console.log("Login successful:", data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      set({ userInfo: data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false,
      });
    }
  },

  signup: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post("/auth/signup", {
        username,
        email,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      set({ userInfo: data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("userInfo");
    set({ userInfo: null });
  },
}));

export default useAuthStore;

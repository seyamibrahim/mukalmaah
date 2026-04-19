import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import useChatStore from "../store/useChatStore";
import { useParams } from "react-router-dom";
import useUIStore from "../store/useUIStore";

const Dashboard = () => {
  const { id } = useParams();
  const { fetchChatById, clearCurrentChat } = useChatStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  useEffect(() => {
    if (id) {
      fetchChatById(id);
    } else {
      clearCurrentChat();
    }
  }, [id, fetchChatById, clearCurrentChat]);

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <ChatArea />
      </div>
    </div>
  );
};

export default Dashboard;

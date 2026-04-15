import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import useChatStore from '../store/useChatStore';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
  const { id } = useParams();
  const { fetchChatById, clearCurrentChat } = useChatStore();

  useEffect(() => {
    if (id) {
      fetchChatById(id);
    } else {
      clearCurrentChat();
    }
  }, [id, fetchChatById, clearCurrentChat]);

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-w-0">
        <ChatArea />
      </div>
    </div>
  );
};

export default Dashboard;

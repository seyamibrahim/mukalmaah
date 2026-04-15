import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, MessageSquare, Trash2, LogOut, Sun, Moon, PanelLeftClose, PanelLeft, Loader2 } from 'lucide-react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
};

const Sidebar = () => {
  const { theme, toggleTheme, toggleSidebar, isSidebarOpen } = useUIStore();
  const { chats, fetchChats, deleteChat, createNewChat, isCreating } = useChatStore();
  const { logout, userInfo } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const handleDelete = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChat(chatId);
    if (id === chatId) navigate('/');
  };

  /* ─────────────── COLLAPSED: icon rail ─────────────── */
  if (!isSidebarOpen) {
    return (
      <div className="w-14 shrink-0 bg-surface border-r border-custom h-full flex flex-col items-center pt-3 pb-4 gap-1 transition-all duration-300">

        {/* Arabic abbreviation of Muqalmah */}
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-arabic text-xl font-bold mb-1 select-none"
          title="مکالمہ — Muqalmah"
          dir="rtl"
        >
          م
        </div>

        {/* Toggle open */}
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted hover:text-primary hover:bg-background transition-colors"
          title="Open sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* New Guidance shortcut */}
        <button
          onClick={() => !isCreating && createNewChat(navigate)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
            isCreating
              ? 'bg-primary/20 text-primary cursor-wait'
              : 'text-muted hover:text-primary hover:bg-background cursor-pointer'
          }`}
          title="New Guidance"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
        </button>

        {/* Divider */}
        <div className="w-6 h-[1px] bg-border mb-2" />

        {/* Only current active chat */}
        {id && (() => {
          const currentChat = chats.find(c => c._id === id);
          return currentChat ? (
            <Link
              to={`/c/${id}`}
              title={currentChat.title}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/15 text-primary"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
          ) : null;
        })()}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="w-6 h-[1px] bg-border mb-2" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted hover:text-primary hover:bg-background transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User initials */}
        <div
          className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs cursor-default"
          title={userInfo?.name}
        >
          {getInitials(userInfo?.name)}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  /* ─────────────── EXPANDED: full sidebar ─────────────── */
  return (
    <div className="w-64 shrink-0 bg-surface border-r border-custom h-full flex flex-col transition-all duration-300">

      {/* Header: Arabic brand + collapse toggle */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-custom flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Arabic/Urdu Muqalmah brand */}
          <div
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-arabic text-xl font-bold select-none"
            title="مکالمہ"
            dir="rtl"
          >
            م
          </div>
          <span className="font-arabic text-primary text-lg font-semibold" dir="rtl">مکالمہ</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-background transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Guidance button with + icon */}
      <div className="p-4">
        <button
          onClick={() => !isCreating && createNewChat(navigate)}
          disabled={isCreating}
          className="w-full flex items-center gap-2.5 p-3 bg-primary text-white rounded-xl hover:bg-primary-hover active:scale-[0.97] disabled:opacity-80 transition-all duration-150 font-medium justify-center shadow-sm hover:shadow-md cursor-pointer"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Guidance
            </>
          )}
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest px-2 mb-2">History</p>
        {chats.map((chat) => (
          <Link
            key={chat._id}
            to={`/c/${chat._id}`}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${
              id === chat._id
                ? 'bg-background border border-custom text-primary'
                : 'hover:bg-background/60 text-muted'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-sm">{chat.title}</span>
            </div>
            <button
              onClick={(e) => handleDelete(e, chat._id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </Link>
        ))}
        {chats.length === 0 && (
          <p className="text-xs text-muted text-center pt-8">No past sessions</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-custom">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {getInitials(userInfo?.name)}
            </div>
            <span className="text-sm font-medium text-text truncate">{userInfo?.name}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-background"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={logout}
              className="p-2 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

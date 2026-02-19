'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageCircle, X, Send, User, MoreVertical, RefreshCw } from 'lucide-react';

interface Chat {
    id: string;
    user_id: string;
    last_message: string;
    updated_at: string;
    profiles?: any;
    unread_count?: number;
}

interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_admin: boolean;
}

export default function ChatSystem({ onClose }: { onClose: () => void }) {
    const { user, isAdmin } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // === ADMIN: Fetch All Chats ===
    const fetchAllChats = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase
                .from('support_chats' as any)
                .select(`
                    *,
                    profiles (full_name, email, avatar_url)
                `) as any)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setChats(data || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    // === USER: Fetch Own Chat ===
    const fetchUserChat = async () => {
        setLoading(true);
        try {
            // Check if chat exists
            const { data: existingChat, error } = await (supabase
                .from('support_chats' as any)
                .select('*')
                .eq('user_id', user?.id)
                .single() as any);

            if (existingChat) {
                setActiveChat(existingChat);
                fetchMessages(existingChat.id);
            } else {
                // Determine if we should create one now or on first message
                // For simplified UX, we will create one when sending the first message if it doesn't exist
                // But to subscribe, we might need it.
                // Let's create it instantly for simplicity if not exists
                const { data: newChat, error: createError } = await (supabase
                    .from('support_chats' as any)
                    .insert({ user_id: user?.id })
                    .select()
                    .single() as any);

                if (newChat) {
                    setActiveChat(newChat);
                }
            }
        } catch (error) {
            console.error('Error fetching user chat:', error);
        } finally {
            setLoading(false);
        }
    };

    // === Fetch Messages for a Chat ===
    const fetchMessages = async (chatId: string) => {
        const { data, error } = await (supabase
            .from('support_messages' as any)
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true }) as any);

        if (!error && data) {
            setMessages(data);
        }
    };

    // === Realtime Subscription ===
    useEffect(() => {
        if (!user) return;

        if (isAdmin) {
            fetchAllChats();
            // Subscribe to all new messages to update 'last_message' or 'unread'
            // For simplicity, we just refetch chats on any change to support_chats table
            const chatSubscription = supabase
                .channel('admin_chats')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats' }, () => {
                    fetchAllChats();
                })
                .subscribe();

            return () => { supabase.removeChannel(chatSubscription); };
        } else {
            fetchUserChat();
        }
    }, [user, isAdmin]);

    // Subscribe to Messages when Active Chat changes
    useEffect(() => {
        if (!activeChat) return;

        const messageSubscription = supabase
            .channel(`chat:${activeChat.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'support_messages',
                filter: `chat_id=eq.${activeChat.id}`
            }, (payload) => {
                const newMessage = payload.new as Message;
                setMessages(prev => [...prev, newMessage]);
            })
            .subscribe();

        return () => { supabase.removeChannel(messageSubscription); };
    }, [activeChat]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        let chatId = activeChat?.id;

        try {
            if (!chatId && !isAdmin) {
                // Create chat if not exists (double check safety)
                const { data: newChat, error } = await (supabase
                    .from('support_chats' as any)
                    .upsert({ user_id: user.id }, { onConflict: 'user_id' })
                    .select()
                    .single() as any);

                if (error) throw error;
                if (newChat) {
                    setActiveChat(newChat);
                    chatId = newChat.id;
                }
            }

            if (chatId) {
                const { error } = await (supabase.from('support_messages' as any).insert({
                    chat_id: chatId,
                    sender_id: user.id,
                    content: newMessage,
                    is_admin: isAdmin
                }) as any);

                if (error) throw error;

                // Update last message in chat
                await (supabase.from('support_chats' as any).update({
                    updated_at: new Date().toISOString(),
                    last_message: newMessage
                }).eq('id', chatId) as any);

                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('ส่งข้อความไม่สำเร็จ');
        }
    };

    // Select a chat (Admin only)
    const handleSelectChat = (chat: Chat) => {
        setActiveChat(chat);
        fetchMessages(chat.id);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-white w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* === LEFT SIDE: Chat List (Only for Admin) === */}
                {isAdmin && (
                    <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">รายการแชทลูกค้า</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {chats.length === 0 ? (
                                <div className="text-center text-gray-400 py-10 text-sm">ไม่มีแชทที่ใช้งานอยู่</div>
                            ) : (
                                chats.map(chat => (
                                    <button
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${activeChat?.id === chat.id ? 'bg-white shadow-md border border-[var(--primary-blue)]' : 'hover:bg-white hover:shadow-sm border border-transparent'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                            {chat.profiles?.avatar_url ? (
                                                <img src={chat.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 text-sm truncate">{chat.profiles?.full_name || 'ลูกค้า'}</div>
                                            <div className="text-xs text-gray-500 truncate">{chat.last_message || 'เริ่มการสนทนา'}</div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(chat.updated_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* === RIGHT SIDE: Chat Window === */}
                <div className={`flex-1 flex flex-col bg-white ${!activeChat && isAdmin ? 'hidden md:flex' : 'flex'}`}>

                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-500 hover:text-gray-900">
                                    ‹ กลับ
                                </button>
                            )}
                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                {isAdmin ? (
                                    activeChat ? (
                                        <>
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            {activeChat.profiles?.full_name || 'ลูกค้า'}
                                        </>
                                    ) : (
                                        <span className="text-gray-400">กรุณาเลือกแชท</span>
                                    )
                                ) : (
                                    <>
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                            <MessageCircle size={16} />
                                        </div>
                                        <span>ติดต่อสอบถาม / แจ้งปัญหา</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
                        {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/50"><RefreshCw className="animate-spin text-blue-500" /></div>}

                        {!activeChat && isAdmin ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <MessageCircle size={48} className="mb-4 opacity-20" />
                                <p>เลือกแชททางด้านซ้ายเพื่อเริ่มสนทนา</p>
                            </div>
                        ) : (
                            <>
                                {messages.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        <p>เริ่มการสนทนาได้เลย</p>
                                        <p className="text-xs mt-1">เจ้าหน้าที่จะรีบตอบกลับโดยเร็วที่สุด</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        // Logic: 
                                        // If Viewer is Admin: 
                                        //    - msg.is_admin = true (My message) -> Right
                                        //    - msg.is_admin = false (Customer) -> Left
                                        // If Viewer is User:
                                        //    - msg.sender_id = user.id (My message) -> Right
                                        //    - msg.sender_id != user.id (Admin) -> Left

                                        // NOTE: sender_id for Admin might be their personal ID, but is_admin is source of truth for Role.

                                        const isMe = isAdmin ? msg.is_admin : !msg.is_admin;

                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm ${isMe
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    {(!isAdmin || activeChat) && (
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="พิมพ์ข้อความ..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

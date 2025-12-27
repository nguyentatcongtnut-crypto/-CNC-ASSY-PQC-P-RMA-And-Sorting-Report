
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { MessageCircle, Send, X, User as UserIcon } from 'lucide-react';

interface ChatWidgetProps {
  user: User;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'System', text: 'Chào mừng bạn đến với kênh thảo luận RMA!', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: user.username,
      text: input,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {isOpen ? (
        <div className="bg-white w-80 h-96 shadow-2xl btn-square flex flex-col border border-blue-100 overflow-hidden mb-4">
          <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <MessageCircle size={16} /> THẢO LUẬN NHÓM
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 btn-square"><X size={16} /></button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === user.username ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tight">{msg.sender}</span>
                <div className={`p-2 btn-square text-sm max-w-[90%] shadow-sm ${msg.sender === user.username ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t flex gap-1 bg-white">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..." 
              className="flex-grow p-2 text-sm outline-none bg-gray-100 focus:bg-white transition input-square"
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 text-white p-2 btn-square hover:bg-blue-700 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white shadow-xl btn-square hover:bg-blue-700 transition flex items-center justify-center animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <MessageCircle size={30} />
      </button>
    </div>
  );
};

export default ChatWidget;

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const BotChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages(msgs => [...msgs, { sender: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      // Gửi đúng endpoint và body { question: ... }
      const res = await axios.post('http://localhost:8080/api/botchat', { question: text });
      setMessages(msgs => [
        ...msgs,
        { sender: 'bot', text: res.data.answer || res.data.reply || '...' }
      ]);
    } catch {
      setMessages(msgs => [
        ...msgs,
        { sender: 'bot', text: 'Bot không phản hồi. Vui lòng thử lại.' }
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Nút mở chat nổi ở góc phải dưới */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 9999,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 4px 16px #2563eb33',
            fontSize: 28,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Chat với Bot"
        >
          🤖
        </button>
      )}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 340,
          maxWidth: '95vw',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px #2563eb33',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#2563eb',
            color: '#fff',
            padding: '12px 18px',
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: 1,
            borderBottom: '1.5px solid #e0e7ef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>🤖 Bot Chat Hỗ trợ</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 22,
                cursor: 'pointer',
                marginLeft: 8
              }}
              title="Đóng"
            >
              ×
            </button>
          </div>
          <div style={{
            flex: 1,
            minHeight: 220,
            maxHeight: 320,
            overflowY: 'auto',
            padding: 12,
            background: '#f8fafc'
          }}>
            {messages.length === 0 && (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>
                Hãy nhập câu hỏi để bắt đầu trò chuyện với bot.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  margin: '8px 0',
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  background: msg.sender === 'user' ? '#2563eb' : '#e5e7eb',
                  color: msg.sender === 'user' ? '#fff' : '#222',
                  borderRadius: 16,
                  padding: '8px 14px',
                  maxWidth: '80%',
                  fontSize: 15,
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
          <form
            onSubmit={sendMessage}
            style={{
              display: 'flex',
              borderTop: '1px solid #e5e7eb',
              background: '#fff'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 10px',
                fontSize: 15,
                background: '#fff'
              }}
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '0 18px',
                fontWeight: 600,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default BotChat;

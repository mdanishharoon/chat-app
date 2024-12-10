'use client'

import { useEffect, useState, useRef } from 'react';

interface Message {
  content: string;
  sender: 'server' | 'client';
  senderId?: string; // Optional senderId for broadcasted messages
}

const Page: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:9001');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Connected to server');
      setMessages((prev) => [...prev, { content: 'Connected to server', sender: 'server' }]);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // If it's a broadcast message, include the sender's ID
      if (data.type === 'broadcast') {
        setMessages((prev) => [
          ...prev,
          {
            content: `${data.senderId}: ${data.message}`, // Show sender ID
            sender: 'server',
            senderId: data.senderId,
          },
        ]);
      } else if (data.type === 'connected') {
        setMessages((prev) => [
          ...prev,
          { content: `Your ID: ${data.id}`, sender: 'server' },
        ]);
      }
    };

    socket.onclose = () => {
      setMessages((prev) => [...prev, { content: 'Disconnected from server', sender: 'server' }]);
    };

    socket.onerror = (error) => {
      setMessages((prev) => [...prev, { content: 'Error connecting to server', sender: 'server' }]);
    };

    return () => socket.close();
  }, []);

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      socketRef.current.send(input.trim());
      setMessages((prev) => [...prev, { content: input.trim(), sender: 'client' }]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-md w-full max-w-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">WebSocket Chat</h1>
        <div className="overflow-y-auto border rounded-md h-64 p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 ${msg.sender === 'client' ? 'text-right text-blue-600' : 'text-left text-green-600'}`}
            >
              {msg.sender === 'client' ? (
                `You: ${msg.content}`
              ) : (
                <>
                  {msg.senderId && <span className="font-semibold">{msg.senderId}</span>}: {msg.content}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex mt-4">
          <input
            type="text"
            className="flex-1 border rounded-l-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;

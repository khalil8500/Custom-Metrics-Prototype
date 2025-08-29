import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onAddMessage: (sender: 'user' | 'agent', text: string, speaker: string, startTime: string, endTime: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onAddMessage }) => {
  const [inputText, setInputText] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleAdd = (sender: 'user' | 'agent') => {
    if (inputText.trim()) {
      onAddMessage(sender, inputText, speaker, startTime, endTime);
      setInputText('');
      setSpeaker('');
      setStartTime('');
      setEndTime('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAdd('user');
    }
  };
  
  return (
    <div>
        <label className="block text-lg font-semibold text-white mb-2">
            1. Build Transcript
        </label>
        <div className="bg-slate-900 border border-slate-600 rounded-md shadow-sm h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 space-y-3" aria-live="polite">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Chat transcript will appear here...</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const timeString = [msg.startTime, msg.endTime].filter(Boolean).join(' - ');
                        return (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                    <div className="flex justify-between items-baseline mb-1 text-xs">
                                        <p className="font-bold uppercase">{msg.speaker || (msg.sender === 'user' ? 'User' : 'Agent')}</p>
                                        {timeString && (
                                            <p className="opacity-70 ml-2">{timeString}</p>
                                        )}
                                    </div>
                                    <p className="text-sm break-words">{msg.text}</p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-slate-600 bg-slate-800/50 rounded-b-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <input
                        type="text"
                        value={speaker}
                        onChange={(e) => setSpeaker(e.target.value)}
                        placeholder="Speaker Name"
                        aria-label="Speaker Name"
                        className="w-full bg-slate-700 border-none rounded-md py-2 px-3 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="text"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="Start Time (e.g. 00:15)"
                        aria-label="Start Time"
                        className="w-full bg-slate-700 border-none rounded-md py-2 px-3 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="text"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="End Time (e.g. 00:22)"
                        aria-label="End Time"
                        className="w-full bg-slate-700 border-none rounded-md py-2 px-3 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type message..."
                    aria-label="New chat message"
                    className="w-full bg-slate-700 border-none rounded-md py-2 px-3 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => handleAdd('agent')} className="px-3 py-1 text-sm font-medium text-slate-200 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors">Add as Agent</button>
                    <button onClick={() => handleAdd('user')} className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors">Add as User</button>
                </div>
            </div>
        </div>
    </div>
  );
};

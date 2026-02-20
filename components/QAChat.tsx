import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, Sparkles, ThumbsUp, Copy } from 'lucide-react';
import { ChatApiResponse, ChatMessage, Language } from '../types';

const getWelcomeMessage = (lang: Language): string => (
  lang === 'zh'
    ? '您好，我是CNSC法规专家系统。我可以为您查询核安全法规、协助合规性审查或解释技术标准。请问有什么可以帮您？'
    : 'Hello, I am the CNSC Regulatory Expert System. I can help you search nuclear safety regulations, assist with compliance checks, or explain technical standards. How can I help you today?'
);

const getInputPlaceholder = (lang: Language): string => (
  lang === 'zh' ? '询问关于CNSC法规的问题...' : 'Ask a question about CNSC regulations...'
);

const getServiceErrorMessage = (lang: Language): string => (
  lang === 'zh'
    ? '暂时无法连接到知识问答服务。请稍后重试，或联系管理员检查 Dify 服务状态。'
    : 'The knowledge QA service is temporarily unavailable. Please try again later or ask an admin to check Dify service status.'
);

const getEmptyAnswerFallback = (lang: Language): string => (
  lang === 'zh'
    ? '当前未返回有效答案，请补充更具体的问题或检查知识库索引状态。'
    : 'No valid answer was returned. Please provide a more specific question or check your knowledge base indexing status.'
);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export const QAChat: React.FC<{ lang: Language }> = ({ lang }) => {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(lang),
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], content: getWelcomeMessage(lang) }];
      }
      return prev;
    });
  }, [lang]);

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Ignore clipboard write errors in unsupported/denied environments.
    }
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setRequestError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          conversationId,
        }),
      });

      const data = await response.json() as Partial<ChatApiResponse> & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      const answer = typeof data.answer === 'string' && data.answer.trim()
        ? data.answer
        : getEmptyAnswerFallback(lang);

      const aiMsg: ChatMessage = {
        id: data.messageId || `${Date.now()}-assistant`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        sources: Array.isArray(data.sources) ? data.sources : []
      };

      setMessages(prev => [...prev, aiMsg]);
      if (typeof data.conversationId === 'string' && data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown request error';
      setRequestError(message);

      const failureMsg: ChatMessage = {
        id: `${Date.now()}-assistant-error`,
        role: 'assistant',
        content: getServiceErrorMessage(lang),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, failureMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
              ${msg.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}
            `}>
              {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
            </div>
            
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`
                px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}
              `}>
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {msg.sources.map(src => (
                    <span key={src} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      <Sparkles size={12} />
                      {src}
                    </span>
                  ))}
                </div>
              )}
              
              {msg.role === 'assistant' && (
                <div className="flex gap-2 mt-2 ml-1">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => copyMessage(msg.content)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={getInputPlaceholder(lang)}
            className="w-full pl-4 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-800 placeholder:text-slate-400 text-sm shadow-inner"
            rows={2}
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Paperclip size={20} />
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          AI generated content may be inaccurate. Always verify with official documents.
        </p>
        {requestError && (
          <p className="text-center text-xs text-red-500 mt-1">Request error: {requestError}</p>
        )}
      </div>
    </div>
  );
};

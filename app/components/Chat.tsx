'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPaperPlane, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from '../contexts/ThemeContext';
import VoicePlayback from './VoicePlayback';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const sampleQuestions = [
  "What is Gemini AI?",
  "Tell me about machine learning",
  "Write a story",
  "Explain quantum computing",
];

export default function Chat() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = { role: 'user', content };
    const newMessages: Message[] = [...messages, newMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const assistantMessage: Message = { role: 'assistant', content: data.reply };
        setMessages([...newMessages, assistantMessage]);
      } else {
        console.error('Failed to get response:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="mb-5" style={{ fontSize: '2rem', fontWeight: 'normal' }}>
          <span style={{ color: theme.colors.primary }}>Вітаю</span>
          <span style={{ color: theme.colors.secondary }}>, Artem!</span>
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto px-4 pb-5 pt-2" style={{ height: 'calc(100vh - 240px)' }}>
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
          {messages.map((message, index) => (
            <div key={index} className="mb-4">
              {message.role === 'user' ? (
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3">
                    <img 
                      src="https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Felix"
                      alt="User Avatar"
                      className="rounded-circle"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div style={{ color: theme.colors.text }} className="markdown-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3">
                    <img 
                      src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Gemini"
                      alt="Assistant Avatar"
                      className="rounded-circle"
                      style={{ width: '32px', height: '32px', objectFit: 'cover', backgroundColor: theme.colors.primary }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-start">
                      <div style={{ color: theme.colors.text }} className="flex-grow-1 markdown-content">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <div className="ms-2">
                        <VoicePlayback text={message.content} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Sample Questions */}
        {messages.length === 0 && (
          <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '120px', width: '100%', maxWidth: '800px' }}>
            <div className="d-flex gap-2 justify-content-center flex-wrap px-4">
              {sampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question)}
                  className="btn border-0 px-3 py-2 m-1"
                  style={{ 
                    backgroundColor: `${theme.colors.primary}33`,
                    color: theme.colors.text,
                    borderRadius: '20px',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.primary}4D`}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.primary}33`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed-bottom p-4" style={{ backgroundColor: theme.colors.background }}>
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
          <div className="d-flex align-items-center rounded-pill" 
               style={{ backgroundColor: theme.colors.inputBackground, padding: '8px 16px' }}>
            <button className="btn btn-link p-0 me-2 d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', minWidth: '36px', color: theme.colors.text }}
                    onClick={toggleTheme}>
              <FontAwesomeIcon icon={theme.name === 'light' ? faMoon : faSun} />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Запитайте Gemini"
              className="form-control border-0 mx-2"
              style={{ 
                backgroundColor: 'transparent',
                boxShadow: 'none',
                fontSize: '16px',
                height: '36px',
                color: theme.colors.text
              }}
            />
            
            {input && (
              <button 
                className="btn btn-link p-0 d-flex align-items-center justify-content-center"
                onClick={() => setInput('')}
                style={{ width: '36px', height: '36px', minWidth: '36px', color: theme.colors.text }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
            
            <button
              className="btn btn-link p-0 d-flex align-items-center justify-content-center"
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              style={{ width: '36px', height: '36px', minWidth: '36px', color: theme.colors.text }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background-color: ${theme.colors.background};
        }
        .btn-link:hover {
          background-color: ${theme.colors.buttonHover};
          border-radius: 50%;
        }
        .btn-link {
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        .form-control:focus {
          background-color: transparent;
          color: ${theme.colors.text};
        }
        .form-control::placeholder {
          color: ${theme.colors.text}80;
        }
        .btn-link:disabled {
          opacity: 0.5;
        }
        .markdown-content {
          line-height: 1.5;
        }
        .markdown-content p {
          margin-bottom: 1rem;
        }
        .markdown-content strong {
          font-weight: 600;
        }
        .markdown-content em {
          font-style: italic;
        }
        .markdown-content code {
          background-color: ${theme.colors.buttonHover};
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
        .markdown-content pre {
          background-color: ${theme.colors.buttonHover};
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
} 
'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPaperPlane, faSun, faMoon, faSpinner, faUser, faRobot, faImage } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from '../contexts/ThemeContext';
import VoicePlayback from './VoicePlayback';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string; // Base64 encoded image or URL
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() && !selectedImage) return;

    const newMessage: Message = { 
      role: 'user', 
      content: content.trim(), // Remove default text for image-only messages
      ...(selectedImage && { image: selectedImage })
    };
    const newMessages: Message[] = [...messages, newMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
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
          <span style={{ color: theme.colors.primary }}>Hello, </span>
          <span style={{ color: theme.colors.secondary }}>Shrek!</span>
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto px-4 pb-5 pt-2" style={{ height: 'calc(100vh - 240px)' }}>
        <div className="chat-container mx-auto" style={{ maxWidth: '800px' }}>
          {messages.map((message, index) => (
            <div key={index} className="mb-4">
              {message.role === 'user' ? (
                <div className="d-flex align-items-start mb-4 flex-row-reverse">
                  <div className="ms-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: theme.colors.inputBackground,
                        border: `1px solid ${theme.colors.buttonHover}`
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={faUser} 
                        style={{ 
                          color: theme.colors.text,
                          fontSize: '16px'
                        }} 
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 d-flex justify-content-end">
                    <div 
                      style={{ 
                        color: theme.colors.text,
                        backgroundColor: theme.colors.inputBackground,
                        padding: '8px 16px',
                        borderRadius: '16px',
                        maxWidth: '100%',
                        fontSize: '14px'
                      }} 
                      className="markdown-content"
                    >
                      {message.image && (
                        <div className="mb-2">
                          <img 
                            src={message.image} 
                            alt="Uploaded content"
                            style={{ 
                              maxWidth: '100%', 
                              height: 'auto',
                              borderRadius: '8px'
                            }} 
                          />
                        </div>
                      )}
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: theme.colors.primary,
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={faRobot} 
                        style={{ 
                          color: theme.colors.background,
                          fontSize: '16px'
                        }} 
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-start">
                      <div 
                        style={{ 
                          color: theme.colors.text,
                          backgroundColor: theme.colors.primary + '33',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          maxWidth: '100%',
                          fontSize: '14px'
                        }} 
                        className="markdown-content"
                      >
                        <ReactMarkdown 
                          components={{
                            code({node, inline, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <div style={{ 
                                  backgroundColor: theme.colors.inputBackground,
                                  padding: '12px',
                                  borderRadius: '8px',
                                  overflowX: 'auto',
                                  marginTop: '8px',
                                  marginBottom: '8px'
                                }}>
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </div>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
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
          {isLoading && (
            <div className="d-flex align-items-start mb-4">
              <div className="me-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  <FontAwesomeIcon 
                    icon={faRobot} 
                    style={{ 
                      color: theme.colors.background,
                      fontSize: '16px'
                    }} 
                  />
                </div>
              </div>
              <div className="flex-grow-1">
                <div 
                  className="d-flex align-items-center" 
                  style={{ 
                    color: theme.colors.text,
                    backgroundColor: theme.colors.primary + '33',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    maxWidth: 'fit-content',
                    fontSize: '14px'
                  }}
                >
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
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
                  }}
                  onMouseEnter={() => {
                    const button = document.querySelector(`button[data-question="${question}"]`) as HTMLButtonElement;
                    if (button) {
                      button.style.backgroundColor = `${theme.colors.primary}4D`;
                    }
                  }}
                  onMouseLeave={() => {
                    const button = document.querySelector(`button[data-question="${question}"]`) as HTMLButtonElement;
                    if (button) {
                      button.style.backgroundColor = `${theme.colors.primary}33`;
                    }
                  }}
                  data-question={question}
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
        <div className="chat-container mx-auto" style={{ maxWidth: '800px' }}>
          {selectedImage && (
            <div 
              className="mb-2 position-relative" 
              style={{ 
                maxWidth: '200px',
                marginLeft: '60px'
              }}
            >
              <img 
                src={selectedImage} 
                alt="Selected" 
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.buttonHover}`
                }} 
              />
              <button
                className="position-absolute btn btn-link p-0 d-flex align-items-center justify-content-center"
                onClick={() => setSelectedImage(null)}
                style={{ 
                  backgroundColor: `${theme.colors.buttonHover}CC`,
                  borderRadius: '50%',
                  top: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  minWidth: '20px',
                  border: 'none'
                }}
              >
                <FontAwesomeIcon 
                  icon={faXmark} 
                  style={{ 
                    fontSize: '12px', 
                    color: theme.colors.text,
                    lineHeight: 1
                  }} 
                />
              </button>
            </div>
          )}
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
              placeholder={selectedImage ? "Add a message or send image directly" : "Запитайте Gemini"}
              className="form-control border-0 mx-2"
              style={{ 
                backgroundColor: 'transparent',
                boxShadow: 'none',
                fontSize: '16px',
                height: '36px',
                color: theme.colors.text
              }}
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button 
              className="btn btn-link p-0 me-2 d-flex align-items-center justify-content-center"
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '36px', height: '36px', minWidth: '36px', color: theme.colors.text }}
            >
              <FontAwesomeIcon icon={faImage} />
            </button>
            
            {(input || selectedImage) && (
              <button 
                className="btn btn-link p-0 me-2 d-flex align-items-center justify-content-center"
                onClick={() => {
                  setInput('');
                  setSelectedImage(null);
                }}
                style={{ width: '36px', height: '36px', minWidth: '36px', color: theme.colors.text }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
            
            <button
              className="btn btn-link p-0 d-flex align-items-center justify-content-center"
              onClick={() => sendMessage(input)}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              style={{ 
                width: '36px', 
                height: '36px', 
                minWidth: '36px', 
                color: theme.colors.text,
                opacity: (!input.trim() && !selectedImage) || isLoading ? 0.5 : 1
              }}
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
        .chat-container {
          width: 100%;
          max-width: 800px;
          padding: 0 60px;
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
          margin-bottom: 0;
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
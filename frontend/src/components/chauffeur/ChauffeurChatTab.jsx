import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Trash2, Image as ImageIcon, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const POLL_INTERVAL_MS = 4000;

const ChauffeurChatTab = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const selectedBookingIdRef = useRef(null);
  selectedBookingIdRef.current = selectedBookingId;

  const getToken = () => localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');

  useEffect(() => {
    fetchRides();
    
    // Check if there's a booking ID stored from ride management
    const storedBookingId = localStorage.getItem('chatBookingId');
    if (storedBookingId) {
      localStorage.removeItem('chatBookingId');
      // Set it after a short delay to ensure rides are loaded
      setTimeout(() => {
        setSelectedBookingId(storedBookingId);
      }, 500);
    }
    
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedBookingId) {
      setConversation(null);
      setMessages([]);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    openConversation(selectedBookingId);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedBookingId]);

  const fetchRides = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chauffeur/dashboard/chat/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const chatEligible = data.data.filter((r) =>
          ['confirmed', 'assigned', 'in-progress'].includes(r.status)
        );
        setRides(chatEligible);
      }
    } catch (err) {
      console.error('Fetch rides for chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (bookingId) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/chauffeur/dashboard/chat/conversations/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversation(data.data);
        await fetchMessages(bookingId);
        if (!pollRef.current) {
          pollRef.current = setInterval(() => {
            const id = selectedBookingIdRef.current;
            if (id) fetchMessages(id);
          }, POLL_INTERVAL_MS);
        }
      }
    } catch (err) {
      console.error('Open conversation error:', err);
    }
  };

  const fetchMessages = async (bookingId) => {
    const token = getToken();
    if (!token || !bookingId) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/chauffeur/dashboard/chat/conversations/${bookingId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
        alert('Only image files (.png, .jpg, .jpeg, .gif, .webp) are allowed');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        alert('Error reading image file');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || !selectedBookingId || sending) return;
    const token = getToken();
    if (!token) return;
    setSending(true);
    const content = inputValue.trim();
    setInputValue('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const formData = new FormData();
      if (content) {
        formData.append('content', content);
      }
      if (imageToSend) {
        formData.append('image', imageToSend);
      }

      const res = await fetch(
        `${API_BASE}/api/chauffeur/dashboard/chat/conversations/${selectedBookingId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type for FormData, browser will set it with boundary
          },
          body: formData,
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }
      
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
      } else {
        const errorMsg = data.message || 'Failed to send message';
        alert(errorMsg);
        setInputValue(content);
        if (imageToSend) {
          setSelectedImage(imageToSend);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(imageToSend);
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert(err.message || 'Failed to send message. Please try again.');
      setInputValue(content);
      if (imageToSend) {
        setSelectedImage(imageToSend);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(imageToSend);
      }
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedBookingId || deleting) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently deleted.'
    );
    
    if (!confirmed) return;
    
    const token = getToken();
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }
    
    setDeleting(true);
    try {
      console.log('🗑️ Deleting conversation for booking:', selectedBookingId);
      const url = `${API_BASE}/api/chauffeur/dashboard/chat/conversations/${selectedBookingId}`;
      console.log('🗑️ DELETE URL:', url);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🗑️ Response status:', res.status);
      console.log('🗑️ Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('🗑️ Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.message || `Failed to delete conversation (${res.status})`);
        } catch (e) {
          alert(`Failed to delete conversation. Server returned status ${res.status}`);
        }
        return;
      }
      
      const data = await res.json();
      console.log('🗑️ Response data:', data);
      
      if (data.success) {
        // Clear current conversation
        setSelectedBookingId(null);
        setConversation(null);
        setMessages([]);
        // Refresh rides list to remove deleted conversation
        await fetchRides();
        alert('Conversation deleted successfully');
      } else {
        alert(data.message || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('🗑️ Delete conversation error:', err);
      alert(`Error deleting conversation: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedRide = rides.find((r) => r._id === selectedBookingId);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #eee', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-tab" style={{ padding: '1rem 0' }}>
      <div className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '480px', border: '1px solid #e9ecef', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <div className="chat-sidebar" style={{ borderRight: '1px solid #e9ecef', padding: 16, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 14, margin: '0 0 12px 0', color: '#6c757d', textTransform: 'uppercase' }}>Rides (chat)</h3>
          {rides.length === 0 ? (
            <p style={{ fontSize: 14, color: '#6c757d', margin: 0 }}>No confirmed or assigned rides. Chat will appear here when you have rides to chat about.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {rides.map((r) => (
                <li
                  key={r._id}
                  onClick={() => setSelectedBookingId(r._id)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 4,
                    cursor: 'pointer',
                    background: selectedBookingId === r._id ? 'rgba(212,175,55,0.15)' : undefined,
                    borderLeft: selectedBookingId === r._id ? '3px solid #d4af37' : undefined,
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 14 }}>{r.bookingReference || '—'}</strong>
                  <span style={{ fontSize: 12, color: '#6c757d' }}>
                    {r.customer ? `${r.customer.firstName || ''} ${r.customer.lastName || ''}`.trim() || 'Customer' : 'Customer'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="chat-main" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {!selectedBookingId ? (
            <div className="chat-placeholder" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', padding: 24 }}>
              <MessageCircle size={64} />
              <p style={{ marginTop: 12 }}>Select a conversation to chat with the customer.</p>
            </div>
          ) : (
            <>
              <div className="chat-header" style={{ padding: 16, borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 18 }}>{selectedRide?.bookingReference || selectedBookingId}</h2>
                  {conversation?.customer && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#6c757d' }}>
                      {conversation.customer.profileImage ? (
                        <img 
                          src={conversation.customer.profileImage.startsWith('http') || conversation.customer.profileImage.startsWith('data:') 
                            ? conversation.customer.profileImage 
                            : `${API_BASE}/${conversation.customer.profileImage.replace(/^\//, '')}`}
                          alt={`${conversation.customer.firstName} ${conversation.customer.lastName}`}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #d4af37'
                          }}
                        />
                      ) : (
                        <User size={16} />
                      )}
                      {conversation.customer.firstName} {conversation.customer.lastName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDeleteConversation}
                  disabled={deleting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    background: deleting ? '#f1f3f5' : '#fff',
                    color: deleting ? '#adb5bd' : '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) {
                      e.target.style.background = '#dc3545';
                      e.target.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deleting) {
                      e.target.style.background = '#fff';
                      e.target.style.color = '#dc3545';
                    }
                  }}
                  title="Delete conversation"
                >
                  <Trash2 size={16} />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((m) => (
                  <div
                    key={m._id}
                    style={{
                      maxWidth: '75%',
                      alignSelf: m.senderType === 'chauffeur' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        padding: m.content ? '10px 14px' : '0',
                        borderRadius: 12,
                        fontSize: 14,
                        background: m.content ? (m.senderType === 'chauffeur' ? 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)' : '#f1f3f5') : 'transparent',
                        color: '#1a1a1a',
                      }}
                    >
                      {m.imageUrl && (
                        <div style={{ marginBottom: m.content ? 8 : 0 }}>
                          <img 
                            src={`${API_BASE}${m.imageUrl}`} 
                            alt="Chat image" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '300px', 
                              borderRadius: 8,
                              cursor: 'pointer',
                              display: 'block'
                            }}
                            onClick={() => window.open(`${API_BASE}${m.imageUrl}`, '_blank')}
                          />
                        </div>
                      )}
                      {m.content && m.content.trim() && <div>{m.content}</div>}
                    </div>
                    <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 4, textAlign: m.senderType === 'chauffeur' ? 'right' : 'left' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {imagePreview && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #e9ecef', position: 'relative' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: 8, display: 'block' }}
                    />
                    <button 
                      type="button" 
                      onClick={removeImage}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#dc3545',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
              <form
                onSubmit={sendMessage}
                style={{ display: 'flex', gap: 8, padding: 16, borderTop: '1px solid #e9ecef' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  id="chauffeur-chat-image-input"
                />
                <label 
                  htmlFor="chauffeur-chat-image-input" 
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1px solid #dee2e6',
                    background: '#fff',
                    color: '#6c757d',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.borderColor = '#d4af37';
                    e.target.style.color = '#d4af37';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.color = '#6c757d';
                  }}
                  title="Upload image"
                >
                  <ImageIcon size={20} />
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={2000}
                  disabled={sending}
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid #dee2e6', borderRadius: 24, fontSize: 14 }}
                />
                <button
                  type="submit"
                  disabled={sending || (!inputValue.trim() && !selectedImage)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChauffeurChatTab;

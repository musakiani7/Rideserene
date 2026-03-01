import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Car, Trash2, Image as ImageIcon, X } from 'lucide-react';
import './DashboardTabs.css';
import './ChatTab.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const POLL_INTERVAL_MS = 4000;

const ChatTab = () => {
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
  const selectedBookingIdRef = useRef(selectedBookingId);
  selectedBookingIdRef.current = selectedBookingId;

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    fetchRides();
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
      // Fetch both upcoming rides and ride history to include in-progress rides
      const [upcomingRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/upcoming-rides`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/dashboard/ride-history?page=1&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      const [upcomingData, historyData] = await Promise.all([
        upcomingRes.json(),
        historyRes.json(),
      ]);
      
      // Combine rides from both sources
      const allRides = [
        ...(upcomingData.success && Array.isArray(upcomingData.data) ? upcomingData.data : []),
        ...(historyData.success && Array.isArray(historyData.data) ? historyData.data : []),
      ];
      
      // Filter for rides with chauffeur and eligible status, remove duplicates
      const uniqueRides = Array.from(
        new Map(allRides.map(r => [r._id, r])).values()
      );
      
      const withChauffeur = uniqueRides.filter(
        (r) => r.chauffeur && ['confirmed', 'assigned', 'in-progress'].includes(r.status)
      );
      
      setRides(withChauffeur);
      
      // Auto-select booking if stored
      const storedBookingId = localStorage.getItem('chatBookingId');
      if (storedBookingId && withChauffeur.some(r => r._id === storedBookingId)) {
        setSelectedBookingId(storedBookingId);
        localStorage.removeItem('chatBookingId');
      }
    } catch (err) {
      console.error('Chat fetch rides error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (bookingId) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/chat/conversations/${bookingId}`, {
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
      const res = await fetch(`${API_BASE}/api/dashboard/chat/conversations/${bookingId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        `${API_BASE}/api/dashboard/chat/conversations/${selectedBookingId}/messages`,
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
      const url = `${API_BASE}/api/dashboard/chat/conversations/${selectedBookingId}`;
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
      <div className="tab-loading">
        <div className="spinner" />
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-tab">
      <div className="tab-header">
        <div>
          <h1>Chat</h1>
          <p>Message your chauffeur once the ride is confirmed.</p>
        </div>
      </div>

      <div className="chat-layout">
        <div className="chat-sidebar">
          <div className="chat-sidebar-title">
            <div className="icon-wrap">
              <Car size={18} strokeWidth={2} />
            </div>
            <span>Active rides</span>
          </div>
          {rides.length === 0 ? (
            <p className="chat-empty-sidebar">No confirmed rides with an assigned chauffeur. Chat will appear here.</p>
          ) : (
            <ul className="chat-ride-list">
              {rides.map((r) => (
                <li
                  key={r._id}
                  className={`chat-ride-item ${selectedBookingId === r._id ? 'active' : ''}`}
                  onClick={() => setSelectedBookingId(r._id)}
                >
                  <strong>{r.bookingReference}</strong>
                  <span className="chat-ride-meta">
                    {r.chauffeur ? `${r.chauffeur.firstName} ${r.chauffeur.lastName}` : '—'} ·{' '}
                    {new Date(r.pickupDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="chat-main">
          {!selectedBookingId ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder-icon">
                <MessageCircle size={40} strokeWidth={1.5} />
              </div>
              <p>Select a ride to start chatting with your chauffeur.</p>
            </div>
          ) : (
            <>
              <div className="chat-conversation-header">
                <div>
                  <h2>{selectedRide?.bookingReference || selectedBookingId}</h2>
                  {conversation?.chauffeur && (
                    <span className="chat-with" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {conversation.chauffeur.profilePicture ? (
                        <img 
                          src={conversation.chauffeur.profilePicture.startsWith('http') || conversation.chauffeur.profilePicture.startsWith('data:') 
                            ? conversation.chauffeur.profilePicture 
                            : `${API_BASE}/${conversation.chauffeur.profilePicture.replace(/^\//, '')}`}
                          alt={`${conversation.chauffeur.firstName} ${conversation.chauffeur.lastName}`}
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
                      {conversation.chauffeur.firstName} {conversation.chauffeur.lastName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDeleteConversation}
                  disabled={deleting}
                  className="chat-delete-btn"
                  title="Delete conversation"
                >
                  <Trash2 size={18} />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <div className="chat-messages">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`chat-bubble ${m.senderType === 'customer' ? 'sent' : 'received'}`}
                  >
                    {m.imageUrl && (
                      <div className="chat-image-container">
                        <img 
                          src={`${API_BASE}${m.imageUrl}`} 
                          alt="Chat image" 
                          className="chat-message-image"
                          onClick={() => window.open(`${API_BASE}${m.imageUrl}`, '_blank')}
                        />
                      </div>
                    )}
                    {m.content && m.content.trim() && (
                      <div className="chat-bubble-content">{m.content}</div>
                    )}
                    <div className="chat-bubble-time">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {imagePreview && (
                <div className="chat-image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button type="button" onClick={removeImage} className="chat-remove-image">
                    <X size={18} />
                  </button>
                </div>
              )}
              <form className="chat-input-form" onSubmit={sendMessage}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  id="chat-image-input"
                />
                <label htmlFor="chat-image-input" className="chat-image-btn" title="Upload image">
                  <ImageIcon size={20} />
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={2000}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || (!inputValue.trim() && !selectedImage)}>
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

export default ChatTab;

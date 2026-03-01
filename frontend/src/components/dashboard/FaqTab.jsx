import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './DashboardTabs.css';

const CATEGORY_LABELS = {
  booking: 'Booking',
  payments: 'Payments',
  cancellations: 'Cancellations & Refunds',
  account: 'Account',
  general: 'General',
};

const FaqTab = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_BASE}/api/dashboard/faq`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFaqs(data.data || []);
      })
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const byCategory = faqs.reduce((acc, faq) => {
    const cat = faq.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const order = ['booking', 'payments', 'cancellations', 'account', 'general'];

  if (loading) {
    return (
      <div className="tab-loading">
        <div className="spinner" />
        <p>Loading help & FAQ...</p>
      </div>
    );
  }

  return (
    <div className="faq-tab">
      <div className="tab-header">
        <div>
          <h1>Booking Help / FAQ</h1>
          <p>Common questions and answers about bookings, payments and support.</p>
        </div>
      </div>

      {faqs.length === 0 ? (
        <div className="empty-state">
          <HelpCircle size={64} />
          <h3>No FAQ available</h3>
          <p>Check back later or contact support for help.</p>
        </div>
      ) : (
        <div className="faq-sections">
          {order.map((cat) => {
            const items = byCategory[cat];
            if (!items || items.length === 0) return null;
            return (
              <section key={cat} className="faq-section">
                <h2 className="faq-category-title">{CATEGORY_LABELS[cat] || cat}</h2>
                <div className="faq-list">
                  {items.map((faq) => {
                    const isOpen = openId === faq._id;
                    return (
                      <div key={faq._id} className="faq-item">
                        <button
                          type="button"
                          className="faq-question"
                          onClick={() => setOpenId(isOpen ? null : faq._id)}
                        >
                          <span>{faq.question}</span>
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {isOpen && (
                          <div className="faq-answer">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <style>{`
        .faq-sections { display: flex; flex-direction: column; gap: 32px; }
        .faq-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e9ecef; }
        .faq-category-title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid rgba(212,175,55,0.3); }
        .faq-list { display: flex; flex-direction: column; gap: 8px; }
        .faq-item { border: 1px solid #e9ecef; border-radius: 10px; overflow: hidden; }
        .faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #f8f9fa; border: none; font-size: 15px; font-weight: 600; color: #1a1a1a; text-align: left; cursor: pointer; transition: background 0.2s; }
        .faq-question:hover { background: rgba(212,175,55,0.1); }
        .faq-answer { padding: 16px; background: white; font-size: 14px; line-height: 1.6; color: #495057; border-top: 1px solid #e9ecef; }
      `}</style>
    </div>
  );
};

export default FaqTab;

import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Gift, DollarSign, X } from 'lucide-react';
import './DashboardTabs.css';

const PaymentsTab = ({ customer }) => {
  const [cards, setCards] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addingMoney, setAddingMoney] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });

  useEffect(() => {
    fetchPaymentMethods();
    fetchAvailablePromos();
  }, []);

  const fetchPaymentMethods = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCards(data.data);
      }
    } catch (error) {
      console.error('Fetch payment methods error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePromos = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/promo-codes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAvailablePromos(data.data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/payment-methods/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the payment methods list
        fetchPaymentMethods();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete card');
      }
    } catch (error) {
      console.error('Delete card error:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setSavingCard(true);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Extract last 4 digits of card number
    const cleanCardNumber = cardForm.cardNumber.replace(/\s/g, '');
    const last4 = cleanCardNumber.slice(-4);
    
    // Determine card brand from first digit
    const firstDigit = cleanCardNumber.charAt(0);
    let cardBrand = 'Card';
    if (firstDigit === '4') cardBrand = 'Visa';
    else if (firstDigit === '5') cardBrand = 'Mastercard';
    else if (firstDigit === '3') cardBrand = 'Amex';
    else if (firstDigit === '6') cardBrand = 'Discover';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stripePaymentMethodId: `pm_${Date.now()}`, // Mock payment method ID
          cardBrand: cardBrand,
          last4: last4,
          expiryMonth: parseInt(cardForm.expiryMonth),
          expiryYear: parseInt(cardForm.expiryYear),
          isDefault: cardForm.isDefault || cards.length === 0
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the payment methods list
        fetchPaymentMethods();
        
        // Close modal and reset form
        setShowAddCardModal(false);
        setCardForm({
          cardNumber: '',
          cardholderName: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          isDefault: false
        });
      } else {
        alert(data.message || 'Failed to add card');
      }
    } catch (error) {
      console.error('Add card error:', error);
      alert('Failed to add card. Please try again.');
    } finally {
      setSavingCard(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setAddingMoney(true);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/wallet/add-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(walletAmount),
          paymentMethod: 'card',
          referenceId: `TXN_${Date.now()}`
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully added $${walletAmount} to your wallet!`);
        setShowAddMoneyModal(false);
        setWalletAmount('');
        // Refresh the page to show updated balance
        window.location.reload();
      } else {
        alert(data.message || 'Failed to add money');
      }
    } catch (error) {
      console.error('Add money error:', error);
      alert('Failed to add money. Please try again.');
    } finally {
      setAddingMoney(false);
    }
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoResult({
        success: false,
        message: 'Please enter a promo code'
      });
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      console.log('Validating promo code:', promoCode);
      const response = await fetch(`${API_BASE}/api/dashboard/validate-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoCode,
          amount: 100
        })
      });

      const data = await response.json();
      console.log('Promo validation response:', data);
      setPromoResult(data);
      
      // Clear result after 5 seconds
      setTimeout(() => setPromoResult(null), 5000);
    } catch (error) {
      console.error('Validate promo error:', error);
      setPromoResult({
        success: false,
        message: 'Failed to validate promo code'
      });
    }
  };

  if (loading) {
    return <div className="tab-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="payments-tab">
      <div className="tab-header">
        <h1>Payments & Wallet</h1>
      </div>

      {/* Wallet Section */}
      <div className="wallet-section">
        <div className="wallet-card">
          <div className="wallet-icon">
            <DollarSign size={32} />
          </div>
          <div className="wallet-info">
            <p className="wallet-label">Wallet Balance</p>
            <h2 className="wallet-balance">
              $
              {typeof customer?.wallet?.balance === 'number'
                ? Math.round(customer.wallet.balance)
                : '0'}
            </h2>
          </div>
          <button className="btn-add-funds" onClick={() => setShowAddMoneyModal(true)}>
            <Plus size={18} />
            Add Funds
          </button>
        </div>
      </div>

      {/* Saved Cards */}
      <div className="section">
        <div className="section-header">
          <h2>Saved Payment Methods</h2>
          <button className="btn-add" onClick={() => setShowAddCardModal(true)}>
            <Plus size={18} />
            Add Card
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="empty-state-small">
            <CreditCard size={48} />
            <p>No saved payment methods</p>
          </div>
        ) : (
          <div className="cards-grid">
            {cards.map((card) => (
              <div key={card._id} className="payment-card">
                <div className="card-header">
                  <CreditCard size={24} />
                  {card.isDefault && <span className="default-badge">Default</span>}
                </div>
                <div className="card-body">
                  <p className="card-brand">{card.cardBrand.toUpperCase()}</p>
                  <p className="card-number">•••• •••• •••• {card.last4}</p>
                  <p className="card-expiry">Expires {card.expiryMonth}/{card.expiryYear}</p>
                </div>
                <div className="card-footer">
                  <button 
                    className="btn-delete-card"
                    onClick={() => handleDeleteCard(card._id)}
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promo Codes */}
      <div className="section">
        <div className="section-header">
          <h2>Promo Codes</h2>
        </div>

        <div className="promo-section">
          <div className="promo-input-group">
            <Gift size={20} />
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <button className="btn-apply" onClick={handleValidatePromo}>
              Apply
            </button>
          </div>

          {promoResult && (
            <div className={`promo-result ${promoResult.success ? 'success' : 'error'}`}>
              {promoResult.success ? (
                <>
                  <p>✓ Promo code applied!</p>
                  <p>{promoResult.data.description}</p>
                  <p>Discount: ${promoResult.data.discount}</p>
                </>
              ) : (
                <p>✗ {promoResult.message}</p>
              )}
            </div>
          )}

          {/* Available Promo Codes */}
          {availablePromos.length > 0 && (
            <div className="available-promos">
              <h3>Available Promo Codes</h3>
              <div className="promo-cards">
                {availablePromos.map((promo) => (
                  <div key={promo._id} className="promo-card">
                    <div className="promo-header">
                      <span className="promo-code">{promo.code}</span>
                      <span className="promo-discount">
                        {promo.discountType === 'percentage' 
                          ? `${promo.discountValue}% OFF`
                          : `$${promo.discountValue} OFF`}
                      </span>
                    </div>
                    <p className="promo-description">{promo.description}</p>
                    <div className="promo-details">
                      {promo.minAmount > 0 && (
                        <span>Min: ${promo.minAmount}</span>
                      )}
                      {promo.maxDiscount > 0 && promo.discountType === 'percentage' && (
                        <span>Max: ${promo.maxDiscount}</span>
                      )}
                      <span className="promo-expiry">
                        Valid until: {new Date(promo.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      className="btn-use-code"
                      onClick={async () => {
                        setPromoCode(promo.code);
                        // Wait for state to update, then validate
                        setTimeout(handleValidatePromo, 100);
                      }}
                    >
                      Use Code
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="modal-overlay" onClick={() => setShowAddCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Payment Card</h2>
              <button className="modal-close" onClick={() => setShowAddCardModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddCard}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardForm.cardholderName}
                    onChange={(e) => setCardForm({...cardForm, cardholderName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      if (value.length <= 16) {
                        setCardForm({...cardForm, cardNumber: value});
                      }
                    }}
                    maxLength="19"
                    required
                  />
                  <small>Enter 16-digit card number</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Month</label>
                    <select
                      value={cardForm.expiryMonth}
                      onChange={(e) => setCardForm({...cardForm, expiryMonth: e.target.value})}
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Expiry Year</label>
                    <select
                      value={cardForm.expiryYear}
                      onChange={(e) => setCardForm({...cardForm, expiryYear: e.target.value})}
                      required
                    >
                      <option value="">YYYY</option>
                      {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setCardForm({...cardForm, cvv: value});
                        }
                      }}
                      maxLength="4"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={cardForm.isDefault}
                      onChange={(e) => setCardForm({...cardForm, isDefault: e.target.checked})}
                    />
                    <span>Set as default payment method</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddCardModal(false)}
                  disabled={savingCard}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={savingCard}
                >
                  {savingCard ? (
                    <>
                      <div className="spinner-small"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Card'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal-overlay" onClick={() => setShowAddMoneyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Money to Wallet</h2>
              <button className="modal-close" onClick={() => setShowAddMoneyModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddMoney}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Amount</label>
                  <div className="amount-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="quick-amounts">
                  <p>Quick amounts:</p>
                  <div className="amount-buttons">
                    <button type="button" onClick={() => setWalletAmount('50')}>$50</button>
                    <button type="button" onClick={() => setWalletAmount('100')}>$100</button>
                    <button type="button" onClick={() => setWalletAmount('200')}>$200</button>
                    <button type="button" onClick={() => setWalletAmount('500')}>$500</button>
                  </div>
                </div>

                <div className="info-box">
                  <p>Money will be added to your wallet instantly and can be used for bookings.</p>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddMoneyModal(false)}
                  disabled={addingMoney}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={addingMoney}
                >
                  {addingMoney ? (
                    <>
                      <div className="spinner-small"></div>
                      Processing...
                    </>
                  ) : (
                    'Add Money'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;

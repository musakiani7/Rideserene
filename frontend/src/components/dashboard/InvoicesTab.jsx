import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, MapPin, Car } from 'lucide-react';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';
import './DashboardTabs.css';

const InvoicesTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  const fetchInvoices = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/dashboard/invoices?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data || []);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (ride) => {
    try {
      generateInvoicePDF(ride);
    } catch (error) {
      console.error('Invoice error:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="tab-loading">
        <div className="spinner" />
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="invoices-tab">
      <div className="tab-header">
        <div>
          <h1>Download Invoice (PDF)</h1>
          <p>Completed rides with downloadable PDF invoices.</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} />
          <h3>No invoices yet</h3>
          <p>Invoices are available for completed rides. Complete a ride to see it here.</p>
        </div>
      ) : (
        <>
          <div className="history-list">
            {invoices.map((ride) => (
              <div key={ride._id} className="history-card">
                <div className="history-header">
                  <div className="history-ref">
                    <FileText size={18} />
                    <strong>{ride.bookingReference}</strong>
                  </div>
                  <span className="status-badge status-completed">completed</span>
                </div>
                <div className="history-body">
                  <div className="history-date">
                    <Calendar size={16} />
                    <span>
                      {new Date(ride.pickupDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {ride.pickupTime}
                    </span>
                  </div>
                  <div className="history-route">
                    <div className="route-item">
                      <MapPin size={16} className="icon-pickup" />
                      <div>
                        <span className="route-label">Pickup</span>
                        <span className="route-address">{ride.pickupLocation?.address || 'N/A'}</span>
                      </div>
                    </div>
                    {ride.dropoffLocation?.address && (
                      <div className="route-item">
                        <MapPin size={16} className="icon-dropoff" />
                        <div>
                          <span className="route-label">Drop-off</span>
                          <span className="route-address">{ride.dropoffLocation.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="history-vehicle">
                    <Car size={16} />
                    <span>
                      {ride.vehicleClass?.name || 'N/A'} - {ride.vehicleClass?.vehicle || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="history-footer">
                  <div className="history-price">
                    <span className="price-label">Total</span>
                    <span className="price-value">${(ride.totalPrice || 0).toFixed(2)}</span>
                  </div>
                  <button
                    className="btn-download"
                    onClick={() => handleDownloadPDF(ride)}
                  >
                    <Download size={16} />
                    Download Invoice (PDF)
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-page"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button
                className="btn-page"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvoicesTab;

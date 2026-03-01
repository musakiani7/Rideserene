import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users,
  UserCheck,
  DollarSign,
  Tag,
  HeadphonesIcon,
  LogOut,
  Menu,
  X,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  TrendingUp,
  Search,
  Filter,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  Package,
} from 'lucide-react';
import './AdminDashboard.css';
import './AdminDashboard-responsive.css';

// Chauffeurs Tab Component
const ChauffeursTab = () => {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Helper function to construct proper image/document URLs
  const getDocumentUrl = (path) => {
    if (!path) return '';
    // If it's a base64 data URL, return as is
    if (path.startsWith('data:')) return path;
    // If it's already a full URL, return as is
    if (path.startsWith('http')) return path;
    // Remove leading slash if present and construct the URL
    const cleanPath = path.replace(/^\//, '');
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  const fetchChauffeurs = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = filter 
        ? `${import.meta.env.VITE_API_URL}/api/admin/chauffeurs?status=${filter}`
        : `${import.meta.env.VITE_API_URL}/api/admin/chauffeurs`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setChauffeurs(data.data);
      }
    } catch (error) {
      console.error('Error fetching chauffeurs:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchChauffeurs();
  }, [fetchChauffeurs]);

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this chauffeur?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/chauffeurs/${id}/approve`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert('Chauffeur approved successfully! They can now login.');
        fetchChauffeurs();
      }
    } catch (error) {
      console.error('Error approving chauffeur:', error);
      alert('Failed to approve chauffeur');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/chauffeurs/${id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        alert('Chauffeur application rejected');
        fetchChauffeurs();
      }
    } catch (error) {
      console.error('Error rejecting chauffeur:', error);
      alert('Failed to reject chauffeur');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading chauffeurs...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Chauffeur Applications</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '2px solid #e0e0e0',
            fontSize: '0.95rem',
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {chauffeurs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          No chauffeur applications found
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>License</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Applied</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chauffeurs.map((chauffeur) => (
                <tr key={chauffeur._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>
                    {chauffeur.firstName} {chauffeur.lastName}
                  </td>
                  <td style={{ padding: '1rem' }}>{chauffeur.email}</td>
                  <td style={{ padding: '1rem' }}>{chauffeur.phone}</td>
                  <td style={{ padding: '1rem' }}>{chauffeur.licenseNumber || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background:
                          chauffeur.status === 'approved'
                            ? 'rgba(76, 175, 80, 0.1)'
                            : chauffeur.status === 'rejected'
                            ? 'rgba(244, 67, 54, 0.1)'
                            : 'rgba(255, 152, 0, 0.1)',
                        color:
                          chauffeur.status === 'approved'
                            ? '#4caf50'
                            : chauffeur.status === 'rejected'
                            ? '#f44336'
                            : '#ff9800',
                      }}
                    >
                      {chauffeur.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(chauffeur.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {chauffeur.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(chauffeur._id)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(76, 175, 80, 0.1)',
                              color: '#4caf50',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(chauffeur._id)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(244, 67, 54, 0.1)',
                              color: '#f44336',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedChauffeur(chauffeur);
                          setShowModal(true);
                        }}
                        style={{
                          padding: '0.5rem',
                          background: 'rgba(212, 175, 55, 0.1)',
                          color: '#d4af37',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedChauffeur && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '2rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Chauffeur Application Details</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>

            {/* Personal Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong>First Name:</strong> {selectedChauffeur.firstName}
                </div>
                <div>
                  <strong>Last Name:</strong> {selectedChauffeur.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedChauffeur.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedChauffeur.countryCode} {selectedChauffeur.phone}
                </div>
                <div>
                  <strong>Country:</strong> {selectedChauffeur.country}
                </div>
                <div>
                  <strong>City:</strong> {selectedChauffeur.city}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Profile Picture:</strong>
                  {selectedChauffeur.profilePicture && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img 
                        src={getDocumentUrl(selectedChauffeur.profilePicture)}
                        alt="Profile"
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '200px', 
                          borderRadius: '8px',
                          border: '2px solid #d4af37',
                          cursor: 'pointer',
                          objectFit: 'cover'
                        }}
                        onClick={() => window.open(getDocumentUrl(selectedChauffeur.profilePicture), '_blank')}
                      />
                      <div style={{ marginTop: '0.5rem' }}>
                        <a
                          href={getDocumentUrl(selectedChauffeur.profilePicture)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                        >
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Documents */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Personal Documents</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {selectedChauffeur.driverLicense && (
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <strong>Driver License:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      <img 
                        src={getDocumentUrl(selectedChauffeur.driverLicense)}
                        alt="Driver License"
                        style={{ 
                          maxWidth: '300px', 
                          maxHeight: '200px', 
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          cursor: 'pointer',
                          objectFit: 'contain',
                          background: 'white'
                        }}
                        onClick={() => window.open(getDocumentUrl(selectedChauffeur.driverLicense), '_blank')}
                      />
                      <div style={{ marginTop: '0.5rem' }}>
                        <a
                          href={getDocumentUrl(selectedChauffeur.driverLicense)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                        >
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                {selectedChauffeur.identityCard && (
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <strong>Identity Card:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      <img 
                        src={getDocumentUrl(selectedChauffeur.identityCard)}
                        alt="Identity Card"
                        style={{ 
                          maxWidth: '300px', 
                          maxHeight: '200px', 
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          cursor: 'pointer',
                          objectFit: 'contain',
                          background: 'white'
                        }}
                        onClick={() => window.open(getDocumentUrl(selectedChauffeur.identityCard), '_blank')}
                      />
                      <div style={{ marginTop: '0.5rem' }}>
                        <a
                          href={getDocumentUrl(selectedChauffeur.identityCard)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                        >
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            {selectedChauffeur.vehicle && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Vehicle Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong>Model:</strong> {selectedChauffeur.vehicle.model}
                  </div>
                  <div>
                    <strong>Year:</strong> {selectedChauffeur.vehicle.year}
                  </div>
                  <div>
                    <strong>Color:</strong> {selectedChauffeur.vehicle.color}
                  </div>
                  <div>
                    <strong>Registration Number:</strong> {selectedChauffeur.vehicle.registrationNumber}
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Documents */}
            {selectedChauffeur.vehicle && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Vehicle Documents</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedChauffeur.vehicle.registrationCertificate && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Registration Certificate:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={getDocumentUrl(selectedChauffeur.vehicle.registrationCertificate)}
                          alt="Registration Certificate"
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                          onClick={() => window.open(getDocumentUrl(selectedChauffeur.vehicle.registrationCertificate), '_blank')}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={getDocumentUrl(selectedChauffeur.vehicle.registrationCertificate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedChauffeur.vehicle.insuranceCertificate && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Insurance Certificate:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={getDocumentUrl(selectedChauffeur.vehicle.insuranceCertificate)}
                          alt="Insurance Certificate"
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                          onClick={() => window.open(getDocumentUrl(selectedChauffeur.vehicle.insuranceCertificate), '_blank')}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={getDocumentUrl(selectedChauffeur.vehicle.insuranceCertificate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedChauffeur.vehicle.vehiclePhoto && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Vehicle Photo:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={getDocumentUrl(selectedChauffeur.vehicle.vehiclePhoto)}
                          alt="Vehicle Photo"
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                          onClick={() => window.open(getDocumentUrl(selectedChauffeur.vehicle.vehiclePhoto), '_blank')}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={getDocumentUrl(selectedChauffeur.vehicle.vehiclePhoto)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Documents */}
            {selectedChauffeur.company && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Company Documents</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedChauffeur.company.commercialRegistration && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Commercial Registration:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={getDocumentUrl(selectedChauffeur.company.commercialRegistration)}
                          alt="Commercial Registration"
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                          onClick={() => window.open(getDocumentUrl(selectedChauffeur.company.commercialRegistration), '_blank')}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={getDocumentUrl(selectedChauffeur.company.commercialRegistration)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedChauffeur.company.fleetInsuranceAgreement && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Fleet Insurance Agreement:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={getDocumentUrl(selectedChauffeur.company.fleetInsuranceAgreement)}
                          alt="Fleet Insurance Agreement"
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                          onClick={() => window.open(getDocumentUrl(selectedChauffeur.company.fleetInsuranceAgreement), '_blank')}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={getDocumentUrl(selectedChauffeur.company.fleetInsuranceAgreement)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedChauffeur.company.vatRegistrationCertificate && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>VAT Registration Certificate:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={getDocumentUrl(selectedChauffeur.company.vatRegistrationCertificate)}
                          alt="VAT Registration Certificate"
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                          onClick={() => window.open(getDocumentUrl(selectedChauffeur.company.vatRegistrationCertificate), '_blank')}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={getDocumentUrl(selectedChauffeur.company.vatRegistrationCertificate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedChauffeur.company.operatingPermit && (
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Operating Permit:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <img 
                          src={getDocumentUrl(selectedChauffeur.company.operatingPermit)}
                          alt="Operating Permit"
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                          onClick={() => window.open(getDocumentUrl(selectedChauffeur.company.operatingPermit), '_blank')}
                        />
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={getDocumentUrl(selectedChauffeur.company.operatingPermit)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '0.9rem' }}
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Application Status */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Application Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong>Status:</strong> 
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: selectedChauffeur.status === 'approved' ? '#4caf50' : 
                               selectedChauffeur.status === 'rejected' ? '#f44336' : 
                               selectedChauffeur.status === 'suspended' ? '#ff9800' : '#2196f3',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {selectedChauffeur.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <strong>Rating:</strong> {selectedChauffeur.rating?.toFixed(1) || '0.0'} ⭐ ({selectedChauffeur.totalRatings || 0} reviews)
                </div>
                <div>
                  <strong>Requirements Accepted:</strong> {selectedChauffeur.requirementsAccepted ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Verified:</strong> {selectedChauffeur.isVerified ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Active:</strong> {selectedChauffeur.isActive ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Online:</strong> {selectedChauffeur.isOnline ? '🟢 Online' : '⚫ Offline'}
                </div>
                {selectedChauffeur.approvedAt && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Approved At:</strong> {new Date(selectedChauffeur.approvedAt).toLocaleString()}
                  </div>
                )}
                {selectedChauffeur.rejectionReason && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Rejection Reason:</strong> 
                    <span style={{ color: '#f44336', marginLeft: '0.5rem' }}>{selectedChauffeur.rejectionReason}</span>
                  </div>
                )}
                {selectedChauffeur.documents?.backgroundCheck && (
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <strong>Background Check:</strong>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${selectedChauffeur.documents.backgroundCheck}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: '1rem', color: '#d4af37', textDecoration: 'underline' }}
                    >
                      View Document
                    </a>
                  </div>
                )}
                {selectedChauffeur.profilePhoto && (
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <strong>Profile Photo:</strong>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${selectedChauffeur.profilePhoto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: '1rem', color: '#d4af37', textDecoration: 'underline' }}
                    >
                      View Photo
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Application Status */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Application Status</h3>
              <div>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background:
                      selectedChauffeur.status === 'approved'
                        ? 'rgba(76, 175, 80, 0.1)'
                        : selectedChauffeur.status === 'rejected'
                        ? 'rgba(244, 67, 54, 0.1)'
                        : 'rgba(255, 152, 0, 0.1)',
                    color:
                      selectedChauffeur.status === 'approved'
                        ? '#4caf50'
                        : selectedChauffeur.status === 'rejected'
                        ? '#f44336'
                        : '#ff9800',
                  }}
                >
                  {selectedChauffeur.status}
                </span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Applied On:</strong> {new Date(selectedChauffeur.createdAt).toLocaleString()}
              </div>
              {selectedChauffeur.rejectionReason && (
                <div style={{ marginTop: '0.5rem', color: '#f44336' }}>
                  <strong>Rejection Reason:</strong> {selectedChauffeur.rejectionReason}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedChauffeur.status === 'pending' && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    handleReject(selectedChauffeur._id);
                    setShowModal(false);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Reject Application
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedChauffeur._id);
                    setShowModal(false);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Approve Application
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Overview Dashboard Component
const OverviewTab = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#4caf50',
      confirmed: '#2196f3',
      pending: '#ff9800',
      in_progress: '#9c27b0',
      cancelled: '#f44336',
    };
    return colors[status] || '#757575';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}
        />
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const { kpis, today, thisMonth, charts, topChauffeurs, recentBookings, newCustomers, popularServices } = dashboardData;

  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>📊 Overview Dashboard</h2>
        <p style={{ color: '#666', margin: 0 }}>
          Real-time insights and key performance metrics
        </p>
      </div>

      {/* Main KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Revenue */}
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Total Revenue
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {formatCurrency(kpis.totalRevenue)}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                All time earnings
              </div>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>💰</div>
          </div>
        </div>

        {/* Total Bookings */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Total Bookings
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {kpis.totalBookings.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {kpis.activeBookings} active now
              </div>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>🚗</div>
          </div>
        </div>

        {/* Total Customers / Active Guests */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Total Customers
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {kpis.totalCustomers.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {kpis.activeGuests != null ? `${kpis.activeGuests} active guests` : 'Registered users'}
              </div>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>👥</div>
          </div>
        </div>

        {/* Active Chauffeurs */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Active Chauffeurs
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {kpis.activeChauffeurs}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {kpis.totalChauffeurs} total, {kpis.pendingChauffeurs} pending
              </div>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>🎖️</div>
          </div>
        </div>
      </div>

      {/* Today & This Month Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Today's Stats */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>📅 Today's Performance</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <span style={{ color: '#666' }}>Bookings</span>
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{today.bookings}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <span style={{ color: '#666' }}>Revenue</span>
              <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#4caf50' }}>
                {formatCurrency(today.revenue)}
              </span>
            </div>
            {today.revenueChange !== 0 && (
              <div style={{ fontSize: '0.85rem', color: today.revenueChange > 0 ? '#4caf50' : '#f44336', textAlign: 'center' }}>
                {today.revenueChange > 0 ? '↑' : '↓'} {Math.abs(today.revenueChange)}% vs yesterday
              </div>
            )}
          </div>
        </div>

        {/* This Month Stats */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>📆 This Month's Performance</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <span style={{ color: '#666' }}>Bookings</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{thisMonth.bookings}</div>
                {thisMonth.bookingsGrowth !== 0 && (
                  <div style={{ fontSize: '0.8rem', color: thisMonth.bookingsGrowth > 0 ? '#4caf50' : '#f44336' }}>
                    {thisMonth.bookingsGrowth > 0 ? '↑' : '↓'} {Math.abs(thisMonth.bookingsGrowth)}%
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <span style={{ color: '#666' }}>Revenue</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#4caf50' }}>
                  {formatCurrency(thisMonth.revenue)}
                </div>
                {thisMonth.revenueGrowth !== 0 && (
                  <div style={{ fontSize: '0.8rem', color: thisMonth.revenueGrowth > 0 ? '#4caf50' : '#f44336' }}>
                    {thisMonth.revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(thisMonth.revenueGrowth)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Revenue Chart */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>📈 Revenue Trend (Last 30 Days)</h3>
          <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '1rem 0' }}>
            {charts.revenue.slice(-15).map((item, index) => {
              const maxRevenue = Math.max(...charts.revenue.map(r => r.revenue));
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    background: 'linear-gradient(to top, #667eea, #764ba2)',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    minHeight: '10px',
                  }}
                  title={`${item._id}: ${formatCurrency(item.revenue)}`}
                >
                  <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#666', whiteSpace: 'nowrap' }}>
                    {new Date(item._id).getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666', fontSize: '0.85rem' }}>
            Total: {formatCurrency(charts.revenue.reduce((sum, item) => sum + item.revenue, 0))}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>📊 Bookings by Status</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {charts.bookingsByStatus.map((status, index) => {
              const total = charts.bookingsByStatus.reduce((sum, s) => sum + s.count, 0);
              const percentage = ((status.count / total) * 100).toFixed(1);
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <span style={{ textTransform: 'capitalize', color: getStatusColor(status._id) }}>
                      {status._id.replace('_', ' ')}
                    </span>
                    <span style={{ fontWeight: '600' }}>{status.count} ({percentage}%)</span>
                  </div>
                  <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: getStatusColor(status._id),
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Top Chauffeurs */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>⭐ Top Performing Chauffeurs</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {topChauffeurs.map((chauffeur, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {index + 1}. {chauffeur.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {chauffeur.rides} rides
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#d4af37' }}>
                    {formatCurrency(chauffeur.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>🕒 Recent Bookings</h3>
          <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {recentBookings.slice(0, 5).map((booking, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getStatusColor(booking.status)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'N/A'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: getStatusColor(booking.status) + '20',
                      color: getStatusColor(booking.status),
                      textTransform: 'capitalize',
                    }}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {booking.bookingReference} • {formatDate(booking.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Customers */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>🆕 New Customers</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {newCustomers.map((customer, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {customer.email}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  {formatDate(customer.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Services */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>🔥 Popular Services</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {popularServices.map((service, index) => {
              const total = popularServices.reduce((sum, s) => sum + s.count, 0);
              const percentage = ((service.count / total) * 100).toFixed(1);
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                      {service._id || 'Standard'}
                    </span>
                    <span style={{ fontWeight: '600', color: '#d4af37' }}>
                      {service.count} ({percentage}%)
                    </span>
                  </div>
                  <div style={{ background: '#f0f0f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(to right, #d4af37, #f5d76e)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    inProgressBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approvedChauffeurs, setApprovedChauffeurs] = useState([]);
  const [assignChauffeurId, setAssignChauffeurId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/bookings/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      let url = `${import.meta.env.VITE_API_URL}/api/admin/bookings`;
      
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, [fetchStats, fetchBookings]);

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setAssignChauffeurId(booking.chauffeur?._id || booking.chauffeur || '');
    setShowModal(true);
  };

  const fetchApprovedChauffeurs = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/chauffeurs?status=approved&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success && data.data) setApprovedChauffeurs(data.data);
    } catch (e) {
      console.error('Fetch approved chauffeurs error:', e);
    }
  }, []);

  useEffect(() => {
    if (showModal && selectedBooking) fetchApprovedChauffeurs();
  }, [showModal, selectedBooking, fetchApprovedChauffeurs]);

  const handleAssignChauffeur = async () => {
    if (!selectedBooking || !assignChauffeurId) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/bookings/${selectedBooking._id}/assign`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ chauffeurId: assignChauffeurId }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(data.data);
        fetchStats();
        fetchBookings();
        setBookings((prev) => prev.map((b) => (b._id === selectedBooking._id ? data.data : b)));
        alert('Chauffeur assigned successfully.');
      } else {
        alert(data.message || 'Failed to assign chauffeur');
      }
    } catch (e) {
      console.error('Assign chauffeur error:', e);
      alert('Error assigning chauffeur');
    } finally {
      setAssigning(false);
    }
  };

  const handleCancelRide = async () => {
    if (!selectedBooking) return;
    const reason = window.prompt('Cancellation reason (optional):') || 'Cancelled by admin';
    if (reason === null) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/bookings/${selectedBooking._id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ cancellationReason: reason }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setSelectedBooking(null);
        fetchStats();
        fetchBookings();
        alert('Ride cancelled.');
      } else {
        alert(data.message || 'Failed to cancel ride');
      }
    } catch (e) {
      console.error('Cancel ride error:', e);
      alert('Error cancelling ride');
    } finally {
      setCancelling(false);
    }
  };

  const refreshData = useCallback(() => {
    fetchStats();
    fetchBookings();
  }, [fetchStats, fetchBookings]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      assigned: '#6610f2',
      'in-progress': '#007bff',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusBadge = (status) => (
    <span style={{
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      backgroundColor: `${getStatusColor(status)}20`,
      color: getStatusColor(status),
      textTransform: 'capitalize'
    }}>
      {status.replace('-', ' ')}
    </span>
  );

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#d4af37' }}>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
      {/* Header */}
      <h2 style={{ 
        fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', 
        fontWeight: '700', 
        color: '#1a1a1a', 
        marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
        borderBottom: '2px solid #d4af37'
      }}>
        Ride Management
      </h2>

      {/* Stats Cards */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: 'clamp(0.5rem, 1.5vw, 1rem)',
        marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
      }}>
        {[
          { label: 'Total', value: stats.totalBookings, color: '#d4af37', icon: Car },
          { label: 'Pending', value: stats.pendingBookings, color: '#ffc107', icon: Clock },
          { label: 'In Progress', value: stats.inProgressBookings, color: '#007bff', icon: TrendingUp },
          { label: 'Completed', value: stats.completedBookings, color: '#28a745', icon: CheckCircle },
          { label: 'Cancelled', value: stats.cancelledBookings, color: '#dc3545', icon: XCircle }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              padding: 'clamp(0.75rem, 1.5vw, 1rem)',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              minWidth: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: 'clamp(40px, 8vw, 50px)',
                height: 'clamp(40px, 8vw, 50px)',
                background: `${stat.color}15`,
                borderRadius: '50%'
              }} />
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '0.35rem',
                gap: '0.35rem'
              }}>
                <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', color: '#666', fontWeight: '600', flexShrink: 1 }}>
                  {stat.label}
                </div>
                <IconComponent size={18} style={{ color: stat.color, opacity: 0.8, flexShrink: 0, width: 'clamp(16px, 2.5vw, 18px)', height: 'clamp(16px, 2.5vw, 18px)' }} />
              </div>
              <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '700', color: stat.color }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: 'clamp(0.85rem, 1.8vw, 1.15rem)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '2px solid #d4af37',
        marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        display: 'flex',
        gap: 'clamp(0.5rem, 1.8vw, 0.85rem)',
        flexWrap: 'wrap',
        alignItems: 'stretch'
      }}>
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: 'min(100%, 220px)' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#d4af37',
            width: '18px',
            height: '18px'
          }} />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(0.65rem, 1.8vw, 0.8rem) 1rem clamp(0.65rem, 1.8vw, 0.8rem) 3rem',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
              outline: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#1a1a1a',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d4af37';
              e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.2)';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              e.target.style.boxShadow = 'none';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            }}
          />
        </div>
        
        <div style={{ position: 'relative', flex: '0 1 auto', minWidth: 'min(100%, 160px)' }}>
          <Filter size={18} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#d4af37',
            pointerEvents: 'none',
            width: '18px',
            height: '18px'
          }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(0.65rem, 1.8vw, 0.8rem) 2.5rem clamp(0.65rem, 1.8vw, 0.8rem) 3rem',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#1a1a1a',
              fontWeight: '500',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.1em'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d4af37';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
          }}
          className="clear-btn"
          style={{
            padding: '0 clamp(1.25rem, 2.5vw, 1.75rem)',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            color: '#1a1a1a',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            height: '100%',
            minHeight: 'clamp(42px, 10vw, 48px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)';
          }}
        >
          <XCircle size={20} style={{ strokeWidth: 2.5, flexShrink: 0, color: '#1a1a1a' }} />
          <span className="btn-text" style={{ lineHeight: 1, color: '#1a1a1a' }}>Clear</span>
        </button>
      </div>

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '2rem',
          textAlign: 'center',
          color: '#666'
        }}>
          No bookings found
        </div>
      ) : (
        <div className="bookings-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(0.75rem, 1.5vw, 1rem)',
          maxHeight: '42vh',
          overflowY: 'auto',
          paddingRight: '0.5rem'
        }}>
          {bookings.map((booking) => (
            <div key={booking._id} style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: 'clamp(0.75rem, 1.5vw, 1rem)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(0.5rem, 1vw, 0.65rem)'
            }}
            onClick={() => viewBookingDetails(booking)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingBottom: 'clamp(0.4rem, 1vw, 0.5rem)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                <div style={{ 
                  fontWeight: '700', 
                  color: '#d4af37',
                  fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Package size={14} />
                  {booking.bookingReference}
                </div>
                {getStatusBadge(booking.status)}
              </div>

              {/* Customer */}
              <div>
                <div style={{ 
                  fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', 
                  color: '#999', 
                  fontWeight: '600', 
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Customer
                </div>
                <div style={{ fontWeight: '600', color: '#1a1a1a', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}>
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: '1' }}>
                  <div style={{ 
                    fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', 
                    color: '#999', 
                    marginBottom: '0.2rem'
                  }}>
                    Date
                  </div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#1a1a1a',
                    fontSize: 'clamp(0.75rem, 1.7vw, 0.85rem)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Calendar size={12} />
                    {new Date(booking.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div style={{ flex: '1' }}>
                  <div style={{ 
                    fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', 
                    color: '#999', 
                    marginBottom: '0.2rem'
                  }}>
                    Time
                  </div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#1a1a1a',
                    fontSize: 'clamp(0.75rem, 1.7vw, 0.85rem)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Clock size={12} />
                    {booking.pickupTime}
                  </div>
                </div>
              </div>

              {/* Route */}
              <div>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginBottom: '0.2rem'
                }}>
                  <MapPin size={12} style={{ color: '#28a745' }} />
                  <span style={{ fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', color: '#666' }}>
                    {booking.pickupLocation?.address?.substring(0, 35)}...
                  </span>
                </div>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <MapPin size={12} style={{ color: '#dc3545' }} />
                  <span style={{ fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', color: '#666' }}>
                    {booking.dropoffLocation?.address?.substring(0, 35)}...
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: 'clamp(0.4rem, 1vw, 0.5rem)',
                borderTop: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                <div style={{ fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', color: '#666' }}>
                  Total Amount
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  color: '#d4af37',
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <CreditCard size={14} />
                  ${booking.totalPrice?.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          animation: 'fadeIn 0.3s ease'
        }}
        onClick={() => setShowModal(false)}
        >
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: 'clamp(12px, 2vw, 16px)',
            maxWidth: '900px',
            width: 'calc(100% - 1rem)',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: '2px solid rgba(212, 175, 55, 0.3)',
            animation: 'slideUp 0.3s ease',
            margin: '0.5rem'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: 'clamp(1rem, 3vw, 2rem)',
              borderBottom: '3px solid #d4af37',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderTopLeftRadius: 'clamp(12px, 2vw, 16px)',
              borderTopRightRadius: 'clamp(12px, 2vw, 16px)',
              gap: '1rem'
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ 
                  fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', 
                  fontWeight: '700', 
                  color: '#d4af37', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  <Car size={28} style={{ flexShrink: 0 }} />
                  <span>Booking Details</span>
                </h3>
                <p style={{ 
                  color: '#c0c0c0', 
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  wordBreak: 'break-word'
                }}>
                  <Package size={18} style={{ flexShrink: 0 }} />
                  <span>{selectedBooking.bookingReference}</span>
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '2px solid #d4af37',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#d4af37',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d4af37';
                  e.currentTarget.style.color = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                  e.currentTarget.style.color = '#d4af37';
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', 
                gap: 'clamp(1rem, 3vw, 2rem)', 
                marginBottom: 'clamp(1rem, 3vw, 2rem)' 
              }}>
                {/* Customer Info */}
                <div style={{
                  background: '#fff',
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  borderRadius: '12px',
                  border: '2px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  minWidth: 0
                }}>
                  <h4 style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '700', 
                    marginBottom: '1.25rem', 
                    color: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderBottom: '2px solid #d4af37',
                    paddingBottom: '0.75rem'
                  }}>
                    <Users size={20} style={{ color: '#d4af37' }} />
                    Customer Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#999', 
                        marginBottom: '0.35rem',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}>
                        Name
                      </div>
                      <div style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>
                        {selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#999', 
                        marginBottom: '0.35rem',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}>
                        Email
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1a1a1a'
                      }}>
                        <Mail size={16} style={{ color: '#d4af37' }} />
                        {selectedBooking.customer?.email}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#999', 
                        marginBottom: '0.35rem',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}>
                        Phone
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1a1a1a'
                      }}>
                        <Phone size={16} style={{ color: '#d4af37' }} />
                        {selectedBooking.customer?.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chauffeur Info */}
                <div style={{
                  background: '#fff',
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  borderRadius: '12px',
                  border: '2px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  minWidth: 0
                }}>
                  <h4 style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '700', 
                    marginBottom: '1.25rem', 
                    color: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderBottom: '2px solid #d4af37',
                    paddingBottom: '0.75rem'
                  }}>
                    <UserCheck size={20} style={{ color: '#d4af37' }} />
                    Chauffeur Information
                  </h4>
                  {selectedBooking.chauffeur ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#999', 
                          marginBottom: '0.35rem',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          letterSpacing: '0.5px'
                        }}>
                          Name
                        </div>
                        <div style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>
                          {selectedBooking.chauffeur.firstName} {selectedBooking.chauffeur.lastName}
                        </div>
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#999', 
                          marginBottom: '0.35rem',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          letterSpacing: '0.5px'
                        }}>
                          Email
                        </div>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#1a1a1a'
                        }}>
                          <Mail size={16} style={{ color: '#d4af37' }} />
                          {selectedBooking.chauffeur.email}
                        </div>
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#999', 
                          marginBottom: '0.35rem',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          letterSpacing: '0.5px'
                        }}>
                          Phone
                        </div>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#1a1a1a'
                        }}>
                          <Phone size={16} style={{ color: '#d4af37' }} />
                          {selectedBooking.chauffeur.phone}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      color: '#999', 
                      fontStyle: 'italic',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      Not assigned yet
                    </div>
                  )}
                </div>
              </div>

              {/* Ride Details */}
              <div style={{
                background: '#fff',
                padding: 'clamp(1rem, 2vw, 1.5rem)',
                borderRadius: '12px',
                border: '2px solid rgba(212, 175, 55, 0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                minWidth: 0
              }}>
                <h4 style={{ 
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
                  fontWeight: '700', 
                  marginBottom: '1.25rem', 
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderBottom: '2px solid #d4af37',
                  paddingBottom: '0.75rem'
                }}>
                  <Car size={20} style={{ color: '#d4af37', flexShrink: 0 }} />
                  <span>Ride Details</span>
                </h4>
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', 
                    gap: 'clamp(1rem, 2vw, 1.5rem)' 
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#999', 
                        marginBottom: '0.35rem',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}>
                        Pickup Date
                      </div>
                      <div style={{ 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1a1a1a'
                      }}>
                        <Calendar size={16} style={{ color: '#d4af37' }} />
                        {new Date(selectedBooking.pickupDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#999', 
                        marginBottom: '0.35rem',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}>
                        Pickup Time
                      </div>
                      <div style={{ 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1a1a1a'
                      }}>
                        <Clock size={16} style={{ color: '#d4af37' }} />
                        {selectedBooking.pickupTime}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      Pickup Location
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#1a1a1a',
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      borderLeft: '3px solid #28a745'
                    }}>
                      <MapPin size={18} style={{ color: '#28a745', flexShrink: 0 }} />
                      {selectedBooking.pickupLocation?.address}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      Dropoff Location
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#1a1a1a',
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      borderLeft: '3px solid #dc3545'
                    }}>
                      <MapPin size={18} style={{ color: '#dc3545', flexShrink: 0 }} />
                      {selectedBooking.dropoffLocation?.address}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#999', 
                        marginBottom: '0.35rem',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}>
                        Vehicle Type
                      </div>
                      <div style={{ 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#1a1a1a'
                      }}>
                        <Car size={16} style={{ color: '#d4af37' }} />
                        {selectedBooking.vehicleClass?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#999', 
                        marginBottom: '0.35rem',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}>
                        Status
                      </div>
                      <div>{getStatusBadge(selectedBooking.status)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div style={{
                background: '#fff',
                padding: 'clamp(1rem, 2vw, 1.5rem)',
                borderRadius: '12px',
                border: '2px solid rgba(212, 175, 55, 0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                marginTop: 'clamp(1rem, 2vw, 1.5rem)',
                minWidth: 0
              }}>
                <h4 style={{ 
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
                  fontWeight: '700', 
                  marginBottom: '1.25rem', 
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderBottom: '2px solid #d4af37',
                  paddingBottom: '0.75rem'
                }}>
                  <CreditCard size={20} style={{ color: '#d4af37', flexShrink: 0 }} />
                  <span>Payment Details</span>
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', 
                  gap: 'clamp(1rem, 2vw, 1.5rem)' 
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      Base Price
                    </div>
                    <div style={{ 
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      color: '#1a1a1a'
                    }}>
                      ${selectedBooking.basePrice?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      Total Price
                    </div>
                    <div style={{ 
                      fontWeight: '700', 
                      fontSize: '1.5rem', 
                      color: '#d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <DollarSign size={24} />
                      ${selectedBooking.totalPrice?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      Payment Method
                    </div>
                    <div style={{ 
                      textTransform: 'capitalize',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      padding: '0.5rem 0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {selectedBooking.paymentMethod}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      Payment Status
                    </div>
                    <div style={{ 
                      textTransform: 'capitalize', 
                      fontWeight: '700',
                      color: selectedBooking.paymentStatus === 'paid' ? '#28a745' : '#ffc107',
                      padding: '0.5rem 0.75rem',
                      background: selectedBooking.paymentStatus === 'paid' ? '#28a74520' : '#ffc10720',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {selectedBooking.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions: Assign Chauffeur & Cancel Ride */}
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                <div style={{
                  background: '#fff',
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  borderRadius: '12px',
                  border: '2px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  marginTop: 'clamp(1rem, 2vw, 1.5rem)',
                  minWidth: 0
                }}>
                  <h4 style={{
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    color: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderBottom: '2px solid #d4af37',
                    paddingBottom: '0.75rem'
                  }}>
                    <UserCheck size={20} style={{ color: '#d4af37' }} />
                    Admin Actions
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Assign Chauffeur</label>
                      <select
                        value={assignChauffeurId}
                        onChange={(e) => setAssignChauffeurId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          border: '2px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          background: '#fff'
                        }}
                      >
                        <option value="">Select chauffeur</option>
                        {approvedChauffeurs.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.firstName} {c.lastName} – {c.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAssignChauffeur}
                      disabled={assigning || !assignChauffeurId}
                      style={{
                        padding: '0.6rem 1.25rem',
                        background: assigning || !assignChauffeurId ? '#ccc' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                        color: '#1a1a1a',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: assigning || !assignChauffeurId ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {assigning ? 'Assigning...' : 'Assign Chauffeur'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.confirm('Cancel this ride?') && handleCancelRide()}
                      disabled={cancelling}
                      style={{
                        padding: '0.6rem 1.25rem',
                        background: cancelling ? '#ccc' : '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: cancelling ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Ride'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Customers Tab Component
const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, history, invoices

  const fetchCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = searchTerm 
        ? `${import.meta.env.VITE_API_URL}/api/admin/customers?search=${searchTerm}`
        : `${import.meta.env.VITE_API_URL}/api/admin/customers`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchCustomerDetails = useCallback(async (customerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCustomerDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerDetails(customer._id);
    setShowModal(true);
    setActiveTab('profile');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setCustomerDetails(null);
  };

  const handleBlockCustomer = async (customerId, reason) => {
    const r = reason || window.prompt('Block reason (optional):') || 'Blocked by admin';
    if (r === null) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/customers/${customerId}/block`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: r }),
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
        if (selectedCustomer?._id === customerId) {
          setSelectedCustomer(data.data);
          setCustomerDetails((prev) => prev ? { ...prev, customer: data.data } : null);
        }
        setShowModal(false);
        alert('Customer blocked.');
      } else {
        alert(data.message || 'Failed to block');
      }
    } catch (e) {
      console.error('Block customer error:', e);
      alert('Error blocking customer');
    }
  };

  const handleUnblockCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/customers/${customerId}/unblock`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
        if (selectedCustomer?._id === customerId) {
          setSelectedCustomer(data.data);
          setCustomerDetails((prev) => prev ? { ...prev, customer: data.data } : null);
        }
        alert('Customer unblocked.');
      } else {
        alert(data.message || 'Failed to unblock');
      }
    } catch (e) {
      console.error('Unblock customer error:', e);
      alert('Error unblocking customer');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      assigned: '#6610f2',
      'in-progress': '#007bff',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#d4af37' }}>Loading customers...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
      {/* Header */}
      <h2 style={{ 
        fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', 
        fontWeight: '700', 
        color: '#1a1a1a', 
        marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
        borderBottom: '2px solid #d4af37'
      }}>
        Customer Management
      </h2>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: 'clamp(0.5rem, 1.5vw, 1rem)',
        marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
      }}>
        {[
          { label: 'Total', value: customers.length, color: '#d4af37', icon: Users },
          { label: 'Active', value: customers.filter(c => c.bookingCount > 0).length, color: '#28a745', icon: CheckCircle },
          { label: 'Blocked', value: customers.filter(c => c.isBlocked).length, color: '#dc3545', icon: XCircle },
          { label: 'New', value: customers.filter(c => !c.bookingCount || c.bookingCount === 0).length, color: '#17a2b8', icon: TrendingUp }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              padding: 'clamp(0.75rem, 1.5vw, 1rem)',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              minWidth: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: 'clamp(40px, 8vw, 50px)',
                height: 'clamp(40px, 8vw, 50px)',
                background: `${stat.color}15`,
                borderRadius: '50%'
              }} />
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '0.35rem',
                gap: '0.35rem'
              }}>
                <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', color: '#666', fontWeight: '600', flexShrink: 1 }}>
                  {stat.label}
                </div>
                <IconComponent size={18} style={{ color: stat.color, opacity: 0.8, flexShrink: 0, width: 'clamp(16px, 2.5vw, 18px)', height: 'clamp(16px, 2.5vw, 18px)' }} />
              </div>
              <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '700', color: stat.color }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: 'clamp(0.85rem, 1.8vw, 1.15rem)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '2px solid #d4af37',
        marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        display: 'flex',
        gap: 'clamp(0.5rem, 1.8vw, 0.85rem)',
        flexWrap: 'wrap',
        alignItems: 'stretch'
      }}>
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: 'min(100%, 220px)' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#d4af37',
            width: '18px',
            height: '18px'
          }} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(0.65rem, 1.8vw, 0.8rem) 1rem clamp(0.65rem, 1.8vw, 0.8rem) 3rem',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
              outline: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#1a1a1a',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d4af37';
              e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.2)';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              e.target.style.boxShadow = 'none';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            }}
          />
        </div>
        
        <button
          onClick={() => setSearchTerm('')}
          style={{
            padding: '0 clamp(1.25rem, 2.5vw, 1.75rem)',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            color: '#1a1a1a',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            height: '100%',
            minHeight: 'clamp(42px, 10vw, 48px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)';
          }}
        >
          <XCircle size={20} style={{ strokeWidth: 2.5, flexShrink: 0 }} />
          <span style={{ lineHeight: 1 }}>Clear</span>
        </button>
      </div>

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '2rem',
          textAlign: 'center',
          color: '#666'
        }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No customers found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(0.75rem, 1.5vw, 1rem)',
          maxHeight: '42vh',
          overflowY: 'auto',
          paddingRight: '0.5rem'
        }}>
          {customers.map((customer) => (
            <div key={customer._id} style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: 'clamp(0.75rem, 1.5vw, 1rem)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(0.5rem, 1vw, 0.65rem)'
            }}
            onClick={() => handleCustomerClick(customer)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.borderColor = '#d4af37';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
            }}>
              {/* Customer Header with Avatar */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(0.5rem, 1vw, 0.75rem)',
                paddingBottom: 'clamp(0.5rem, 1vw, 0.65rem)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                <div style={{
                  width: 'clamp(40px, 8vw, 48px)',
                  height: 'clamp(40px, 8vw, 48px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1a1a1a',
                  fontWeight: 'bold',
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                }}>
                  {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ 
                      fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', 
                      fontWeight: '700',
                      marginBottom: '0.15rem', 
                      color: '#1a1a1a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      margin: 0
                    }}>
                      {customer.firstName} {customer.lastName}
                    </h3>
                    {customer.isBlocked && (
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '600', background: '#dc354520', color: '#dc3545' }}>Blocked</span>
                    )}
                  </div>
                  <p style={{ 
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.8rem)', 
                    color: '#d4af37',
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    ID: {customer._id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.4rem, 0.8vw, 0.5rem)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: 'clamp(0.8rem, 1.6vw, 0.85rem)',
                  color: '#555'
                }}>
                  <Mail size={14} style={{ flexShrink: 0, color: '#d4af37' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customer.email}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: 'clamp(0.8rem, 1.6vw, 0.85rem)',
                  color: '#555'
                }}>
                  <Phone size={14} style={{ flexShrink: 0, color: '#d4af37' }} />
                  <span>{customer.phone}</span>
                </div>
              </div>

              {/* Stats Footer */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                paddingTop: 'clamp(0.5rem, 1vw, 0.65rem)',
                borderTop: '1px solid rgba(212, 175, 55, 0.2)',
                marginTop: 'auto'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.8rem)'
                }}>
                  <Package size={14} style={{ color: '#17a2b8', flexShrink: 0 }} />
                  <span style={{ color: '#666', fontWeight: '600' }}>
                    {customer.bookingCount || 0} Rides
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.8rem)',
                  justifyContent: 'flex-end'
                }}>
                  <DollarSign size={14} style={{ color: '#28a745', flexShrink: 0 }} />
                  <span style={{ fontWeight: '700', color: '#28a745' }}>
                    {formatCurrency(customer.totalSpent || 0)}
                  </span>
                </div>
              </div>

              {/* Block / Unblock */}
              <div style={{ paddingTop: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                {customer.isBlocked ? (
                  <button
                    type="button"
                    onClick={() => handleUnblockCustomer(customer._id)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Unblock User
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => window.confirm('Block this user?') && handleBlockCustomer(customer._id)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Block User
                  </button>
                )}
              </div>

              {/* Member Since */}
              <div style={{ 
                fontSize: 'clamp(0.7rem, 1.4vw, 0.75rem)', 
                color: '#999',
                textAlign: 'center',
                paddingTop: 'clamp(0.3rem, 0.6vw, 0.4rem)'
              }}>
                Member since {formatDate(customer.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && customerDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff',
            borderRadius: '12px',
            maxWidth: 'min(900px, 95vw)',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              borderBottom: '3px solid #d4af37'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1a1a1a',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
                  }}>
                    {selectedCustomer.firstName?.charAt(0)}{selectedCustomer.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: '700' }}>
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#d4af37', fontSize: 'clamp(0.875rem, 2vw, 0.95rem)', fontWeight: '600' }}>
                      ID: {selectedCustomer._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} style={{
                  background: 'transparent',
                  border: '2px solid rgba(212, 175, 55, 0.5)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: '#d4af37'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d4af37';
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#d4af37';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}>
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'profile', label: 'Profile' },
                  { id: 'history', label: `History (${customerDetails.stats.bookingCount})` },
                  { id: 'invoices', label: 'Invoices' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: activeTab === tab.id ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' : 'transparent',
                      color: activeTab === tab.id ? '#1a1a1a' : '#d4af37',
                      border: activeTab === tab.id ? 'none' : '2px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                      transition: 'all 0.3s ease',
                      boxShadow: activeTab === tab.id ? '0 4px 12px rgba(212, 175, 55, 0.4)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.borderColor = '#d4af37';
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h3 style={{ 
                    color: '#1a1a1a', 
                    marginBottom: '1.5rem', 
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
                    fontWeight: '700',
                    paddingBottom: '0.75rem',
                    borderBottom: '2px solid #d4af37'
                  }}>
                    Customer Information
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 
                      padding: '1.25rem', 
                      borderRadius: '10px', 
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Mail size={16} style={{ color: '#d4af37' }} />
                        <label style={{ color: '#666', fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
                      </div>
                      <p style={{ color: '#1a1a1a', fontSize: '0.95rem', margin: 0, wordBreak: 'break-word', fontWeight: '500' }}>
                        {customerDetails.customer.email}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 
                      padding: '1.25rem', 
                      borderRadius: '10px', 
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Phone size={16} style={{ color: '#d4af37' }} />
                        <label style={{ color: '#666', fontSize: '0.85rem', fontWeight: '600' }}>Phone Number</label>
                      </div>
                      <p style={{ color: '#1a1a1a', fontSize: '0.95rem', margin: 0, fontWeight: '500' }}>
                        {customerDetails.customer.phone}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)', 
                      padding: '1.25rem', 
                      borderRadius: '10px', 
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.15)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Package size={16} style={{ color: '#d4af37' }} />
                        <label style={{ color: '#666', fontSize: '0.85rem', fontWeight: '600' }}>Total Bookings</label>
                      </div>
                      <p style={{ color: '#d4af37', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                        {customerDetails.stats.bookingCount}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)', 
                      padding: '1.25rem', 
                      borderRadius: '10px', 
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.15)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <DollarSign size={16} style={{ color: '#28a745' }} />
                        <label style={{ color: '#666', fontSize: '0.85rem', fontWeight: '600' }}>Total Spent</label>
                      </div>
                      <p style={{ color: '#28a745', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                        {formatCurrency(customerDetails.stats.totalSpent)}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 
                      padding: '1.25rem', 
                      borderRadius: '10px', 
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Calendar size={16} style={{ color: '#d4af37' }} />
                        <label style={{ color: '#666', fontSize: '0.85rem', fontWeight: '600' }}>Member Since</label>
                      </div>
                      <p style={{ color: '#1a1a1a', fontSize: '0.95rem', margin: 0, fontWeight: '500' }}>
                        {formatDate(customerDetails.customer.createdAt)}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 
                      padding: '1.25rem', 
                      borderRadius: '10px', 
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Eye size={16} style={{ color: '#d4af37' }} />
                        <label style={{ color: '#666', fontSize: '0.85rem', fontWeight: '600' }}>Customer ID</label>
                      </div>
                      <p style={{ color: '#1a1a1a', fontSize: '0.85rem', margin: 0, fontFamily: 'monospace', fontWeight: '600' }}>
                        {customerDetails.customer._id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h3 style={{ 
                    color: '#1a1a1a', 
                    marginBottom: '1.5rem', 
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
                    fontWeight: '700',
                    paddingBottom: '0.75rem',
                    borderBottom: '2px solid #d4af37'
                  }}>
                    Booking History
                  </h3>
                  
                  {customerDetails.bookings.length === 0 ? (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      borderRadius: '10px',
                      padding: '3rem', 
                      textAlign: 'center', 
                      color: '#888',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                      <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p style={{ margin: 0, fontSize: '1rem' }}>No bookings found</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {customerDetails.bookings.map((booking) => (
                        <div
                          key={booking._id}
                          style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            padding: '1.25rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = '#d4af37';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <h4 style={{ color: '#1a1a1a', fontSize: '1.05rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                                {booking.bookingReference || `BK-${booking._id.slice(-6).toUpperCase()}`}
                              </h4>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.35rem 0.85rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                background: `${getStatusColor(booking.status)}20`,
                                color: getStatusColor(booking.status),
                                border: `1px solid ${getStatusColor(booking.status)}40`
                              }}>
                                {booking.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ color: '#28a745', fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>
                                {formatCurrency(booking.totalPrice)}
                              </p>
                            </div>
                          </div>
                          
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', 
                            gap: '1rem', 
                            fontSize: '0.875rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(212, 175, 55, 0.2)'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <MapPin size={14} style={{ color: '#28a745', flexShrink: 0 }} />
                                <span style={{ color: '#666', fontWeight: '600' }}>Pickup</span>
                              </div>
                              <p style={{ color: '#1a1a1a', margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>
                                {booking.pickupLocation.address}
                              </p>
                            </div>
                            {booking.dropoffLocation && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <MapPin size={14} style={{ color: '#dc3545', flexShrink: 0 }} />
                                  <span style={{ color: '#666', fontWeight: '600' }}>Dropoff</span>
                                </div>
                                <p style={{ color: '#1a1a1a', margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>
                                  {booking.dropoffLocation.address}
                                </p>
                              </div>
                            )}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Calendar size={14} style={{ color: '#d4af37', flexShrink: 0 }} />
                                <span style={{ color: '#666', fontWeight: '600' }}>Date & Time</span>
                              </div>
                              <p style={{ color: '#1a1a1a', margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>
                                {formatDate(booking.pickupDate)}
                              </p>
                              <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                                {booking.pickupTime}
                              </p>
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Car size={14} style={{ color: '#17a2b8', flexShrink: 0 }} />
                                <span style={{ color: '#666', fontWeight: '600' }}>Vehicle</span>
                              </div>
                              <p style={{ color: '#1a1a1a', margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>
                                {booking.vehicleClass.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div>
                  <h3 style={{ 
                    color: '#1a1a1a', 
                    marginBottom: '1.5rem', 
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
                    fontWeight: '700',
                    paddingBottom: '0.75rem',
                    borderBottom: '2px solid #d4af37'
                  }}>
                    Invoice History
                  </h3>
                  
                  {customerDetails.bookings.filter(b => b.status === 'completed').length === 0 ? (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      borderRadius: '10px',
                      padding: '3rem', 
                      textAlign: 'center', 
                      color: '#888',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                      <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>No invoices available</p>
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>Invoices are generated for completed bookings</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {customerDetails.bookings
                        .filter(b => b.status === 'completed')
                        .map((booking) => (
                          <div
                            key={booking._id}
                            style={{
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                              padding: '1.25rem',
                              borderRadius: '10px',
                              border: '1px solid rgba(212, 175, 55, 0.2)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                              e.currentTarget.style.borderColor = '#d4af37';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <CreditCard size={18} style={{ color: '#d4af37' }} />
                                  <h4 style={{ color: '#1a1a1a', fontSize: '1.05rem', margin: 0, fontWeight: '700' }}>
                                    Invoice #{booking.bookingReference || booking._id.slice(-8).toUpperCase()}
                                  </h4>
                                </div>
                                <p style={{ color: '#666', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Calendar size={14} />
                                  {formatDate(booking.pickupDate)}
                                </p>
                              </div>
                              <button
                                style={{
                                  padding: '0.65rem 1.25rem',
                                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                                  color: '#1a1a1a',
                                  border: '2px solid rgba(255, 255, 255, 0.2)',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '0.875rem',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                                onClick={() => window.open(`/invoice/${booking._id}`, '_blank')}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.3)';
                                }}
                              >
                                <Eye size={16} />
                                View Invoice
                              </button>
                            </div>
                            
                            <div style={{ 
                              borderTop: '1px solid rgba(212, 175, 55, 0.2)', 
                              paddingTop: '1rem', 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', 
                              gap: '1rem', 
                              fontSize: '0.875rem' 
                            }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(212, 175, 55, 0.15)'
                              }}>
                                <span style={{ color: '#666', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>Base Price</span>
                                <p style={{ color: '#1a1a1a', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                  {formatCurrency(booking.basePrice)}
                                </p>
                              </div>
                              <div style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(212, 175, 55, 0.15)'
                              }}>
                                <span style={{ color: '#666', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>Taxes</span>
                                <p style={{ color: '#1a1a1a', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                  {formatCurrency(booking.taxes || 0)}
                                </p>
                              </div>
                              <div style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(212, 175, 55, 0.15)'
                              }}>
                                <span style={{ color: '#666', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>Fees</span>
                                <p style={{ color: '#1a1a1a', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                  {formatCurrency(booking.fees || 0)}
                                </p>
                              </div>
                              <div style={{
                                background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '2px solid rgba(212, 175, 55, 0.3)',
                                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2)'
                              }}>
                                <span style={{ color: '#666', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>Total</span>
                                <p style={{ color: '#28a745', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                                  {formatCurrency(booking.totalPrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PromoCodesTab = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minAmount: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/promos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPromoCodes(data.data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minAmount: parseFloat(formData.minAmount) || 0,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Promo code created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchPromoCodes();
      } else {
        alert(`❌ Failed to create promo code: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      alert('❌ Failed to create promo code');
    }
  };

  const handleUpdatePromo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/promos/${selectedPromo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minAmount: parseFloat(formData.minAmount) || 0,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Promo code updated successfully!');
        setShowEditModal(false);
        setSelectedPromo(null);
        resetForm();
        fetchPromoCodes();
      } else {
        alert(`❌ Failed to update promo code: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating promo code:', error);
      alert('❌ Failed to update promo code');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/promos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Promo code deleted successfully!');
        fetchPromoCodes();
      } else {
        alert(`❌ Failed to delete promo code: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
      alert('❌ Failed to delete promo code');
    }
  };

  const openEditModal = (promo) => {
    setSelectedPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minAmount: promo.minAmount || '',
      maxDiscount: promo.maxDiscount || '',
      validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().slice(0, 16) : '',
      validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().slice(0, 16) : '',
      usageLimit: promo.usageLimit || '',
      isActive: promo.isActive,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minAmount: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (promo) => {
    if (!promo.isActive) return '#757575';
    const now = new Date();
    if (now < new Date(promo.validFrom)) return '#ff9800';
    if (now > new Date(promo.validUntil)) return '#f44336';
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return '#9c27b0';
    return '#4caf50';
  };

  const getStatus = (promo) => {
    if (!promo.isActive) return 'Inactive';
    const now = new Date();
    if (now < new Date(promo.validFrom)) return 'Scheduled';
    if (now > new Date(promo.validUntil)) return 'Expired';
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return 'Limit Reached';
    return 'Active';
  };

  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>🎟️ Promo Codes</h2>
          <p style={{ color: '#666', margin: 0 }}>Create and manage discount codes for customers</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#d4af37',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
          }}
        >
          + Create Promo Code
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Promo Codes</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>{promoCodes.length}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Active Codes</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4caf50' }}>
            {promoCodes.filter(p => p.isActive && new Date() < new Date(p.validUntil)).length}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Uses</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2196f3' }}>
            {promoCodes.reduce((sum, p) => sum + p.usedCount, 0)}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #d4af37',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          />
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading promo codes...</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Discount</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Valid Period</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Usage</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '1.1rem', color: '#d4af37' }}>
                      {promo.code}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{promo.description}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600' }}>
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}% off`
                        : `$${promo.discountValue} off`}
                    </div>
                    {promo.minAmount > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Min: ${promo.minAmount}</div>
                    )}
                    {promo.maxDiscount && (
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Max: ${promo.maxDiscount}</div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                    <div>{formatDate(promo.validFrom)}</div>
                    <div style={{ color: '#666' }}>to {formatDate(promo.validUntil)}</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600' }}>
                      {promo.usedCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        background: getStatusColor(promo) + '20',
                        color: getStatusColor(promo),
                        fontWeight: '500',
                      }}
                    >
                      {getStatus(promo)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(promo)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promo._id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Promo Code</h3>
            <form onSubmit={handleCreatePromo}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SUMMER2025"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the promo code offer"
                    required
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                      required
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Minimum Amount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Max Discount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="Optional"
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Valid From *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Valid Until *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Active</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Create Promo Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPromo && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Promo Code</h3>
            <form onSubmit={handleUpdatePromo}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Minimum Amount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Max Discount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Valid From *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Valid Until *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Usage Count (Current: {selectedPromo.usedCount})
                  </label>
                  <div style={{ padding: '0.75rem', background: '#f9f9f9', borderRadius: '8px', color: '#666' }}>
                    This promo code has been used {selectedPromo.usedCount} time(s)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Active</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Update Promo Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPromo(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RevenueTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('analytics');
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [commissionReports, setCommissionReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        'http://localhost:5000/api/admin/finance/analytics',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(
        `http://localhost:5000/api/admin/finance/transactions?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCommissionReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        'http://localhost:5000/api/admin/finance/commission-reports',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCommissionReports(data.data);
      }
    } catch (error) {
      console.error('Error fetching commission reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        'http://localhost:5000/api/admin/finance/payouts',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPayouts(data.data);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprovePayout = async (payoutId) => {
    if (!window.confirm('Are you sure you want to approve this payout?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:5000/api/admin/finance/payouts/${payoutId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: '' }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('✅ Payout approved successfully!');
        fetchPayouts();
      } else {
        alert(`❌ Failed to approve payout: ${data.message}`);
      }
    } catch (error) {
      console.error('Error approving payout:', error);
      alert('❌ Failed to approve payout');
    }
  };

  const handleProcessPayout = async (payoutId) => {
    if (!window.confirm('Mark this payout as completed?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:5000/api/admin/finance/payouts/${payoutId}/process`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('✅ Payout processed successfully!');
        fetchPayouts();
      } else {
        alert(`❌ Failed to process payout: ${data.message}`);
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('❌ Failed to process payout');
    }
  };

  useEffect(() => {
    if (activeSubTab === 'analytics') {
      fetchAnalytics();
    } else if (activeSubTab === 'transactions') {
      fetchTransactions();
    } else if (activeSubTab === 'commissions') {
      fetchCommissionReports();
    } else if (activeSubTab === 'payouts') {
      fetchPayouts();
    }
  }, [activeSubTab, filters, fetchTransactions, fetchPayouts]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#4caf50',
      pending: '#ff9800',
      failed: '#f44336',
      approved: '#2196f3',
      processing: '#9c27b0',
      cancelled: '#757575',
    };
    return colors[status] || '#757575';
  };

  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>💰 Finance & Payouts</h2>
        <p style={{ color: '#666', margin: 0 }}>
          Manage transactions, commissions, and chauffeur payouts
        </p>
      </div>

      {/* Sub-tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        {['analytics', 'transactions', 'commissions', 'payouts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom:
                activeSubTab === tab ? '3px solid #d4af37' : '3px solid transparent',
              color: activeSubTab === tab ? '#d4af37' : '#666',
              fontWeight: activeSubTab === tab ? '600' : '400',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.3s',
            }}
          >
            {tab === 'analytics' && '📊 Analytics'}
            {tab === 'transactions' && '💳 Transactions'}
            {tab === 'commissions' && '📈 Commissions'}
            {tab === 'payouts' && '💸 Payouts'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #d4af37',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          />
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading...</p>
        </div>
      ) : (
        <>
          {/* Analytics Tab */}
          {activeSubTab === 'analytics' && analytics && (
            <div>
              {/* Overview Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    color: 'white',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Revenue</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' }}>
                    {formatCurrency(analytics.overview.totalRevenue || 0)}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {analytics.overview.totalTransactions || 0} transactions
                  </div>
                </div>

                <div
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    color: 'white',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Commission</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' }}>
                    {formatCurrency(analytics.overview.totalCommission || 0)}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Platform earnings</div>
                </div>

                <div
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    color: 'white',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg Transaction</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' }}>
                    {formatCurrency(analytics.overview.avgTransactionValue || 0)}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Per booking</div>
                </div>

                <div
                  style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    color: 'white',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pending Payouts</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' }}>
                    {formatCurrency(analytics.pendingPayouts.totalAmount || 0)}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {analytics.pendingPayouts.count || 0} pending
                  </div>
                </div>
              </div>

              {/* Revenue by Payment Method */}
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: '1rem' }}>Revenue by Payment Method</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {analytics.byPaymentMethod.map((method) => (
                    <div
                      key={method._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                          {method._id}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {method.count} transactions
                        </div>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d4af37' }}>
                        {formatCurrency(method.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customers */}
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: '1rem' }}>Top Customers</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Customer</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Bookings</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topCustomers.map((customer, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '0.75rem' }}>
                            {customer.customer.firstName} {customer.customer.lastName}
                          </td>
                          <td style={{ padding: '0.75rem', color: '#666' }}>
                            {customer.customer.email}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            {customer.bookings}
                          </td>
                          <td
                            style={{
                              padding: '0.75rem',
                              textAlign: 'right',
                              fontWeight: '600',
                              color: '#d4af37',
                            }}
                          >
                            {formatCurrency(customer.totalSpent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeSubTab === 'transactions' && (
            <div>
              {/* Filters */}
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="booking_payment">Booking Payment</option>
                    <option value="refund">Refund</option>
                    <option value="commission">Commission</option>
                    <option value="payout">Payout</option>
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <option value="">All Payment Methods</option>
                    <option value="card">Card</option>
                    <option value="wallet">Wallet</option>
                    <option value="stripe">Stripe</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Transaction ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Payment Method</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {transaction.transactionId}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {transaction.customer ? (
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {transaction.customer.firstName} {transaction.customer.lastName}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                {transaction.customer.email}
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              background: '#e3f2fd',
                              color: '#1976d2',
                              textTransform: 'capitalize',
                            }}
                          >
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                          {transaction.paymentMethod}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: '#d4af37',
                          }}
                        >
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              background: getStatusColor(transaction.status) + '20',
                              color: getStatusColor(transaction.status),
                              fontWeight: '500',
                              textTransform: 'capitalize',
                            }}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTransactionModal(true);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#d4af37',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Commission Reports Tab */}
          {activeSubTab === 'commissions' && commissionReports && (
            <div>
              {/* Commission Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Commission</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d4af37', margin: '0.5rem 0' }}>
                    {formatCurrency(commissionReports.summary.totalCommission || 0)}
                  </div>
                </div>

                <div
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Revenue</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4caf50', margin: '0.5rem 0' }}>
                    {formatCurrency(commissionReports.summary.totalRevenue || 0)}
                  </div>
                </div>

                <div
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Transactions</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2196f3', margin: '0.5rem 0' }}>
                    {commissionReports.summary.transactions || 0}
                  </div>
                </div>
              </div>

              {/* Commission by Chauffeur */}
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflowX: 'auto',
                }}
              >
                <h3 style={{ marginBottom: '1rem' }}>Commission by Chauffeur</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Chauffeur</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Rides</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Revenue</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Commission</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionReports.byChauffeur.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>
                              {item.chauffeur.firstName} {item.chauffeur.lastName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              {item.chauffeur.email}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.rides}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {formatCurrency(item.revenue)}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: '#d4af37',
                          }}
                        >
                          {formatCurrency(item.commission)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#666' }}>
                          {item.commissionRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payouts Tab */}
          {activeSubTab === 'payouts' && (
            <div>
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Payout ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Chauffeur</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Period</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {payout.payoutId}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {payout.chauffeur ? (
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {payout.chauffeur.firstName} {payout.chauffeur.lastName}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                {payout.chauffeur.email}
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                          {formatDate(payout.period.startDate)} - {formatDate(payout.period.endDate)}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            textAlign: 'right',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            color: '#d4af37',
                          }}
                        >
                          {formatCurrency(payout.amount)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              background: getStatusColor(payout.status) + '20',
                              color: getStatusColor(payout.status),
                              fontWeight: '500',
                              textTransform: 'capitalize',
                            }}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowPayoutModal(true);
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#d4af37',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                              }}
                            >
                              Details
                            </button>
                            {payout.status === 'pending' && (
                              <button
                                onClick={() => handleApprovePayout(payout._id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#4caf50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                }}
                              >
                                ✓ Approve
                              </button>
                            )}
                            {payout.status === 'approved' && (
                              <button
                                onClick={() => handleProcessPayout(payout._id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#2196f3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                }}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowTransactionModal(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Transaction Details</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Transaction ID</div>
                <div style={{ fontWeight: '500', fontFamily: 'monospace' }}>
                  {selectedTransaction.transactionId}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Amount</div>
                <div style={{ fontWeight: '600', fontSize: '1.5rem', color: '#d4af37' }}>
                  {formatCurrency(selectedTransaction.amount)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Type</div>
                <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                  {selectedTransaction.type.replace('_', ' ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Payment Method</div>
                <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                  {selectedTransaction.paymentMethod}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Status</div>
                <span
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    background: getStatusColor(selectedTransaction.status) + '20',
                    color: getStatusColor(selectedTransaction.status),
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {selectedTransaction.status}
                </span>
              </div>
              {selectedTransaction.description && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Description</div>
                  <div style={{ fontWeight: '500' }}>{selectedTransaction.description}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Date</div>
                <div style={{ fontWeight: '500' }}>
                  {new Date(selectedTransaction.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowTransactionModal(false)}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payout Details Modal */}
      {showPayoutModal && selectedPayout && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowPayoutModal(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Payout Details</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Payout ID</div>
                <div style={{ fontWeight: '500', fontFamily: 'monospace' }}>
                  {selectedPayout.payoutId}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Amount</div>
                <div style={{ fontWeight: '600', fontSize: '1.5rem', color: '#d4af37' }}>
                  {formatCurrency(selectedPayout.amount)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Period</div>
                <div style={{ fontWeight: '500' }}>
                  {formatDate(selectedPayout.period.startDate)} - {formatDate(selectedPayout.period.endDate)}
                </div>
              </div>
              {selectedPayout.breakdown && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    Breakdown
                  </div>
                  <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Total Earnings:</span>
                      <span>{formatCurrency(selectedPayout.breakdown.totalEarnings)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Commission:</span>
                      <span style={{ color: '#f44336' }}>
                        -{formatCurrency(selectedPayout.breakdown.commission)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Rides Count:</span>
                      <span>{selectedPayout.breakdown.ridesCount}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #ddd',
                        fontWeight: '600',
                      }}
                    >
                      <span>Net Amount:</span>
                      <span style={{ color: '#4caf50' }}>
                        {formatCurrency(selectedPayout.breakdown.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Status</div>
                <span
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    background: getStatusColor(selectedPayout.status) + '20',
                    color: getStatusColor(selectedPayout.status),
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {selectedPayout.status}
                </span>
              </div>
              {selectedPayout.bankDetails && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    Bank Details
                  </div>
                  <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Account Name:</strong> {selectedPayout.bankDetails.accountName}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Account Number:</strong> {selectedPayout.bankDetails.accountNumber}
                    </div>
                    <div>
                      <strong>Bank:</strong> {selectedPayout.bankDetails.bankName}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowPayoutModal(false)}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SupportTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('refunds');
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundStats, setRefundStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await fetch(
        `http://localhost:5000/api/admin/support/refunds?${statusParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch refunds');

      const data = await response.json();
      setRefunds(data.data || []);
      setRefundStats(data.stats || refundStats);
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'refunds') {
      fetchRefunds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, statusFilter]);

  const handleApproveRefund = async (refundId, notes = '') => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:5000/api/admin/support/refunds/${refundId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve refund');
      }

      alert('✅ Refund approved successfully!\n\nAmount has been added to customer wallet.');
      setShowRefundModal(false);
      setSelectedRefund(null);
      fetchRefunds();
    } catch (error) {
      console.error('Error approving refund:', error);
      alert(`❌ Failed to approve refund\n\n${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRefund = async (refundId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:5000/api/admin/support/refunds/${refundId}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject refund');
      }

      alert('❌ Refund rejected successfully\n\nCustomer will be notified with your reason.');
      setShowRefundModal(false);
      setSelectedRefund(null);
      setRejectReason('');
      fetchRefunds();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      alert(`❌ Failed to reject refund\n\n${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#10b981',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getReasonLabel = (reason) => {
    const labels = {
      booking_cancellation: 'Booking Cancellation',
      service_issue: 'Service Issue',
      overcharge: 'Overcharge',
      no_show: 'No Show',
      customer_request: 'Customer Request',
      other: 'Other',
    };
    return labels[reason] || reason;
  };

  const filteredRefunds = refunds.filter(refund => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const customerName = `${refund.customer?.firstName} ${refund.customer?.lastName}`.toLowerCase();
    const email = refund.customer?.email?.toLowerCase() || '';
    const bookingRef = refund.booking?.bookingReference?.toLowerCase() || '';
    return customerName.includes(query) || email.includes(query) || bookingRef.includes(query);
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <HeadphonesIcon size={32} style={{ color: '#d4af37' }} />
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1a1a1a' }}>
            Support & Operations
          </h2>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveSubTab('refunds')}
          style={{
            padding: '1rem 1.5rem',
            background: activeSubTab === 'refunds' ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'transparent',
            color: activeSubTab === 'refunds' ? '#d4af37' : '#6b7280',
            border: 'none',
            borderBottom: activeSubTab === 'refunds' ? '3px solid #d4af37' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            borderRadius: '8px 8px 0 0'
          }}
        >
          Refund Requests
        </button>
        <button
          onClick={() => setActiveSubTab('tickets')}
          style={{
            padding: '1rem 1.5rem',
            background: activeSubTab === 'tickets' ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'transparent',
            color: activeSubTab === 'tickets' ? '#d4af37' : '#6b7280',
            border: 'none',
            borderBottom: activeSubTab === 'tickets' ? '3px solid #d4af37' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            borderRadius: '8px 8px 0 0'
          }}
        >
          Support Tickets
        </button>
      </div>

      {/* Refunds Tab Content */}
      {activeSubTab === 'refunds' && (
        <>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>
                Total Requests
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>
                {refundStats.total}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #fdba74',
              boxShadow: '0 4px 6px rgba(245,158,11,0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '600' }}>
                Pending
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#c2410c' }}>
                {refundStats.pending}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #60a5fa',
              boxShadow: '0 4px 6px rgba(59,130,246,0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#1e3a8a', marginBottom: '0.5rem', fontWeight: '600' }}>
                Processing
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                {refundStats.processing}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #34d399',
              boxShadow: '0 4px 6px rgba(16,185,129,0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#064e3b', marginBottom: '0.5rem', fontWeight: '600' }}>
                Completed
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#065f46' }}>
                {refundStats.completed}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #f87171',
              boxShadow: '0 4px 6px rgba(239,68,68,0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '0.5rem', fontWeight: '600' }}>
                Rejected
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#991b1b' }}>
                {refundStats.rejected}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #d4af37',
              boxShadow: '0 4px 6px rgba(212,175,55,0.2)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.5rem', fontWeight: '600' }}>
                Total Amount
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>
                ${refundStats.totalAmount?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#d4af37',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                placeholder="Search by customer name, email, or booking ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  fontSize: '0.95rem',
                  border: '2px solid #d4af37',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(212, 175, 55, 0.1)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4af37';
                  e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.2), 0 4px 6px rgba(212, 175, 55, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 6px rgba(212, 175, 55, 0.1)';
                }}
              />
            </div>
            <div style={{ position: 'relative', minWidth: '180px' }}>
              <Filter
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#d4af37',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 2.5rem 0.875rem 2.75rem',
                  fontSize: '0.95rem',
                  border: '2px solid #d4af37',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  appearance: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(212, 175, 55, 0.1)',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='%23d4af37'%3E%3Cpath d='M4 6l4 4 4-4H4z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4af37';
                  e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.2), 0 4px 6px rgba(212, 175, 55, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 6px rgba(212, 175, 55, 0.1)';
                }}
              >
                <option value="all" style={{ background: '#1a1a1a', color: '#ffffff' }}>All Status</option>
                <option value="pending" style={{ background: '#1a1a1a', color: '#ffffff' }}>⏳ Pending</option>
                <option value="processing" style={{ background: '#1a1a1a', color: '#ffffff' }}>🔄 Processing</option>
                <option value="completed" style={{ background: '#1a1a1a', color: '#ffffff' }}>✅ Completed</option>
                <option value="rejected" style={{ background: '#1a1a1a', color: '#ffffff' }}>❌ Rejected</option>
              </select>
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                style={{
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: 'transparent',
                  color: '#ef4444',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ef4444';
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ef4444';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Counter */}
          {!loading && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '12px',
              border: '1px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#065f46' }}>
                Showing {filteredRefunds.length} of {refunds.length} refund request{refunds.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
                {statusFilter !== 'all' && ` with status "${statusFilter}"`}
              </span>
            </div>
          )}

          {/* Refunds List */}
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: '#6b7280',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #d4af37',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '1rem', fontWeight: '600' }}>Loading refunds...</span>
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontSize: '1.125rem', color: '#1f2937', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                {searchQuery || statusFilter !== 'all' ? 'No matching refund requests' : 'No refund requests found'}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Refund requests will appear here when customers submit them'}
              </p>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: '#d4af37', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Customer
                      </th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: '#d4af37', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Booking Ref
                      </th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: '#d4af37', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Amount
                      </th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: '#d4af37', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Reason
                      </th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: '#d4af37', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Status
                      </th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: '#d4af37', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Requested
                      </th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'center', color: '#d4af37', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRefunds.map((refund, index) => (
                      <tr
                        key={refund._id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0f9ff';
                          e.currentTarget.style.transform = 'scale(1.01)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '600' }}>
                          <div>
                            {refund.customer?.firstName} {refund.customer?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {refund.customer?.email}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '600' }}>
                          {refund.booking?.bookingReference || 'N/A'}
                        </td>
                        <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '700', fontSize: '1.125rem' }}>
                          ${refund.amount?.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                          {getReasonLabel(refund.reason)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            background: `${getStatusColor(refund.status)}15`,
                            color: getStatusColor(refund.status),
                            border: `2px solid ${getStatusColor(refund.status)}30`
                          }}>
                            {refund.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          {new Date(refund.requestedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {/* View Details Button - Always visible */}
                            <button
                              onClick={() => {
                                setSelectedRefund(refund);
                                setShowRefundModal(true);
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: 'linear-gradient(135deg, #d4af37 0%, #c19b2f 100%)',
                                color: '#1a1a1a',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.75rem',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,175,55,0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              title="View full details"
                            >
                              View Details
                            </button>

                            {/* Approve Button - Only for pending/processing */}
                            {(refund.status === 'pending' || refund.status === 'processing') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Approve refund of $${refund.amount.toFixed(2)} for ${refund.customer?.firstName} ${refund.customer?.lastName}?\n\nThis will add the amount to their wallet immediately.`)) {
                                    handleApproveRefund(refund._id, '');
                                  }
                                }}
                                disabled={actionLoading}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  background: actionLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.75rem',
                                  transition: 'all 0.3s ease',
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  if (!actionLoading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.4)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                                title="Approve and add to wallet"
                              >
                                ✓ Approve
                              </button>
                            )}

                            {/* Reject Button - Only for pending/processing */}
                            {(refund.status === 'pending' || refund.status === 'processing') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const reason = window.prompt(`Reject refund for ${refund.customer?.firstName} ${refund.customer?.lastName}?\n\nPlease provide a reason for rejection:`);
                                  if (reason && reason.trim()) {
                                    handleRejectRefund(refund._id, reason);
                                  } else if (reason !== null) {
                                    alert('Rejection reason is required');
                                  }
                                }}
                                disabled={actionLoading}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  background: actionLoading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.75rem',
                                  transition: 'all 0.3s ease',
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  if (!actionLoading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                                title="Reject refund request"
                              >
                                ✕ Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Support Tickets Tab Content */}
      {activeSubTab === 'tickets' && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', margin: 0 }}>
            Support ticket management coming soon...
          </p>
        </div>
      )}

      {/* Refund Details Modal */}
      {showRefundModal && selectedRefund && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => {
            setShowRefundModal(false);
            setSelectedRefund(null);
            setRejectReason('');
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              padding: '2rem',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#d4af37', fontSize: '1.5rem', fontWeight: '700' }}>
                  Refund Request Details
                </h3>
                <p style={{ margin: '0.5rem 0 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>
                  ID: {selectedRefund._id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedRefund(null);
                  setRejectReason('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#d4af37',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem' }}>
              {/* Status Badge */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '30px',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  background: `${getStatusColor(selectedRefund.status)}15`,
                  color: getStatusColor(selectedRefund.status),
                  border: `3px solid ${getStatusColor(selectedRefund.status)}`,
                  display: 'inline-block'
                }}>
                  {selectedRefund.status}
                </span>
              </div>

              {/* Customer Info */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e5e7eb 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '1.125rem', fontWeight: '700' }}>
                  Customer Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Name
                    </div>
                    <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                      {selectedRefund.customer?.firstName} {selectedRefund.customer?.lastName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Email
                    </div>
                    <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                      {selectedRefund.customer?.email}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Phone
                    </div>
                    <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                      {selectedRefund.customer?.phone || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Wallet Balance
                    </div>
                    <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: '700' }}>
                      ${selectedRefund.customer?.wallet?.balance?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e5e7eb 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '1.125rem', fontWeight: '700' }}>
                  Booking Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Reference
                    </div>
                    <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '700' }}>
                      {selectedRefund.booking?.bookingReference || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Ride Type
                    </div>
                    <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600', textTransform: 'capitalize' }}>
                      {selectedRefund.booking?.rideType || 'N/A'}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Route
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#1f2937', fontWeight: '600' }}>
                      {selectedRefund.booking?.pickupLocation} → {selectedRefund.booking?.dropoffLocation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Info */}
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #d4af37'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1a1a1a', fontSize: '1.125rem', fontWeight: '700' }}>
                  Refund Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Amount
                    </div>
                    <div style={{ fontSize: '1.75rem', color: '#92400e', fontWeight: '700' }}>
                      ${selectedRefund.amount?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Method
                    </div>
                    <div style={{ fontSize: '1rem', color: '#92400e', fontWeight: '600', textTransform: 'capitalize' }}>
                      {selectedRefund.refundMethod?.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Reason
                    </div>
                    <div style={{ fontSize: '1rem', color: '#92400e', fontWeight: '600' }}>
                      {getReasonLabel(selectedRefund.reason)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                      Requested On
                    </div>
                    <div style={{ fontSize: '1rem', color: '#92400e', fontWeight: '600' }}>
                      {new Date(selectedRefund.requestedAt).toLocaleString()}
                    </div>
                  </div>
                  {selectedRefund.notes && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                        Notes
                      </div>
                      <div style={{
                        fontSize: '0.95rem',
                        color: '#92400e',
                        background: '#fffbeb',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #fbbf24'
                      }}>
                        {selectedRefund.notes}
                      </div>
                    </div>
                  )}
                  {selectedRefund.processedBy && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>
                        Processed By
                      </div>
                      <div style={{ fontSize: '1rem', color: '#92400e', fontWeight: '600' }}>
                        {selectedRefund.processedBy?.firstName} {selectedRefund.processedBy?.lastName}
                        {selectedRefund.processedAt && ` on ${new Date(selectedRefund.processedAt).toLocaleString()}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Only show for pending/processing refunds */}
              {(selectedRefund.status === 'pending' || selectedRefund.status === 'processing') && (
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  {/* Reject Reason Input */}
                  {selectedRefund.status === 'pending' || selectedRefund.status === 'processing' ? (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        marginBottom: '0.5rem',
                        fontWeight: '600'
                      }}>
                        Rejection Reason (optional for approval, required for rejection):
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection or notes for approval..."
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          minHeight: '100px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleApproveRefund(selectedRefund._id, rejectReason)}
                      disabled={actionLoading}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: actionLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontWeight: '700',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: actionLoading ? 'none' : '0 4px 12px rgba(16,185,129,0.3)'
                      }}
                    >
                      {actionLoading ? 'Processing...' : '✓ Approve Refund'}
                    </button>

                    <button
                      onClick={() => handleRejectRefund(selectedRefund._id, rejectReason)}
                      disabled={actionLoading}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: actionLoading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontWeight: '700',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: actionLoading ? 'none' : '0 4px 12px rgba(239,68,68,0.3)'
                      }}
                    >
                      {actionLoading ? 'Processing...' : '✕ Reject Refund'}
                    </button>
                  </div>
                </div>
              )}

              {/* Already Processed Message */}
              {selectedRefund.status === 'completed' && (
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
                  borderRadius: '12px',
                  border: '2px solid #10b981',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.125rem', color: '#065f46', fontWeight: '700' }}>
                    ✓ Refund has been approved and processed
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#047857', marginTop: '0.5rem' }}>
                    Amount has been added to customer's wallet
                  </div>
                </div>
              )}

              {selectedRefund.status === 'rejected' && (
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
                  borderRadius: '12px',
                  border: '2px solid #ef4444',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.125rem', color: '#991b1b', fontWeight: '700' }}>
                    ✕ Refund has been rejected
                  </div>
                  {selectedRefund.notes && (
                    <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginTop: '0.5rem' }}>
                      Reason: {selectedRefund.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize admin data from localStorage
  const getInitialAdminData = () => {
    try {
      const admin = localStorage.getItem('adminData');
      return admin ? JSON.parse(admin) : null;
    } catch {
      return null;
    }
  };
  
  // eslint-disable-next-line no-unused-vars
  const [adminData, setAdminData] = useState(getInitialAdminData);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    
    if (!token || !adminData) {
      navigate('/admin/login');
    }
  }, [navigate, adminData]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Ride Management', icon: Car },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'chauffeurs', label: 'Chauffeurs', icon: UserCheck },
    { id: 'promos', label: 'Promo Codes', icon: Tag },
    { id: 'revenue', label: 'Finance & Payouts', icon: DollarSign },
    { id: 'support', label: 'Support & Operations', icon: HeadphonesIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'customers':
        return <CustomersTab />;
      case 'chauffeurs':
        return <ChauffeursTab />;
      case 'promos':
        return <PromoCodesTab />;
      case 'revenue':
        return <RevenueTab />;
      case 'support':
        return <SupportTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (!adminData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>RIDESERENE</h2>
          <p>Admin Portal</p>
        </div>

        <div className="admin-info">
          <div className="admin-avatar">
            {adminData.firstName[0]}
            {adminData.lastName[0]}
          </div>
          <div className="admin-details">
            <h3>
              {adminData.firstName} {adminData.lastName}
            </h3>
            <span className="admin-role">{adminData.role.replace('_', ' ')}</span>
          </div>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <button className="mobile-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1>{menuItems.find((item) => item.id === activeTab)?.label}</h1>
        </div>

        <div className="admin-content">{renderTabContent()}</div>
      </main>

      {isSidebarOpen && <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default AdminDashboard;

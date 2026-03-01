import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  DollarSign,
  Clock,
  FileText,
  Star,
  LogOut,
  Menu,
  X,
  Power,
  MapPin,
  User,
  Phone,
  Download,
  TrendingUp,
  Calendar,
  MessagesSquare,
  History,
  PlayCircle,
  CheckCircle,
  Mail,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ChauffeurChatTab from '../components/chauffeur/ChauffeurChatTab';
import './ChauffeurDashboard.css';

const ChauffeurDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chauffeurData, setChauffeurData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [todayRides, setTodayRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);
  const [rideRequests, setRideRequests] = useState([]);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [loadingRideSections, setLoadingRideSections] = useState(true);
  const [approvingRideId, setApprovingRideId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [rideDetailsId, setRideDetailsId] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [loadingRideDetails, setLoadingRideDetails] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  const [loadingRideHistory, setLoadingRideHistory] = useState(false);
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [historyStatus, setHistoryStatus] = useState('all');
  const [earningsData, setEarningsData] = useState(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('daily');

  useEffect(() => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const chauffeur = localStorage.getItem('chauffeurInfo');

    if (!token || !chauffeur) {
      navigate('/chauffeur-login');
      return;
    }

    try {
      setChauffeurData(JSON.parse(chauffeur));
      fetchChauffeurProfile(); // Fetch fresh data from API
      fetchTodayRides();
      if (activeTab === 'earnings') {
        fetchEarnings();
      }

      // Auto-refresh ride requests every 30 seconds when on Today tab
      const refreshInterval = setInterval(() => {
        if (activeTab === 'today') {
          console.log('🔄 Auto-refreshing ride requests...');
          fetchTodayRides();
        }
      }, 30000);

      return () => clearInterval(refreshInterval);
    } catch (error) {
      console.error('Authentication error:', error);
      navigate('/chauffeur-login');
    }
  }, [navigate, activeTab]);

  useEffect(() => {
    if (activeTab === 'history' && (localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken'))) {
      fetchRideHistory();
    }
  }, [activeTab]);

  const fetchChauffeurProfile = async () => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/chauffeur/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.chauffeur) {
        setChauffeurData(data.chauffeur);
        setIsOnline(!!data.chauffeur.isOnline);
        localStorage.setItem('chauffeurInfo', JSON.stringify(data.chauffeur));
      }
    } catch (error) {
      console.error('Error fetching chauffeur profile:', error);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch(`${API_BASE}/api/chauffeur/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Profile picture updated successfully!');
        // Refresh profile data
        await fetchChauffeurProfile();
      } else {
        alert(data.message || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      // Reset file input
      e.target.value = '';
    }
  };

  const fetchTodayRides = async () => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      setLoadingRides(true);
      setLoadingRideSections(true);
      console.log('🔍 Fetching ride management sections from API');

      const [requestsRes, upcomingRes, completedRes] = await Promise.all([
        fetch(`${API_BASE}/api/chauffeur/dashboard/rides/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          cache: 'no-store',
        }),
        fetch(`${API_BASE}/api/chauffeur/dashboard/rides/upcoming`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/api/chauffeur/dashboard/rides/completed`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      // Parse all responses
      let requestsData, upcomingData, completedData;
      
      try {
        requestsData = await requestsRes.json();
        upcomingData = await upcomingRes.json();
        completedData = await completedRes.json();
      } catch (parseError) {
        console.error('❌ Error parsing API responses:', parseError);
        setRideRequests([]);
        setUpcomingRides([]);
        setCompletedRides([]);
        return;
      }

      console.log('📊 Ride requests response:', requestsData);
      console.log('📊 Upcoming rides response:', upcomingData);
      console.log('📊 Completed rides response:', completedData);

      // Handle ride requests
      if (requestsRes.ok && requestsData.success) {
        const requests = Array.isArray(requestsData.data) ? requestsData.data : [];
        console.log(`✅ Loaded ${requests.length} ride requests`);
        if (requests.length > 0) {
          console.log('📋 First request:', requests[0].bookingReference);
          console.log('📋 Sample request:', {
            id: requests[0]._id,
            ref: requests[0].bookingReference,
            status: requests[0].status,
            chauffeur: requests[0].chauffeur,
            customer: requests[0].customer,
          });
        }
        setRideRequests(requests);
      } else {
        if (!requestsRes.ok) {
          console.error('❌ Ride requests API error:', requestsRes.status, requestsData?.message || requestsData?.error);
        } else {
          console.error('❌ Failed to load ride requests:', requestsData.message || requestsData.error);
        }
        setRideRequests([]);
      }
      if (upcomingData.success) {
        setUpcomingRides(upcomingData.data || []);
      }
      if (completedData.success) {
        setCompletedRides(completedData.data || []);
      }

      // keep todayRides as "upcoming" for backwards compatibility with any other UI pieces
      const combinedUpcoming = Array.isArray(upcomingData.data) ? upcomingData.data : [];
      setTodayRides(combinedUpcoming);
      console.log('✅ Set ride management state:', {
        requests: requestsData.data?.length,
        upcoming: upcomingData.data?.length,
        completed: completedData.data?.length,
      });
    } catch (error) {
      console.error('❌ Fetch today rides error:', error);
    } finally {
      setLoadingRides(false);
      setLoadingRideSections(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chauffeurToken');
    sessionStorage.removeItem('chauffeurToken');
    localStorage.removeItem('chauffeurInfo');
    navigate('/chauffeur-login');
  };

  const toggleOnlineStatus = async () => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const next = !isOnline;
    try {
      const res = await fetch(`${API_BASE}/api/chauffeur/dashboard/online-status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline: next }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIsOnline(data.data.isOnline);
        setChauffeurData((prev) => (prev ? { ...prev, isOnline: data.data.isOnline } : null));
      }
    } catch (err) {
      console.error('Toggle online status error:', err);
    }
  };

  const handleApproveRide = async (rideId) => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      setApprovingRideId(rideId);
      console.log('🔍 Approving ride:', rideId);

      const response = await fetch(`${API_BASE}/api/chauffeur/dashboard/rides/${rideId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📊 Approve ride response:', data);

      if (data.success && data.data) {
        // Refresh all ride sections to keep everything in sync
        await fetchTodayRides();
        alert('Ride approved successfully!');
      } else {
        alert(data.message || 'Failed to approve ride');
      }
    } catch (error) {
      console.error('❌ Approve ride error:', error);
      alert('Error approving ride. Please try again.');
    } finally {
      setApprovingRideId(null);
    }
  };

  const handleDeclineRide = async (rideId) => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      console.log('🔍 Declining ride:', rideId);
      const response = await fetch(`${API_BASE}/api/chauffeur/dashboard/rides/${rideId}/decline`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📊 Decline ride response:', data);

      if (data.success) {
        // Optimistically remove from local requests
        setRideRequests((prev) => prev.filter((ride) => ride._id !== rideId));
        alert('Ride request declined.');
      } else {
        alert(data.message || 'Failed to decline ride');
      }
    } catch (error) {
      console.error('❌ Decline ride error:', error);
      alert('Error declining ride. Please try again.');
    }
  };

  const handleStartRide = async (rideId) => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      setStatusUpdatingId(rideId);
      const res = await fetch(`${API_BASE}/api/chauffeur/dashboard/rides/${rideId}/start`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        await fetchTodayRides();
        if (rideDetailsId === rideId) {
          setRideDetails(data.data);
        }
        alert('Ride started.');
      } else {
        alert(data.message || 'Failed to start ride');
      }
    } catch (err) {
      console.error('Start ride error:', err);
      alert('Error starting ride.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleCompleteRide = async (rideId, notes) => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      setStatusUpdatingId(rideId);
      const res = await fetch(`${API_BASE}/api/chauffeur/dashboard/rides/${rideId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTodayRides();
        setRideDetailsId(null);
        setRideDetails(null);
        alert('Ride completed.');
      } else {
        alert(data.message || 'Failed to complete ride');
      }
    } catch (err) {
      console.error('Complete ride error:', err);
      alert('Error completing ride.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openRideDetails = async (id) => {
    setRideDetailsId(id);
    setRideDetails(null);
    setLoadingRideDetails(true);
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/chauffeur/dashboard/rides/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRideDetails(data.data);
    } catch (err) {
      console.error('Fetch ride details error:', err);
    } finally {
      setLoadingRideDetails(false);
    }
  };

  const fetchRideHistory = async () => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setLoadingRideHistory(true);
    try {
      const params = new URLSearchParams();
      if (historyDateFrom) params.set('dateFrom', historyDateFrom);
      if (historyDateTo) params.set('dateTo', historyDateTo);
      if (historyStatus && historyStatus !== 'all') params.set('status', historyStatus);
      const res = await fetch(`${API_BASE}/api/chauffeur/dashboard/rides/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRideHistory(data.data || []);
    } catch (err) {
      console.error('Fetch ride history error:', err);
    } finally {
      setLoadingRideHistory(false);
    }
  };

  const fetchEarnings = async () => {
    const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      setLoadingEarnings(true);
      const response = await fetch(`${API_BASE}/api/chauffeur/dashboard/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEarningsData(data.data);
      }
    } catch (error) {
      console.error('Fetch earnings error:', error);
    } finally {
      setLoadingEarnings(false);
    }
  };

  const downloadEarningsReport = () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Earnings data:', earningsData);
      
      if (!earningsData) {
        alert('No earnings data available to download');
        return;
      }

      const { summary, completedRides } = earningsData;
      
      if (!summary || !completedRides) {
        alert('Earnings data is incomplete');
        console.log('Summary:', summary, 'Completed rides:', completedRides);
        return;
      }
      
      console.log('Creating PDF document...');
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(212, 175, 55);
      doc.text('Earnings Report', 105, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 28, { align: 'center' });
      
      // Add summary section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(11);
      const summaryData = [
        ['Total Earnings', `$${(summary.total || 0).toFixed(2)}`],
        ['Total Rides', (summary.totalRides || 0).toString()],
        ['This Month', `$${(summary.month || 0).toFixed(2)}`],
        ['This Week', `$${(summary.week || 0).toFixed(2)}`],
        ['Today', `$${(summary.today || 0).toFixed(2)}`]
      ];
      
      console.log('Adding summary table...');
      autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
        margin: { left: 14 },
        tableWidth: 80
      });
      
      // Add rides section
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Completed Rides', 14, finalY);
      
      // Prepare rides data
      console.log('Preparing rides data...');
      const ridesData = completedRides.map(ride => {
        const date = ride.pickupDate ? new Date(ride.pickupDate).toLocaleDateString() : 'N/A';
        const customer = `${ride.customer?.firstName || ''} ${ride.customer?.lastName || ''}`.trim() || 'N/A';
        const vehicle = ride.vehicleClass?.name || ride.vehicleType || 'N/A';
        const amount = ride.totalPrice ? ride.totalPrice.toFixed(2) : '0.00';
        const status = ride.status ? ride.status.charAt(0).toUpperCase() + ride.status.slice(1) : 'N/A';
        
        return [
          date,
          ride.bookingReference || 'N/A',
          customer,
          vehicle,
          `$${amount}`,
          status
        ];
      });
      
      console.log('Adding rides table with', ridesData.length, 'rides...');
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Date', 'Booking Ref', 'Customer', 'Vehicle', 'Amount', 'Status']],
        body: ridesData,
        theme: 'grid',
        headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25 }
        },
        margin: { left: 14, right: 14 }
      });
      
      // Add footer
      console.log('Adding footer...');
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('RideSerene - Chauffeur Earnings Report', 105, 290, { align: 'center' });
      }
      
      // Save the PDF
      const filename = `earnings_report_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF as:', filename);
      doc.save(filename);
      console.log('PDF saved successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      alert(`Failed to generate PDF report: ${error.message}`);
    }
  };

  const menuItems = [
    { id: 'today', label: 'Ride Management', icon: LayoutDashboard },
    { id: 'history', label: 'Ride History', icon: History },
    { id: 'chat', label: 'Chat', icon: MessagesSquare },
    { id: 'earnings', label: 'Earnings & Payouts', icon: DollarSign },
    { id: 'schedule', label: 'Availability', icon: Clock },
    { id: 'vehicle', label: 'Vehicle & Documents', icon: Car },
    { id: 'ratings', label: 'Ratings & Feedback', icon: Star },
    { id: 'documents', label: 'My Documents', icon: FileText },
  ];

  // Responsive utility function
  const getResponsiveStyles = () => {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const isSmallPhone = window.innerWidth <= 480;

    return {
      containerPadding: isSmallPhone ? '0.75rem' : isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
      cardPadding: isSmallPhone ? '1rem' : isMobile ? '1.25rem' : '2.5rem',
      headerFontSize: isSmallPhone ? '1.25rem' : isMobile ? '1.5rem' : '2rem',
      subHeaderFontSize: isSmallPhone ? '1rem' : isMobile ? '1.1rem' : '1.5rem',
      gridColumns: isSmallPhone ? '1fr' : isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      buttonPadding: isSmallPhone ? '0.5rem 1rem' : '0.75rem 1.5rem',
      imagemaxHeight: isSmallPhone ? '200px' : isMobile ? '300px' : '500px',
      gap: isSmallPhone ? '1rem' : isMobile ? '1.5rem' : '2rem',
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#d4af37';
      case 'assigned': return '#17a2b8';
      case 'in_progress': return '#4caf50';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const rideDate = new Date(d);
    rideDate.setHours(0, 0, 0, 0);
    
    if (rideDate.getTime() === today.getTime()) return 'Today';
    if (rideDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Placeholder components for each tab
  const TodayTab = () => {
    const requestCount = rideRequests.length;
    const upcomingCount = upcomingRides.length;
    const completedCount = completedRides.length;

    return (
      <div className="ride-mgmt">
        <header className="ride-mgmt-header">
          <div>
            <h2 className="ride-mgmt-title">Ride Management</h2>
            <p className="ride-mgmt-subtitle">
              {loadingRideSections
                ? 'Loading rides...'
                : `${requestCount} request${requestCount !== 1 ? 's' : ''}, ${upcomingCount} upcoming, ${completedCount} completed`}
            </p>
          </div>
          <div className="ride-mgmt-toolbar">
            <button
              type="button"
              onClick={fetchTodayRides}
              disabled={loadingRideSections}
              className="ride-mgmt-refresh-btn"
              title="Refresh ride requests"
            >
              <RefreshCw size={18} className={loadingRideSections ? 'spinning' : ''} />
            </button>
            <span className="ride-mgmt-online-badge">Status</span>
            <button
              type="button"
              onClick={toggleOnlineStatus}
              className={`ride-mgmt-online-btn ${isOnline ? 'online' : 'offline'}`}
            >
              <Power size={20} />
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </header>

        {loadingRideSections ? (
          <div className="ride-mgmt-loading">
            <div className="spinner" />
            Loading rides...
          </div>
        ) : (
          <div className="ride-mgmt-grid">
            {/* Ride Requests */}
            <section className="ride-mgmt-section">
              <div className="ride-mgmt-section-header">
                <h3 className="ride-mgmt-section-title">Ride Requests</h3>
                <span className="ride-mgmt-badge ride-mgmt-badge--requests">{rideRequests.length}</span>
              </div>
              {rideRequests.length === 0 ? (
                <p className="ride-mgmt-empty">No ride requests.</p>
              ) : (
                <div className="ride-mgmt-cards">
                  {rideRequests.map((ride) => (
                    <div key={ride._id} className="ride-card">
                      <div className="ride-card__row">
                        <div>
                          <h4 className="ride-card__ref">{ride.bookingReference}</h4>
                          <div className="ride-card__customer">{ride.customer?.firstName} {ride.customer?.lastName}</div>
                        </div>
                        <div>
                          <div className="ride-card__price">${ride.totalPrice?.toFixed(2)}</div>
                          <div className="ride-card__vehicle">{ride.vehicleClass?.name || 'Standard'}</div>
                        </div>
                      </div>
                      <div className="ride-card__meta">
                        <span className="ride-card__meta-item"><Clock size={16} />{formatDate(ride.pickupDate)} at {formatTime(ride.pickupTime)}</span>
                        <span className="ride-card__meta-item"><MapPin size={16} className="pin" />{ride.pickupLocation?.address}</span>
                      </div>
                      <div className="ride-card__actions">
                        <button type="button" onClick={() => handleApproveRide(ride._id)} disabled={approvingRideId === ride._id} className="btn-ride btn-ride--primary" style={{ flex: 1, minWidth: 140 }}>
                          {approvingRideId === ride._id ? 'Accepting...' : 'Accept Ride'}
                        </button>
                        <button type="button" onClick={() => handleDeclineRide(ride._id)} className="btn-ride btn-ride--danger-outline" style={{ flex: 1, minWidth: 120 }}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming & Active Rides */}
            <section className="ride-mgmt-section">
              <div className="ride-mgmt-section-header">
                <h3 className="ride-mgmt-section-title">Upcoming & Active Rides</h3>
                <span className="ride-mgmt-badge ride-mgmt-badge--upcoming">{upcomingRides.length}</span>
              </div>
              {upcomingRides.length === 0 ? (
                <p className="ride-mgmt-empty">No upcoming rides.</p>
              ) : (
                <div className="ride-mgmt-cards">
                  {upcomingRides.map((ride) => (
                    <div key={ride._id} className="ride-card">
                      <div className="ride-card__row">
                        <div>
                          <h4 className="ride-card__ref">{ride.bookingReference}</h4>
                          <span className="ride-card__status" style={{ background: `${getStatusColor(ride.status)}20`, color: getStatusColor(ride.status) }}>{ride.status?.toUpperCase().replace('_', ' ')}</span>
                        </div>
                        <div>
                          <div className="ride-card__price">${ride.totalPrice?.toFixed(2)}</div>
                          <div className="ride-card__vehicle">{ride.vehicleClass?.name || 'Standard'}</div>
                        </div>
                      </div>
                      <div className="ride-card__details">
                        <div className="ride-card__detail-row">
                          <Clock size={18} />
                          <div><span className="ride-card__detail-label">Pickup </span><span className="ride-card__detail-value">{formatDate(ride.pickupDate)} at {formatTime(ride.pickupTime)}</span></div>
                        </div>
                        <div className="ride-card__detail-row">
                          <MapPin size={18} className="pin" />
                          <div><span className="ride-card__detail-label">Pickup </span><span className="ride-card__detail-value">{ride.pickupLocation?.address}</span></div>
                        </div>
                        {ride.dropoffLocation?.address && (
                          <div className="ride-card__detail-row">
                            <MapPin size={18} className="pin-drop" />
                            <div><span className="ride-card__detail-label">Dropoff </span><span className="ride-card__detail-value">{ride.dropoffLocation.address}</span></div>
                          </div>
                        )}
                      </div>
                      <div className="ride-card__customer-block">
                        <div className="ride-card__customer-label">Customer</div>
                        <div className="ride-card__customer-row"><User size={18} /><span>{ride.customer?.firstName} {ride.customer?.lastName}</span></div>
                        <div className="ride-card__customer-row"><Phone size={18} /><span>{ride.customer?.phone || ride.customer?.email}</span></div>
                      </div>
                      <div className="ride-card__actions">
                        <button type="button" onClick={() => openRideDetails(ride._id)} className="btn-ride btn-ride--ghost">View Details</button>
                        {(ride.status === 'in-progress' || ride.status === 'assigned' || ride.status === 'confirmed') && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setActiveTab('chat');
                              localStorage.setItem('chatBookingId', ride._id);
                            }} 
                            className="btn-ride btn-ride--info"
                            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #86efac 100%)', color: '#1a1a1a' }}
                          >
                            <MessageCircle size={18} />Chat
                          </button>
                        )}
                        {(ride.status === 'assigned' || ride.status === 'confirmed') && (
                          <button type="button" onClick={() => handleStartRide(ride._id)} disabled={statusUpdatingId === ride._id} className="btn-ride btn-ride--success">
                            <PlayCircle size={18} />{statusUpdatingId === ride._id ? 'Starting...' : 'Start Ride'}
                          </button>
                        )}
                        {ride.status === 'in-progress' && (
                          <button type="button" onClick={() => handleCompleteRide(ride._id)} disabled={statusUpdatingId === ride._id} className="btn-ride btn-ride--info">
                            <CheckCircle size={18} />{statusUpdatingId === ride._id ? 'Completing...' : 'Complete Ride'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Completed Rides */}
            <section className="ride-mgmt-section">
              <div className="ride-mgmt-section-header">
                <h3 className="ride-mgmt-section-title">Completed Rides</h3>
                <span className="ride-mgmt-badge ride-mgmt-badge--completed">{completedRides.length}</span>
              </div>
              {completedRides.length === 0 ? (
                <p className="ride-mgmt-empty">No completed rides in recent list.</p>
              ) : (
                <div className="ride-mgmt-cards">
                  {completedRides.map((ride) => (
                    <div key={ride._id} className="ride-card ride-card--compact">
                      <div>
                        <div className="ride-card__ref">{ride.bookingReference}</div>
                        <div className="ride-card__customer">{ride.customer?.firstName} {ride.customer?.lastName} • {ride.pickupDate ? new Date(ride.pickupDate).toLocaleDateString() : ''}</div>
                      </div>
                      <div className="ride-card__right">
                        <div>
                          <div className="ride-card__price">${ride.totalPrice?.toFixed(2)}</div>
                          <div className="ride-card__vehicle">{ride.vehicleClass?.name || 'Standard'}</div>
                        </div>
                        <button type="button" onClick={() => openRideDetails(ride._id)} className="btn-ride btn-ride--ghost">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    );
  };

  const RideHistoryTab = () => {
    const styles = getResponsiveStyles();
    return (
      <div style={{ padding: styles.containerPadding }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: styles.headerFontSize }}>Ride History</h2>
        <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: styles.subHeaderFontSize }}>Filter by date range and status.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>From</span>
            <input type="date" value={historyDateFrom} onChange={(e) => setHistoryDateFrom(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #dee2e6', borderRadius: 8, fontSize: '0.9rem' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>To</span>
            <input type="date" value={historyDateTo} onChange={(e) => setHistoryDateTo(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #dee2e6', borderRadius: 8, fontSize: '0.9rem' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>Status</span>
            <select value={historyStatus} onChange={(e) => setHistoryStatus(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #dee2e6', borderRadius: 8, fontSize: '0.9rem', minWidth: 140 }}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <button onClick={fetchRideHistory} disabled={loadingRideHistory} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a6 100%)', color: '#000', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: loadingRideHistory ? 'not-allowed' : 'pointer' }}>
            {loadingRideHistory ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
        {loadingRideHistory ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading history...</div>
        ) : rideHistory.length === 0 ? (
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#666' }}>No rides match the filters. Adjust dates/status and click Apply.</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9ecef', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Reference</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rideHistory.map((ride) => (
                    <tr key={ride._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{ride.bookingReference}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{ride.customer?.firstName} {ride.customer?.lastName}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{ride.pickupDate ? new Date(ride.pickupDate).toLocaleDateString() : '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, background: `${getStatusColor(ride.status)}20`, color: getStatusColor(ride.status) }}>{ride.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#d4af37' }}>${ride.totalPrice?.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}><button onClick={() => openRideDetails(ride._id)} style={{ padding: '0.4rem 0.75rem', background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer' }}>Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const EarningsTab = () => {
    const styles = getResponsiveStyles();
    
    if (loadingEarnings) {
      return (
        <div style={{ padding: styles.containerPadding, textAlign: 'center' }}>
          <div style={{ fontSize: styles.subHeaderFontSize, color: '#d4af37' }}>Loading earnings...</div>
        </div>
      );
    }

    if (!earningsData) {
      return (
        <div style={{ padding: styles.containerPadding, textAlign: 'center' }}>
          <div style={{ fontSize: styles.subHeaderFontSize, color: '#666' }}>No earnings data available</div>
        </div>
      );
    }

    const { summary, dailyEarnings, weeklyEarnings, monthlyEarnings, completedRides } = earningsData;

    const getChartData = () => {
      if (chartPeriod === 'daily') return dailyEarnings;
      if (chartPeriod === 'weekly') return weeklyEarnings;
      return monthlyEarnings;
    };

    const chartData = getChartData();

    return (
      <div style={{ padding: styles.containerPadding, maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Download Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: styles.gap }}>
          <h2 style={{ fontSize: styles.headerFontSize, fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            Earnings & Payouts
          </h2>
          <button
            onClick={downloadEarningsReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: styles.buttonPadding,
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a6 100%)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Download size={20} />
            Download Report
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: styles.gridColumns, 
          gap: styles.gap, 
          marginBottom: '2rem' 
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a6 100%)',
            padding: styles.cardPadding,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#1a1a1a', fontWeight: '600', marginBottom: '0.5rem' }}>
              Today's Earnings
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>
              ${summary.today.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#1a1a1a', marginTop: '0.5rem' }}>
              {summary.todayRides} rides
            </div>
          </div>

          <div style={{
            background: '#fff',
            padding: styles.cardPadding,
            borderRadius: '12px',
            border: '2px solid #d4af37',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: '600', marginBottom: '0.5rem' }}>
              This Week
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d4af37' }}>
              ${summary.week.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              {summary.weekRides} rides
            </div>
          </div>

          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #c0c0c0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: '600', marginBottom: '0.5rem' }}>
              This Month
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a' }}>
              ${summary.month.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              {summary.monthRides} rides
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
              Total Earnings
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>
              ${summary.total.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#c0c0c0', marginTop: '0.5rem' }}>
              {summary.totalRides} rides
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
              Earnings Chart
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setChartPeriod('daily')}
                style={{
                  padding: '0.5rem 1rem',
                  background: chartPeriod === 'daily' ? '#d4af37' : '#f5f5f5',
                  color: chartPeriod === 'daily' ? '#000' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Daily
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                style={{
                  padding: '0.5rem 1rem',
                  background: chartPeriod === 'weekly' ? '#d4af37' : '#f5f5f5',
                  color: chartPeriod === 'weekly' ? '#000' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                style={{
                  padding: '0.5rem 1rem',
                  background: chartPeriod === 'monthly' ? '#d4af37' : '#f5f5f5',
                  color: chartPeriod === 'monthly' ? '#000' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Pie Chart */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem', padding: '3rem 0', minHeight: '550px' }}>
            {chartData.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', color: '#666' }}>
                No data available for this period
              </div>
            ) : (() => {
              const total = chartData.reduce((sum, item) => sum + item.total, 0);
              const colors = [
                '#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5',
                '#70AD47', '#264478', '#9E480E', '#636363', '#997300',
                '#255E91', '#43682B', '#698ED0', '#F1975A', '#B7B7B7'
              ];
              
              let currentAngle = -90; // Start from top
              
              return (
                <>
                  {/* Pie Chart SVG */}
                  <div style={{ position: 'relative' }}>
                    <svg width="500" height="500" viewBox="0 0 200 200" style={{ 
                      filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
                      transition: 'all 0.3s ease'
                    }}>
                      {chartData.map((item, index) => {
                        const percentage = (item.total / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        
                        // Calculate path for pie slice
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        const x1 = 100 + 95 * Math.cos(startRad);
                        const y1 = 100 + 95 * Math.sin(startRad);
                        const x2 = 100 + 95 * Math.cos(endRad);
                        const y2 = 100 + 95 * Math.sin(endRad);
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        const path = `M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        
                        // Calculate label position
                        const midAngle = startAngle + angle / 2;
                        const midRad = (midAngle * Math.PI) / 180;
                        const labelX = 100 + 65 * Math.cos(midRad);
                        const labelY = 100 + 65 * Math.sin(midRad);
                        
                        currentAngle = endAngle;
                        
                        return (
                          <g key={index}>
                            <path
                              d={path}
                              fill={colors[index % colors.length]}
                              stroke="#fff"
                              strokeWidth="2"
                              style={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transformOrigin: '100px 100px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.filter = 'brightness(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.filter = 'brightness(1)';
                              }}
                            >
                              <title>{`$${item.total.toFixed(2)} (${percentage.toFixed(1)}%)`}</title>
                            </path>
                            {percentage > 3 && (
                              <text
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                fontSize="14"
                                fontWeight="700"
                                fill="#fff"
                                style={{ 
                                  pointerEvents: 'none', 
                                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                  fontFamily: 'Arial, sans-serif'
                                }}
                              >
                                {percentage.toFixed(1)}%
                              </text>
                            )}
                          </g>
                        );
                      })}
                      {/* Center circle for donut effect */}
                      <circle cx="100" cy="100" r="40" fill="#fff" stroke="#e0e0e0" strokeWidth="1" />
                      <text x="100" y="92" textAnchor="middle" fontSize="12" fontWeight="600" fill="#666">
                        Total Earnings
                      </text>
                      <text x="100" y="108" textAnchor="middle" fontSize="20" fontWeight="700" fill="#d4af37">
                        ${total.toFixed(0)}
                      </text>
                      <text x="100" y="120" textAnchor="middle" fontSize="10" fill="#999">
                        {chartData.reduce((sum, item) => sum + item.count, 0)} rides
                      </text>
                    </svg>
                  </div>
                  
                  {/* Legend */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem', 
                    maxHeight: '500px', 
                    overflowY: 'auto',
                    paddingRight: '1rem'
                  }}>
                    {chartData.map((item, index) => {
                      const percentage = ((item.total / total) * 100).toFixed(1);
                      const label = chartPeriod === 'daily' 
                        ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : chartPeriod === 'weekly'
                        ? `Week ${item._id.week}`
                        : `${new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' })}`;
                      
                      return (
                        <div 
                          key={index} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            cursor: 'pointer',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: '#f8f9fa',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e9ecef';
                            e.currentTarget.style.transform = 'translateX(5px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: colors[index % colors.length],
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '700', 
                              color: '#1a1a1a', 
                              fontSize: '0.95rem',
                              marginBottom: '0.25rem'
                            }}>
                              {label}
                            </div>
                            <div style={{ 
                              fontSize: '0.875rem', 
                              color: '#d4af37',
                              fontWeight: '600',
                              marginBottom: '0.1rem'
                            }}>
                              ${item.total.toFixed(2)}
                            </div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#666',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{
                                padding: '2px 6px',
                                background: '#d4af37',
                                color: '#fff',
                                borderRadius: '4px',
                                fontWeight: '600'
                              }}>
                                {percentage}%
                              </span>
                              <span>{item.count} rides</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Payment History Table */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1.5rem' }}>
            Payment History
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #d4af37' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1a1a1a' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1a1a1a' }}>Booking Ref</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1a1a1a' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1a1a1a' }}>Route</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1a1a1a' }}>Vehicle</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1a1a1a' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1a1a1a' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedRides.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  completedRides.map((ride) => (
                    <tr key={ride._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '1rem', color: '#666' }}>
                        {new Date(ride.pickupDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#1a1a1a' }}>
                        {ride.bookingReference}
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>
                        {ride.customer?.firstName} {ride.customer?.lastName}
                      </td>
                      <td style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ride.pickupLocation?.address} → {ride.dropoffLocation?.address || 'Same location'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>
                        {ride.vehicleClass?.name || 'Standard'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#d4af37', fontSize: '1.125rem' }}>
                        ${ride.totalPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: ride.status === 'completed' ? '#28a745' : '#d4af37',
                          color: '#fff'
                        }}>
                          {ride.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ScheduleTab = () => {
    const [availability, setAvailability] = useState({
      monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' }
    });
    const [savingAvailability, setSavingAvailability] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(true);

    // Fetch existing availability on component mount
    useEffect(() => {
      const fetchAvailability = async () => {
        try {
          const token = localStorage.getItem('chauffeurToken');
          const response = await fetch('http://localhost:5000/api/chauffeur/dashboard/availability', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && Object.keys(data.data).length > 0) {
              setAvailability(data.data);
            }
          }
        } catch (error) {
          console.error('Error fetching availability:', error);
        } finally {
          setLoadingAvailability(false);
        }
      };

      fetchAvailability();
    }, []);

    const dayLabels = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    const toggleDay = (day) => {
      setAvailability(prev => ({
        ...prev,
        [day]: { ...prev[day], enabled: !prev[day].enabled }
      }));
    };

    const updateTime = (day, field, value) => {
      setAvailability(prev => ({
        ...prev,
        [day]: { ...prev[day], [field]: value }
      }));
    };

    const saveAvailability = async () => {
      setSavingAvailability(true);
      try {
        const token = localStorage.getItem('chauffeurToken');
        const response = await fetch('http://localhost:5000/api/chauffeur/dashboard/availability', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ availability })
        });

        if (response.ok) {
          alert('Availability saved successfully!');
        } else {
          alert('Failed to save availability');
        }
      } catch (error) {
        console.error('Error saving availability:', error);
        alert('Error saving availability');
      } finally {
        setSavingAvailability(false);
      }
    };

    if (loadingAvailability) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: '#d4af37' }}>Loading availability...</div>
        </div>
      );
    }

    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Availability & Schedule
          </h2>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Set your working hours and availability. Toggle days on/off and set your preferred working hours.
          </p>
        </div>

        {/* Online Status Toggle */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              Online Status
            </h3>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
              {isOnline ? 'You are currently online and available for rides' : 'You are currently offline'}
            </p>
          </div>
          <button
            onClick={toggleOnlineStatus}
            style={{
              position: 'relative',
              width: '80px',
              height: '40px',
              backgroundColor: isOnline ? '#d4af37' : '#ccc',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              boxShadow: isOnline ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '4px',
              left: isOnline ? '44px' : '4px',
              width: '32px',
              height: '32px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              transition: 'left 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        {/* Weekly Availability Schedule */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>
            Weekly Schedule
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.keys(availability).map(day => (
              <div key={day} style={{
                display: 'grid',
                gridTemplateColumns: '150px 80px 1fr 1fr 120px',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: availability[day].enabled ? '#f8f9fa' : '#fff',
                borderRadius: '8px',
                border: `2px solid ${availability[day].enabled ? '#d4af37' : '#e0e0e0'}`,
                transition: 'all 0.3s ease'
              }}>
                {/* Day Name */}
                <div style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>
                  {dayLabels[day]}
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => toggleDay(day)}
                  style={{
                    position: 'relative',
                    width: '60px',
                    height: '30px',
                    backgroundColor: availability[day].enabled ? '#d4af37' : '#ccc',
                    borderRadius: '15px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: availability[day].enabled ? '33px' : '3px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </button>

                {/* Start Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#666" />
                  <input
                    type="time"
                    value={availability[day].startTime}
                    onChange={(e) => updateTime(day, 'startTime', e.target.value)}
                    disabled={!availability[day].enabled}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      width: '100%',
                      opacity: availability[day].enabled ? 1 : 0.5,
                      cursor: availability[day].enabled ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                {/* End Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#666" />
                  <input
                    type="time"
                    value={availability[day].endTime}
                    onChange={(e) => updateTime(day, 'endTime', e.target.value)}
                    disabled={!availability[day].enabled}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      width: '100%',
                      opacity: availability[day].enabled ? 1 : 0.5,
                      cursor: availability[day].enabled ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                {/* Status Badge */}
                <div style={{
                  textAlign: 'center',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  backgroundColor: availability[day].enabled ? '#d4f4dd' : '#f5f5f5',
                  color: availability[day].enabled ? '#1e7e34' : '#666'
                }}>
                  {availability[day].enabled ? 'Available' : 'Off'}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              onClick={saveAvailability}
              disabled={savingAvailability}
              style={{
                padding: '0.75rem 2rem',
                background: savingAvailability ? '#ccc' : 'linear-gradient(135deg, #d4af37 0%, #f4e5a6 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: savingAvailability ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!savingAvailability) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.3)';
              }}
            >
              {savingAvailability ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => {
              const allEnabled = {};
              Object.keys(availability).forEach(day => {
                allEnabled[day] = { ...availability[day], enabled: true };
              });
              setAvailability(allEnabled);
            }}
            style={{
              padding: '1rem',
              background: '#fff',
              border: '2px solid #d4af37',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#d4af37',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#d4af37';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#d4af37';
            }}
          >
            Enable All Days
          </button>

          <button
            onClick={() => {
              const allDisabled = {};
              Object.keys(availability).forEach(day => {
                allDisabled[day] = { ...availability[day], enabled: false };
              });
              setAvailability(allDisabled);
            }}
            style={{
              padding: '1rem',
              background: '#fff',
              border: '2px solid #dc3545',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#dc3545',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#dc3545';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#dc3545';
            }}
          >
            Disable All Days
          </button>

          <button
            onClick={() => {
              const weekdaysOnly = { ...availability };
              ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                weekdaysOnly[day] = { ...weekdaysOnly[day], enabled: true };
              });
              ['saturday', 'sunday'].forEach(day => {
                weekdaysOnly[day] = { ...weekdaysOnly[day], enabled: false };
              });
              setAvailability(weekdaysOnly);
            }}
            style={{
              padding: '1rem',
              background: '#fff',
              border: '2px solid #17a2b8',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#17a2b8',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#17a2b8';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#17a2b8';
            }}
          >
            Weekdays Only
          </button>
        </div>
      </div>
    );
  };

  const VehicleTab = () => {
    const styles = getResponsiveStyles();
    
    // Helper function to construct proper image/document URLs
    const getDocumentUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('data:')) return path;
      if (path.startsWith('http')) return path;
      const cleanPath = path.replace(/^\//, '');
      return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
    };

    if (!chauffeurData || !chauffeurData.vehicle) {
      return (
        <div style={{ padding: styles.containerPadding, textAlign: 'center' }}>
          <Car size={64} style={{ color: '#d4af37', margin: '0 auto 1rem' }} />
          <h2>No Vehicle Information</h2>
          <p style={{ color: '#666' }}>Your vehicle details are not available. Please contact support.</p>
        </div>
      );
    }

    return (
      <div style={{ padding: styles.containerPadding, background: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              padding: '1rem',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}>
              <Car size={32} style={{ color: 'white', display: 'block' }} />
            </div>
            <div>
              <h2 style={{ color: '#1a1a1a', margin: 0, fontSize: styles.headerFontSize, fontWeight: '700' }}>
                Vehicle & Documents
              </h2>
              <p style={{ color: '#666', margin: '0.3rem 0 0 0', fontSize: styles.subHeaderFontSize }}>
                Your vehicle information and uploaded documents
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Information Card */}
        <div style={{ 
          background: 'white',
          borderRadius: '20px',
          padding: styles.cardPadding,
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
            backgroundSize: '200% 100%',
            animation: 'gradient 3s ease infinite'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '4px', 
              height: '24px', 
              background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
              borderRadius: '4px'
            }} />
            <h3 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              Vehicle Details
            </h3>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: styles.gridColumns,
            gap: styles.gap
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '2px solid #f0f0f0',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(212, 175, 55, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Model
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1a1a1a', lineHeight: '1.3' }}>
                {chauffeurData.vehicle.model}
              </div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '2px solid #f0f0f0',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(212, 175, 55, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Year
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1a1a1a' }}>
                {chauffeurData.vehicle.year}
              </div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '2px solid #f0f0f0',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(212, 175, 55, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Color
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: chauffeurData.vehicle.color.toLowerCase(),
                  border: '2px solid #ddd',
                  display: 'inline-block'
                }} />
                {chauffeurData.vehicle.color}
              </div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '2px solid #f0f0f0',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(212, 175, 55, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Registration
              </div>
              <div style={{ 
                fontSize: '1.35rem', 
                fontWeight: '700', 
                color: '#1a1a1a', 
                fontFamily: 'monospace',
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {chauffeurData.vehicle.registrationNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Photo */}
        {chauffeurData.vehicle.vehiclePhoto && (
          <div style={{ 
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ 
                width: '4px', 
                height: '24px', 
                background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
                borderRadius: '4px'
              }} />
              <h3 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                Vehicle Photo
              </h3>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#f8f9fa'
            }}>
              <img 
                src={getDocumentUrl(chauffeurData.vehicle.vehiclePhoto)}
                alt="Vehicle Photo"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '500px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  objectFit: 'cover',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onClick={() => window.open(getDocumentUrl(chauffeurData.vehicle.vehiclePhoto), '_blank')}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 16px 40px rgba(0,0,0,0.18)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                }}
              />
            </div>
          </div>
        )}

        {/* Vehicle Documents */}
        <div style={{ 
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '4px', 
              height: '24px', 
              background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
              borderRadius: '4px'
            }} />
            <h3 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              Vehicle Documents
            </h3>
          </div>
          
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Registration Certificate */}
            {chauffeurData.vehicle.registrationCertificate && (
              <div style={{ 
                padding: '2rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #f0f0f0',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      📋
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.25rem', fontWeight: '700' }}>
                      Registration Certificate
                    </h4>
                  </div>
                </div>
                <div style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white',
                  padding: '1rem',
                  border: '2px solid #f0f0f0'
                }}>
                  <img 
                    src={getDocumentUrl(chauffeurData.vehicle.registrationCertificate)}
                    alt="Registration Certificate"
                    style={{ 
                      width: '100%',
                      maxHeight: '350px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={() => window.open(getDocumentUrl(chauffeurData.vehicle.registrationCertificate), '_blank')}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              </div>
            )}

            {/* Insurance Certificate */}
            {chauffeurData.vehicle.insuranceCertificate && (
              <div style={{ 
                padding: '2rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #f0f0f0',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      🛡️
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.25rem', fontWeight: '700' }}>
                      Insurance Certificate
                    </h4>
                  </div>
                </div>
                <div style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white',
                  padding: '1rem',
                  border: '2px solid #f0f0f0'
                }}>
                  <img 
                    src={getDocumentUrl(chauffeurData.vehicle.insuranceCertificate)}
                    alt="Insurance Certificate"
                    style={{ 
                      width: '100%',
                      maxHeight: '350px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={() => window.open(getDocumentUrl(chauffeurData.vehicle.insuranceCertificate), '_blank')}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status Footer */}
          <div style={{ 
            marginTop: '2.5rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
            borderRadius: '16px',
            border: '2px solid #4caf50',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                ✅
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2e7d32', marginBottom: '0.25rem' }}>
                  All Documents Verified & Approved
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#558b2f' }}>
                  Your vehicle is registered and ready for service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RatingsTab = () => {
    const styles = getResponsiveStyles();
    const [reviews, setReviews] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);

    useEffect(() => {
      fetchReviews();
    }, []);

    const fetchReviews = async () => {
      const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/chauffeur/reviews`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
          setStatistics(data.statistics);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleRespondToReview = async (reviewId) => {
      if (!responseText.trim()) return;

      const token = localStorage.getItem('chauffeurToken') || sessionStorage.getItem('chauffeurToken');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        setSubmittingResponse(true);
        const response = await fetch(`${API_BASE}/api/chauffeur/reviews/${reviewId}/respond`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: responseText })
        });

        const data = await response.json();
        if (data.success) {
          // Update the review in the list
          setReviews(reviews.map(r => r._id === reviewId ? data.review : r));
          setRespondingTo(null);
          setResponseText('');
        }
      } catch (error) {
        console.error('Error responding to review:', error);
      } finally {
        setSubmittingResponse(false);
      }
    };

    const renderStars = (rating) => {
      return [...Array(5)].map((_, i) => (
        <span key={i} style={{ 
          color: i < rating ? '#d4af37' : '#ddd',
          fontSize: '1.2rem'
        }}>
          ★
        </span>
      ));
    };

    const renderCategoryBar = (label, value, max = 5) => {
      const percentage = (value / max) * 100;
      return (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>{label}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{value.toFixed(1)}</span>
          </div>
          <div style={{ 
            height: '8px',
            background: '#f0f0f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%',
              width: `${percentage}%`,
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      );
    };

    if (loading) {
      return (
        <div style={{ padding: styles.containerPadding, textAlign: 'center' }}>
          <Star size={48} style={{ color: '#d4af37', marginBottom: '1rem' }} />
          <p style={{ color: '#666' }}>Loading reviews...</p>
        </div>
      );
    }

    return (
      <div style={{ padding: styles.containerPadding, background: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            padding: '1rem',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
          }}>
            <Star size={32} style={{ color: 'white', display: 'block' }} />
          </div>
          <div>
            <h2 style={{ fontSize: styles.headerFontSize, fontWeight: '700', margin: 0 }}>Ratings & Feedback</h2>
            <p style={{ color: '#666', margin: '0.25rem 0 0 0' }}>
              Customer reviews and performance metrics
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        {statistics && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Overall Rating Card */}
            <div style={{ 
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              border: '1px solid rgba(212, 175, 55, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
              }} />
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '3.5rem', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  {statistics.avgRating.toFixed(1)}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  {renderStars(Math.round(statistics.avgRating))}
                </div>
                <div style={{ fontSize: '1rem', color: '#666' }}>
                  Based on {statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Rating Distribution */}
              <div style={{ marginTop: '2rem' }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = statistics.distribution[
                    star === 5 ? 'fiveStars' :
                    star === 4 ? 'fourStars' :
                    star === 3 ? 'threeStars' :
                    star === 2 ? 'twoStars' : 'oneStar'
                  ];
                  const percentage = statistics.totalReviews > 0 
                    ? (count / statistics.totalReviews) * 100 
                    : 0;

                  return (
                    <div key={star} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', width: '50px' }}>{star} stars</span>
                      <div style={{ 
                        flex: 1,
                        height: '6px',
                        background: '#f0f0f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%',
                          width: `${percentage}%`,
                          background: star >= 4 ? '#4caf50' : star >= 3 ? '#ff9800' : '#f44336',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#666', width: '30px' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Categories */}
            <div style={{ 
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              border: '1px solid rgba(212, 175, 55, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
              }} />
              
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                marginBottom: '1.5rem',
                color: '#1a1a1a'
              }}>
                Performance by Category
              </h3>

              {renderCategoryBar('Professionalism', statistics.categories.professionalism)}
              {renderCategoryBar('Punctuality', statistics.categories.punctuality)}
              {renderCategoryBar('Vehicle Condition', statistics.categories.vehicleCondition)}
              {renderCategoryBar('Communication', statistics.categories.communication)}
              {renderCategoryBar('Driving Skills', statistics.categories.drivingSkills)}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div style={{ 
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              margin: 0,
              color: '#1a1a1a'
            }}>
              Customer Reviews
            </h3>
          </div>

          {/* Customer Ratings Summary */}
          {reviews.length > 0 && (
            <div style={{ 
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
              borderRadius: '16px',
              border: '2px solid #4caf50'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <User size={24} style={{ color: '#2e7d32' }} />
                <h4 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  margin: 0,
                  color: '#2e7d32'
                }}>
                  Customer Ratings
                </h4>
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {reviews
                  .filter((review, index, self) => 
                    index === self.findIndex(r => r.customer?._id === review.customer?._id)
                  )
                  .slice(0, 6)
                  .map((review) => (
                    <div key={review.customer?._id || review._id} style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #c8e6c9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700'
                      }}>
                        {review.customer?.firstName?.[0] || 'C'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          color: '#1a1a1a'
                        }}>
                          {review.customer?.firstName} {review.customer?.lastName}
                        </div>
                        {review.customerRating > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star size={14} fill="#4caf50" color="#4caf50" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#2e7d32' }}>
                              {review.customerRating.toFixed(1)}
                            </span>
                            {review.customerRidesCount > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.25rem' }}>
                                ({review.customerRidesCount})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: '#999' }}>
                            New customer
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <Star size={64} style={{ color: '#ddd', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem' }}>No reviews yet</p>
              <p style={{ fontSize: '0.9rem' }}>Complete rides to start receiving customer feedback</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0'
                }}>
                  {/* Review Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: '700'
                      }}>
                        {review.customer?.firstName?.[0] || 'C'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                            {review.customer?.firstName} {review.customer?.lastName}
                          </div>
                          {review.customerRating > 0 && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#2e7d32'
                            }}>
                              <Star size={12} fill="#4caf50" color="#4caf50" />
                              <span>{review.customerRating.toFixed(1)}</span>
                              {review.customerRidesCount > 0 && (
                                <span style={{ color: '#666', fontWeight: '400' }}>
                                  ({review.customerRidesCount} rides)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        {review.booking && (
                          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                            Booking: {review.booking.bookingReference}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        {renderStars(review.rating)}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#d4af37' }}>
                        {review.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <div style={{ 
                      marginBottom: '1rem',
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: '#333'
                    }}>
                      "{review.comment}"
                    </div>
                  )}

                  {/* Category Ratings */}
                  {review.categories && Object.keys(review.categories).length > 0 && (
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem',
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px'
                    }}>
                      {Object.entries(review.categories).map(([key, value]) => value && (
                        <div key={key} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#d4af37' }}>
                            {value.toFixed(1)} ★
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chauffeur Response */}
                  {review.chauffeurResponse?.message ? (
                    <div style={{ 
                      marginTop: '1rem',
                      padding: '1rem',
                      background: '#e8f5e9',
                      borderLeft: '4px solid #4caf50',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2e7d32', marginBottom: '0.5rem' }}>
                        Your Response
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#333' }}>
                        {review.chauffeurResponse.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#558b2f', marginTop: '0.5rem' }}>
                        {new Date(review.chauffeurResponse.respondedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '1rem' }}>
                      {respondingTo === review._id ? (
                        <div>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            maxLength={300}
                            style={{ 
                              width: '100%',
                              minHeight: '100px',
                              padding: '1rem',
                              border: '2px solid #d4af37',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontFamily: 'inherit',
                              resize: 'vertical'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                              onClick={() => handleRespondToReview(review._id)}
                              disabled={submittingResponse || !responseText.trim()}
                              style={{ 
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: submittingResponse ? 'not-allowed' : 'pointer',
                                opacity: submittingResponse ? 0.6 : 1
                              }}
                            >
                              {submittingResponse ? 'Posting...' : 'Post Response'}
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              style={{ 
                                padding: '0.75rem 1.5rem',
                                background: 'white',
                                color: '#666',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            {responseText.length}/300 characters
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(review._id)}
                          style={{ 
                            padding: '0.75rem 1.5rem',
                            background: 'white',
                            color: '#d4af37',
                            border: '2px solid #d4af37',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = '#d4af37';
                            e.target.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.color = '#d4af37';
                          }}
                        >
                          Respond to Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const DocumentsTab = () => {
    const styles = getResponsiveStyles();
    
    const getDocumentUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('data:')) return path;
      if (path.startsWith('http')) return path;
      const cleanPath = path.replace(/^\//, '');
      return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
    };

    if (!chauffeurData) {
      return (
        <div style={{ padding: styles.containerPadding, textAlign: 'center' }}>
          <FileText size={48} style={{ color: '#d4af37', marginBottom: '1rem' }} />
          <p style={{ color: '#666' }}>Loading your documents...</p>
        </div>
      );
    }

    const isApproved = chauffeurData.status === 'approved';

    return (
      <div style={{ padding: styles.containerPadding, background: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            padding: '1rem',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
          }}>
            <FileText size={32} style={{ color: 'white', display: 'block' }} />
          </div>
          <div>
            <h2 style={{ fontSize: styles.headerFontSize, fontWeight: '700', margin: 0 }}>My Documents</h2>
            <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: styles.subHeaderFontSize }}>
              All your uploaded documents and verification status
            </p>
          </div>
        </div>

        {/* Status Banner */}
        {isApproved ? (
          <div style={{ 
            marginTop: '2rem',
            padding: styles.cardPadding,
            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
            borderRadius: '16px',
            border: '2px solid #4caf50',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                ✅
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2e7d32', marginBottom: '0.25rem' }}>
                  All Documents Verified & Approved
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#558b2f' }}>
                  Your application has been approved and you're ready to accept rides
                </p>
              </div>
              {chauffeurData.approvedAt && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#558b2f', fontWeight: '600' }}>Approved On</div>
                  <div style={{ fontSize: '0.9rem', color: '#2e7d32' }}>
                    {new Date(chauffeurData.approvedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ 
            marginTop: '2rem',
            padding: styles.cardPadding,
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            borderRadius: '16px',
            border: '2px solid #ff9800',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#ff9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
              }}>
                ⏳
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e65100', marginBottom: '0.25rem' }}>
                  Application Under Review
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#ef6c00' }}>
                  Your documents are being verified by our admin team
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Information - Show only if approved */}
        {isApproved && (
          <div style={{ 
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ 
                width: '4px', 
                height: '24px', 
                background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
                borderRadius: '4px'
              }} />
              <h3 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                Personal Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ 
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '12px',
                border: '2px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Full Name
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>
                  {chauffeurData.firstName} {chauffeurData.lastName}
                </div>
              </div>

              <div style={{ 
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '12px',
                border: '2px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Email
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a', wordBreak: 'break-all' }}>
                  {chauffeurData.email}
                </div>
              </div>

              <div style={{ 
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '12px',
                border: '2px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Phone Number
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>
                  {chauffeurData.countryCode} {chauffeurData.phone}
                </div>
              </div>

              <div style={{ 
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '12px',
                border: '2px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Location
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>
                  {chauffeurData.city}, {chauffeurData.country}
                </div>
              </div>

              {chauffeurData.rating > 0 && (
                <div style={{ 
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '12px',
                  border: '2px solid #f0f0f0'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Rating
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>
                    ⭐ {chauffeurData.rating.toFixed(1)} ({chauffeurData.totalRatings || 0} reviews)
                  </div>
                </div>
              )}

              <div style={{ 
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '12px',
                border: '2px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ 
                    padding: '0.35rem 0.85rem',
                    background: '#4caf50',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '700'
                  }}>
                    APPROVED
                  </span>
                  {chauffeurData.isVerified && <span style={{ fontSize: '0.9rem' }}>✅ Verified</span>}
                  {chauffeurData.isActive && <span style={{ fontSize: '0.9rem' }}>🟢 Active</span>}
                  {chauffeurData.isOnline && <span style={{ fontSize: '0.9rem' }}>🌐 Online</span>}
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            {chauffeurData.vehicle && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '4px', 
                    height: '20px', 
                    background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
                    borderRadius: '4px'
                  }} />
                  <h4 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                    Vehicle Details
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ 
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Model
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>
                      {chauffeurData.vehicle.model}
                    </div>
                  </div>

                  <div style={{ 
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Year
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>
                      {chauffeurData.vehicle.year}
                    </div>
                  </div>

                  <div style={{ 
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Color
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        background: chauffeurData.vehicle.color,
                        border: '2px solid #ddd'
                      }} />
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>
                        {chauffeurData.vehicle.color}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Registration
                    </div>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '700', 
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {chauffeurData.vehicle.registrationNumber}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Personal Documents */}
        <div style={{ 
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '4px', 
              height: '24px', 
              background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
              borderRadius: '4px'
            }} />
            <h3 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              Personal Documents
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Profile Picture */}
            <div style={{ 
              padding: '2rem',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '2px solid #f0f0f0',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#f0f0f0';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                }}>
                  👤
                </div>
                <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                  Profile Picture
                </h4>
              </div>
              <div style={{ 
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white',
                padding: '1rem',
                border: '2px solid #f0f0f0',
                marginBottom: '1rem'
              }}>
                {chauffeurData.profilePicture ? (
                  <img 
                    src={getDocumentUrl(chauffeurData.profilePicture)}
                    alt="Profile"
                    style={{ 
                      width: '100%',
                      maxHeight: '250px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={() => window.open(getDocumentUrl(chauffeurData.profilePicture), '_blank')}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{ 
                    width: '100%',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    color: '#6c757d',
                    fontSize: '0.9rem'
                  }}>
                    No profile picture uploaded
                  </div>
                )}
              </div>
              <label style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                color: '#1a1a1a',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                />
                {chauffeurData.profilePicture ? 'Change Profile Picture' : 'Upload Profile Picture'}
              </label>
            </div>

            {/* Driver License */}
            {chauffeurData.driverLicense && (
              <div style={{ 
                padding: '2rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #f0f0f0',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                  }}>
                    🪪
                  </div>
                  <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                    Driver License
                  </h4>
                </div>
                <div style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white',
                  padding: '1rem',
                  border: '2px solid #f0f0f0'
                }}>
                  <img 
                    src={getDocumentUrl(chauffeurData.driverLicense)}
                    alt="Driver License"
                    style={{ 
                      width: '100%',
                      maxHeight: '250px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={() => window.open(getDocumentUrl(chauffeurData.driverLicense), '_blank')}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              </div>
            )}

            {/* Identity Card */}
            {chauffeurData.identityCard && (
              <div style={{ 
                padding: '2rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #f0f0f0',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                  }}>
                    🆔
                  </div>
                  <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                    Identity Card
                  </h4>
                </div>
                <div style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white',
                  padding: '1rem',
                  border: '2px solid #f0f0f0'
                }}>
                  <img 
                    src={getDocumentUrl(chauffeurData.identityCard)}
                    alt="Identity Card"
                    style={{ 
                      width: '100%',
                      maxHeight: '250px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={() => window.open(getDocumentUrl(chauffeurData.identityCard), '_blank')}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Documents */}
        {chauffeurData.vehicle && (
          <div style={{ 
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ 
                width: '4px', 
                height: '24px', 
                background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
                borderRadius: '4px'
              }} />
              <h3 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                Vehicle Documents
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Vehicle Photo */}
              {chauffeurData.vehicle.vehiclePhoto && (
                <div style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      🚗
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                      Vehicle Photo
                    </h4>
                  </div>
                  <div style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    padding: '1rem',
                    border: '2px solid #f0f0f0'
                  }}>
                    <img 
                      src={getDocumentUrl(chauffeurData.vehicle.vehiclePhoto)}
                      alt="Vehicle"
                      style={{ 
                        width: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onClick={() => window.open(getDocumentUrl(chauffeurData.vehicle.vehiclePhoto), '_blank')}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                </div>
              )}

              {/* Registration Certificate */}
              {chauffeurData.vehicle.registrationCertificate && (
                <div style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      📋
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                      Registration Certificate
                    </h4>
                  </div>
                  <div style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    padding: '1rem',
                    border: '2px solid #f0f0f0'
                  }}>
                    <img 
                      src={getDocumentUrl(chauffeurData.vehicle.registrationCertificate)}
                      alt="Registration Certificate"
                      style={{ 
                        width: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                      onClick={() => window.open(getDocumentUrl(chauffeurData.vehicle.registrationCertificate), '_blank')}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                </div>
              )}

              {/* Insurance Certificate */}
              {chauffeurData.vehicle.insuranceCertificate && (
                <div style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      🛡️
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                      Insurance Certificate
                    </h4>
                  </div>
                  <div style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    padding: '1rem',
                    border: '2px solid #f0f0f0'
                  }}>
                    <img 
                      src={getDocumentUrl(chauffeurData.vehicle.insuranceCertificate)}
                      alt="Insurance Certificate"
                      style={{ 
                        width: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                      onClick={() => window.open(getDocumentUrl(chauffeurData.vehicle.insuranceCertificate), '_blank')}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Documents */}
        {chauffeurData.company && (
          <div style={{ 
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ 
                width: '4px', 
                height: '24px', 
                background: 'linear-gradient(180deg, #d4af37 0%, #f4d03f 100%)',
                borderRadius: '4px'
              }} />
              <h3 style={{ color: '#1a1a1a', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                Company Documents
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Commercial Registration */}
              {chauffeurData.company.commercialRegistration && (
                <div style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      🏢
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                      Commercial Registration
                    </h4>
                  </div>
                  <div style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    padding: '1rem',
                    border: '2px solid #f0f0f0'
                  }}>
                    <img 
                      src={getDocumentUrl(chauffeurData.company.commercialRegistration)}
                      alt="Commercial Registration"
                      style={{ 
                        width: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                      onClick={() => window.open(getDocumentUrl(chauffeurData.company.commercialRegistration), '_blank')}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                </div>
              )}

              {/* Fleet Insurance Agreement */}
              {chauffeurData.company.fleetInsuranceAgreement && (
                <div style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      📄
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                      Fleet Insurance Agreement
                    </h4>
                  </div>
                  <div style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    padding: '1rem',
                    border: '2px solid #f0f0f0'
                  }}>
                    <img 
                      src={getDocumentUrl(chauffeurData.company.fleetInsuranceAgreement)}
                      alt="Fleet Insurance"
                      style={{ 
                        width: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                      onClick={() => window.open(getDocumentUrl(chauffeurData.company.fleetInsuranceAgreement), '_blank')}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                </div>
              )}

              {/* VAT Registration */}
              {chauffeurData.company.vatRegistrationCertificate && (
                <div style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      💼
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                      VAT Registration Certificate
                    </h4>
                  </div>
                  <div style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    padding: '1rem',
                    border: '2px solid #f0f0f0'
                  }}>
                    <img 
                      src={getDocumentUrl(chauffeurData.company.vatRegistrationCertificate)}
                      alt="VAT Certificate"
                      style={{ 
                        width: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                      onClick={() => window.open(getDocumentUrl(chauffeurData.company.vatRegistrationCertificate), '_blank')}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                </div>
              )}

              {/* Operating Permit */}
              {chauffeurData.company.operatingPermit && (
                <div style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}>
                      📜
                    </div>
                    <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700' }}>
                      Operating Permit
                    </h4>
                  </div>
                  <div style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    padding: '1rem',
                    border: '2px solid #f0f0f0'
                  }}>
                    <img 
                      src={getDocumentUrl(chauffeurData.company.operatingPermit)}
                      alt="Operating Permit"
                      style={{ 
                        width: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                      onClick={() => window.open(getDocumentUrl(chauffeurData.company.operatingPermit), '_blank')}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayTab />;
      case 'history':
        return <RideHistoryTab />;
      case 'chat':
        return <ChauffeurChatTab />;
      case 'earnings':
        return <EarningsTab />;
      case 'schedule':
        return <ScheduleTab />;
      case 'vehicle':
        return <VehicleTab />;
      case 'ratings':
        return <RatingsTab />;
      case 'documents':
        return <DocumentsTab />;
      default:
        return <TodayTab />;
    }
  };

  if (!chauffeurData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="chauffeur-dashboard">
      <aside className={`chauffeur-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="chauffeur-sidebar-header">
          <h2>RIDESERENE</h2>
          <p>Chauffeur Portal</p>
        </div>

        <div className="chauffeur-info">
          <div className="chauffeur-avatar">
            {chauffeurData.firstName[0]}
            {chauffeurData.lastName[0]}
          </div>
          <div className="chauffeur-details">
            <h3>
              {chauffeurData.firstName} {chauffeurData.lastName}
            </h3>
            <span className="chauffeur-status">
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.9rem', color: '#d4af37' }}>
              <Star size={14} fill="currentColor" />
              <span>{Number(chauffeurData.rating ?? 0).toFixed(1)}</span>
              <span style={{ color: '#666', fontWeight: 'normal' }}>({chauffeurData.totalRatings ?? 0})</span>
            </div>
          </div>
        </div>

        <nav className="chauffeur-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`chauffeur-nav-item ${activeTab === item.id ? 'active' : ''}`}
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

        <button className="chauffeur-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="chauffeur-main">
        <div className="chauffeur-header">
          <button className="mobile-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1>{menuItems.find((item) => item.id === activeTab)?.label}</h1>
        </div>

        <div className="chauffeur-content">{renderTabContent()}</div>
      </main>

      {/* Ride Details Modal — Guest info, timing, location */}
      {rideDetailsId && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => { setRideDetailsId(null); setRideDetails(null); }}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Ride Details</h3>
              <button onClick={() => { setRideDetailsId(null); setRideDetails(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {loadingRideDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
              ) : rideDetails ? (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' }}>Reference</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{rideDetails.bookingReference}</div>
                    <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: `${getStatusColor(rideDetails.status)}20`, color: getStatusColor(rideDetails.status) }}>{rideDetails.status}</span>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>Guest / Passenger</div>
                    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><User size={18} style={{ color: '#d4af37' }} />{(rideDetails.passengerInfo?.firstName || rideDetails.customer?.firstName) + ' ' + (rideDetails.passengerInfo?.lastName || rideDetails.customer?.lastName)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Mail size={18} style={{ color: '#d4af37' }} />{rideDetails.passengerInfo?.email || rideDetails.customer?.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={18} style={{ color: '#d4af37' }} />{rideDetails.passengerInfo?.phone || rideDetails.customer?.phone}</div>
                      {(rideDetails.passengerInfo?.flightNumber || rideDetails.passengerInfo?.specialRequests) && (
                        <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#666' }}>Flight: {rideDetails.passengerInfo?.flightNumber || '—'} {rideDetails.passengerInfo?.specialRequests ? ` • ${rideDetails.passengerInfo.specialRequests}` : ''}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>Timing</div>
                    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '1rem' }}>
                      <div>Pickup: {formatDate(rideDetails.pickupDate)} at {formatTime(rideDetails.pickupTime)}</div>
                      {rideDetails.startedAt && <div style={{ marginTop: 4 }}>Started: {new Date(rideDetails.startedAt).toLocaleString()}</div>}
                      {rideDetails.completedAt && <div style={{ marginTop: 4 }}>Completed: {new Date(rideDetails.completedAt).toLocaleString()}</div>}
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 600 }}>Locations</div>
                    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '1rem' }}>
                      <div style={{ marginBottom: 8 }}><MapPin size={16} style={{ color: '#4caf50', verticalAlign: 'middle', marginRight: 6 }} />Pickup: {rideDetails.pickupLocation?.address}</div>
                      {rideDetails.dropoffLocation?.address && <div><MapPin size={16} style={{ color: '#dc3545', verticalAlign: 'middle', marginRight: 6 }} />Dropoff: {rideDetails.dropoffLocation.address}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(rideDetails.status === 'assigned' || rideDetails.status === 'confirmed') && (
                      <button onClick={() => handleStartRide(rideDetails._id)} disabled={statusUpdatingId === rideDetails._id} style={{ padding: '0.65rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PlayCircle size={18} />{statusUpdatingId === rideDetails._id ? 'Starting...' : 'Start Ride'}
                      </button>
                    )}
                    {rideDetails.status === 'in-progress' && (
                      <button onClick={() => handleCompleteRide(rideDetails._id)} disabled={statusUpdatingId === rideDetails._id} style={{ padding: '0.65rem 1rem', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={18} />{statusUpdatingId === rideDetails._id ? 'Completing...' : 'Complete Ride'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Could not load ride details.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default ChauffeurDashboard;

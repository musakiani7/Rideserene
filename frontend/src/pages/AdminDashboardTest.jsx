import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboardTest = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('adminData');

    if (!token || !admin) {
      navigate('/admin/login');
      return;
    }

    try {
      setAdminData(JSON.parse(admin));
    } catch (error) {
      navigate('/admin/login');
    }
  }, [navigate]);

  if (!adminData) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Admin Dashboard Test</h1>
      <p>Welcome, {adminData.firstName} {adminData.lastName}</p>
      <p>Role: {adminData.role}</p>
      <p>Email: {adminData.email}</p>
      <button onClick={() => {
        localStorage.clear();
        navigate('/admin/login');
      }}>
        Logout
      </button>
    </div>
  );
};

export default AdminDashboardTest;

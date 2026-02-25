import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Stethoscope, Calendar, Activity, TrendingUp, UserPlus, FileText, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Total Users', value: '1,248', color: '#8b5cf6' },
    { icon: Stethoscope, label: 'Active Doctors', value: '45', color: '#3b82f6' },
    { icon: Calendar, label: 'Appointments Today', value: '89', color: '#10b981' },
    { icon: TrendingUp, label: 'Growth Rate', value: '+12.5%', color: '#f59e0b' },
  ];

  const recentUsers = [
    { id: 1, name: 'Dr. Sarah Johnson', role: 'Doctor', date: 'Today', status: 'active' },
    { id: 2, name: 'Michael Chen', role: 'Patient', date: 'Today', status: 'active' },
    { id: 3, name: 'Emily Davis', role: 'Patient', date: 'Yesterday', status: 'pending' },
    { id: 4, name: 'Dr. Robert Brown', role: 'Doctor', date: 'Yesterday', status: 'active' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard 🎛️</h1>
        <p>Welcome back, {user?.name || 'Administrator'}! Here's what's happening.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Registrations</h2>
            <Link to="/dashboard/admin/users">View All</Link>
          </div>
          
          {recentUsers.map(user => (
            <div key={user.id} className="appointment-item">
              <div className="appointment-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="appointment-info">
                <h4>{user.name}</h4>
                <p>{user.role} • Joined {user.date}</p>
              </div>
              <span className={`appointment-status status-${user.status === 'active' ? 'confirmed' : 'pending'}`}>
                {user.status}
              </span>
            </div>
          ))}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <Link to="/dashboard/admin/users" className="action-btn">
              <UserPlus size={24} />
              <span>Add User</span>
            </Link>
            <Link to="/dashboard/admin/doctors" className="action-btn">
              <Stethoscope size={24} />
              <span>Manage Doctors</span>
            </Link>
            <Link to="/dashboard/admin/analytics" className="action-btn">
              <Activity size={24} />
              <span>View Analytics</span>
            </Link>
            <Link to="/dashboard/admin/settings" className="action-btn">
              <Settings size={24} />
              <span>System Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

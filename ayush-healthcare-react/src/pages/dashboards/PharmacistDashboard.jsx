import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Pill, FileText, Package, AlertTriangle, Plus, ClipboardList, Activity, TrendingUp } from 'lucide-react';

const PharmacistDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Pill, label: 'Total Medicines', value: '1,856', color: '#f59e0b' },
    { icon: FileText, label: 'Pending Orders', value: '23', color: '#3b82f6' },
    { icon: Package, label: 'Orders Today', value: '47', color: '#10b981' },
    { icon: AlertTriangle, label: 'Low Stock Items', value: '8', color: '#ef4444' },
  ];

  const pendingOrders = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', items: 3, total: '$45.50', status: 'pending' },
    { id: 2, patient: 'Emily Davis', doctor: 'Dr. Michael Chen', items: 5, total: '$78.25', status: 'pending' },
    { id: 3, patient: 'Robert Wilson', doctor: 'Dr. Emily Brown', items: 2, total: '$32.00', status: 'confirmed' },
    { id: 4, patient: 'Sarah Miller', doctor: 'Dr. James Lee', items: 4, total: '$56.75', status: 'pending' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Pharmacy Dashboard 💊</h1>
        <p>Welcome, {user?.name || 'Pharmacist'}! Manage your inventory and orders.</p>
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
            <h2>Recent Prescription Orders</h2>
            <Link to="/dashboard/pharmacist/orders">View All</Link>
          </div>
          
          {pendingOrders.map(order => (
            <div key={order.id} className="appointment-item">
              <div className="appointment-avatar">
                {order.patient.charAt(0)}
              </div>
              <div className="appointment-info">
                <h4>{order.patient}</h4>
                <p>{order.doctor} • {order.items} items • {order.total}</p>
              </div>
              <span className={`appointment-status status-${order.status}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <Link to="/dashboard/pharmacist/inventory" className="action-btn">
              <Plus size={24} />
              <span>Add Medicine</span>
            </Link>
            <Link to="/dashboard/pharmacist/prescriptions" className="action-btn">
              <FileText size={24} />
              <span>View Prescriptions</span>
            </Link>
            <Link to="/dashboard/pharmacist/orders" className="action-btn">
              <ClipboardList size={24} />
              <span>Process Orders</span>
            </Link>
            <Link to="/dashboard/pharmacist/reports" className="action-btn">
              <TrendingUp size={24} />
              <span>Sales Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, FileText, Activity, Bell, Plus, Clock, User } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Calendar, label: 'Appointments', value: '3', color: '#10b981' },
    { icon: FileText, label: 'Prescriptions', value: '5', color: '#3b82f6' },
    { icon: Activity, label: 'Health Score', value: '85%', color: '#8b5cf6' },
    { icon: Bell, label: 'Notifications', value: '2', color: '#f59e0b' },
  ];

  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Cardiologist', date: 'Today, 10:00 AM', status: 'confirmed' },
    { id: 2, doctor: 'Dr. Michael Chen', specialty: 'General Physician', date: 'Tomorrow, 2:30 PM', status: 'pending' },
    { id: 3, doctor: 'Dr. Emily Brown', specialty: 'Dermatologist', date: 'Mar 02, 9:00 AM', status: 'confirmed' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Patient'}! 👋</h1>
        <p>Here's an overview of your health journey</p>
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
            <h2>Upcoming Appointments</h2>
            <Link to="/dashboard/patient/appointments">View All</Link>
          </div>
          
          {appointments.map(apt => (
            <div key={apt.id} className="appointment-item">
              <div className="appointment-avatar">
                {apt.doctor.charAt(4)}
              </div>
              <div className="appointment-info">
                <h4>{apt.doctor}</h4>
                <p>{apt.specialty} • {apt.date}</p>
              </div>
              <span className={`appointment-status status-${apt.status}`}>
                {apt.status}
              </span>
            </div>
          ))}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <Link to="/dashboard/patient/appointments" className="action-btn">
              <Plus size={24} />
              <span>Book Appointment</span>
            </Link>
            <Link to="/dashboard/patient/prescriptions" className="action-btn">
              <FileText size={24} />
              <span>View Prescriptions</span>
            </Link>
            <Link to="/dashboard/patient/records" className="action-btn">
              <Activity size={24} />
              <span>Health Records</span>
            </Link>
            <Link to="/dashboard/patient/messages" className="action-btn">
              <Clock size={24} />
              <span>Medical History</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, FileText, Clock, Plus, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Total Patients', value: '248', color: '#3b82f6' },
    { icon: Calendar, label: "Today's Appointments", value: '12', color: '#10b981' },
    { icon: CheckCircle, label: 'Completed', value: '8', color: '#8b5cf6' },
    { icon: AlertCircle, label: 'Pending', value: '4', color: '#f59e0b' },
  ];

  const todayAppointments = [
    { id: 1, patient: 'John Smith', age: 45, issue: 'Regular Checkup', time: '09:00 AM', status: 'completed' },
    { id: 2, patient: 'Emily Davis', age: 32, issue: 'Fever & Cold', time: '10:30 AM', status: 'confirmed' },
    { id: 3, patient: 'Robert Wilson', age: 58, issue: 'Blood Pressure', time: '11:30 AM', status: 'pending' },
    { id: 4, patient: 'Sarah Miller', age: 28, issue: 'Skin Allergy', time: '02:00 PM', status: 'pending' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Good Morning, Dr. {user?.name || 'Doctor'}! 🩺</h1>
        <p>You have {todayAppointments.length} appointments scheduled for today</p>
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
            <h2>Today's Schedule</h2>
            <Link to="/dashboard/doctor/appointments">View All</Link>
          </div>
          
          {todayAppointments.map(apt => (
            <div key={apt.id} className="appointment-item">
              <div className="appointment-avatar">
                {apt.patient.charAt(0)}
              </div>
              <div className="appointment-info">
                <h4>{apt.patient}</h4>
                <p>{apt.issue} • Age: {apt.age} • {apt.time}</p>
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
            <Link to="/dashboard/doctor/patients" className="action-btn">
              <Users size={24} />
              <span>View Patients</span>
            </Link>
            <Link to="/dashboard/doctor/prescriptions" className="action-btn">
              <Plus size={24} />
              <span>Write Prescription</span>
            </Link>
            <Link to="/dashboard/doctor/schedule" className="action-btn">
              <Clock size={24} />
              <span>Manage Schedule</span>
            </Link>
            <Link to="/dashboard/doctor/appointments" className="action-btn">
              <Activity size={24} />
              <span>Patient Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

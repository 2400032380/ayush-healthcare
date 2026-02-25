import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, Home, Calendar, FileText, Users, Settings, LogOut, 
  Stethoscope, Pill, UserCog, ClipboardList, Activity, MessageSquare
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    patient: [
      { icon: Home, label: 'Dashboard', path: '/dashboard/patient' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/patient/appointments' },
      { icon: FileText, label: 'Prescriptions', path: '/dashboard/patient/prescriptions' },
      { icon: Activity, label: 'Health Records', path: '/dashboard/patient/records' },
      { icon: MessageSquare, label: 'Messages', path: '/dashboard/patient/messages' },
      { icon: Settings, label: 'Settings', path: '/dashboard/patient/settings' },
    ],
    doctor: [
      { icon: Home, label: 'Dashboard', path: '/dashboard/doctor' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/doctor/appointments' },
      { icon: Users, label: 'Patients', path: '/dashboard/doctor/patients' },
      { icon: FileText, label: 'Prescriptions', path: '/dashboard/doctor/prescriptions' },
      { icon: ClipboardList, label: 'Schedule', path: '/dashboard/doctor/schedule' },
      { icon: Settings, label: 'Settings', path: '/dashboard/doctor/settings' },
    ],
    admin: [
      { icon: Home, label: 'Dashboard', path: '/dashboard/admin' },
      { icon: Users, label: 'Users', path: '/dashboard/admin/users' },
      { icon: Stethoscope, label: 'Doctors', path: '/dashboard/admin/doctors' },
      { icon: Calendar, label: 'Appointments', path: '/dashboard/admin/appointments' },
      { icon: Activity, label: 'Analytics', path: '/dashboard/admin/analytics' },
      { icon: Settings, label: 'Settings', path: '/dashboard/admin/settings' },
    ],
    pharmacist: [
      { icon: Home, label: 'Dashboard', path: '/dashboard/pharmacist' },
      { icon: Pill, label: 'Inventory', path: '/dashboard/pharmacist/inventory' },
      { icon: FileText, label: 'Prescriptions', path: '/dashboard/pharmacist/prescriptions' },
      { icon: ClipboardList, label: 'Orders', path: '/dashboard/pharmacist/orders' },
      { icon: Activity, label: 'Reports', path: '/dashboard/pharmacist/reports' },
      { icon: Settings, label: 'Settings', path: '/dashboard/pharmacist/settings' },
    ],
  };

  const roleColors = {
    patient: { primary: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    doctor: { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    admin: { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    pharmacist: { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  };

  const roleIcons = {
    patient: Users,
    doctor: Stethoscope,
    admin: UserCog,
    pharmacist: Pill,
  };

  const RoleIcon = roleIcons[role] || Users;

  return (
    <aside className="sidebar" style={{ '--role-primary': roleColors[role]?.primary, '--role-gradient': roleColors[role]?.gradient }}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Heart className="logo-icon" />
          <span>Ayush 24/7</span>
        </div>
      </div>

      <div className="user-profile">
        <div className="user-avatar">
          <RoleIcon size={24} />
        </div>
        <div className="user-info">
          <h4>{user?.name || 'User'}</h4>
          <span className="user-role">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems[role]?.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            end={item.path === `/dashboard/${role}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;

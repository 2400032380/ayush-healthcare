import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Lock, Mail, Phone, Stethoscope, UserCog, Pill, Users } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'patient', label: 'Patient', icon: Users, color: '#10b981' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#3b82f6' },
    { id: 'admin', label: 'Admin', icon: UserCog, color: '#8b5cf6' },
    { id: 'pharmacist', label: 'Pharmacist', icon: Pill, color: '#f59e0b' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      createdAt: new Date().toISOString()
    });

    navigate(`/dashboard/${formData.role}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="logo-container">
            <Heart className="logo-icon" />
            <span className="logo-text">Ayush 24/7</span>
          </div>
          <h1>Create Account</h1>
          <p>Join us for better healthcare</p>
        </div>

        <div className="role-selector">
          {roles.map(r => (
            <button
              key={r.id}
              type="button"
              className={`role-btn ${formData.role === r.id ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: r.id })}
              style={{ '--role-color': r.color }}
            >
              <r.icon size={20} />
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Phone className="input-icon" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

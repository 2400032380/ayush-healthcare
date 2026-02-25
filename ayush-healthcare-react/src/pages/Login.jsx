import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Lock, Stethoscope, UserCog, Pill, Users } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'patient', label: 'Patient', icon: Users, color: '#10b981' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#3b82f6' },
    { id: 'admin', label: 'Admin', icon: UserCog, color: '#8b5cf6' },
    { id: 'pharmacist', label: 'Pharmacist', icon: Pill, color: '#f59e0b' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('ayushUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password && u.role === role);

    if (user) {
      login(user);
      navigate(`/dashboard/${role}`);
    } else {
      // Demo login - allow any credentials
      login({ email, role, name: email.split('@')[0] });
      navigate(`/dashboard/${role}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <Heart className="logo-icon" />
            <span className="logo-text">Ayush 24/7</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your healthcare dashboard</p>
        </div>

        <div className="role-selector">
          {roles.map(r => (
            <button
              key={r.id}
              className={`role-btn ${role === r.id ? 'active' : ''}`}
              onClick={() => setRole(r.id)}
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
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

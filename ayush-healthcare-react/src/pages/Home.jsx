import { Link } from 'react-router-dom';
import { Heart, Stethoscope, Calendar, Shield, Clock, Users, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointments',
      description: 'Book appointments with top doctors in just a few clicks'
    },
    {
      icon: Shield,
      title: 'Secure Records',
      description: 'Your health records are encrypted and always secure'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock medical support when you need it'
    },
    {
      icon: Stethoscope,
      title: 'Expert Doctors',
      description: 'Access to certified specialists across all fields'
    }
  ];

  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300' },
    { name: 'Dr. Michael Chen', specialty: 'Neurologist', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300' },
    { name: 'Dr. Emily Brown', specialty: 'Pediatrician', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300' },
    { name: 'Dr. James Wilson', specialty: 'Orthopedic', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300' },
  ];

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Heart className="logo-icon" />
            <span>Ayush 24/7</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#doctors">Doctors</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-auth">
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-register">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, Our Priority</h1>
          <p>Experience world-class healthcare services with Ayush 24/7. Book appointments, manage prescriptions, and access your health records anytime, anywhere.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-secondary">
              Login to Dashboard
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <h3>10,000+</h3>
              <p>Happy Patients</p>
            </div>
            <div className="stat">
              <h3>500+</h3>
              <p>Expert Doctors</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600" alt="Healthcare" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Why Choose Ayush 24/7?</h2>
          <p>We provide comprehensive healthcare solutions tailored to your needs</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon size={32} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="doctors">
        <div className="section-header">
          <h2>Meet Our Expert Doctors</h2>
          <p>Highly qualified professionals dedicated to your well-being</p>
        </div>
        <div className="doctors-grid">
          {doctors.map((doctor, index) => (
            <div key={index} className="doctor-card">
              <img src={doctor.image} alt={doctor.name} />
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p>{doctor.specialty}</p>
                <Link to="/register" className="btn-book">Book Appointment</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="section-header">
          <h2>Get In Touch</h2>
          <p>Have questions? We're here to help!</p>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={24} />
              <div>
                <h4>Phone</h4>
                <p>+91 1800-123-4567</p>
              </div>
            </div>
            <div className="contact-item">
              <Mail size={24} />
              <div>
                <h4>Email</h4>
                <p>support@ayush247.com</p>
              </div>
            </div>
            <div className="contact-item">
              <MapPin size={24} />
              <div>
                <h4>Location</h4>
                <p>123 Healthcare Ave, Medical City</p>
              </div>
            </div>
          </div>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="4" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Heart className="logo-icon" />
            <span>Ayush 24/7</span>
            <p>Your trusted healthcare partner</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#features">Features</a>
            <a href="#doctors">Doctors</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <a href="#">FAQ</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Ayush 24/7 Health Care. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

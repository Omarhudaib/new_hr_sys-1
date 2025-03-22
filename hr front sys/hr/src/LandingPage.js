import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import {  Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import api from './api';
import { FaMobileAlt,  FaCalendarCheck, FaClock, FaFileAlt, FaUsers, FaDownload ,FaInstagram, FaFacebook, FaEnvelope } from 'react-icons/fa';
import './LandingPage.css';
import bg7 from './images/7.jpg';
import bg9 from './images/13.jpg';
import authorImg from './images/11.jpg';
import { motion } from 'framer-motion';
import img1 from './images/1.jpg';
import img2 from './images/2.jpg';
import img3 from './images/3.jpg';
import img4 from './images/4.jpg';
import img5 from './images/5.jpg';
import img6 from './images/6.jpg'
const LandingPage = () => {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  // State for contact form
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsContactLoading(true);
    setContactError('');
    try {
      const response = await api.post('/contact', contactData);
      if (response.status === 200) {
        setContactSuccess(true);
        setContactData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setContactSuccess(false), 5000);
      }
    } catch (err) {
      setContactError('Failed to send message. Please try again.');
    } finally {
      setIsContactLoading(false);
    }
  };
  // State for login form
  const [formData, setFormData] = useState({ company_code: '', password: '' });
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', formData);
      const { token, company } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('company', JSON.stringify(company));
      navigate('/home');
    } catch (err) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 1000);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
<animated.div style={fadeIn}>
  {/* Modern Navbar */}
  <Navbar expand="lg" fixed="top" className="navbar-custom">
  <Container>
  <Navbar.Brand href="#" className="fw-bold text-shadow-custom">
  Dawam
</Navbar.Brand>
<Navbar.Toggle aria-controls="basic-navbar-nav" />
<Navbar.Collapse id="basic-navbar-nav">
  <Nav className="ms-auto">
    <Nav.Link href="#features" className="mx-3 fw-bold text-shadow-custom">
      Features
    </Nav.Link>
    <Nav.Link href="#about" className="mx-3 fw-bold text-shadow-custom">
      About
    </Nav.Link>
    <Nav.Link href="#image-gallery" className="mx-3 fw-bold text-shadow-custom">
    Gallery
    </Nav.Link>
    <Nav.Link href="#contact" className="mx-3 fw-bold text-shadow-custom">
      Contact
    </Nav.Link>
    <Nav.Link href="/dawam.apk" download="DAWAM.apk" className="text-shadow-custom">
      Download APK
    </Nav.Link>
  </Nav>
</Navbar.Collapse>

   
  </Container>
</Navbar>




{/* Hero Section */}
<section className="hero-section">
  <div 
    className="parallax-background"
    style={{ backgroundImage: `url(${bg7})` }}
  />
  <Container className="h-100 d-flex align-items-center">
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center"
      style={{
        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        width: '100%'
      }}
    >
      <h1 
        className="mb-4 display-3 fw-bold"
        style={{
          color: '#f8fafc', // Bright white
          fontSize: '4rem',
          letterSpacing: '-0.03em',
          lineHeight: '1.2'
        }}
      >

        <span style={{ 
          color: '#f9f5f8', 
      
        }}>
         DAWAM
        </span>
      </h1>
      
      <p 
        className="mb-4 lead"
        style={{
          color: '#f9f5f8', // Light gray
          fontSize: '1.5rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        Mobile-first solution for real-time attendance tracking and employee request management
      </p>

      <div 
        className="gap-4 mt-5 d-flex justify-content-center"
        style={{ color: '#f9f5f8' }} // Medium gray
      >
        <div className="gap-2 d-flex align-items-center">
          <FaClock style={{ color: '#f9f5f8' }} /> {/* Soft purple */}
          <span>Real-time Tracking</span>
        </div>
        <div className="gap-2 d-flex align-items-center">
          <FaMobileAlt style={{ color: '#f9f5f8' }} /> {/* Soft purple */}
          <span>Mobile Optimized</span>
        </div>
        <div className="gap-2 d-flex align-items-center">
          <FaMobileAlt style={{ color: '#f9f5f8' }} /> {/* Soft purple */}
          <span>Secure Platform</span>
        </div>
        <a
  href="/dawam.apk"
  download="DAWAM.apk"
  className="gap-2 d-flex align-items-center text-decoration-none"
  style={{ color: '#f9f5f8' }}
>
  <FaDownload  style={{ color: '#f9f5f8' }}
   />
  <span  style={{ color: '#f9f5f8' }}
  >Download for Android</span>
</a>
      </div>
    </motion.div>
  </Container>
</section>


    {/* Features Section */}
<section id="features" className="py-5 bg-gray-400" style={{ minHeight: '90vh' }}>
  <Container>
  <hr></hr>
  <hr></hr>      <hr></hr>

    <h2 className="mb-5 text-center display-4">Core Features</h2>
    <hr></hr>
    <hr></hr>
    <hr></hr>
    <Row className="g-4"  style={{  fontSize: '1.6rem' }}>
      {[ 
        { title: 'Mobile Attendance', icon: <FaMobileAlt />, desc: 'Instant attendance recording via mobile devices' },
        { title: 'Leave Requests', icon: <FaCalendarCheck />, desc: 'Digital leave application and approval system' },
        { title: 'Real-time Reports', icon: <FaFileAlt />, desc: 'Instant attendance reports and analytics' },
        { title: 'Users Management', icon: <FaUsers />, desc: 'Flexible users management and tracking' }
      ].map((feature, i) => (
        <Col md={3} key={feature.title}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="p-4 text-center feature-card h-100 rounded-3"
          >
            <div className="mb-3 floating">
              <span style={{ color: 'var(--accent-primary)', fontSize: '2.5rem' }}>
                {feature.icon}
              </span>
            </div>
            <h3 className="h4" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
            <p className="text-muted-custom">{feature.desc}</p>
          </motion.div>
        </Col>
      ))}
    </Row>
  </Container>
</section>
<section className="testimonial-section" style={{ position: 'relative', backgroundImage: `url(${bg9})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '100px 0' }}>
        <Container>
          <Row className="mt-5 justify-content-center">
            <Col md={6}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 rounded shadow-lg">
                <h3 className="mb-4 text-center" style={{ color: '#f9f5f8' }}>Login to Your Company</h3>
                <form onSubmit={handleLoginSubmit} style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '20px', borderRadius: '10px' }}>
                  <div className="mb-3">
                    <label htmlFor="company_code" className="fw-bold" style={{ color: '#fff' }}>Company Code</label>
                    <input
                      type="text"
                      id="company_code"
                      name="company_code"
                      className="form-control"
                      placeholder="Enter Company Code"
                      value={formData.company_code}
                      onChange={handleChange}
                      required
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#000', borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="fw-bold" style={{ color: '#fff' }}>Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#000', borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-dark w-100" style={{ borderRadius: '8px', padding: '12px', backgroundColor: '#333', borderColor: '#333' }}>
                    Login
                  </button>
                  {loginError && <p className="text-danger">Login failed. Please try again.</p>}
                </form>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

{/* About Section */}
<section id="about" className="bg-gray-400 " style={{ minHeight: '90vh' }}>
  <Container>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center"
    >
                <hr></hr>
          <hr></hr>
      <hr></hr>
      <h2 className="mb-5 display-4" style={{ color: 'var(--text-primary)' }}>
        About DAWAM
      </h2>
          <hr></hr>
          <hr></hr>
      <hr></hr>
      <p className="lead" style={{ color: '#242427' , fontSize: '1.5rem' }}>
        DAWAM is designed to be the most advanced employee management system that simplifies real-time attendance tracking and employee request management. It aims to offer a mobile-first solution that brings efficiency and security to the workplace. Our platform is highly optimized, intuitive, and scalable to meet the diverse needs of businesses of all sizes.
      </p>
      <p className="lead" style={{ color: '#242427' , fontSize: '1.5rem' }}>
        With a focus on user experience, DAWAM empowers businesses to manage employee attendance and requests seamlessly, ensuring that operations run smoothly and securely.
      </p>
      <hr></hr>
      <hr></hr>
    </motion.div>
  </Container>
</section>

<section id="image-gallery" className="bg-gray-400 custom-gallery-section" style={{ minHeight: '90vh' }}>
  <Container>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center custom-gallery-content"
    >
      <h2 className="mb-5 display-4 custom-gallery-title">
        Our Gallery
      </h2>

      <div className="row custom-gallery-row">
        <div className="mb-4 col-md-4 custom-gallery-item">
          <img src={img1} alt="Image 1" className="rounded img-fluid custom-gallery-img" />
        </div>
        <div className="mb-4 col-md-4 custom-gallery-item">
          <img src={img2} alt="Image 2" className="rounded img-fluid custom-gallery-img" />
        </div>
        <div className="mb-4 col-md-4 custom-gallery-item">
          <img src={img3} alt="Image 3" className="rounded img-fluid custom-gallery-img" />
        </div>
      </div>

      <div className="row custom-gallery-row">
        <div className="mb-4 col-md-4 custom-gallery-item">
          <img src={img4} alt="Image 4" className="rounded img-fluid custom-gallery-img" />
        </div>
        <div className="mb-4 col-md-4 custom-gallery-item">
          <img src={img5} alt="Image 5" className="rounded img-fluid custom-gallery-img" />
        </div>
        <div className="mb-4 col-md-4 custom-gallery-item">
          <img src={img6} alt="Image 6" className="rounded img-fluid custom-gallery-img" />
        </div>
      </div>
    </motion.div>
  </Container>
</section>

      {/* Contact Section */}
      <section id="contact" className="py-5 " style={{ background: `url(${authorImg}) no-repeat center center/cover`, color: 'white' }}>
        <Container>
          <Row className="mt-5 g-5 align-items-center">
            <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="p-4 shadow rounded-3" style={{ background: 'rgba(0, 0, 0, 0.6)', maxWidth: '800px', margin: '0 auto', borderRadius: '10px', padding: '20px' }}>
              <h2 className="mb-4 text-center display-5" style={{ color: '#f9f5f8', fontWeight: 'bold' }}>Get Started Today</h2>
              <p className="mb-4 text-center" style={{ fontSize: '1.1rem', color: '#e0e0e0' }}>Transform your workplace attendance management with our mobile-first solution.</p>
              <form onSubmit={handleContactSubmit} style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '20px', borderRadius: '10px' }}>
                <Row className="mb-3">
                  <Col sm={6}>
                    <label htmlFor="name" className="fw-bold" style={{ color: '#fff' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      required
                      placeholder="Your Name"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#000', borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                    />
                  </Col>
                  <Col sm={6}>
                    <label htmlFor="email" className="fw-bold" style={{ color: '#fff' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      required
                      placeholder="youremail@example.com"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#000', borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={6}>
                    <label htmlFor="phone" className="fw-bold" style={{ color: '#fff' }}>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      required
                      placeholder="Your Phone Number"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#000', borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                    />
                  </Col>
                  <Col sm={6}>
                    <label htmlFor="message" className="fw-bold" style={{ color: '#fff' }}>Message</label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="3"
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      required
                      placeholder="Your Message"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#000', borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                    ></textarea>
                  </Col>
                </Row>
                <div className="d-flex justify-content-center">
                  <button
                    type="submit"
                    className="btn btn-dark"
                    style={{ backgroundColor: '#333', borderColor: '#333', borderRadius: '8px', padding: '12px', width: '200px' }}
                    disabled={isContactLoading}
                  >
                    {isContactLoading ? 'Sending...' : 'Submit'}
                  </button>
                </div>
                {contactSuccess && <p className="text-success">Message sent successfully!</p>}
                {contactError && <p className="text-danger">{contactError}</p>}
           
              </form>
            </motion.div>
          </Row>
        </Container>
      </section>
    
      <footer className="footer">

        <div className="links">
          <a href="https://www.instagram.com/dawam.jo/" target="_blank" rel="noopener noreferrer" className="link">
            <FaInstagram style={{ marginRight: '8px' }} /> Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61574071978343" target="_blank" rel="noopener noreferrer" className="link">
            <FaFacebook style={{ marginRight: '8px' }} /> Facebook
          </a>
          <a href="mailto:omarhudaib.it@gmail.com" className="link">
            <FaEnvelope style={{ marginRight: '8px' }} /> omarhudaib.it@gmail.com
          </a>
          <a href="mailto:jodawam@gmail.com" className="link">
            <FaEnvelope style={{ marginRight: '8px' }} /> jodawam@gmail.com
          </a>
        </div>

    </footer>
</animated.div>

  );
};

export default LandingPage;
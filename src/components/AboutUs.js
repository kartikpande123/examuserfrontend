import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Target, Eye, Award, Users, Clock } from 'lucide-react';

const AboutUs = () => {
  const [keySequence, setKeySequence] = useState('');

  useEffect(() => {
    const handleKeyPress = (e) => {
      setKeySequence((prev) => {
        const newSequence = (prev + e.key).slice(-5); // Keep last 5 characters
        
        if (newSequence === 'admin') {
          window.location.href = '/adminlogin';
          return '';
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Karnataka Ayan Wholesale Supply Enterprises presents</h1>
          <h2 className="display-5 fw-bold mt-3">ARN Private Exam Conduct</h2>
          <p className="lead">Empowering Students Through Quality Test Preparation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        {/* Company Overview */}
        <div className="card mb-5 shadow">
          <div className="card-body">
            <h2 className="card-title text-primary h3 mb-4">About Our Company</h2>
            <p className="card-text">
              Founded in 2024, ARN Private Exam Conduct is a specialized educational service provider
              focused on preparing students for competitive examinations. We conduct comprehensive
              model exams that simulate real competitive examination environments, helping students
              gain valuable experience across all types of competitive tests.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="row mb-5 g-4">
          <div className="col-md-6">
            <div className="card h-100 shadow">
              <div className="card-body text-center">
                <Target className="text-primary mb-3" size={32} />
                <h3 className="card-title h4">Our Mission</h3>
                <p className="card-text">
                  To provide students with authentic examination experiences through high-quality
                  model tests, enabling them to build confidence and excel in their competitive
                  exam journey.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 shadow">
              <div className="card-body text-center">
                <Eye className="text-primary mb-3" size={32} />
                <h3 className="card-title h4">Our Vision</h3>
                <p className="card-text">
                  To become the leading competitive exam preparation platform in Karnataka,
                  recognized for our innovative approach and commitment to student success.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Values */}
        <div className="card mb-5 shadow">
          <div className="card-body">
            <h2 className="card-title text-primary h3 mb-4">Our Values</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="text-center">
                  <Award className="text-primary mb-3" size={32} />
                  <h4 className="h5">Excellence</h4>
                  <p>Delivering premium quality exam preparation services</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <Users className="text-primary mb-3" size={32} />
                  <h4 className="h5">Student-Centric</h4>
                  <p>Focusing on individual student growth and success</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <Clock className="text-primary mb-3" size={32} />
                  <h4 className="h5">Reliability</h4>
                  <p>Consistent and dependable examination partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Overview */}
        <div className="card mb-5 shadow">
          <div className="card-body">
            <h2 className="card-title text-primary h3 mb-4">Our Team</h2>
            <p>
              Our dedicated team consists of experienced educators and examination experts who are
              committed to providing the best preparation experience for competitive exams. With
              their extensive knowledge and expertise, they ensure that students receive quality
              guidance and support throughout their preparation journey.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-primary h3 mb-4">Contact Us</h2>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3">
                <MapPin className="text-primary" size={24} />
                <p className="mb-0">Dharwad, District Dharwad, Karnataka - 580011</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Phone className="text-primary" size={24} />
                <div>
                  <p className="mb-0">+91 6360785195</p>
                  <p className="mb-0">+91 9482759409</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Mail className="text-primary" size={24} />
                <p className="mb-0">arnprivateexamconduct@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer mt-5 bg-light py-3">
          <div className="container text-center">
            <p className="mb-2">
              &copy; 2025/2026 Karnataka Ayan Wholesale Supply Enterprises. All Rights Reserved.
            </p>
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="/termscondition" className="footer-link">Terms and Conditions</a>
              </li>
              <li className="list-inline-item">|</li>
              <li className="list-inline-item">
                <a href="/privacypolicy" className="footer-link">Privacy Policy</a>
              </li>
              <li className="list-inline-item">|</li>
              <li className="list-inline-item">
                <a href="/cancellationplicy" className="footer-link">Cancellation Policy</a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;
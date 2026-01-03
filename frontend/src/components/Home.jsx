import React from 'react';
import { GraduationCap, BookOpen, Users, Phone } from 'lucide-react';

const Home = () => {
    return (
        <div className="home">
            <nav className="navbar" style={{
                padding: '20px 0',
                background: 'var(--white)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                        <GraduationCap size={32} />
                        <span>MIET Arts & Science</span>
                    </div>
                    <div style={{ display: 'flex', gap: '30px', fontWeight: '500' }}>
                        <a href="#home">Home</a>
                        <a href="#about">About</a>
                        <a href="#courses">Courses</a>
                        <a href="#contact">Contact</a>
                    </div>
                </div>
            </nav>

            <section className="hero" style={{
                padding: '100px 0',
                background: 'linear-gradient(135deg, var(--primary) 0%, #0055aa 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container animate">
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Excellence in Education</h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 40px', opacity: 0.9 }}>
                        Join MIET Arts and Science College and shape your future with our world-class facilities and expert faculty.
                    </p>
                    <button style={{
                        padding: '15px 40px',
                        fontSize: '1.1rem',
                        background: 'var(--secondary)',
                        color: 'var(--primary)',
                        border: 'none',
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        Explore Courses
                    </button>
                </div>
            </section>

            <section id="features" style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        <div className="feature-card" style={{ padding: '40px', background: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <BookOpen size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>Quality Courses</h3>
                            <p>A wide range of undergraduate and postgraduate programs.</p>
                        </div>
                        <div className="feature-card" style={{ padding: '40px', background: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <Users size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>Expert Faculty</h3>
                            <p>Experienced professors dedicated to student success.</p>
                        </div>
                        <div className="feature-card" style={{ padding: '40px', background: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <Phone size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>24/7 Support</h3>
                            <p>Get your queries answered by our AI Helpdesk instantly.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

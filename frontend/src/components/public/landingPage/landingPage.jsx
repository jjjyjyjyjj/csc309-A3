import React from 'react';
import { Link } from 'react-router-dom';
import squiggle from '../../../assets/hero-squiggle.svg'
import wave from '../../../assets/hero-wave.svg'

import './style.css';

function LandingPage() {
    return (
        <div>
            <div className='hero'>
                <h1 className="hero-title">
                    Welcome to <span className="hero-accent">JobFinder</span>
                </h1>
                <img src={squiggle} alt="" className="hero-squiggle" />
            </div>
                
            <div className="hero-wave-container">
                <h2 className='about-jobfinder'>About JobFinder</h2>
                <div className='about-card'>

                    <div className='about-item'>
                        <span className='about-icon'>🔍</span>
                        <div>
                            <strong>Discover Opportunities</strong>
                            <p>Search through thousands of businesses, open roles, and positions tailored to your skills and interests.</p>
                        </div>
                    </div>

                    <div className='about-item'>
                        <span className='about-icon'>💬</span>
                        <div>
                            <strong>Connect Directly</strong>
                            <p>Chat with employers, learn about their culture, and take the next step in your career, no endless applications.</p>
                        </div>
                    </div>

                    <div className='about-item'>
                        <span className='about-icon'>📍</span>
                        <div>
                            <strong>Explore Locally</strong>
                            <p>Find businesses near you, save your favourites, and build a personalized network of places you actually want to work.</p>
                        </div>
                    </div>

                    <div className='about-item'>
                        <span className='about-icon'>🚀</span>
                        <div>
                            <strong>Stay Ahead</strong>
                            <p>Whether you're actively job hunting or just exploring, join over 5 million users already finding better opportunities, faster.</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="log-in-container">
                <h2 className='container-header'>
                    Start by logging into your account 
                    or finding a business
                </h2>
                <div className='btn-row'>
                    <Link to="/login" className="btn login">Log in</Link>
                    <Link to="/businesses" className="btn business">Find businesses</Link>
                </div>
            </div>

            <div className='ending-wave'></div>
        </div>
    );
}

export default LandingPage;
"use client";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isAnnual, setIsAnnual] = useState(false);
  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blue" />
        <div className="mesh-blob coral" />
        <div className="mesh-blob sage" />
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFFFFF" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="navbar-logo-text">Local<span>Boost</span></span>
        </a>

        <ul className="navbar-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How it Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>

        <div className="navbar-cta">
          <a href="/login" className="btn btn-ghost">Sign in</a>
          <a href="/signup" className="btn btn-primary">Start free</a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="floating-metric left">
          <div className="metric-icon coral">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div className="metric-text">
            <div className="metric-value">3x</div>
            <div className="metric-label">Engagement</div>
          </div>
        </div>

        <div className="floating-metric right">
          <div className="metric-icon sage">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="metric-text">
            <div className="metric-value">+42%</div>
            <div className="metric-label">More Walk-ins</div>
          </div>
        </div>

        <div className="hero-badge">
          <span className="hero-badge-tag">New</span>
          Your AI Marketing Assistant is here
        </div>

        <h1 className="hero-title">
          Grow your local business,<br />
          <span className="gradient-text">effortlessly.</span>
        </h1>

        <p className="hero-subtitle">
          LocalBoost acts like a full-time marketing agency for your business. 
          Generate beautiful social posts, ads, and local campaigns in seconds.
        </p>

        <div className="hero-actions">
          <a href="/signup" className="btn btn-primary btn-lg">
            Get started for free
          </a>
          <a href="#features" className="btn btn-outline btn-lg">
            See how it works
          </a>
        </div>

        {/* Dashboard Preview */}
        <div className="dashboard-preview">
          <div className="dashboard-preview-frame">
            <div className="dashboard-preview-bar">
              <span className="window-dot red" />
              <span className="window-dot yellow" />
              <span className="window-dot green" />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: '#FFFFFF', padding: '4px 16px', borderRadius: '6px', fontSize: '13px', color: '#94A3B8', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  app.localboost.com
                </div>
              </div>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-sidebar">
                {[
                  { id: 'Overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { id: 'Content AI', label: 'Content AI', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                  { id: 'Calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { id: 'Brand Profile', label: 'Brand Profile', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon}/>
                    </svg>
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="dashboard-main">
                {activeTab === 'Overview' && (
                  <>
                    <div className="dashboard-header-row">
                      <div className="dashboard-greeting">
                        Good morning, Sarah
                        <span>Here's how The Daily Grind is doing today.</span>
                      </div>
                      <button className="btn btn-accent">
                        + New Campaign
                      </button>
                    </div>
                    
                    <div className="stats-row">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon blue"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></div>
                          Smart Ideas Generated
                        </div>
                        <div className="stat-value">124</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon coral"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg></div>
                          Audience Reached
                        </div>
                        <div className="stat-value">4.2k</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon violet"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
                          Posts Scheduled
                        </div>
                        <div className="stat-value">12</div>
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Upcoming Content</h3>
                      {[
                        { day: 'Today', content: 'Morning Coffee Special — Instagram Story', color: '#0284C7' },
                        { day: 'Tomorrow', content: 'Meet the Barista: James — Facebook Post', color: '#10B981' },
                      ].map((post, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
                          <div style={{ background: `${post.color}15`, color: post.color, padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, width: '90px', textAlign: 'center' }}>{post.day}</div>
                          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{post.content}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {activeTab === 'Content AI' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className="bento-icon-wrapper blue" style={{ marginBottom: '16px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Magic Content Creator</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '300px' }}>Describe your latest update and let the AI draft perfect posts for all networks.</p>
                    <div style={{ marginTop: '24px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', width: '100%', maxWidth: '400px', display: 'flex', gap: '8px' }}>
                       <input type="text" placeholder="e.g. We have a new vanilla latte..." style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' }} disabled />
                       <button className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '13px' }}>Generate</button>
                    </div>
                  </div>
                )}
                
                {activeTab === 'Calendar' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="dashboard-header-row" style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Content Calendar</h2>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px' }}>&lt;</button>
                        <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px' }}>Today</button>
                        <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px' }}>&gt;</button>
                      </div>
                    </div>
                    <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '16px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: '40px repeat(3, 1fr)', background: '#F8FAFC', overflow: 'hidden' }}>
                       {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} style={{ padding: '10px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>{day}</div>)}
                       {Array.from({length: 21}).map((_, i) => (
                         <div key={i} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '8px', background: '#FFFFFF' }}>
                           <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '4px' }}>{i + 1}</div>
                           {i === 3 && <div style={{ background: 'var(--accent)', color: 'white', fontSize: '10px', padding: '4px', borderRadius: '4px' }}>IG Post</div>}
                           {i === 5 && <div style={{ background: 'var(--sage)', color: 'white', fontSize: '10px', padding: '4px', borderRadius: '4px' }}>FB Ad</div>}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'Brand Profile' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className="bento-icon-wrapper coral" style={{ marginBottom: '16px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Brand DNA</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '300px' }}>Your business profile and AI tone settings are configured here.</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <span className="hero-badge-tag">Friendly Tone</span>
                      <span className="hero-badge-tag">Coffee Shop</span>
                      <span className="hero-badge-tag">Local Audience</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section" id="features">
        <div className="section-header">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need. <br/>None of the complexity.</h2>
          <p className="section-subtitle">
            We built LocalBoost to feel like magic. It takes the heavy lifting out of marketing, so you can focus on running your business.
          </p>
        </div>

        <div className="bento-grid">
          {/* AI Content - Wide */}
          <div className="bento-card wide">
            <div className="bento-icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </div>
            <div className="bento-card-title">Magic Content Creator</div>
            <div className="bento-card-desc">
              Never stare at a blank screen again. Describe what's happening at your business, and our AI writes engaging posts perfectly tailored to your brand voice.
            </div>
            <div className="bento-visual visual-padding" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="chat-bubble">
                "We just got a new espresso machine in today!"
              </div>
              <div className="chat-bubble" style={{ alignSelf: 'flex-end', background: 'var(--accent)', color: '#FFF', borderColor: 'var(--accent)' }}>
                ✨ <strong>Drafted:</strong> Big news, coffee lovers! ☕ Our brand new espresso machine just landed at The Daily Grind...
              </div>
            </div>
          </div>

          {/* Brand DNA */}
          <div className="bento-card">
            <div className="bento-icon-wrapper coral">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            </div>
            <div className="bento-card-title">Your Brand DNA</div>
            <div className="bento-card-desc">
              Set your tone (friendly, professional, witty) and target audience once. The AI remembers exactly who you are.
            </div>
          </div>

          {/* Calendar */}
          <div className="bento-card">
            <div className="bento-icon-wrapper sage">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="bento-card-title">Auto-Scheduler</div>
            <div className="bento-card-desc">
              Plan your whole week in 10 minutes. We'll automatically post to Instagram, Facebook, and Google for you.
            </div>
          </div>

          {/* Analytics - Wide */}
          <div className="bento-card wide">
            <div className="bento-icon-wrapper violet">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div className="bento-card-title">Simple Analytics</div>
            <div className="bento-card-desc">
              No confusing charts or jargon. Just clear insights on what posts are working best and what you should do next.
            </div>
            <div className="bento-visual" style={{ padding: '24px', display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px' }}>
              {[30, 45, 25, 60, 50, 80, 70, 95].map((h, i) => (
                <div key={i} style={{ flex: 1, background: i === 7 ? 'var(--violet)' : 'rgba(139, 92, 246, 0.2)', height: `${h}%`, borderRadius: '6px 6px 0 0' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section" id="how-it-works" style={{ background: '#FFFFFF', margin: '0', maxWidth: '100%', padding: '120px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <div className="section-label" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--sage)' }}>Process</div>
            <h2 className="section-title">Three steps to growth.</h2>
          </div>

          <div className="steps-container">
            {[
              { n: '1', title: 'Connect Your Accounts', desc: 'Securely link your Instagram, Facebook, and Google Business profiles in one click.' },
              { n: '2', title: 'Define Your Brand', desc: 'Tell us your business name, what makes you special, and how you like to talk to customers.' },
              { n: '3', title: 'Review & Grow', desc: 'LocalBoost generates your monthly calendar. You just hit approve, and we handle the rest.' },
            ].map((s, i) => (
              <div key={i} className="step-row">
                <div className="step-number-large">{s.n}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="section" id="pricing" style={{ background: '#F8FAFC', margin: '0', maxWidth: '100%', padding: '120px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header">
            <div className="section-label" style={{ background: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent)' }}>Pricing</div>
            <h2 className="section-title">Simple plans for local heroes.</h2>
            <p className="section-subtitle">Start for free, upgrade when you're ready to automate everything.</p>
            
            {/* Pricing Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: !isAnnual ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color 0.2s' }}>Monthly</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                style={{ width: '64px', height: '36px', background: 'var(--text-primary)', borderRadius: '100px', padding: '4px', cursor: 'pointer', border: 'none', position: 'relative' }}
                aria-label="Toggle annual pricing"
              >
                <div style={{ width: '28px', height: '28px', background: '#FFFFFF', borderRadius: '50%', position: 'absolute', top: '4px', left: isAnnual ? '32px' : '4px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: 'var(--shadow-sm)' }} />
              </button>
              <span style={{ fontSize: '16px', fontWeight: 600, color: isAnnual ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s' }}>
                Annually
                <span style={{ background: 'var(--sage)', color: '#FFF', fontSize: '12px', padding: '4px 10px', borderRadius: '100px', fontWeight: 800, letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}>SAVE 20%</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'flex-start', marginTop: '64px' }}>
            {/* Free Tier */}
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Starter</h3>
              <div style={{ fontSize: '48px', fontWeight: 800, margin: '16px 0', letterSpacing: '-1px' }}>$0<span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></div>
              <div style={{ height: '24px' }}></div> {/* Spacer for alignment */}
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>Perfect for trying out LocalBoost for a single location.</p>
              <a href="/signup" className="btn btn-outline" style={{ width: '100%', marginBottom: '32px' }}>Start Free</a>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-primary)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> 1 Business Profile</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-primary)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> 10 AI Generations/mo</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-faint)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Auto-Scheduling</li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div style={{ background: '#FFFFFF', border: '2px solid var(--accent)', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#FFF', padding: '4px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Most Popular</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Pro Growth</h3>
              <div style={{ fontSize: '48px', fontWeight: 800, margin: '16px 0', letterSpacing: '-1px' }}>
                ${isAnnual ? '24' : '29'}<span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <div style={{ height: '24px', fontSize: '14px', color: 'var(--text-faint)', fontWeight: 500 }}>
                {isAnnual ? 'Billed $288 annually' : 'Billed monthly'}
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>Everything you need to run your marketing on autopilot.</p>
              <a href="/signup" className="btn btn-accent" style={{ width: '100%', marginBottom: '32px' }}>Start 14-Day Trial</a>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-primary)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Up to 3 Profiles</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-primary)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Unlimited AI Content</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-primary)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Full Auto-Scheduling</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-primary)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Advanced Analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section" style={{ padding: '120px 24px' }}>
        <div className="cta-card">
          <h2 className="cta-title">Ready to automate your marketing?</h2>
          <p className="cta-subtitle">
            Join thousands of local business owners saving 10+ hours a week with LocalBoost AI.
          </p>
          <a href="/signup" className="btn btn-outline btn-lg" style={{ color: '#0F172A', border: 'none', padding: '16px 32px', fontSize: '18px' }}>
            Start your free trial today
          </a>
          <div style={{ marginTop: '24px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500 }}>
            No credit card required. Cancel anytime.
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="navbar-logo" style={{ marginBottom: '16px' }}>
              <div className="navbar-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFFFFF" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="navbar-logo-text">Local<span>Boost</span></span>
            </div>
            <p className="footer-desc">
              The AI-powered marketing team built specifically for local businesses, cafes, and shops.
            </p>
          </div>
          
          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Case Studies</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div>© 2026 LocalBoost Inc. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
}

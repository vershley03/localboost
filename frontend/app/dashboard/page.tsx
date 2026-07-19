"use client";
import { useState } from "react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: '#FFFFFF', borderRight: '1px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent) 0%, #38BDF8 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFFFFF" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Local<span style={{ color: 'var(--accent)' }}>Boost</span>
          </span>
        </a>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'Overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'Content AI', label: 'Magic Creator', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { id: 'Calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'Brand Profile', label: 'Brand DNA', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: activeTab === item.id ? 'var(--accent-subtle)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => { if (activeTab !== item.id) { e.currentTarget.style.background = 'rgba(15,23,42,0.03)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={(e) => { if (activeTab !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d={item.icon}/>
              </svg>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--text-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              S
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Sarah Jenkins</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>The Daily Grind</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {activeTab === 'Overview' && (
            <div style={{ animation: 'fadeInUp 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Dashboard</h1>
                  <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '4px' }}>Welcome back! Here's what's happening today.</p>
                </div>
                <button className="btn btn-accent" style={{ padding: '12px 24px' }}>
                  + New Campaign
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2,132,199,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></div>
                    AI Generations
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>124</div>
                  <div style={{ fontSize: '13px', color: 'var(--sage)', fontWeight: 600, marginTop: '8px' }}>+12% this week</div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(249,115,22,0.1)', color: 'var(--coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg></div>
                    Audience Reached
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>4.2k</div>
                  <div style={{ fontSize: '13px', color: 'var(--sage)', fontWeight: 600, marginTop: '8px' }}>+800 new views</div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', color: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
                    Scheduled Posts
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>12</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '8px' }}>Next post at 4:00 PM</div>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Upcoming Content</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { day: 'Today', content: 'Morning Coffee Special — Instagram Story', color: '#0284C7', status: 'Ready' },
                    { day: 'Tomorrow', content: 'Meet the Barista: James — Facebook Post', color: '#10B981', status: 'Scheduled' },
                    { day: 'Friday', content: 'Weekend Brunch Menu Drop — Google Update', color: '#F97316', status: 'Draft' },
                  ].map((post, i) => (
                    <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ background: `${post.color}15`, color: post.color, padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 800, width: '100px', textAlign: 'center' }}>{post.day}</div>
                      <div style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600, flex: 1 }}>{post.content}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', background: '#FFFFFF', padding: '6px 12px', borderRadius: '100px', border: '1px solid var(--border)' }}>{post.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Content AI' && (
            <div style={{ animation: 'fadeInUp 0.4s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '64px' }}>
              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, rgba(2,132,199,0.1) 0%, rgba(2,132,199,0.05) 100%)', color: 'var(--accent)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Magic Content Creator</h1>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px', marginBottom: '40px' }}>
                Describe what's happening at your business, and our AI will draft the perfect posts for all your networks.
              </p>

              <div style={{ width: '100%', maxWidth: '600px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                <textarea 
                  placeholder="e.g. We just got a new batch of Ethiopian coffee beans in..."
                  style={{ width: '100%', height: '120px', border: 'none', resize: 'none', outline: 'none', fontSize: '16px', fontFamily: 'inherit', color: 'var(--text-primary)' }}
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '6px 12px', borderRadius: '100px', background: '#F8FAFC', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>📸 Add Image</button>
                    <button style={{ padding: '6px 12px', borderRadius: '100px', background: '#F8FAFC', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🎯 Pick Platform</button>
                  </div>
                  <button className="btn btn-accent">Generate ✨</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Calendar' && (
            <div style={{ animation: 'fadeInUp 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Content Calendar</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline">&lt;</button>
                  <button className="btn btn-outline">Today</button>
                  <button className="btn btn-outline">&gt;</button>
                </div>
              </div>
              
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>{day}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 120px)' }}>
                  {Array.from({length: 35}).map((_, i) => (
                    <div key={i} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px', position: 'relative' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: i < 3 || i > 33 ? 'var(--text-faint)' : 'var(--text-primary)' }}>{(i % 31) + 1}</div>
                      
                      {i === 12 && (
                        <div style={{ marginTop: '8px', padding: '6px 8px', background: 'var(--accent)', color: '#FFF', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                          IG: New Menu
                        </div>
                      )}
                      {i === 14 && (
                        <div style={{ marginTop: '8px', padding: '6px 8px', background: 'var(--sage)', color: '#FFF', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                          FB Ad: Promo
                        </div>
                      )}
                      {i === 17 && (
                        <div style={{ marginTop: '8px', padding: '6px 8px', background: 'var(--coral)', color: '#FFF', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                          Google: Event
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Brand Profile' && (
            <div style={{ animation: 'fadeInUp 0.4s ease', maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Brand DNA</h1>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '40px' }}>
                Configure your business details so the AI always writes exactly in your voice.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Business Name</label>
                  <input type="text" defaultValue="The Daily Grind" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)' }} />
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Brand Voice / Tone</label>
                  <select style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)', backgroundColor: '#FFFFFF' }}>
                    <option>Friendly & Approachable</option>
                    <option>Professional & Corporate</option>
                    <option>Witty & Humorous</option>
                    <option>Energetic & Bold</option>
                  </select>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Target Audience</label>
                  <textarea defaultValue="Local professionals, college students, and coffee enthusiasts in the downtown area." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', fontFamily: 'inherit', fontWeight: 500, color: 'var(--text-primary)', resize: 'none', height: '100px' }}></textarea>
                </div>
                
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>Save Brand DNA</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

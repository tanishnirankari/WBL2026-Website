import { useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auction() {
  // Masked placeholder player pool
  const maskedPlayers = [
    {
      id: 'AUC-101',
      code: 'Player #101',
      category: 'Category A',
      role: 'Top-Order Batsman',
      status: 'MASKED / IN POOL',
      basePrice: '₹?,???',
      badgeColor: '#00d2ff',
    },
    {
      id: 'AUC-102',
      code: 'Player #102',
      category: 'Icon Player',
      role: 'Pace Bowling All-Rounder',
      status: 'MASKED / IN POOL',
      basePrice: '₹?,???',
      badgeColor: 'var(--lime)',
    },
    {
      id: 'AUC-103',
      code: 'Player #103',
      category: 'Category A',
      role: 'Express Fast Bowler',
      status: 'MASKED / IN POOL',
      basePrice: '₹?,???',
      badgeColor: '#ff9f43',
    },
    {
      id: 'AUC-104',
      code: 'Player #104',
      category: 'Category B',
      role: 'Wicket-Keeper Finisher',
      status: 'MASKED / IN POOL',
      basePrice: '₹?,???',
      badgeColor: '#a55eea',
    },
    {
      id: 'AUC-105',
      code: 'Player #105',
      category: 'Category A',
      role: 'Spin Specialist',
      status: 'MASKED / IN POOL',
      basePrice: '₹?,???',
      badgeColor: '#2bcbba',
    },
    {
      id: 'AUC-106',
      code: 'Player #106',
      category: 'Category B',
      role: 'Hard-Hitting All-Rounder',
      status: 'MASKED / IN POOL',
      basePrice: '₹?,???',
      badgeColor: 'var(--lime)',
    },
  ];

  const [registeredList, setRegisteredList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wbl_auction_registrations') || '[]');
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [successCode, setSuccessCode] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    role: 'All-Rounder',
    battingStyle: 'Right-Hand Bat',
    bowlingStyle: 'Right-Arm Fast',
    club: '',
    basePrice: '₹2,000',
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newReg = {
      id: 'REG-' + Math.floor(1000 + Math.random() * 9000),
      code: `Player #${Math.floor(107 + registeredList.length)} (You)`,
      category: 'New Registration',
      role: formData.role,
      status: 'PENDING VERIFICATION',
      basePrice: formData.basePrice,
      badgeColor: 'var(--lime)',
    };

    const updated = [newReg, ...registeredList];
    setRegisteredList(updated);
    try {
      localStorage.setItem('wbl_auction_registrations', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setSuccessCode(newReg.id);
    setShowModal(false);
    setFormData({
      name: '',
      phone: '',
      age: '',
      role: 'All-Rounder',
      battingStyle: 'Right-Hand Bat',
      bowlingStyle: 'Right-Arm Fast',
      club: '',
      basePrice: '₹2,000',
    });
  };

  const allDisplayPlayers = [...registeredList, ...maskedPlayers];

  const filteredPlayers = allDisplayPlayers.filter((p) => {
    if (filter === 'All') return true;
    if (filter === 'Batsman') return p.role.toLowerCase().includes('bat');
    if (filter === 'Bowler') return p.role.toLowerCase().includes('bowl');
    if (filter === 'All-Rounder') return p.role.toLowerCase().includes('round');
    if (filter === 'Wicket-Keeper') return p.role.toLowerCase().includes('keeper');
    return true;
  });

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.03)',
    color: 'white',
    outline: 'none',
    fontSize: '14px'
  };

  return (
    <Layout>
      <main className="page content-page">
        
        {/* HEADER SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ color: 'var(--lime)', fontSize: '13px', letterSpacing: '4px', fontWeight: 'bold' }}
          >
            WINTER BASH LEAGUE 2026
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(34px, 5vw, 56px)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '-1px' }}
          >
            Player Auction Arena
          </motion.h1>

          <p style={{ color: '#9bb0c4', fontSize: '16px', maxWidth: '650px', margin: '14px auto 26px', lineHeight: 1.6 }}>
            The official auction player pool is currently masked and under wraps. Identity, photos, and player statistics will be officially unveiled during tournament auction week.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowModal(true)}
              className="primary-button"
              style={{ padding: '14px 30px', fontSize: '15px', cursor: 'pointer', border: 'none' }}
            >
              + Register to be Auctioned
            </button>
            <a href="#masked-pool" className="outline-button" style={{ padding: '14px 28px', fontSize: '15px' }}>
              View Auction Pool Slots
            </a>
          </div>
        </div>

        {/* REGISTRATION SUCCESS BANNER */}
        {successCode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(156, 255, 0, 0.12)',
              border: '1px solid var(--lime)',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '35px'
            }}
          >
            <h3 style={{ color: 'var(--lime)', marginBottom: '6px' }}>🎉 Player Registration Received!</h3>
            <p style={{ color: '#e0e8f0', fontSize: '14px' }}>
              Your application has been logged under Registration ID <strong>#{successCode}</strong>. Your slot has been reserved in the auction pool.
            </p>
          </motion.div>
        )}

        {/* MASKED TEASER NOTICE BOX */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(12, 38, 60, 0.8), rgba(6, 17, 29, 0.9))',
          border: '1px dashed rgba(156, 255, 0, 0.35)',
          borderRadius: '14px',
          padding: '24px 30px',
          marginBottom: '35px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 800, letterSpacing: '2px', marginBottom: '6px' }}>
              🔒 CONFIDENTIAL PLAYER POOL
            </div>
            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '6px' }}>
              Player Names & Details Masked
            </h3>
            <p style={{ color: '#8fa2b4', fontSize: '14px', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
              To maintain fair bidding among franchises, individual statistics and player identities are confidential. Players can still submit their nominations below.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '12px 22px',
              background: 'rgba(156, 255, 0, 0.15)',
              border: '1px solid var(--lime)',
              color: 'var(--lime)',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Submit Player Nomination
          </button>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div id="masked-pool" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: filter === cat ? '1px solid var(--lime)' : '1px solid rgba(255,255,255,0.1)',
                  background: filter === cat ? 'var(--lime)' : 'transparent',
                  color: filter === cat ? '#06111d' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
            Showing <strong>{filteredPlayers.length}</strong> Auction Slots
          </div>
        </div>

        {/* MASKED PLAYER SLOTS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredPlayers.map((player, idx) => (
            <motion.div
              key={player.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              style={{
                background: 'linear-gradient(180deg, rgba(12, 34, 54, 0.95), rgba(7, 21, 35, 0.98))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}
            >
              {/* CARD TOP BANNER */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: player.badgeColor || 'var(--lime)',
                  border: `1px solid ${player.badgeColor || 'var(--lime)'}`
                }}>
                  {player.category}
                </span>

                <span style={{ fontSize: '12px', color: '#93a0ad' }}>
                  Base: <strong style={{ color: 'var(--lime)', fontSize: '14px' }}>{player.basePrice}</strong>
                </span>
              </div>

              {/* MASKED AVATAR & INFO */}
              <div style={{ padding: '24px 20px', display: 'flex', gap: '18px', alignItems: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(156,255,0,0.08), rgba(4,13,22,0.95))',
                  border: '2px dashed rgba(156, 255, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  fontWeight: 900,
                  color: 'var(--lime)',
                  flexShrink: 0
                }}>
                  ?
                </div>

                <div>
                  <h3 style={{ fontSize: '19px', color: '#fff', marginBottom: '5px' }}>
                    {player.code}
                  </h3>
                  <p style={{ color: 'var(--lime)', fontSize: '13px', fontWeight: 700 }}>
                    {player.role}
                  </p>
                  <small style={{ color: 'var(--muted)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Stats & Identity Masked
                  </small>
                </div>
              </div>

              {/* MASKED STATS MATRIX */}
              <div style={{
                padding: '14px 20px',
                background: 'rgba(3, 13, 23, 0.8)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>MATCHES</span>
                  <strong style={{ fontSize: '14px', color: '#8fa2b4' }}>••</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>RUNS</span>
                  <strong style={{ fontSize: '14px', color: '#8fa2b4' }}>••••</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>WKTS</span>
                  <strong style={{ fontSize: '14px', color: '#8fa2b4' }}>••</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>S/RATE</span>
                  <strong style={{ fontSize: '14px', color: '#8fa2b4' }}>•••.•</strong>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div style={{ padding: '16px 20px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  ID: #{player.id}
                </small>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--lime)',
                  fontWeight: 700,
                  background: 'rgba(156,255,0,0.08)',
                  padding: '4px 10px',
                  borderRadius: '4px'
                }}>
                  Revealing Soon
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* REGISTRATION MODAL */}
        <AnimatePresence>
          {showModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '12px'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                  background: 'linear-gradient(135deg, #091d30, #05121f)',
                  border: '1px solid var(--lime)',
                  borderRadius: '18px',
                  width: '100%',
                  maxWidth: '600px',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  padding: 'clamp(18px, 4vw, 30px)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', textTransform: 'uppercase', color: '#fff' }}>Player Auction Registration</h2>
                    <p style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
                      Register to be auctioned in WBL 2026
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '26px',
                      cursor: 'pointer'
                    }}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 Mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Age *
                      </label>
                      <input
                        type="number"
                        required
                        min="14"
                        max="50"
                        placeholder="e.g. 20"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Playing Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="All-Rounder">All-Rounder</option>
                        <option value="Top-Order Batsman">Top-Order Batsman</option>
                        <option value="Middle-Order Batsman">Middle-Order Batsman</option>
                        <option value="Fast Bowler">Fast Bowler</option>
                        <option value="Spin Bowler">Spin Bowler</option>
                        <option value="Wicket-Keeper Batsman">Wicket-Keeper Batsman</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Batting Style
                      </label>
                      <select
                        value={formData.battingStyle}
                        onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Right-Hand Bat">Right-Hand Bat</option>
                        <option value="Left-Hand Bat">Left-Hand Bat</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Bowling Style
                      </label>
                      <select
                        value={formData.bowlingStyle}
                        onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Right-Arm Fast">Right-Arm Fast</option>
                        <option value="Right-Arm Medium">Right-Arm Medium</option>
                        <option value="Right-Arm Spin">Right-Arm Spin</option>
                        <option value="Left-Arm Fast">Left-Arm Fast</option>
                        <option value="Left-Arm Spin">Left-Arm Spin</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Club / Academy Name
                      </label>
                      <input
                        type="text"
                        placeholder="Club / Academy"
                        value={formData.club}
                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Expected Base Price
                      </label>
                      <select
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="₹1,000">₹1,000 (Emerging)</option>
                        <option value="₹2,000">₹2,000 (Category B)</option>
                        <option value="₹3,000">₹3,000 (Category A)</option>
                        <option value="₹4,000">₹4,000 (Icon Player)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: '#cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      style={{ border: 'none', cursor: 'pointer', padding: '12px 28px' }}
                    >
                      Submit Player Registration &rarr;
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </Layout>
  );
}

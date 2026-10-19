import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gavel,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Upload,
  Coins,
  ChevronRight,
  Award,
  Zap,
  Flame,
  Shield,
  Activity
} from 'lucide-react';

export default function Auction() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const roleFilters = ['All Players', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
  const [activeRole, setActiveRole] = useState('All Players');
  const [registeredPlayers, setRegisteredPlayers] = useState([]);

  const [players, setPlayers] = useState([]);
  const [catalogueError, setCatalogueError] = useState('');

  const [approvedBids, setApprovedBids] = useState([]);
  const [bidFeedUpdatedAt, setBidFeedUpdatedAt] = useState(null);
  const [bidFeedError, setBidFeedError] = useState(false);

  // Modal states
  const [biddingPlayer, setBiddingPlayer] = useState(null);
  const [bidForm, setBidForm] = useState({ name: '', phone: '', email: '', amount: '' });
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Player Nomination Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    age: '',
    role: 'All-Rounder',
    battingStyle: 'Right-Hand Bat',
    bowlingStyle: 'Right-Arm Fast',
    club: '',
  });
  const [regSuccess, setRegSuccess] = useState(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regError, setRegError] = useState('');

  // Load only organiser-approved bids from the shared database.
  useEffect(() => {
    let active = true;
    const fetchLiveBids = async () => {
      try {
        const res = await fetch(`${apiUrl}/auction/bids/public`);
        if (!res.ok) throw new Error('Could not load approved bids.');
        const data = await res.json();
        if (active) {
          setApprovedBids(Array.isArray(data) ? data : []);
          setBidFeedUpdatedAt(new Date());
          setBidFeedError(false);
        }
      } catch {
        if (active) setBidFeedError(true);
      }
    };
    const fetchApprovedPlayers = async () => {
      try {
        const res = await fetch(`${apiUrl}/auction/registrations`);
        if (!res.ok) return;
        const data = await res.json();
        if (active) setRegisteredPlayers(Array.isArray(data) ? data.map((p) => ({
          ...p, id: `approved-${p.id}`, category: p.category || 'APPROVED PLAYER', status: 'AVAILABLE', published: true,
          basePrice: Number(String(p.basePrice || '0').replace(/[^0-9]/g, '')) || 0,
          stats: { matches: p.matches || '—', average: p.average || '—', strikeRate: p.strikeRate || '—', economy: p.economy || '—', best: p.best || '—' },
          badgeColor: 'var(--lime)'
        })) : []);
      } catch { if (active) setRegisteredPlayers([]); }
    };
    const fetchCatalogue = async () => {
      try {
        const res = await fetch(`${apiUrl}/auction/catalogue`);
        if (!res.ok) throw new Error('Could not load auction player statistics.');
        const data = await res.json();
        if (active) {
          setPlayers(Array.isArray(data) ? data : []);
          setCatalogueError('');
        }
      } catch (error) {
        if (active) setCatalogueError(error.message || 'Could not load auction player statistics.');
      }
    };
    fetchLiveBids();
    fetchApprovedPlayers();
    fetchCatalogue();
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') fetchLiveBids();
    }, 20000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, [apiUrl]);

  const getHighestBidInfo = (playerId) => {
    const playerBids = approvedBids.filter(
      (b) => String(b.playerId) === String(playerId) && b.status === 'APPROVED'
    );
    if (!playerBids.length) return null;
    return playerBids.reduce((max, current) =>
      Number(current.bidAmount) > Number(max.bidAmount) ? current : max
    );
  };

  const visiblePlayers = [...players, ...registeredPlayers].filter((p) => {
    if (p.published === false) return false;
    if (activeRole === 'All Players') return true;
    if (activeRole === 'Batsman') return (p.role || '').toLowerCase().includes('bat');
    if (activeRole === 'Bowler') return (p.role || '').toLowerCase().includes('bowl');
    if (activeRole === 'All-Rounder') return (p.role || '').toLowerCase().includes('round');
    if (activeRole === 'Wicket-Keeper') return (p.role || '').toLowerCase().includes('keeper');
    return true;
  });

  const openBidModal = (player) => {
    const highestBid = getHighestBidInfo(player.id);
    const minBid = highestBid ? Number(highestBid.bidAmount) + 100 : Number(player.basePrice);
    setBiddingPlayer(player);
    setBidForm({ name: '', phone: '', email: '', amount: String(minBid) });
    setBidError('');
    setBidSuccess(false);
  };

  const incrementBid = (increment) => {
    setBidForm((prev) => {
      const current = Number(prev.amount) || 0;
      return { ...prev, amount: String(current + increment) };
    });
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!biddingPlayer) return;

    const highestBid = getHighestBidInfo(biddingPlayer.id);
    const minRequired = highestBid ? Number(highestBid.bidAmount) + 100 : Number(biddingPlayer.basePrice);
    const bidAmountNumber = Number(bidForm.amount);
    if (!Number.isFinite(bidAmountNumber) || bidAmountNumber < minRequired) {
      setBidError(`Bid must be at least ${minRequired.toLocaleString('en-IN')} T`);
      return;
    }

    setIsSubmittingBid(true);
    setBidError('');
    try {
      const res = await fetch(`${apiUrl}/auction/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: biddingPlayer.id,
          playerName: biddingPlayer.name,
          bidderName: bidForm.name.trim(),
          phone: bidForm.phone.trim(),
          email: bidForm.email.trim() || null,
          bidAmount: bidAmountNumber
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit your bid. Please try again.');
      setBidSuccess(true);
    } catch (error) {
      setBidError(error.message || 'Could not connect to the auction service. Your bid was not sent.');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReg(true);
    setRegError('');

    try {
      const res = await fetch(`${apiUrl}/auction/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...regForm, photoUrl: photoPreview })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setRegSuccess(data.registrationId);
      setShowRegisterModal(false);
      setPhotoPreview(null);
    } catch (error) {
      setRegError(error.message || 'Unable to submit nomination. Please try again.');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const scrollToCatalogue = () => {
    const el = document.getElementById('player-catalogue');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <main
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: '#04070c',
          color: '#f8fafc',
          minHeight: '100vh',
          paddingTop: '86px',
          paddingBottom: '90px',
          position: 'relative',
          overflowX: 'hidden'
        }}
      >
        {/* Subtle mesh background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), radial-gradient(ellipse at 50% -10%, rgba(156,255,0,0.06) 0%, transparent 60%)',
            backgroundSize: '32px 32px, 100% 100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          
          {/* 1. ULTRA-COMPACT PROFESSIONAL HEADER BAR */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            {/* Small League Brand Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(156, 255, 0, 0.08)',
                  border: '1px solid rgba(156, 255, 0, 0.28)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--lime)',
                    boxShadow: '0 0 10px var(--lime)'
                  }}
                />
                <span
                  style={{
                    color: 'var(--lime)',
                    fontSize: '11px',
                    fontWeight: 900,
                    letterSpacing: '1.6px',
                    textTransform: 'uppercase',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  OFFICIAL AUCTION POOL
                </span>
              </div>
            </div>

            {/* Compact Action Button */}
            <div>
              <button
                onClick={() => setShowRegisterModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--lime)',
                  color: '#06111d',
                  height: '42px',
                  padding: '0 22px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 18px rgba(156, 255, 0, 0.28)',
                  fontFamily: "'Outfit', sans-serif"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(156, 255, 0, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(156, 255, 0, 0.28)';
                }}
              >
                <UserCheck size={16} /> REGISTER AS PLAYER
              </button>
            </div>
          </header>

          <div className={`auction-bid-feed ${bidFeedError ? 'is-stale' : ''}`} role="status">
            <span className="auction-bid-feed-dot" />
            {bidFeedError
              ? 'Live bid updates are temporarily unavailable. Showing the last received bids.'
              : `Approved bids refresh automatically${bidFeedUpdatedAt ? ` · Updated ${bidFeedUpdatedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ' · Connecting…'}`}
          </div>
          {catalogueError && <p role="alert" style={{ color: '#fca5a5', margin: '10px 0 18px' }}>{catalogueError}</p>}

          {/* Registration Success Notification */}
          {regSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(156, 255, 0, 0.08)',
                border: '1px solid rgba(156, 255, 0, 0.3)',
                borderRadius: '12px',
                padding: '14px 20px',
                marginBottom: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 color="var(--lime)" size={20} />
                <span style={{ fontSize: '13px', color: '#e2e8f0' }}>
                  Player nomination submitted under Registration <strong>#{regSuccess}</strong>. Under organizer review.
                </span>
              </div>
              <button
                onClick={() => setRegSuccess(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </motion.div>
          )}

          {visiblePlayers.length === 0 && (
            <div style={{ margin: '40px auto', maxWidth: 680, padding: '32px', textAlign: 'center', border: '1px solid rgba(156,255,0,.22)', borderRadius: 16, background: 'rgba(156,255,0,.04)' }}>
              <h2 style={{ color: 'var(--lime)' }}>Player nominations are open</h2>
              <p style={{ color: '#cbd5e1' }}>Approved players will appear here after organiser review. Submit your nomination to be considered for the auction.</p>
              <button onClick={() => setShowRegisterModal(true)} style={{ background: 'var(--lime)', color: '#06111d', border: 0, borderRadius: 8, padding: '12px 20px', fontWeight: 800, cursor: 'pointer' }}>Register as a player</button>
            </div>
          )}

          {/* 3. PRO SPORTS PLAYER CARDS GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '24px'
            }}
          >
            {visiblePlayers.map((player) => {
              const highestBid = getHighestBidInfo(player.id);
              const isSold = player.status === 'SOLD';
              const isUnsold = player.status === 'UNSOLD';

              return (
                <motion.article
                  key={player.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{
                    background: 'linear-gradient(180deg, #0b1118 0%, #070b10 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: '0 14px 34px rgba(0, 0, 0, 0.55)',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(156, 255, 0, 0.35)';
                    e.currentTarget.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(156, 255, 0, 0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.boxShadow = '0 14px 34px rgba(0, 0, 0, 0.55)';
                  }}
                >
                  {/* Portrait Hero Card Header with Real Sports Photography & Vignette Overlay */}
                  <div
                    style={{
                      position: 'relative',
                      height: '280px',
                      overflow: 'hidden',
                      background: '#04070c'
                    }}
                  >
                    {/* Portrait Photograph */}
                    <img
                      src={player.photoUrl || '/images/jersey.jpg'}
                      alt={player.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 20%',
                        filter: 'brightness(0.92) contrast(1.1)',
                        transition: 'transform 0.4s ease'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/jersey.jpg';
                      }}
                    />

                    {/* Rich Cinematic Vignette Gradient Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, rgba(4, 7, 12, 0.35) 0%, rgba(4, 7, 12, 0.08) 35%, rgba(7, 11, 16, 0.92) 80%, #0b1118 100%)'
                      }}
                    />

                    {/* Top Row: Role Badge & Auction Status */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        right: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 3
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(6, 11, 18, 0.75)',
                          backdropFilter: 'blur(8px)',
                          color: player.badgeColor || 'var(--lime)',
                          border: `1px solid ${player.badgeColor ? player.badgeColor + '66' : 'rgba(156,255,0,0.4)'}`,
                          fontFamily: "'Outfit', sans-serif"
                        }}
                      >
                        {player.role}
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.5px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: isSold
                            ? 'rgba(239, 68, 68, 0.25)'
                            : isUnsold
                            ? 'rgba(148, 163, 184, 0.25)'
                            : 'rgba(156, 255, 0, 0.18)',
                          color: isSold ? '#f87171' : isUnsold ? '#cbd5e1' : 'var(--lime)',
                          border: isSold
                            ? '1px solid rgba(239, 68, 68, 0.5)'
                            : isUnsold
                            ? '1px solid rgba(148, 163, 184, 0.4)'
                            : '1px solid rgba(156, 255, 0, 0.4)',
                          fontFamily: "'Outfit', sans-serif"
                        }}
                      >
                        {player.status || 'AVAILABLE'}
                      </span>
                    </div>

                    {/* Bottom: Player Name & Styles */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '16px',
                        right: '16px',
                        zIndex: 3
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'var(--lime)',
                          fontWeight: 800,
                          letterSpacing: '1.2px',
                          textTransform: 'uppercase',
                          fontFamily: "'Outfit', sans-serif",
                          display: 'block',
                          marginBottom: '2px'
                        }}
                      >
                        {player.category}
                      </span>
                      <h3
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '20px',
                          fontWeight: 800,
                          color: '#ffffff',
                          margin: '0 0 3px',
                          letterSpacing: '-0.3px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {player.name}
                      </h3>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#cbd5e1',
                          display: 'flex',
                          gap: '6px',
                          alignItems: 'center'
                        }}
                      >
                        <span>{player.battingStyle}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                        <span>{player.bowlingStyle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Performance Matrix — 4 fixed stats */}
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#070b10',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 800, letterSpacing: '0.5px' }}>
                        AVERAGE
                      </span>
                      <strong style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 800 }}>
                        {player.stats?.average || '—'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 800, letterSpacing: '0.5px' }}>
                        STRIKE RATE
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--lime)', fontWeight: 800 }}>
                        {player.stats?.strikeRate || '—'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 800, letterSpacing: '0.5px' }}>
                        ECONOMY
                      </span>
                      <strong style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 800 }}>
                        {player.stats?.economy || '—'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 800, letterSpacing: '0.5px' }}>
                        BEST
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--lime)', fontWeight: 800 }}>
                        {player.stats?.best || '—'}
                      </strong>
                    </div>
                  </div>

                  {/* Price & Auction Actions Footer */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}
                    >
                      {/* Base Price */}
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, display: 'block', letterSpacing: '0.5px' }}>
                          BASE PRICE
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
                          {Number(player.basePrice).toLocaleString('en-IN')} T
                        </span>
                      </div>

                      {/* Highest Approved Bid Display */}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, display: 'block', letterSpacing: '0.5px' }}>
                          CURRENT BID
                        </span>
                        {highestBid ? (
                          <div>
                            <span
                              style={{
                                fontSize: '17px',
                                fontWeight: 900,
                                color: 'var(--lime)',
                                letterSpacing: '-0.3px',
                                fontFamily: "'Outfit', sans-serif"
                              }}
                            >
                              {Number(highestBid.bidAmount).toLocaleString('en-IN')} T
                            </span>
                            <span
                              style={{
                                display: 'block',
                                fontSize: '11px',
                                color: '#94a3b8',
                                maxWidth: '140px',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              by {highestBid.bidderName}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                            Opening soon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: 'auto' }}>
                      <button
                        onClick={() => openBidModal(player)}
                        disabled={isSold}
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: isSold ? 'not-allowed' : 'pointer',
                          background: isSold
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(156, 255, 0, 0.08)',
                          border: isSold
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(156, 255, 0, 0.35)',
                          color: isSold ? '#64748b' : 'var(--lime)',
                          transition: 'all 0.2s ease',
                          fontFamily: "'Outfit', sans-serif"
                        }}
                        onMouseOver={(e) => {
                          if (!isSold) {
                            e.currentTarget.style.background = 'var(--lime)';
                            e.currentTarget.style.color = '#04070c';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(156,255,0,0.3)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSold) {
                            e.currentTarget.style.background = 'rgba(156, 255, 0, 0.08)';
                            e.currentTarget.style.color = 'var(--lime)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <Gavel size={15} />
                        {isSold ? 'PLAYER SOLD' : 'PLACE A BID'}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

        </div>

        {/* 4. POLISHED BID SUBMISSION MODAL */}
        <AnimatePresence>
          {biddingPlayer && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '16px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                style={{
                  background: '#090e15',
                  border: '1px solid rgba(156, 255, 0, 0.35)',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '460px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#0c131c'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(156, 255, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Gavel size={18} color="var(--lime)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                        Place Official Bid
                      </h3>
                      <span style={{ fontSize: '11px', color: 'var(--lime)', fontWeight: 600 }}>
                        {biddingPlayer.name} ({biddingPlayer.role})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBiddingPlayer(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {bidSuccess ? (
                  <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(156, 255, 0, 0.15)',
                        border: '2px solid var(--lime)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                      }}
                    >
                      <CheckCircle2 color="var(--lime)" size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                      Bid Submitted Successfully
                    </h3>
                    <p style={{ color: 'var(--lime)', fontSize: '14px', fontWeight: 700, margin: '0 0 16px' }}>
                      Awaiting organiser approval.
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: '0 0 24px' }}>
                      Your bid for <strong>{biddingPlayer.name}</strong> of{' '}
                      <strong style={{ color: '#ffffff' }}>{Number(bidForm.amount).toLocaleString('en-IN')} T</strong> will be reviewed by the league panel and displayed publicly once approved.
                    </p>
                    <button
                      onClick={() => setBiddingPlayer(null)}
                      style={{
                        height: '44px',
                        padding: '0 24px',
                        borderRadius: '8px',
                        background: 'var(--lime)',
                        color: '#070a0f',
                        fontWeight: 800,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit} style={{ padding: '20px' }}>
                    {/* Snapshot Bar */}
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 800 }}>
                          BASE PRICE
                        </span>
                        <strong style={{ fontSize: '14px', color: '#e2e8f0', fontFamily: "'Outfit', sans-serif" }}>
                          {Number(biddingPlayer.basePrice).toLocaleString('en-IN')} T
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 800 }}>
                          CURRENT HIGHEST BID
                        </span>
                        <strong style={{ fontSize: '14px', color: 'var(--lime)', fontFamily: "'Outfit', sans-serif" }}>
                          {getHighestBidInfo(biddingPlayer.id)
                            ? `${Number(getHighestBidInfo(biddingPlayer.id).bidAmount).toLocaleString('en-IN')} T`
                            : 'None'}
                        </strong>
                      </div>
                    </div>

                    {bidError && (
                      <div
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          color: '#f87171',
                          fontSize: '12px',
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <AlertCircle size={15} /> {bidError}
                      </div>
                    )}

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Bidder / Franchise Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Strikers"
                        value={bidForm.name}
                        onChange={(e) => setBidForm({ ...bidForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Contact Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={bidForm.phone}
                        onChange={(e) => setBidForm({ ...bidForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                      <small style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                        🔒 Private. Never displayed on the public page.
                      </small>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="franchise@example.com"
                        value={bidForm.email}
                        onChange={(e) => setBidForm({ ...bidForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
                          Bid Amount (Bash Tokens) *
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => incrementBid(500)}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(156,255,0,0.1)',
                              border: '1px solid rgba(156,255,0,0.3)',
                              color: 'var(--lime)',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            +500 T
                          </button>
                          <button
                            type="button"
                            onClick={() => incrementBid(1000)}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(156,255,0,0.1)',
                              border: '1px solid rgba(156,255,0,0.3)',
                              color: 'var(--lime)',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            +1,000 T
                          </button>
                        </div>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          required
                          min={biddingPlayer.basePrice}
                          step="100"
                          value={bidForm.amount}
                          onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                          style={{
                            width: '100%',
                            height: '44px',
                            padding: '0 34px 0 12px',
                            borderRadius: '8px',
                            background: '#04070c',
                            border: '1px solid rgba(156, 255, 0, 0.4)',
                            color: 'var(--lime)',
                            fontWeight: 800,
                            fontSize: '15px',
                            outline: 'none',
                            fontFamily: "'Outfit', sans-serif"
                          }}
                        />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--lime)', fontWeight: 800, fontSize: '15px', pointerEvents: 'none' }}>T</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingBid}
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '8px',
                        background: 'var(--lime)',
                        color: '#04070c',
                        fontWeight: 800,
                        fontSize: '13px',
                        letterSpacing: '0.4px',
                        border: 'none',
                        cursor: isSubmittingBid ? 'wait' : 'pointer',
                        transition: 'opacity 0.2s',
                        boxShadow: '0 4px 14px rgba(156, 255, 0, 0.25)',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      {isSubmittingBid ? 'Submitting Bid…' : 'SUBMIT BID FOR APPROVAL'}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 5. PLAYER NOMINATION / REGISTRATION MODAL */}
        <AnimatePresence>
          {showRegisterModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '16px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                style={{
                  background: '#090e15',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '560px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                      Register as Player
                    </h2>
                    <p style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 700, margin: '4px 0 0' }}>
                      WBL 2026 Auction Player Nomination
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  {regError && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>{regError}</p>}

                  {/* Photo Upload with Live Thumbnail Preview */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '10px',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#04070c',
                        border: '1px solid rgba(156,255,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Upload size={20} color="var(--lime)" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'inline-block',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--lime)',
                          cursor: 'pointer',
                          marginBottom: '2px'
                        }}
                      >
                        {photoPreview ? 'Change Photograph' : 'Upload Player Photograph'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                        Square portrait recommended (JPG/PNG)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Player full name"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 Mobile number"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Age *
                      </label>
                      <input
                        type="number"
                        required
                        min="14"
                        max="50"
                        placeholder="e.g. 21"
                        value={regForm.age}
                        onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Playing Role *
                      </label>
                      <select
                        value={regForm.role}
                        onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px'
                        }}
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
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Batting Style
                      </label>
                      <select
                        value={regForm.battingStyle}
                        onChange={(e) => setRegForm({ ...regForm, battingStyle: e.target.value })}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px'
                        }}
                      >
                        <option value="Right-Hand Bat">Right-Hand Bat</option>
                        <option value="Left-Hand Bat">Left-Hand Bat</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Bowling Style
                      </label>
                      <select
                        value={regForm.bowlingStyle}
                        onChange={(e) => setRegForm({ ...regForm, bowlingStyle: e.target.value })}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px'
                        }}
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
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Club / Academy Name
                      </label>
                      <input
                        type="text"
                        placeholder="Club name"
                        value={regForm.club}
                        onChange={(e) => setRegForm({ ...regForm, club: e.target.value })}
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#04070c',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(false)}
                      style={{
                        height: '42px',
                        padding: '0 18px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReg}
                      style={{
                        height: '42px',
                        padding: '0 22px',
                        borderRadius: '8px',
                        background: 'var(--lime)',
                        color: '#04070c',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      {isSubmittingReg ? 'Submitting…' : 'Submit Nomination'}
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

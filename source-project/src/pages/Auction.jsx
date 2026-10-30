import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fetchPublicAuctionPlayerData, readAuctionPlayerCache } from '../utils/auctionPlayerData';
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  Mail,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Coins,
  Award,
  Zap,
  Flame,
  Shield,
  UserPlus,
  ImagePlus,
} from 'lucide-react';

export default function Auction() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const prefersReducedMotion = useReducedMotion();
  const [cachedPlayerData] = useState(() => readAuctionPlayerCache(apiUrl));

  const [registeredPlayers, setRegisteredPlayers] = useState(() =>
    cachedPlayerData.registrations.map((player) => ({
      ...player,
      id: `approved-${player.id}`,
      category: player.category || 'APPROVED PLAYER',
      status: 'AVAILABLE',
      published: true,
      basePrice: Number(String(player.basePrice || '0').replace(/[^0-9]/g, '')) || 0,
      stats: {
        matches: player.matches || '—',
        average: player.average || '—',
        strikeRate: player.strikeRate || '—',
        economy: player.economy || '—',
        best: player.best || '—',
      },
      badgeColor: 'var(--lime)',
    }))
  );
  const [isLoadingApprovedPlayers, setIsLoadingApprovedPlayers] = useState(!cachedPlayerData.hasRegistrations);

  const [players, setPlayers] = useState(cachedPlayerData.catalogue);
  const [catalogueError, setCatalogueError] = useState('');
  const [isLoadingCatalogue, setIsLoadingCatalogue] = useState(!cachedPlayerData.hasCatalogue);

  const [approvedBids, setApprovedBids] = useState([]);
  const [bidFeedError, setBidFeedError] = useState(false);
  const highestBidsByPlayer = useMemo(() => {
    const highestBids = new Map();
    approvedBids.forEach((bid) => {
      if (bid.status !== 'APPROVED') return;
      const playerId = String(bid.playerId);
      const currentHighest = highestBids.get(playerId);
      if (!currentHighest || Number(bid.bidAmount) > Number(currentHighest.bidAmount)) {
        highestBids.set(playerId, bid);
      }
    });
    return highestBids;
  }, [approvedBids]);

  // Modal states
  const [biddingPlayer, setBiddingPlayer] = useState(null);
  const [bidForm, setBidForm] = useState({ name: '', phone: '', amount: '' });
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
    average: '',
    strikeRate: '',
    economy: '',
    best: '',
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
          setBidFeedError(false);
        }
      } catch {
        if (active) setBidFeedError(true);
      }
    };
    const refreshPlayerData = async () => {
      const data = await fetchPublicAuctionPlayerData(apiUrl);
      if (!active) return;

      if (data.catalogue !== null) {
        setPlayers(data.catalogue);
        setCatalogueError('');
      } else {
        const error = data.catalogueError;
        setCatalogueError(error?.message === 'Failed to fetch'
          ? 'Player information is temporarily unavailable. Please try again later.'
          : error?.message || 'Could not load auction player statistics.');
      }

      if (data.registrations !== null) {
        setRegisteredPlayers(data.registrations.map((player) => ({
          ...player,
          id: `approved-${player.id}`,
          category: player.category || 'APPROVED PLAYER',
          status: 'AVAILABLE',
          published: true,
          basePrice: Number(String(player.basePrice || '0').replace(/[^0-9]/g, '')) || 0,
          stats: {
            matches: player.matches || '—',
            average: player.average || '—',
            strikeRate: player.strikeRate || '—',
            economy: player.economy || '—',
            best: player.best || '—',
          },
          badgeColor: 'var(--lime)',
        })));
      }

      setIsLoadingApprovedPlayers(false);
      setIsLoadingCatalogue(false);
    };

    fetchLiveBids();
    refreshPlayerData();
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') fetchLiveBids();
    }, 20000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, [apiUrl]);

  const getHighestBidInfo = (playerId) => {
    return highestBidsByPlayer.get(String(playerId)) || null;
  };

  const visiblePlayers = [...players, ...registeredPlayers].filter((player) => player.published !== false);
  const isLoadingPlayerData = isLoadingApprovedPlayers || isLoadingCatalogue;

  const openBidModal = (player) => {
    const highestBid = getHighestBidInfo(player.id);
    const minBid = highestBid ? Number(highestBid.bidAmount) + 100 : Number(player.basePrice);
    setBiddingPlayer(player);
    setBidForm({ name: '', phone: '', amount: String(minBid) });
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

  return (
    <Layout>
      <main
        className="auction-page-shell"
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
        <div className="auction-page-inner">
          <header className="auction-page-heading">
            <p>WINTER BASH LEAGUE AUCTION 2026</p>
          </header>
          <div
            className="auction-player-grid"
            aria-label="Auction players"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '24px'
            }}
          >
            {visiblePlayers.map((player, index) => {
              const highestBid = getHighestBidInfo(player.id);
              const isSold = player.status === 'SOLD';
              const isUnsold = player.status === 'UNSOLD';
              const ringPathId = `auction-player-ring-${String(player.id).replace(/[^a-zA-Z0-9_-]/g, '-')}-${index}`;

              return (
                <motion.article
                  key={player.id}
                  className="auction-player-card"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
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
                  <div
                    className="auction-player-portrait"
                  >
                    <div className="auction-player-photo-frame">
                      <div className="auction-player-emblem">
                        <svg className="auction-player-emblem-type" viewBox="0 0 100 100" aria-hidden="true">
                          <defs>
                            <path id={ringPathId} d="M 50,50 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
                          </defs>
                          <text>
                            <textPath href={`#${ringPathId}`} startOffset="0%">WINTER BASH LEAGUE AUCTION 2026 ·</textPath>
                            <textPath href={`#${ringPathId}`} startOffset="50%">WINTER BASH LEAGUE AUCTION 2026 ·</textPath>
                          </text>
                        </svg>
                        <img
                          src={player.photoUrl || '/images/jersey.jpg'}
                          alt={player.name}
                          loading={index < 4 ? 'eager' : 'lazy'}
                          decoding="async"
                          fetchPriority={index < 2 ? 'high' : 'auto'}
                          onError={(e) => {
                            e.currentTarget.src = '/images/jersey.jpg';
                          }}
                        />
                      </div>
                    </div>
                    <div className="auction-player-summary">
                      <div className="auction-player-badges">
                        <span className="auction-player-role" style={{ color: player.badgeColor || 'var(--lime)' }}>{player.role}</span>
                        <span className={`auction-player-status${isSold ? ' is-sold' : isUnsold ? ' is-unsold' : ''}`}>{player.status || 'AVAILABLE'}</span>
                      </div>
                      <div className="auction-player-name-block">
                        <span className="auction-player-category">{player.category}</span>
                        <h3>{player.name}</h3>
                        <div className="auction-player-styles">
                          <span>{player.battingStyle}</span>
                          <span aria-hidden="true">·</span>
                          <span>{player.bowlingStyle}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean Performance Matrix — 4 fixed stats */}
                  <div
                    className="auction-player-stats"
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
                            : 'rgba(0, 217, 255, 0.08)',
                          border: isSold
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0, 217, 255, 0.42)',
                          color: isSold ? '#64748b' : '#00d9ff',
                          transition: 'all 0.2s ease',
                          fontFamily: "'Outfit', sans-serif"
                        }}
                        onMouseOver={(e) => {
                          if (!isSold) {
                            e.currentTarget.style.background = '#00d9ff';
                            e.currentTarget.style.color = '#041018';
                            e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 217, 255, 0.38)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSold) {
                            e.currentTarget.style.background = 'rgba(0, 217, 255, 0.08)';
                            e.currentTarget.style.color = '#00d9ff';
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
            {visiblePlayers.length === 0 && isLoadingPlayerData && (
              <>
                <span className="sr-only" role="status">Loading auction player information</span>
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={`player-skeleton-${index}`} className="auction-player-loading-card" aria-hidden="true" />
                ))}
              </>
            )}
          </div>

          {visiblePlayers.length === 0 && !isLoadingPlayerData && (
            catalogueError ? (
              <p className="auction-player-data-message" role="alert">{catalogueError}</p>
            ) : (
              <section className="auction-empty-state" role="status" aria-labelledby="auction-empty-title">
                <span className="auction-empty-icon" aria-hidden="true"><Clock size={22} /></span>
                <span className="auction-empty-eyebrow">WINTER BASH LEAGUE</span>
                <h2 id="auction-empty-title">Auction Starts Soon</h2>
              </section>
            )
          )}
          <div className="sr-only" role="status" aria-live="polite">
            {regSuccess ? `Player nomination submitted under registration ${regSuccess}. Under organiser review.` : ''}
            {bidFeedError ? 'Live bid updates are temporarily unavailable.' : ''}
          </div>
          {catalogueError && visiblePlayers.length > 0 && (
            <div className="sr-only" role="alert">{catalogueError}</div>
          )}
          <button
            className="auction-register-fab"
            type="button"
            aria-label="Register yourself"
            title="Register yourself"
            onClick={() => setShowRegisterModal(true)}
          >
            <span className="auction-register-icon-motion">
              <UserPlus size={25} strokeWidth={2.2} />
            </span>
            <span className="auction-register-label">Register yourself</span>
          </button>
        </div>

        {/* 4. POLISHED BID SUBMISSION MODAL */}
        <AnimatePresence>
          {biddingPlayer && (
            <div
            className="auction-dialog-backdrop"
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
                className="auction-dialog auction-bid-dialog"
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
              className="auction-dialog-backdrop"
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
                className="auction-dialog auction-register-dialog"
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                style={{
                  background: '#090e15',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: 'min(88vh, 760px)',
                  overflowY: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                  padding: '20px'
                }}
              >
                <div className="auction-register-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                      Player nomination
                    </h2>
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

                  <div
                    className="auction-register-photo"
                    style={{
                      marginBottom: '14px'
                    }}
                  >
                    <span className="auction-register-photo-title">PLAYER CARD IMAGE</span>
                    <label className="auction-player-image-upload">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Player card image preview" />
                      ) : (
                        <span className="auction-player-image-empty">
                          <ImagePlus size={23} aria-hidden="true" />
                          <span>Choose a player image</span>
                        </span>
                      )}
                      <span className="auction-player-image-action">
                        {photoPreview ? 'Change image' : 'Upload player image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        aria-label="Upload player card image"
                      />
                    </label>
                    <div className="auction-register-photo-help">
                      This image will appear on your auction player card.
                    </div>
                  </div>

                  <div className="auction-register-fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
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

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                        Average
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        maxLength={30}
                        placeholder="e.g. 38.5"
                        value={regForm.average}
                        onChange={(e) => setRegForm({ ...regForm, average: e.target.value })}
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
                        Strike Rate
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        maxLength={30}
                        placeholder="e.g. 142.0"
                        value={regForm.strikeRate}
                        onChange={(e) => setRegForm({ ...regForm, strikeRate: e.target.value })}
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
                        Economy
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        maxLength={30}
                        placeholder="e.g. 6.8"
                        value={regForm.economy}
                        onChange={(e) => setRegForm({ ...regForm, economy: e.target.value })}
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
                        Best Performance
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="e.g. 72* or 3/18"
                        value={regForm.best}
                        onChange={(e) => setRegForm({ ...regForm, best: e.target.value })}
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

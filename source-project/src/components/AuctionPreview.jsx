import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuctionPreview() {
  const maskedSpotlight = [
    {
      id: '01',
      name: 'Marquee Icon #01',
      role: 'Top-Order All-Rounder',
      specialty: 'Profile & Identity Locked • Revealing Soon',
      basePrice: '₹?,???',
      status: 'MYSTERY PICK',
      stats: { matches: '??', runs: '???', sr: '???.?', wickets: '??' }
    },
    {
      id: '02',
      name: 'Marquee Icon #02',
      role: 'Express Fast Bowler',
      specialty: 'Profile & Identity Locked • Revealing Soon',
      basePrice: '₹?,???',
      status: 'MYSTERY PICK',
      stats: { matches: '??', runs: '???', sr: '???.?', wickets: '??' }
    },
    {
      id: '03',
      name: 'Marquee Icon #03',
      role: 'Wicket-Keeper Finisher',
      specialty: 'Profile & Identity Locked • Revealing Soon',
      basePrice: '₹?,???',
      status: 'MYSTERY PICK',
      stats: { matches: '??', runs: '???', sr: '???.?', wickets: '??' }
    }
  ];

  return (
    <section id="auction" className="section match-section">
      <div className="section-heading">
        <div>
          <h2>WBL Mega Player Auction 2026</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>
            Build your championship squad • 10 Franchises • Live Bidding
          </p>
        </div>
        <Link to="/auction" className="view-all">
          Explore Auction Arena &rarr;
        </Link>
      </div>

      <motion.div
        className="auction-preview-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, rgba(12, 38, 60, 0.95), rgba(9, 28, 45, 0.95))',
          border: '1px solid rgba(156, 255, 0, 0.25)',
          borderRadius: '16px',
          marginBottom: '35px'
        }}
      >
        <div>
          <div style={{
            display: 'inline-block',
            padding: '5px 12px',
            background: 'rgba(156, 255, 0, 0.15)',
            border: '1px solid var(--lime)',
            borderRadius: '20px',
            color: 'var(--lime)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '2px',
            marginBottom: '15px'
          }}>
            AUCTION ARENA
          </div>
          <h3 style={{ fontSize: '26px', textTransform: 'uppercase', marginBottom: '12px', lineHeight: 1.2 }}>
            Player Registrations Now Open
          </h3>
          <p style={{ color: '#a0afbe', fontSize: '14px', lineHeight: 1.6, marginBottom: '22px' }}>
            Official player names and photos are currently masked until the grand reveal. Register yourself into the auction pool to be auctioned among 10 league franchises!
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/auction" className="primary-button" style={{ padding: '12px 24px' }}>
              Auction Arena &rarr;
            </Link>
            <Link to="/auction" className="outline-button" style={{ padding: '12px 24px' }}>
              Register for Auction
            </Link>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          textAlign: 'center',
          background: 'rgba(5, 17, 28, 0.6)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }} className="auction-stats">
          <div>
            <strong style={{ display: 'block', fontSize: 'clamp(20px, 7vw, 28px)', color: 'var(--lime)', fontWeight: 900 }}>10+</strong>
            <small style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '1px' }}>FRANCHISES</small>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: 'clamp(20px, 7vw, 28px)', color: '#fff', fontWeight: 900 }}>100+</strong>
            <small style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '1px' }}>PLAYERS</small>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: 'clamp(20px, 7vw, 28px)', color: 'var(--lime)', fontWeight: 900 }}>₹40K+</strong>
            <small style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '1px' }}>PRIZE POOL</small>
          </div>
        </div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {maskedSpotlight.map((player, idx) => (
          <motion.div
            key={idx}
            className="team-card"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            style={{
              padding: '24px 20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(10, 28, 44, 0.85)',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  background: 'rgba(156, 255, 0, 0.15)',
                  color: 'var(--lime)',
                  border: '1px solid rgba(156, 255, 0, 0.4)'
                }}>
                  {player.status}
                </span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px' }}>
                  Base: <strong style={{ color: 'var(--lime)' }}>{player.basePrice}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(156,255,0,0.08), rgba(6,17,29,0.95))',
                  border: '2px dashed rgba(156, 255, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: 900,
                  color: 'var(--lime)',
                  flexShrink: 0
                }}>
                  ?
                </div>
                <div>
                  <h4 style={{ fontSize: '17px', color: '#fff', marginBottom: '4px', letterSpacing: '0.5px' }}>{player.name}</h4>
                  <p style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 700 }}>{player.role}</p>
                  <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{player.specialty}</small>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                background: 'rgba(3, 12, 21, 0.6)',
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>MAT</span>
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{player.stats.matches}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>RUNS</span>
                  <strong style={{ fontSize: '13px', color: 'var(--lime)' }}>{player.stats.runs}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>SR</span>
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{player.stats.sr}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>WKTS</span>
                  <strong style={{ fontSize: '13px', color: 'var(--lime)' }}>{player.stats.wickets}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '18px' }}>
              <Link
                to="/auction"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  transition: '0.2s'
                }}
              >
                View Auction Pool &rarr;
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

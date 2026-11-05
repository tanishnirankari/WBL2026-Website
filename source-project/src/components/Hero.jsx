import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { prefetchAuctionPage } from '../utils/auctionPlayerData';

export default function Hero() {
  return (
    <section
      id="hero"
      className="hero"
      style={{
        '--hero-image': `url("${import.meta.env.BASE_URL}images/hero.jpg")`,
        '--hero-mobile-image': `url("${import.meta.env.BASE_URL}images/hero.jpg")`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="hero-content"
      >
        <div className="eyebrow">
          The Biggest Swinger Ball League
        </div>

        <h1 className="hero-title">
          WINTER BASH<br />
          <span>LEAGUE</span>
        </h1>

        <p className="hero-tagline">
          BEYOND BOUNDARIES
        </p>

        <div className="hero-details">
          <div className="hero-detail">
            <strong>₹30,000+</strong>
            <small>PRIZE POOL</small>
          </div>
          <div className="hero-detail">
            <strong>DECEMBER</strong>
            <small>TOURNAMENT</small>
          </div>
          <div className="hero-detail">
            <strong>NEHRU YUVA KENDRA</strong>
            <small>VENUE</small>
          </div>
          <div className="hero-detail">
            <strong>10 TEAMS</strong>
            <small>15 PLAYERS / TEAM</small>
          </div>
        </div>

        <div className="hero-buttons">
          <Link to="/register" className="primary-button">
            REGISTER YOUR TEAM &rarr;
          </Link>
          <Link
            to="/auction"
            className="outline-button"
            onMouseEnter={prefetchAuctionPage}
            onFocus={prefetchAuctionPage}
            onTouchStart={prefetchAuctionPage}
          >
            PLAYER AUCTION &rarr;
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

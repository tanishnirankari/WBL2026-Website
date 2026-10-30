import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Gavel, Menu, ShieldCheck, X } from 'lucide-react';
import { prefetchAuctionPage } from '../utils/auctionPlayerData';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const assetBase = `${import.meta.env.BASE_URL}images/`;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Auction', path: '/auction' },
    { name: 'Teams', path: '/teams' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', path: '/exclusive' },
  ];

  const hashLinks = [
    { name: 'Contact us', hash: '#contact' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="navbar"
    >
      <Link to="/" className="logo-area" onClick={closeMenu}>
        <img src={`${assetBase}logo.png`} alt="WBL Logo" />
        <div className="logo-name">
          WINTER BASH<br />
          <span>LEAGUE</span>
        </div>
      </Link>

      <nav className="nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={location.pathname === link.path && !location.hash ? 'active' : ''}
            onMouseEnter={link.path === '/auction' ? prefetchAuctionPage : undefined}
            onFocus={link.path === '/auction' ? prefetchAuctionPage : undefined}
            onTouchStart={link.path === '/auction' ? prefetchAuctionPage : undefined}
          >
            {link.name}
          </Link>
        ))}
        {hashLinks.map((link) => (
          <Link
            key={link.name}
            to={{ pathname: '/', hash: link.hash }}
            className={location.hash === link.hash ? 'active' : ''}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <Link to="/register" className="nav-register">
        Register Team &rarr;
      </Link>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link
          to="/auction"
          className="mobile-auction-btn"
          onMouseEnter={prefetchAuctionPage}
          onFocus={prefetchAuctionPage}
          onTouchStart={prefetchAuctionPage}
        >
          <Gavel size={14} aria-hidden="true" />
          AUCTION
        </Link>
        <button
          className="menu-button"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu show"
            id="mobile-menu"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={link.path === '/auction' ? prefetchAuctionPage : undefined}
                onFocus={link.path === '/auction' ? prefetchAuctionPage : undefined}
                onTouchStart={link.path === '/auction' ? prefetchAuctionPage : undefined}
                style={link.path === '/auction' ? { color: '#fff', fontWeight: 'bold' } : {}}
              >
                {link.name}
              </Link>
            ))}
            {hashLinks.map((link) => (
              <Link key={link.name} to={{ pathname: '/', hash: link.hash }} onClick={closeMenu}>
                {link.name}
              </Link>
            ))}
            <Link to="/register" className="mobile-register-link" onClick={closeMenu}>
              Register Your Team &rarr;
            </Link>
            <Link to="/admin" className="organiser-access-link" onClick={closeMenu}>
              <span className="organiser-access-icon"><ShieldCheck size={18} aria-hidden="true" /></span>
              <span className="organiser-access-copy"><strong>Organiser access</strong><small>Admin portal</small></span>
              <ArrowUpRight className="organiser-access-arrow" size={17} aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

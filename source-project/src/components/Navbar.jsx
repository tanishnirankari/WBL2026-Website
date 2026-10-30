import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, BookOpen, Gavel, Home as HomeIcon, Images, Info, Menu, Phone, ShieldCheck, UsersRound, X } from 'lucide-react';
import { prefetchAuctionPage } from '../utils/auctionPlayerData';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const assetBase = `${import.meta.env.BASE_URL}images/`;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const handleLogoClick = (event) => {
    closeMenu();
    if (location.pathname === '/' && location.hash === '#hero') {
      event.preventDefault();
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon, iconColor: '#60a5fa' },
    { name: 'Auction', path: '/auction', icon: Gavel, iconColor: '#9cff00' },
    { name: 'Teams', path: '/teams', icon: UsersRound, iconColor: '#34d399' },
    { name: 'Gallery', path: '/gallery', icon: Images, iconColor: '#c084fc' },
    { name: 'About Us', path: '/exclusive', icon: Info, iconColor: '#fb7185' },
    { name: 'Rule Book', path: '/rule-book', icon: BookOpen, iconColor: '#fbbf24' },
  ];

  const hashLinks = [
    { name: 'Contact us', hash: '#contact', icon: Phone, iconColor: '#22d3ee' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="navbar"
    >
      <Link to="/#hero" className="logo-area" onClick={handleLogoClick} aria-label="Winter Bash League home">
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
          className={`menu-button${isOpen ? ' is-open' : ''}`}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isOpen ? <X size={21} strokeWidth={2} aria-hidden="true" /> : <Menu size={21} strokeWidth={2} aria-hidden="true" />}
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
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`mobile-menu-link${location.pathname === link.path && !location.hash ? ' active' : ''}`}
                  onClick={closeMenu}
                  onMouseEnter={link.path === '/auction' ? prefetchAuctionPage : undefined}
                  onFocus={link.path === '/auction' ? prefetchAuctionPage : undefined}
                  onTouchStart={link.path === '/auction' ? prefetchAuctionPage : undefined}
                >
                  <span className="mobile-menu-link-icon-wrap" style={{ '--menu-icon-color': link.iconColor }}>
                    <Icon className="mobile-menu-link-icon" size={16} aria-hidden="true" />
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
            {hashLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.name} to={{ pathname: '/', hash: link.hash }} onClick={closeMenu} className="mobile-menu-link">
                  <span className="mobile-menu-link-icon-wrap" style={{ '--menu-icon-color': link.iconColor }}>
                    <Icon className="mobile-menu-link-icon" size={16} aria-hidden="true" />
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
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

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const assetBase = import.meta.env.BASE_URL;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Auction', path: '/auction' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Exclusive', path: '/exclusive' },
  ];

  const hashLinks = [
    { name: 'Teams', hash: '#teams' },
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link
          to="/auction"
          className="mobile-auction-btn"
          style={{
            padding: '7px 14px',
            background: 'rgba(156, 255, 0, 0.15)',
            border: '1px solid var(--lime)',
            color: 'var(--lime)',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1px',
            textDecoration: 'none'
          }}
        >
          AUCTION
        </Link>
        <button className="menu-button" onClick={toggleMenu} aria-label="Toggle Menu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                style={link.path === '/auction' ? { color: 'var(--lime)', fontWeight: 'bold' } : {}}
              >
                {link.name === 'Auction' ? '🏏 Player Auction' : link.name}
              </Link>
            ))}
            {hashLinks.map((link) => (
              <Link key={link.name} to={{ pathname: '/', hash: link.hash }} onClick={closeMenu}>
                {link.name}
              </Link>
            ))}
            <Link to="/register" style={{ color: 'var(--lime)', fontWeight: 'bold', borderBottom: 'none' }} onClick={closeMenu}>
              Register Your Team &rarr;
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

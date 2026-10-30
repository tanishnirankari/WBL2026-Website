import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';

const names = [
  ['winner.png', 'Trophy Awarding Ceremony', 'Awards', 'Respected Sir Keshav Chaudhry, IPS officer, awarding the prestigious championship trophy to the tournament winners.'],
  ['gallery4.jpg', 'Newspaper & National Press Coverage', 'Press', 'Extensive multi-regional media coverage capturing the competitive energy and community excitement of Winter Bash League.'],
  ['gallery7.jpg', 'Medal Winners & Finalists', 'Awards', 'Recognizing the tournament MVPs, outstanding bowlers, aggressive batters, and finalist champions on stage.'],
  ['jersey.jpg', 'Official Tournament Jersey', 'Extra', 'The signature Winter Bash League kit crafted with breathable high-performance athletic fabric.'],
  ['awards.jpg', 'Silverware & Championship Accolades', 'Awards', 'Glittering custom trophies, individual honours, and mementos lined up for the grand presentation ceremony.'],
  ['gallery2.jpg', 'Match Day Clashes & Intensity', 'Matches', 'High-stakes cricket under the open sky featuring decisive tactical bowling and sharp slip fielding.'],
  ['gallery3.jpg', 'Powerplay Batting Explosions', 'Matches', 'Electric batting spells and towering sixes dominating the high-octane opening powerplay overs.'],
  ['gallery6.jpg', 'Fast Bowling at Full Throttle', 'Matches', 'Deadly yorkers, seam variation, and high-velocity spells rattling the opposition batting lineup.'],
  ['gallery8.jpg', 'The Battle Arena Grounds', 'Matches', 'Pristine emerald outfield, laser-aligned wickets, and scenic grounds prepared for tournament battle.'],
  ['umpire.jpg', 'Match Officials & Fair Play', 'Extra', 'Accredited match umpires and tournament referees upholding sportsmanship, fairness, and league laws.'],
  ['streaming.jpg', 'Live Broadcast & Multi-Cam Studio', 'Press', 'Professional livestream production crew operating high-definition cameras, live scoreboards, and replay feeds.'],
  ['gallery5.jpg', 'Strategic Team Timeout', 'Matches', 'Captains and veteran players huddling during mid-innings strategic timeouts to formulate game plans.'],
  ['memorable.jpg', 'Unforgettable Celebration Moments', 'Awards', 'Unfiltered euphoria, winning celebrations, and team bonding captured in timeless frames.']
];

export default function GalleryPage() {
  const base = import.meta.env.BASE_URL + 'images/';
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [uploaded, setUploaded] = useState([]);
  const [active, setActive] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState(1);

  // Mobile swipe gestures
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    fetch(api + '/gallery')
      .then((r) => (r.ok ? r.json() : []))
      .then(setUploaded)
      .catch(() => setUploaded([]));
  }, [api]);

  const items = [
    ...names.map((x, i) => ({
      id: 'static-' + i,
      src: base + x[0],
      title: x[1],
      category: x[2],
      caption: x[3] || x[1]
    })),
    ...uploaded.map((x) => ({
      id: 'uploaded-' + x.id,
      src: x.url,
      title: x.caption || 'Winter Bash League Moment',
      category: 'Community',
      caption: x.caption || 'Winter Bash League Tournament Archive'
    }))
  ];

  const categories = ['All', 'Matches', 'Awards', 'Press', 'Extra'];

  const visible = items.filter((x) => active === 'All' || x.category === active);

  // Navigation handlers for Lightbox
  const handlePrev = useCallback(() => {
    setSlideDirection(-1);
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current > 0 ? current - 1 : visible.length - 1;
    });
  }, [visible.length]);

  const handleNext = useCallback(() => {
    setSlideDirection(1);
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current < visible.length - 1 ? current + 1 : 0;
    });
  }, [visible.length]);

  // Touch handlers for mobile photo swiping
  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  const activeItem = selectedIndex !== null ? visible[selectedIndex] : null;

  return (
    <Layout>
      <main className="page content-page gallery-page apple-gallery-page">
        {/* Mobile-Enhanced Sleek Cupertino Header */}
        <section className="apple-gallery-hero mobile-enhanced">
          <motion.div
            className="apple-gallery-hero-badge"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Sparkles size={12} className="apple-badge-icon" />
            <span>OFFICIAL ARCHIVE &bull; WINTER BASH LEAGUE</span>
          </motion.div>

          {/* Cupertino Segmented Control Capsule with Smooth Mobile Touch Pan */}
          <div className="apple-filter-capsule-container">
            <motion.div
              className="apple-filter-capsule"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              role="tablist"
              aria-label="Gallery categories"
            >
              {categories.map((c) => {
                const count = c === 'All' ? items.length : items.filter((x) => x.category === c).length;
                const isSelected = active === c;
                return (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={isSelected}
                    className={`apple-filter-tab ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setActive(c);
                      setSelectedIndex(null);
                    }}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="appleFilterPill"
                        className="apple-filter-indicator"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="apple-filter-label">{c}</span>
                    <span className="apple-filter-count">{count}</span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Apple Bento Gallery Grid with 2-Column Mobile Optimization */}
        <section className="apple-gallery-grid-wrapper">
          <div className="apple-gallery-grid">
            <AnimatePresence mode="popLayout">
              {visible.map((item, index) => {
                const isFeatured = index === 0;
                return (
                  <motion.div
                    layout
                    key={item.id}
                    className={`apple-gallery-card ${isFeatured ? 'card-featured' : ''}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.15) }}
                    onClick={() => setSelectedIndex(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedIndex(index);
                      }
                    }}
                    aria-label={`View photo: ${item.title}`}
                  >
                    <div className="apple-card-media">
                      <img
                        src={item.src}
                        alt={item.title}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="apple-card-gradient" />
                    </div>

                    {/* Apple Frosted Glass Bottom Pill Tag */}
                    <div className="apple-card-meta">
                      <div className="apple-meta-left">
                        <span className="apple-meta-category">{item.category}</span>
                        <h3 className="apple-meta-title">{item.title}</h3>
                      </div>
                      <div className="apple-meta-action" aria-hidden="true">
                        <Eye size={14} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Apple Photos / QuickLook Modal Lightbox with Mobile Swipe Support */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              className="apple-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedIndex(null)}
              role="dialog"
              aria-modal="true"
              aria-label={activeItem.title}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Top Navigation & Status Bar */}
              <div className="apple-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
                <div className="apple-lightbox-counter-pill">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={`counter-${activeItem.id}`}
                      className="apple-lightbox-counter-content"
                      initial={{ opacity: 0, x: slideDirection * 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection * -18 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                    >
                      <span className="apple-counter-text">
                        {selectedIndex + 1} / {visible.length}
                      </span>
                      <span className="apple-counter-divider">&bull;</span>
                      <span className="apple-counter-tag">{activeItem.category}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  className="apple-lightbox-close-btn"
                  onClick={() => setSelectedIndex(null)}
                  aria-label="Close photo preview"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Central Lightbox Stage */}
              <div className="apple-lightbox-stage" onClick={(e) => e.stopPropagation()}>
                {/* Desktop Prev Arrow */}
                {visible.length > 1 && (
                  <button
                    className="apple-lightbox-nav prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                {/* Main Image Container */}
                <div className="apple-lightbox-photo-box">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.img
                      key={activeItem.id}
                      src={activeItem.src}
                      alt={activeItem.title}
                      decoding="async"
                      fetchPriority="high"
                      initial={{ x: slideDirection * 48 }}
                      animate={{ x: 0 }}
                      exit={{ x: slideDirection * -48 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    />
                  </AnimatePresence>
                </div>

                {/* Desktop Next Arrow */}
                {visible.length > 1 && (
                  <button
                    className="apple-lightbox-nav next"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
              </div>

              {/* Mobile Quick Tap Navigation Bar */}
              {visible.length > 1 && (
                <div className="apple-lightbox-mobile-nav" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="apple-mobile-nav-btn"
                    onClick={handlePrev}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={18} />
                    <span>Previous</span>
                  </button>
                  <button
                    className="apple-mobile-nav-btn"
                    onClick={handleNext}
                    aria-label="Next photo"
                  >
                    <span>Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Bottom Metadata Drawer */}
              <motion.div
                className="apple-lightbox-drawer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="apple-drawer-pill" />
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`meta-${activeItem.id}`}
                    className="apple-drawer-content"
                    initial={{ opacity: 0, x: slideDirection * 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDirection * -18 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                  >
                    <span className="apple-drawer-cat">{activeItem.category}</span>
                    <h2 className="apple-drawer-title">{activeItem.title}</h2>
                    <p className="apple-drawer-desc">{activeItem.caption}</p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}

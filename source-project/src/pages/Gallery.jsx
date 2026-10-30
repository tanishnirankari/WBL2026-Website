import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';

const names = [
  ['winner.png', 'Trophy Awarding Ceremony', 'Awards', 'Respected Sir Keshav Chaudhry, IPS officer, awarding the prestigious championship trophy to the tournament winners.'],
  ['gallery4.jpg', 'Newspaper & National Press Coverage', 'Press', 'Extensive multi-regional media coverage capturing the competitive energy and community excitement of Winter Bash League.'],
  ['gallery7.jpg', 'Medal Winners & Finalists', 'Awards', 'Recognizing the tournament MVPs, outstanding bowlers, aggressive batters, and finalist champions on stage.'],
  ['jersey.jpg', 'Official Tournament Jersey', 'Behind the Scenes', 'The signature Winter Bash League kit crafted with breathable high-performance athletic fabric.'],
  ['awards.jpg', 'Silverware & Championship Accolades', 'Awards', 'Glittering custom trophies, individual honours, and mementos lined up for the grand presentation ceremony.'],
  ['gallery2.jpg', 'Match Day Clashes & Intensity', 'Matches', 'High-stakes cricket under the open sky featuring decisive tactical bowling and sharp slip fielding.'],
  ['gallery3.jpg', 'Powerplay Batting Explosions', 'Matches', 'Electric batting spells and towering sixes dominating the high-octane opening powerplay overs.'],
  ['gallery6.jpg', 'Fast Bowling at Full Throttle', 'Matches', 'Deadly yorkers, seam variation, and high-velocity spells rattling the opposition batting lineup.'],
  ['gallery8.jpg', 'The Battle Arena Grounds', 'Matches', 'Pristine emerald outfield, laser-aligned wickets, and scenic grounds prepared for tournament battle.'],
  ['umpire.jpg', 'Match Officials & Fair Play', 'Behind the Scenes', 'Accredited match umpires and tournament referees upholding sportsmanship, fairness, and league laws.'],
  ['streaming.jpg', 'Live Broadcast & Multi-Cam Studio', 'Press', 'Professional livestream production crew operating high-definition cameras, live scoreboards, and replay feeds.'],
  ['gallery5.jpg', 'Strategic Team Timeout', 'Matches', 'Captains and veteran players huddling during mid-innings strategic timeouts to formulate game plans.'],
  ['memorable.jpg', 'Unforgettable Celebration Moments', 'Awards', 'Unfiltered euphoria, winning celebrations, and team bonding captured in timeless frames.'],
  ['refreshments.jpg', 'Player Lounge & Recovery Zones', 'Behind the Scenes', 'Hydration bars, nutritional meals, and active recovery amenities reserved for competing squads.']
];

export default function GalleryPage() {
  const base = import.meta.env.BASE_URL + 'images/';
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [uploaded, setUploaded] = useState([]);
  const [active, setActive] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(null);

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

  const categories = ['All', 'Matches', 'Awards', 'Press', 'Behind the Scenes'];

  const visible = items.filter((x) => active === 'All' || x.category === active);

  // Navigation handlers for Lightbox
  const handlePrev = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current > 0 ? current - 1 : visible.length - 1;
    });
  }, [visible.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current < visible.length - 1 ? current + 1 : 0;
    });
  }, [visible.length]);

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
        {/* Apple Keynote Style Hero Header */}
        <section className="apple-gallery-hero">
          <motion.div
            className="apple-gallery-hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Sparkles size={13} className="apple-badge-icon" />
            <span>OFFICIAL ARCHIVE &bull; WINTER BASH LEAGUE</span>
          </motion.div>

          <motion.h1
            className="apple-gallery-title"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            Moments in Motion.
          </motion.h1>

          <motion.p
            className="apple-gallery-subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
          >
            High-voltage cricket, championship celebrations, and unfiltered tournament spirit captured in stunning detail.
          </motion.p>

          {/* Cupertino Segmented Control Capsule */}
          <div className="apple-filter-capsule-container">
            <motion.div
              className="apple-filter-capsule"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
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

        {/* Apple Bento Gallery Grid */}
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.18) }}
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
                        <Eye size={15} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Apple Photos / QuickLook Modal Lightbox */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              className="apple-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setSelectedIndex(null)}
              role="dialog"
              aria-modal="true"
              aria-label={activeItem.title}
            >
              {/* Top Navigation & Status Bar */}
              <div className="apple-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
                <div className="apple-lightbox-counter-pill">
                  <span className="apple-counter-text">
                    {selectedIndex + 1} / {visible.length}
                  </span>
                  <span className="apple-counter-divider">&bull;</span>
                  <span className="apple-counter-tag">{activeItem.category}</span>
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
                {/* Prev Arrow */}
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
                <motion.div
                  key={activeItem.id}
                  className="apple-lightbox-photo-box"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={activeItem.src}
                    alt={activeItem.title}
                    decoding="async"
                    fetchPriority="high"
                  />
                </motion.div>

                {/* Next Arrow */}
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

              {/* Bottom Metadata Drawer */}
              <motion.div
                key={'meta-' + activeItem.id}
                className="apple-lightbox-drawer"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="apple-drawer-pill" />
                <div className="apple-drawer-content">
                  <span className="apple-drawer-cat">{activeItem.category}</span>
                  <h2 className="apple-drawer-title">{activeItem.title}</h2>
                  <p className="apple-drawer-desc">{activeItem.caption}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}

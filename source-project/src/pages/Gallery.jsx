import { useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

export default function GalleryPage() {
  const assetBase = import.meta.env.BASE_URL;

  const galleryItems = [
    {
      id: 1,
      src: `${assetBase}winner.png`,
      title: 'Trophy Awarding Ceremony',
      category: 'Awards',
      caption: 'Respected Sir IPS officer Mr. Keshav Chaudhry awarding the championship winner trophy to summer tournament champions at Nehru Yuva Kendra.'
    },
    {
      id: 2,
      src: `${assetBase}gallery4.jpg`,
      title: 'Newspaper & Press Coverage',
      category: 'Press',
      caption: 'Official media coverage in daily newspaper covering Dominators championship victory organized under the leadership of Tanish Nirankari.'
    },
    {
      id: 3,
      src: `${assetBase}gallery7.jpg`,
      title: 'Medal Winners & Finalists',
      category: 'Awards',
      caption: 'Outstanding tournament performers holding their gold medals after a thrilling finals encounter.'
    },
    {
      id: 4,
      src: `${assetBase}jersey.jpg`,
      title: 'Official Tournament Jersey',
      category: 'Behind the Scenes',
      caption: 'Official team kit and jersey design showcase for Winter Bash League participants.'
    },
    {
      id: 5,
      src: `${assetBase}awards.jpg`,
      title: 'Trophies & Accolades',
      category: 'Awards',
      caption: 'Gleaming silverware, Man of the Match awards, and medals waiting for champions.'
    },
    {
      id: 6,
      src: `${assetBase}gallery2.jpg`,
      title: 'Match Day Action',
      category: 'Matches',
      caption: 'Intense swinger ball action and fielding drill under the sun.'
    },
    {
      id: 7,
      src: `${assetBase}gallery3.jpg`,
      title: 'Powerplay Batting',
      category: 'Matches',
      caption: 'Batsmen launching into attack during high-stakes powerplay overs.'
    },
    {
      id: 8,
      src: `${assetBase}gallery6.jpg`,
      title: 'Bowling In Full Throttle',
      category: 'Matches',
      caption: 'Fast bowler hitting the deck hard at Nehru Yuva Kendra ground.'
    },
    {
      id: 9,
      src: `${assetBase}gallery8.jpg`,
      title: 'The Battle Arena',
      category: 'Matches',
      caption: 'Wide angle view of Nehru Yuva Kendra sports ground with spectators and teams.'
    },
    {
      id: 10,
      src: `${assetBase}umpire.jpg`,
      title: 'Match Officials & Fair Play',
      category: 'Behind the Scenes',
      caption: 'Certified tournament umpires and match referee ensuring highest sportsmanship standards.'
    },
    {
      id: 11,
      src: `${assetBase}streaming.jpg`,
      title: 'Live Coverage & Broadcast',
      category: 'Press',
      caption: 'Digital live score updates and streaming camera setup for fans across Ghaziabad.'
    },
    {
      id: 12,
      src: `${assetBase}gallery5.jpg`,
      title: 'Team Strategy Timeout',
      category: 'Matches',
      caption: 'Captain and core players formulating tactical plans ahead of the final over.'
    },
    {
      id: 13,
      src: `${assetBase}memorable.jpg`,
      title: 'Unforgettable Moments',
      category: 'Awards',
      caption: 'Celebrations and smiles after finishing a memorable tournament campaign.'
    },
    {
      id: 14,
      src: `${assetBase}refreshments.jpg`,
      title: 'Hospitality & Refreshments',
      category: 'Behind the Scenes',
      caption: 'Top quality energy drinks and hospitality provided to all competing athletes.'
    }
  ];

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredItems = galleryItems.filter((item) => {
    return activeCategory === 'All' || item.category === activeCategory;
  });

  return (
    <Layout>
      <main className="page" style={{ paddingTop: '110px', paddingBottom: '90px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ color: 'var(--lime)', fontSize: '13px', letterSpacing: '4px', fontWeight: 'bold' }}
          >
            MOMENTS & MEMORIES
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '-1px' }}
          >
            Tournament Gallery
          </motion.h1>
          <p style={{ color: '#9bb0c4', fontSize: '16px', maxWidth: '650px', margin: '14px auto 26px', lineHeight: 1.6 }}>
            Relive the greatest moments, celebrations, award ceremonies, and unforgettable match highlights from the Winter Bash League.
          </p>

          {/* CATEGORIES */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {['All', 'Matches', 'Awards', 'Press', 'Behind the Scenes'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: activeCategory === cat ? '1px solid var(--lime)' : '1px solid rgba(255,255,255,0.12)',
                  background: activeCategory === cat ? 'var(--lime)' : 'rgba(255,255,255,0.04)',
                  color: activeCategory === cat ? '#06111d' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GALLERY GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              onClick={() => setSelectedPhoto(item)}
              style={{
                position: 'relative',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'rgba(11, 32, 51, 0.7)',
                border: '1px solid var(--border)',
                height: '270px'
              }}
              whileHover={{ scale: 1.02, borderColor: 'var(--lime)' }}
            >
              <img
                src={item.src}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px 16px 14px',
                background: 'linear-gradient(to top, rgba(3, 12, 21, 0.95), transparent)',
                color: '#fff'
              }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  color: 'var(--lime)',
                  marginBottom: '4px',
                  textTransform: 'uppercase'
                }}>
                  {item.category}
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                  {item.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {selectedPhoto && (
            <div
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.92)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '900px',
                  width: '100%',
                  background: 'rgba(8, 24, 38, 0.98)',
                  border: '1px solid var(--lime)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                }}
              >
                <div style={{ position: 'relative', maxHeight: '70vh', background: '#000', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={selectedPhoto.src}
                    alt={selectedPhoto.title}
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  />
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    &times;
                  </button>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--lime)', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
                      {selectedPhoto.category}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                      Winter Bash League
                    </span>
                  </div>
                  <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#fff' }}>
                    {selectedPhoto.title}
                  </h3>
                  <p style={{ color: '#a0afbe', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    {selectedPhoto.caption}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </Layout>
  );
}

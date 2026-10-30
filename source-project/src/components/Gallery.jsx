import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Gallery() {
  const assetBase = `${import.meta.env.BASE_URL}images/`;
  const images = [
    { src: `${assetBase}winner.png`, alt: 'Winner Ceremony', tag: 'Awards', overlay: 'IPS Officer Keshav Chaudhry awarding championship trophy' },
    { src: `${assetBase}gallery2.jpg`, alt: 'Match Day Action', tag: 'Matches', overlay: 'High-voltage match action under the sun' },
    { src: `${assetBase}gallery3.jpg`, alt: 'Powerplay Batting', tag: 'Matches', overlay: 'Aggressive strokeplay and boundary hitting' },
    { src: `${assetBase}gallery4.jpg`, alt: 'Press Coverage', tag: 'Press', overlay: 'State and national press highlights' },
    { src: `${assetBase}gallery5.jpg`, alt: 'Team Strategy', tag: 'Matches', overlay: 'Tactical discussions in the middle' },
    { src: `${assetBase}gallery6.jpg`, alt: 'Fast Bowling', tag: 'Matches', overlay: 'Fiery bowling spells and yorkers' },
    { src: `${assetBase}gallery7.jpg`, alt: 'Medal Winners', tag: 'Awards', overlay: 'Championship finalists and medal winners' },
    { src: `${assetBase}gallery8.jpg`, alt: 'Cricket Ground', tag: 'Grounds', overlay: 'Pristine tournament outfield and pitch' },
    { src: `${assetBase}memorable.jpg`, alt: 'Celebrations', tag: 'Awards', overlay: 'Unforgettable victory celebrations' },
  ];

  return (
    <section id="gallery" className="section gallery-section apple-gallery-section">
      <div className="section-heading apple-section-heading">
        <div>
          <div className="apple-gallery-hero-badge" style={{ marginBottom: 8 }}>
            <Sparkles size={12} className="apple-badge-icon" />
            <span>CURATED HIGHLIGHTS</span>
          </div>
          <h2 className="apple-gallery-title" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: 0 }}>
            Moments in Motion
          </h2>
        </div>
        <Link to="/gallery" className="apple-view-all-pill">
          <span>Explore All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="gallery-grid apple-home-gallery-grid">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            className="gallery-item apple-home-gallery-item"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: idx * 0.04 }}
          >
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
            <div className="apple-home-gallery-overlay">
              <span className="apple-home-tag">{img.tag}</span>
              {img.overlay && <p className="apple-home-text">{img.overlay}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

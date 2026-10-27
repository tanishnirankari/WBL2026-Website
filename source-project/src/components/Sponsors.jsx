import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const sponsors = [
  {
    name: 'Starbucks',
    category: 'ILLUSTRATIVE SPONSOR CONCEPT',
    image: `${import.meta.env.BASE_URL}images/starbucks-wordmark.svg`,
    description: 'Starbucks wordmark',
    brand: 'starbucks',
    illustrative: true,
  },
  {
    id: 'sponsor-placeholder-2',
    name: 'T.B.D.',
    category: 'T.B.D.',
    image: `${import.meta.env.BASE_URL}images/sponser2.jpg`,
    description: 'Sponsor placeholder',
    brand: 'partner-preview',
  },
  {
    id: 'sponsor-placeholder-3',
    name: 'T.B.D.',
    category: 'T.B.D.',
    image: `${import.meta.env.BASE_URL}images/sponser3.jpg`,
    description: 'Sponsor placeholder',
    brand: 'partner-preview-alt',
  },
];

export default function Sponsors() {
  const [activeSponsor, setActiveSponsor] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const pointerStartX = useRef(null);
  const sponsor = sponsors[activeSponsor];

  const showSponsor = (direction) => {
    setSlideDirection(direction);
    setActiveSponsor((current) => (current + direction + sponsors.length) % sponsors.length);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSlideDirection(1);
      setActiveSponsor((current) => (current + 1) % sponsors.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (pointerStartX.current === null) return;
    const swipeDistance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(swipeDistance) >= 45) {
      showSponsor(swipeDistance < 0 ? 1 : -1);
    }
  };

  return (
    <section className="sponsors" aria-label="Sponsors">
      <motion.div
        className="sponsors-content"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
      >
        <div className="sponsor-carousel" aria-roledescription="carousel" aria-label="Tournament sponsors">
          <button
            className="sponsor-arrow"
            type="button"
            onClick={() => showSponsor(-1)}
            aria-label="Previous sponsor"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>

          <div
            className="sponsor-slide-window"
            aria-live="polite"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerStartX.current = null;
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={sponsor.id ?? sponsor.name}
                className="sponsor-card"
                initial={{ opacity: 0, x: slideDirection * 52, rotateY: slideDirection * -12, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, x: slideDirection * -52, rotateY: slideDirection * 12, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 230, damping: 25, mass: 0.8 }}
              >
                <div className={`sponsor-art${sponsor.brand ? ` sponsor-art--${sponsor.brand}` : ''}`}>
                  <img
                    src={sponsor.image}
                    alt={sponsor.description}
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                      event.currentTarget.nextElementSibling.hidden = false;
                    }}
                  />
                  <div className="sponsor-art-fallback" hidden>{sponsor.name}</div>
                  <div className="sponsor-art-caption">
                    {sponsor.illustrative ? 'NOT AN OFFICIAL PARTNERSHIP' : 'SPONSOR PREVIEW'}
                  </div>
                </div>
                <div className="sponsor-card-info">
                  <div>
                    <span className="sponsor-category">{sponsor.category}</span>
                    <h3>{sponsor.name}</h3>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          <button
            className="sponsor-arrow"
            type="button"
            onClick={() => showSponsor(1)}
            aria-label="Next sponsor"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="sponsor-pagination" aria-label="Choose a sponsor">
          {sponsors.map((item, index) => (
            <button
              key={item.id ?? item.name}
              type="button"
              className={`sponsor-dot${index === activeSponsor ? ' is-active' : ''}`}
              onClick={() => {
                setSlideDirection(index >= activeSponsor ? 1 : -1);
                setActiveSponsor(index);
              }}
              aria-label={`Show ${item.name}${item.id ? ` ${index + 1}` : ''}`}
              aria-current={index === activeSponsor ? 'true' : undefined}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

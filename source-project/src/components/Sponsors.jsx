import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
    id: 'HEAD OF LEAGUE',
    name: 'FOUNDER',
    category: 'TANISH',
    image: `${import.meta.env.BASE_URL}images/tanishs.jpg`,
    description: 'Sponsor placeholder',
    brand: 'partner-preview',
  },
  {
    id: 'sponsor-placeholder-3',
    name: 'T.B.D.',
    category: 'SPONSOR PREVIEW',
    image: `${import.meta.env.BASE_URL}images/sponsor-a.svg`,
    description: 'Sponsor placeholder',
    brand: 'partner-preview-alt',
  },
];

function SponsorGroup({ duplicate = false }) {
  return (
    <div
      className="sponsor-marquee-group"
      role={duplicate ? undefined : 'list'}
      aria-label={duplicate ? undefined : 'Featured sponsors'}
      aria-hidden={duplicate ? 'true' : undefined}
    >
      {sponsors.map((sponsor, index) => (
        <article
          key={sponsor.id ?? sponsor.name}
          className="sponsor-card"
          role={duplicate ? undefined : 'listitem'}
        >
          <div className={`sponsor-art${sponsor.brand ? ` sponsor-art--${sponsor.brand}` : ''}`}>
            <img
              src={sponsor.image}
              alt={duplicate ? '' : sponsor.description}
              onError={(event) => {
                event.currentTarget.hidden = true;
                event.currentTarget.nextElementSibling.hidden = false;
              }}
            />
            <div className="sponsor-art-fallback" hidden>{sponsor.name}</div>
          </div>
          <div className="sponsor-card-info">
            <span className="sponsor-category">{sponsor.category}</span>
            <h3>{sponsor.name}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Sponsors() {
  const marqueeRef = useRef(null);
  const trackRef = useRef(null);
  const loopWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const dragRef = useRef(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const track = trackRef.current;
    const group = track?.firstElementChild;
    if (!marquee || !track || !group) return undefined;

    const normalizeOffset = (offset) => {
      const loopWidth = loopWidthRef.current;
      if (!loopWidth) return offset;
      return -(((-offset % loopWidth) + loopWidth) % loopWidth);
    };

    const updateLoopWidth = () => {
      loopWidthRef.current = group.getBoundingClientRect().width;
      offsetRef.current = normalizeOffset(offsetRef.current);
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    };

    updateLoopWidth();
    const resizeObserver = new ResizeObserver(updateLoopWidth);
    resizeObserver.observe(group);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId;
    let previousTime;
    const animate = (time) => {
      if (previousTime !== undefined && !dragRef.current && !prefersReducedMotion.matches) {
        offsetRef.current = normalizeOffset(offsetRef.current - ((time - previousTime) * 28) / 1000);
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      previousTime = time;
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startOffset: offsetRef.current };
    event.currentTarget.classList.add('is-dragging');
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    const loopWidth = loopWidthRef.current;
    if (!loopWidth) return;

    const offset = dragRef.current.startOffset + event.clientX - dragRef.current.startX;
    offsetRef.current = -(((-offset % loopWidth) + loopWidth) % loopWidth);
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="sponsors" aria-label="Sponsors">
      <motion.div
        className="sponsors-content"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          ref={marqueeRef}
          className="sponsor-marquee"
          role="region"
          aria-label="Featured sponsors; swipe or drag to browse"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div ref={trackRef} className="sponsor-marquee-track">
            <SponsorGroup />
            <SponsorGroup duplicate />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

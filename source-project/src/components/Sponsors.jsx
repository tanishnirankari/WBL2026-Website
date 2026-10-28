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
    id: 'sponsor-placeholder-2',
    name: 'TANISH',
    category: 'HEAD OF LEAGUE',
    image: `${import.meta.env.BASE_URL}images/tanishs.jpg`,
    description: 'Sponsor placeholder',
    brand: 'partner-preview',
  },
  {
    id: 'sponsor-placeholder-3',
    name: 'T.B.D.',
    category: 'SPONSOR PREVIEW',
    image: `${import.meta.env.BASE_URL}images/sponser3.jpg`,
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
  return (
    <section className="sponsors" aria-label="Sponsors">
      <motion.div
        className="sponsors-content"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
      >
        <div
          className="sponsor-marquee"
          role="region"
          aria-label="Featured sponsors moving continuously from right to left"
        >
          <div className="sponsor-marquee-track">
            <SponsorGroup />
            <SponsorGroup duplicate />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

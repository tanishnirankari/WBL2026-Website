import Layout from '../components/Layout';
import { motion, useReducedMotion } from 'framer-motion';

const aboutSections = [
  {
    id: 'founder',
    eyebrow: '',
    title: 'Our Founder',
    name: 'Tanish Nirankari',
    image: 'tanish.jpg',
    imageAlt: 'Trophy presentation at a Winter Bash League event',
    description: [
      'I am Tanish Nirankari, founder of the Winter Bash League. Following the massive success of the 2026 Summer Bash League, I am elevating the standard for the upcoming winter edition with a strict focus on structured tournament management and total team engagement.',
      'Dedicated to building anticipation and cultivating a high-energy atmosphere, my goal is to ensure every season is more memorable, fiercely competitive, and expertly executed than the last.',
    ],
  },
  {
    id: 'aim',
    eyebrow: '',
    title: 'Our Aim',
    image: 'gallery8.jpg',
    imageAlt: 'Players and an official discussing play on the cricket ground',
    description:
      ' We work to create a fair,Positive and welcoming environment where talent gets noticed, teams build camaraderie, and every match inspires players to reach further.',
  },
];

export default function Exclusive() {
  const imageBase = `${import.meta.env.BASE_URL}images/`;
  const shouldReduceMotion = useReducedMotion();

  return (
    <Layout>
      <div className="about-page">
        <header className="about-heading">
          <span>WINTER BASH LEAGUE</span>
          <h1>About Us</h1>
          <p>Built around cricket, community, and the next generation of local talent.</p>
        </header>

        <div className="about-sections">
          {aboutSections.map((section, index) => (
            <motion.section
              key={section.id}
              className="about-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby={`about-${section.id}-title`}
            >
              <div className="about-card-image">
                <img src={`${imageBase}${section.image}`} alt={section.imageAlt} />
              </div>
              <div className="about-card-copy">
                <span>{section.eyebrow}</span>
                <h2 id={`about-${section.id}-title`}>{section.title}</h2>
                {section.name && <h3>{section.name}</h3>}
                {Array.isArray(section.description)
                  ? section.description.map((paragraph, idx) => (
                      <p key={`${section.id}-paragraph-${idx}`}>{paragraph}</p>
                    ))
                  : <p>{section.description}</p>}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </Layout>
  );
}

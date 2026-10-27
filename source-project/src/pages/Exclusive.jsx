import Layout from '../components/Layout';
import { motion, useReducedMotion } from 'framer-motion';

const aboutSections = [
  {
    id: 'founder',
    eyebrow: 'THE PERSON BEHIND THE LEAGUE',
    title: 'Our Founder',
    name: 'Tanish Nirankari',
    image: 'winner.png',
    imageAlt: 'Trophy presentation at a Winter Bash League event',
    description:
      'Founded by Tanish Nirankari, Winter Bash League was created to bring local cricket talent together through a well-organized, competitive tournament. His focus on thoughtful planning and community has helped build a stage where players can compete, connect, and grow.',
  },
  {
    id: 'aim',
    eyebrow: 'WHY WE PLAY',
    title: 'Our Aim',
    image: 'gallery8.jpg',
    imageAlt: 'Players and an official discussing play on the cricket ground',
    description:
      'Our aim is to make competitive cricket more accessible to local players. We work to create a fair, welcoming environment where talent gets noticed, teams build camaraderie, and every match inspires players to reach further.',
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
                <p>{section.description}</p>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </Layout>
  );
}

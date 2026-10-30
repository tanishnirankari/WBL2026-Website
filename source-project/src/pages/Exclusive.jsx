import Layout from '../components/Layout';
import { motion, useReducedMotion } from 'framer-motion';
import { Target } from 'lucide-react';

const aboutSections = [
  {
    id: 'summer-bash',
    eyebrow: 'VIP AWARD CEREMONY',
    title: 'Summer Bash League',
    image: 'winner.png',
    imageAlt: 'Championship trophy being presented to the Summer Bash League winners',
    description: [
      'Summer Bash League 2026 Season 1 (SBL 2026) was the first season of the Bash League franchise, played with a swinger ball.',
      'The season took place at Nehru Yuva Kendra, Ambedkar Road, Ghaziabad, from 1 June 2026, with the grand finale held on 5 July 2026.',
    ],
    chiefGuests: [
      {
        name: 'Shri Keshav Kumar Chaudhry (IPS)',
        role: 'Additional Commissioner of Police, Ghaziabad',
      },
      {
        name: 'Shri Rajendra Mittal ji (Medi Wale)',
        role: 'Representative of the Member of Parliament, Ghaziabad',
      },
    ],
  },
  {
    id: 'founder',
    eyebrow: 'FOUNDER',
    name: 'Tanish Nirankari',
    image: 'tanishs.jpg',
    imageAlt: 'Winter Bash League founder Tanish Nirankari',
    description: [
      '"Myself Tanish Nirankari, Bash cricket.com',
      'Following the massive success of the 2026 Summer Bash League, me and my team aim to elevate the tournament standard to an exceptionally high standard."',
    ],
  },
  {
    id: 'winter-bash',
    eyebrow: 'THE NEXT CHAPTER',
    title: 'Winter Bash League',
    image: 'logo.png',
    imageAlt: 'Winter Bash League logo',
    description: [
      'Winter Bash League carries that momentum into a new season, bringing players together for organized matches, spirited competition, and a welcoming cricket community.',
      'The focus is on a well-run tournament where teams can compete, connect, and make the most of every matchday.',
    ],
  },
  {
    id: 'aim',
    eyebrow: 'OUR MISSION',
    title: 'Our Aim',
    icon: Target,
    image: 'gallery8.jpg',
    imageAlt: 'Players and an official discussing play on the cricket ground',
    description: [
      'We create a fair, positive, and welcoming environment where talent gets noticed.',
      'Teams build camaraderie, and every match inspires players to reach further.',
    ],
  },
];

export default function Exclusive() {
  const imageBase = `${import.meta.env.BASE_URL}images/`;
  const shouldReduceMotion = useReducedMotion();

  return (
    <Layout>
      <div className="about-page">
        <header className="about-heading">
          <h1>About Us</h1>
        </header>

        <div className="about-sections">
          {aboutSections.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <motion.section
                key={section.id}
                className={`about-card about-card-${section.id}`}
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
                  {section.id !== 'founder' && <span>{section.eyebrow}</span>}
                  {section.title && (
                    <h2 id={`about-${section.id}-title`}>
                      {SectionIcon && <SectionIcon className="about-card-title-icon" size={22} aria-hidden="true" />}
                      {section.title}
                    </h2>
                  )}
                  {section.name && <h3>{section.name}</h3>}
                  {section.id === 'founder' && <span className="about-founder-role">FOUNDER</span>}
                  {section.chiefGuests && (
                    <div className="about-chief-guests">
                      <h3>Chief Guests</h3>
                      <ul>
                        {section.chiefGuests.map((guest) => (
                          <li key={guest.name}>
                            <strong>{guest.name}</strong>
                            <span>{guest.role}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(section.description)
                    ? section.description.map((paragraph, idx) => (
                      <p key={`${section.id}-paragraph-${idx}`}>{paragraph}</p>
                    ))
                    : <p>{section.description}</p>}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

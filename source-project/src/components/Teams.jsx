import { motion } from 'framer-motion';

export default function Teams() {
  const teamSlots = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <section id="teams" className="teams-section">
      <div className="team-grid">
        {teamSlots.map((slot) => (
          <motion.div
            key={slot}
            className="team-card team-card-placeholder"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (slot - 1) * 0.05 }}
            whileHover={{ y: -5, borderColor: 'var(--lime)' }}
          >
            <span className="team-placeholder-mark" aria-hidden="true">T.B.D.</span>
            <h3>T.B.D.</h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

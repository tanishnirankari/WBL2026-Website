import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FeatureCards() {
  return (
    <section className="section">
      <div className="feature-grid">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="feature-card"
          style={{ '--feature-image': `url("${import.meta.env.BASE_URL}player.jpg")` }}
        >
          <h2>TALENT MEETS OPPORTUNITY</h2>
          <p>A competitive platform where teams, players and cricket lovers come together.</p>
          <div>
            <Link to="/register" className="primary-button">JOIN THE LEAGUE &rarr;</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="feature-card"
        >
          <h2>BE PART OF GHAZIABAD BIGGEST SWINGER BALL TOURNAMENT</h2>
          <p>Register your team and showcase your cricket on the Winter Bash League stage.</p>
          <div>
            <Link to="/register" className="primary-button">REGISTER NOW &rarr;</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

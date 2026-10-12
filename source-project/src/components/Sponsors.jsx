import { motion } from 'framer-motion';

export default function Sponsors() {
  return (
    <section className="sponsors">
      <div className="sponsors-title">OUR SPONSORS</div>
      <motion.div 
        className="sponsor-list"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="sponsor">TBD</div>
        <div className="sponsor">TBD</div>
        <div className="sponsor">TBD</div>
        <div className="sponsor">TBD</div>
        <div className="sponsor"><span>TBD</span></div>
      </motion.div>
    </section>
  );
}

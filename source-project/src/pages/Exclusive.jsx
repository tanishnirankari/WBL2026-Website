import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function Exclusive() {
  return (
    <Layout>
      <div className="exclusive-page">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="exclusive-title">EXCLUSIVE PAGE</h1>
          <p className="exclusive-copy">
            Exclusive content coming soon. Stay tuned for behind the scenes footage, interviews, and thrilling match highlights from the Winter Bash League.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}

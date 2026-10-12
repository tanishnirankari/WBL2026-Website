import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function Exclusive() {
  return (
    <Layout>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '100px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: '48px', color: 'var(--lime)', marginBottom: '20px' }}>EXCLUSIVE PAGE</h1>
          <p style={{ color: '#8e9aa7', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Exclusive content coming soon. Stay tuned for behind the scenes footage, interviews, and thrilling match highlights from the Winter Bash League.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Sponsors from '../components/Sponsors';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const sectionId = decodeURIComponent(hash.slice(1));
    const scrollTimer = window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 5, behavior: 'auto' });
      }
    }, 0);

    return () => window.clearTimeout(scrollTimer);
  }, [hash]);

  return (
    <Layout className="home-layout">
      <main className="home-page-content">
        <Hero />
        <Sponsors />
      </main>
    </Layout>
  );
}

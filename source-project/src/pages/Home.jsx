import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Sponsors from '../components/Sponsors';

export default function Home() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    const sectionId = hash ? decodeURIComponent(hash.slice(1)) : 'hero';
    const scrollTimer = window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 0);

    return () => window.clearTimeout(scrollTimer);
  }, [hash, pathname]);

  return (
    <Layout className="home-layout">
      <main className="home-page-content">
        <Hero />
        <Sponsors />
      </main>
    </Layout>
  );
}

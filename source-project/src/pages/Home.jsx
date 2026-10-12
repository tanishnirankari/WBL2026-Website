import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import PointsTable from '../components/PointsTable';
import Teams from '../components/Teams';
import FeatureCards from '../components/FeatureCards';
import Gallery from '../components/Gallery';
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
    <Layout>
      <Hero />
      <PointsTable />
      <Teams />
      <FeatureCards />
      <Gallery />
      <Sponsors />
    </Layout>
  );
}

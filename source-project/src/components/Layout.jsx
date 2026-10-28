import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="site-layout">
      <Navbar />
      <div className="layout-content">{children}</div>
      <Footer />
    </div>
  );
}

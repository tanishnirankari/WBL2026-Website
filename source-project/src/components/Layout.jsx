import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, className = '' }) {
  return (
    <div className={`site-layout ${className}`.trim()}>
      <Navbar />
      <div className="layout-content">{children}</div>
      <Footer />
    </div>
  );
}

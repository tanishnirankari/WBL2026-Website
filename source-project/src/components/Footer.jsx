import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Auction', to: '/auction' },
  { label: 'Teams', to: '/teams' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About Us', to: '/exclusive' },
  { label: 'Rule Book', to: '/rule-book' },
];

const contactItems = [
  {
    label: 'Call',
    value: '+91 9711621524',
    href: 'tel:+919711621524',
    icon: Phone,
  },
  {
    label: 'Email',
    value: 'winterbashleague@gmail.com',
    href: 'mailto:winterbashleague@gmail.com',
    icon: Mail,
  },
  {
    label: 'Venue',
    value: 'Nehru Yuva Kendra, Ghaziabad',
    icon: MapPin,
  },
  {
    label: 'Instagram',
    links: [
      { value: 'winterbashleague', href: 'https://www.instagram.com/winterbashleague/' },
      { value: 'summerbashleague', href: 'https://www.instagram.com/summerbashleague/' },
    ],
    icon: InstagramIcon,
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-main">
        <nav className="footer-navigation" aria-label="Footer navigation">
          <h2>Explore</h2>
          <div className="footer-navigation-links">
            {footerLinks.map(({ label, to }) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
            <a
              className="footer-youtube-link"
              href="https://www.youtube.com/@summerbashleague"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Summer Bash League on YouTube"
              title="Summer Bash League on YouTube"
            >
              <span>YouTube</span>
            </a>
          </div>
        </nav>

        <section className="footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">Get in touch</h2>
          <div className="footer-contact-list">
            {contactItems.map(({ label, value, href, links, icon: Icon, external }) => (
              <div
                className={`footer-contact-item${label === 'Instagram' ? ' footer-contact-item-instagram' : ''}`}
                key={href || label}
              >
                <span className="footer-contact-icon">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div>
                  {label !== 'Instagram' && <span className="footer-contact-label">{label}</span>}
                  {href ? (
                    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                      {value}
                    </a>
                  ) : links ? (
                    links.map(({ value: linkValue, href: linkHref }) => (
                      <a key={linkHref} href={linkHref} target="_blank" rel="noopener noreferrer">
                        {linkValue}
                      </a>
                    ))
                  ) : (
                    <span className="footer-contact-value">{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="footer-bottom">
        <span>Founded by <strong>Tanish Nirankari</strong></span>
      </div>
    </footer>
  );
}

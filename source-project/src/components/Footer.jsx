import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const contactItems = [
  {
    label: 'Call us',
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
];

export default function Footer() {
  const assetBase = `${import.meta.env.BASE_URL}images/`;

  return (
    <footer id="contact">
      <div className="footer-brand">
        <Link to="/" className="footer-brand-link" aria-label="Winter Bash League home">
          <img src={`${assetBase}logo.png`} alt="" />
          <strong>
            WINTER BASH <span>LEAGUE</span>
          </strong>
        </Link>
        <p className="footer-tagline">Beyond Boundaries</p>
      </div>

      <div className="footer-contact">
        <h2>Get in touch</h2>
        <div className="footer-contact-list">
          {contactItems.map(({ label, value, href, icon: Icon }) => (
            <div className="footer-contact-item" key={label}>
              <span className="footer-contact-icon"><Icon size={16} aria-hidden="true" /></span>
              <div>
                <span className="footer-contact-label">{label}</span>
                {href ? <a href={href}>{value}</a> : <span className="footer-contact-value">{value}</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="footer-organizer">Founded by <strong>Tanish Nirankari</strong></p>
      </div>

      <div className="footer-meta">
        <p>&copy; {new Date().getFullYear()} Winter Bash League. All rights reserved.</p>
        <p>Cricket, community, and competition.</p>
      </div>
    </footer>
  );
}

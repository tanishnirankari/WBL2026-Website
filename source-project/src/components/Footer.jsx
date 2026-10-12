import { Link } from 'react-router-dom';

export default function Footer() {
  const assetBase = import.meta.env.BASE_URL;

  return (
    <footer id="contact">
      <div className="footer-brand">
        <Link to="/">
          <img src={`${assetBase}logo.png`} alt="WBL Logo" style={{ width: '50px' }} />
        </Link>
        <strong>
          WINTER BASH
          <span>LEAGUE</span>
        </strong>
      </div>

      <div className="footer-contact">
        <p><strong>Contact Us</strong></p>
        <p>Phone: +91 9711621524</p>
        <p>organised by Tanish Nirankari</p>
        <p>Email: winterbashleague@gmail.com</p>
        <p>Venue: Nehru Yuva Kendra, Ghaziabad</p>
      </div>

      <div className="footer-meta">
        <p>&copy; 2026 Winter Bash League. Season 1</p>
        <p>BEYOND BOUNDARIES</p>
      </div>
    </footer>
  );
}

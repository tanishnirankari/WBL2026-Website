import { ShieldCheck } from 'lucide-react';

export default function AdminPortalLogo({ compact = false }) {
  return (
    <span className={`admin-portal-brand${compact ? ' compact' : ''}`}>
      <span className="admin-portal-mark"><ShieldCheck aria-hidden="true" /></span>
      <span className="admin-portal-wordmark"><strong>WBL</strong><small>ADMIN PORTAL</small></span>
    </span>
  );
}

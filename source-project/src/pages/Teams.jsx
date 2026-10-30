import Layout from '../components/Layout';
import Teams from '../components/Teams';
import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';

export default function TeamsPage() {
  return (
    <Layout>
      <div className="page content-page teams-page">
        <div className="section-heading">
          <h1>WBL Teams</h1>
          <Link className="teams-register-link" to="/register">
            Register to showcase your team here.
            <Link2 size={16} aria-hidden="true" />
          </Link>
        </div>
        <Teams />
      </div>
    </Layout>
  );
}

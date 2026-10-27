import Layout from '../components/Layout';
import Teams from '../components/Teams';

export default function TeamsPage() {
  return (
    <Layout>
      <div className="page content-page teams-page">
        <div className="section-heading">
          <h1>WBL Teams</h1>
        </div>
        <Teams />
      </div>
    </Layout>
  );
}

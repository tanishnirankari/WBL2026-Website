import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));
const Exclusive = lazy(() => import('./pages/Exclusive'));
const Auction = lazy(() => import('./pages/Auction'));
const GalleryPage = lazy(() => import('./pages/Gallery'));
const TeamsPage = lazy(() => import('./pages/Teams'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<main className="page-loading" role="status">Loading page…</main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auction" element={<Auction />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exclusive" element={<Exclusive />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

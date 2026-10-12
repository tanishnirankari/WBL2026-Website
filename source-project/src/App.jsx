import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Exclusive from './pages/Exclusive';
import Auction from './pages/Auction';
import GalleryPage from './pages/Gallery';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/exclusive" element={<Exclusive />} />
      </Routes>
    </Router>
  );
}

export default App;

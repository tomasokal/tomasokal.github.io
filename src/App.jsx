import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import PhotoDetail from './pages/PhotoDetail';
import Creations from './pages/Creations';

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:tripId" element={<TripDetail />} />
        <Route path="/photos/:photoId" element={<PhotoDetail />} />
        <Route path="/creations" element={<Creations />} />
      </Routes>
      <Footer />
    </div>
  );
}

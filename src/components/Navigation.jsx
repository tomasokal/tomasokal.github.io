import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navigation() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="site-nav">
      <Link to="/" className="nav-brand">TOMAS OKAL</Link>
      <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
        <Link
          to="/"
          className={`nav-link ${isActive('/') ? 'nav-active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          HOME
        </Link>
        <Link
          to="/trips"
          className={`nav-link ${isActive('/trips') ? 'nav-active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          GALLERY
        </Link>
        <Link
          to="/creations"
          className={`nav-link ${isActive('/creations') ? 'nav-active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          CREATIONS
        </Link>
      </nav>
      <button
        className="nav-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
    </header>
  );
}

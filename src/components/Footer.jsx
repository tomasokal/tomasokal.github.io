import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-left">
        <span className="footer-brand">TOMAS OKAL</span>
        <span className="footer-copy">&copy;2024 ALL RIGHTS RESERVED</span>
      </div>
      <div className="footer-right">
        <Link to="/trips" className="footer-link">GALLERY</Link>
      </div>
    </footer>
  );
}

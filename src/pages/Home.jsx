import { Link } from 'react-router-dom';
import { usePhotos } from '../hooks/usePhoto';

export default function Home() {
  const { data, loading, error } = usePhotos();

  if (loading) return <main className="page-loading"><p>LOADING...</p></main>;
  if (error) return <main className="page-error"><p>UNAVAILABLE</p></main>;

  const trips = data?.trips || [];

  // Find Nova Scotia trip specifically, fall back to first trip
  const featuredTrip = trips.find(t => t.trip.id === 'nova-scotia-2024') || trips[0];
  const featuredPhoto = featuredTrip?.photos?.[0] || null;
  const coverImage = featuredTrip
    ? `${import.meta.env.BASE_URL}images/${featuredTrip.trip.id}/${featuredTrip.trip.coverPhotoId}.webp`
    : null;

  return (
    <main className="home-page">
      <section className="hero">
        {/* Left column: Featured photo */}
        <div className="hero-media">
          {coverImage ? (
            <Link to={`/trips/${featuredTrip.trip.id}`} className="hero-image-wrap">
              <img src={coverImage} alt={featuredTrip.trip.title} className="hero-image" />
              {featuredTrip && (
                <div className="hero-image-meta">
                  <div className="hero-meta-cell">
                    <span className="hero-meta-label">Trip</span>
                    <span className="hero-meta-value">{featuredTrip.trip.title.toUpperCase()}</span>
                  </div>
                  <div className="hero-meta-cell">
                    <span className="hero-meta-label">Location</span>
                    <span className="hero-meta-value">{featuredTrip.trip.location.name.toUpperCase()}</span>
                  </div>
                  <div className="hero-meta-cell">
                    <span className="hero-meta-label">Period</span>
                    <span className="hero-meta-value">
                      {featuredTrip.trip.startDate?.slice(0, 7).replace('-', '.')}
                    </span>
                  </div>
                  <div className="hero-meta-cell">
                    <span className="hero-meta-label">Photos</span>
                    <span className="hero-meta-value">{featuredTrip.photos?.length || 0}</span>
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <div className="hero-image-wrap hero-placeholder">
              <span className="material-symbols-outlined">photo_camera</span>
            </div>
          )}
        </div>

        {/* Right column: Bio & Network */}
        <div className="hero-sidebar">
          <section className="home-bio-section">
            <h3 className="home-section-heading">
              <span className="home-section-dot home-section-dot--red"></span>
              Personnel_Bio
            </h3>
            <div className="home-bio-content">
              <p>
                I am a <strong>Data Solutions Architect</strong> at{' '}
                <span className="home-bio-employer">Oliver Wyman</span>.
              </p>
              <p className="home-bio-secondary">
                Beyond this, I enjoy art, ceramics, photography, and rock
                climbing.
              </p>
            </div>
          </section>

          <section className="home-network-section">
            <h3 className="home-section-heading">
              <span className="home-section-dot"></span>
              Network_Access
            </h3>
            <ul className="home-network-list">
              <li>
                <a
                  href="https://github.com/tomasokal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-network-link"
                >
                  <span>GITHUB</span>
                  <span className="material-symbols-outlined home-network-arrow">arrow_outward</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/tomas-okal-36049b143/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-network-link"
                >
                  <span>LINKEDIN</span>
                  <span className="material-symbols-outlined home-network-arrow">arrow_outward</span>
                </a>
              </li>
            </ul>
          </section>

          <Link to="/trips" className="hero-cta">
            VIEW GALLERY
          </Link>
        </div>
      </section>
    </main>
  );
}

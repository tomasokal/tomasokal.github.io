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
        <div className="hero-text">
          {featuredTrip && (
            <div className="hero-featured-info">
              <p className="hero-featured-trip">{featuredTrip.trip.title.toUpperCase()}</p>
              <p className="hero-featured-location">{featuredTrip.trip.location.name}</p>
              <p className="hero-featured-desc">{featuredTrip.trip.description}</p>
            </div>
          )}

          <Link to="/trips" className="hero-cta">
            VIEW GALLERY
          </Link>
        </div>

        <div className="hero-media">
          {coverImage ? (
            <Link to={`/trips/${featuredTrip.trip.id}`} className="hero-image-wrap">
              <img src={coverImage} alt={featuredTrip.trip.title} className="hero-image" />
            </Link>
          ) : (
            <div className="hero-image-wrap hero-placeholder">
              <span className="material-symbols-outlined">photo_camera</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

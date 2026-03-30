import { useParams, Link } from 'react-router-dom';
import { usePhotos, getPhotoById } from '../hooks/usePhoto';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PhotoDetail() {
  const { photoId } = useParams();
  const { data, loading, error } = usePhotos();

  if (loading) return <main className="page-loading"><p>LOADING ARCHIVE...</p></main>;
  if (error) return <main className="page-error"><p>ARCHIVE UNAVAILABLE</p></main>;

  const result = getPhotoById(data, photoId);
  if (!result) return <main className="page-error"><p>OBSERVATION NOT FOUND</p></main>;

  const { photo, trip, locations } = result;
  const locDef = locations?.find(l => l.name === photo.location?.name || l.name === photo.location);
  const lat = locDef?.lat ?? photo.location?.lat;
  const lng = locDef?.lng ?? photo.location?.lng;
  const imagePath = `${import.meta.env.BASE_URL}images/${trip.id}/${photo.id}.webp`;

  return (
    <main className="photo-detail-page archival-bg">
      <div className="photo-detail-container">
        {/* Header */}
        <div className="photo-detail-meta-header">
          {lat != null && (
            <span className="detail-coord-label">
              {Math.abs(lat).toFixed(4)}°{' '}
              {lat >= 0 ? 'N' : 'S'},{' '}
              {Math.abs(lng).toFixed(4)}°{' '}
              {lng >= 0 ? 'E' : 'W'}
            </span>
          )}
          <h1 className="photo-detail-title">{photo.title.toUpperCase()}</h1>
          <span className="photo-detail-context">
            {(photo.location?.name || photo.location || '').toUpperCase()} // {formatDate(photo.date)}
          </span>
        </div>

        <div className="photo-detail-layout">
          {/* Main Image */}
          <div className="photo-detail-main">
            <div className="photo-detail-frame">
              <img
                src={imagePath}
                alt={photo.title}
                className="photo-detail-image"
              />
            </div>
            <div className="photo-detail-caption">
              <p className="caption-text">Fig 1.1: {photo.title}</p>
              <span className="caption-ref">
                Archive Ref: {photo.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Sidebar Metadata */}
          <aside className="photo-detail-sidebar">
            {/* Equipment */}
            <section className="detail-section">
              <div className="section-header">
                <div className="section-dot"></div>
                <h2 className="section-title">EQUIPMENT</h2>
              </div>
              <div className="equipment-card">
                <p className="equipment-camera">{photo.exif.camera}</p>
                <p className="equipment-lens">{photo.exif.lens}</p>
              </div>
            </section>

            {/* Technical Data */}
            <section className="detail-section">
              <div className="section-header">
                <div className="section-dot"></div>
                <h2 className="section-title">TECHNICAL DATA</h2>
              </div>
              <div className="tech-grid">
                <div className="tech-cell">
                  <span className="tech-label">APERTURE</span>
                  <span className="tech-value">{photo.exif.aperture}</span>
                </div>
                <div className="tech-cell">
                  <span className="tech-label">EXPOSURE</span>
                  <span className="tech-value">{photo.exif.shutterSpeed}</span>
                </div>
                <div className="tech-cell">
                  <span className="tech-label">ISO</span>
                  <span className="tech-value">{photo.exif.iso}</span>
                </div>
                <div className="tech-cell">
                  <span className="tech-label">FOCAL</span>
                  <span className="tech-value">{photo.exif.focalLength}mm</span>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="detail-section">
              <div className="section-header">
                <div className="section-dot"></div>
                <h2 className="section-title">DESCRIPTION</h2>
              </div>
              <div className="observations-card">
                <p>{photo.description}</p>
              </div>
            </section>

            {/* Back link */}
            <Link to={`/trips/${trip.id}`} className="back-to-trip">
              <span className="material-symbols-outlined">arrow_back</span>
              RETURN TO {trip.title.toUpperCase()}
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

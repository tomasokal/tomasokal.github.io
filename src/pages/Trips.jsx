import { Link } from 'react-router-dom';
import { usePhotos } from '../hooks/usePhoto';

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${months[s.getMonth()]} ${s.getFullYear()} — ${months[e.getMonth()]} ${e.getFullYear()}`;
}

export default function Trips() {
  const { data, loading, error } = usePhotos();

  if (loading) return <main className="page-loading"><p>LOADING...</p></main>;
  if (error) return <main className="page-error"><p>UNAVAILABLE</p></main>;

  const trips = data?.trips || [];

  return (
    <main className="trips-page">
      <header className="trips-header">
        <div className="trips-header-left">
          <h1 className="page-title">GALLERY INDEX</h1>
        </div>
        <div className="trips-header-right">
          <p className="trips-subtitle">
            A chronological documentation of terrestrial surveys and wilderness
            expeditions.
          </p>
        </div>
      </header>

      <div className="trips-grid">
        {trips.map((t, i) => {
          const coverImage = `${import.meta.env.BASE_URL}images/${t.trip.id}/${t.trip.coverPhotoId}-thumb.webp`;
          const num = String(i + 1).padStart(2, '0');
          return (
            <Link to={`/trips/${t.trip.id}`} key={t.trip.id} className="trip-entry">
              <div className="trip-entry-image">
                <img src={coverImage} alt={t.trip.title} />
                <div className="trip-entry-badge">{num}</div>
              </div>
              <div className="trip-entry-info">
                {t.trip.location.center[0] != null && (
                  <p className="trip-entry-coord">
                    {Math.abs(t.trip.location.center[0]).toFixed(3)}°{' '}
                    {t.trip.location.center[0] >= 0 ? 'N' : 'S'},{' '}
                    {Math.abs(t.trip.location.center[1]).toFixed(3)}°{' '}
                    {t.trip.location.center[1] >= 0 ? 'E' : 'W'}
                  </p>
                )}
                <h2 className="trip-entry-title">
                  {t.trip.title.toUpperCase()}
                </h2>
                <div className="trip-entry-footer">
                  <span className="trip-entry-dates">
                    {formatDateRange(t.trip.startDate, t.trip.endDate)}
                  </span>
                  <span className="material-symbols-outlined trip-entry-arrow">
                    north_east
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {trips.length === 0 && (
        <div className="empty-state">
          <p>No expeditions recorded yet.</p>
        </div>
      )}
    </main>
  );
}

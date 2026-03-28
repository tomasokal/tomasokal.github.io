import { Link } from 'react-router-dom';
import { usePhotos } from '../hooks/usePhoto';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${months[s.getMonth()]} ${s.getFullYear()} — ${months[e.getMonth()]} ${e.getFullYear()}`;
}

function coordString(center) {
  if (!center || center[0] == null) return null;
  return `LAT: ${Math.abs(center[0]).toFixed(3)}° ${center[0] >= 0 ? 'N' : 'S'} / LON: ${Math.abs(center[1]).toFixed(3)}° ${center[1] >= 0 ? 'E' : 'W'}`;
}

/* --- map helpers (mirrored from TripDetail) --- */

function groupByLocation(photos) {
  const map = new Map();
  photos.forEach((photo) => {
    const key = photo.location?.name || 'Unknown';
    if (!map.has(key)) {
      map.set(key, { name: key, lat: photo.location?.lat, lng: photo.location?.lng, photos: [] });
    }
    map.get(key).photos.push(photo);
  });
  return Array.from(map.values());
}

function catmullRomSpline(locs, density = 20) {
  if (locs.length < 2) return locs.map((l) => [l.lat, l.lng]);
  const pts = locs.map((l) => [l.lat, l.lng]);
  const result = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    for (let t = 0; t <= 1; t += 1 / density) {
      const t2 = t * t;
      const t3 = t2 * t;
      const lat =
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lng =
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      result.push([lat, lng]);
    }
  }
  const last = pts[pts.length - 1];
  result.push([last[0], last[1]]);
  return result;
}

/* --- Mini-map component for the gallery sidebar --- */

function GalleryMiniMap({ photos }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const locations = groupByLocation(photos);

    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 14,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 14,
      noWrap: true,
    }).addTo(map);

    leafletRef.current = map;

    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds.pad(0.35), { animate: false, maxZoom: 9 });
    }

    // Draw route spline
    if (locations.length >= 2) {
      const spline = catmullRomSpline(locations);
      L.polyline(spline, {
        color: '#b8101c',
        weight: 2,
        dashArray: '6 4',
        opacity: 0.7,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      }).addTo(map);
    }

    // Draw markers
    locations.forEach((loc) => {
      const size = 8;
      const icon = L.divIcon({
        className: 'td-leaflet-marker',
        html: `<div class="td-marker-sq td-marker-sq--on" style="width:${size}px;height:${size}px;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      L.marker([loc.lat, loc.lng], { icon, interactive: false }).addTo(map);
    });

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, [photos]);

  return <div ref={mapRef} className="gallery-minimap-leaflet" />;
}

/* --- Main component --- */

export default function Trips() {
  const { data, loading, error } = usePhotos();

  if (loading) return <main className="page-loading"><p>LOADING...</p></main>;
  if (error) return <main className="page-error"><p>UNAVAILABLE</p></main>;

  const trips = data?.trips || [];
  const featured = trips[0] || null;
  const rest = trips.slice(1);

  return (
    <main className="trips-page">
      {/* Section Header */}
      <div className="trips-header">
        <div className="trips-header-left">
          <p className="trips-ref">INDEX_REF: 2024.GL.01</p>
          <h1 className="trips-title">GALLERY</h1>
        </div>
        <div className="trips-header-right">
          <p className="trips-subtitle">
            A chronological documentation of my photography.
            Organized by trips.
          </p>
        </div>
      </div>

      {trips.length === 0 && (
        <div className="empty-state">
          <p>No trips recorded yet.</p>
        </div>
      )}

      {trips.length > 0 && (
        <div className="trips-grid">
          {/* Featured trip — large card, 8 cols */}
          {featured && (
            <Link to={`/trips/${featured.trip.id}`} className="trip-card trip-featured">
              <div className="trip-image-wrap">
                <img
                  src={`${import.meta.env.BASE_URL}images/${featured.trip.id}/${featured.trip.coverPhotoId}.webp`}
                  alt={featured.trip.title}
                  className="trip-image"
                />
              </div>
              <div className="trip-image-meta">
                <div className="trip-meta-cell">
                  <span className="trip-meta-label">Trip</span>
                  <span className="trip-meta-value">{featured.trip.title.toUpperCase()}</span>
                </div>
                <div className="trip-meta-cell">
                  <span className="trip-meta-label">Location</span>
                  <span className="trip-meta-value">{featured.trip.location.name.toUpperCase()}</span>
                </div>
                <div className="trip-meta-cell">
                  <span className="trip-meta-label">Period</span>
                  <span className="trip-meta-value">
                    {formatDateRange(featured.trip.startDate, featured.trip.endDate)}
                  </span>
                </div>
                <div className="trip-meta-cell">
                  <span className="trip-meta-label">Photos</span>
                  <span className="trip-meta-value">{featured.photos?.length || 0} FRAMES</span>
                </div>
              </div>
            </Link>
          )}

          {/* Sidebar column — 4 cols: mini-map of featured trip */}
          {featured && (
            <div className="trip-sidebar-col">
              <div className="trip-gallery-map-block">
                <span className="material-symbols-outlined trip-gallery-map-icon">
                  map
                </span>
                <div className="trip-gallery-map-header">
                  <h3 className="trip-gallery-map-title">TRIP ROUTE</h3>
                  <p className="trip-gallery-map-desc">
                    {featured.trip.location.name.toUpperCase()} — {featured.photos?.length || 0} OBSERVATION POINTS
                  </p>
                </div>
                <div className="trip-gallery-map-container">
                  <GalleryMiniMap photos={featured.photos || []} />
                </div>
              </div>
            </div>
          )}

          {/* Remaining trips — equal-width grid cards */}
          {rest.map((t, i) => {
            const num = String(i + 2).padStart(3, '0');
            return (
              <Link to={`/trips/${t.trip.id}`} key={t.trip.id} className="trip-card trip-grid-card">
                <div className="trip-grid-card-header">
                  <span className="trip-card-badge">TRIP_{num}</span>
                </div>
                <div className="trip-image-wrap trip-image-wrap--sm">
                  <img
                    src={`${import.meta.env.BASE_URL}images/${t.trip.id}/${t.trip.coverPhotoId}-thumb.webp`}
                    alt={t.trip.title}
                    className="trip-image"
                  />
                </div>
                <div className="trip-image-meta trip-image-meta--sm">
                  <div className="trip-meta-cell">
                    <span className="trip-meta-label">Location</span>
                    <span className="trip-meta-value">{t.trip.location.name.toUpperCase()}</span>
                  </div>
                  <div className="trip-meta-cell">
                    <span className="trip-meta-label">Period</span>
                    <span className="trip-meta-value">
                      {formatDateRange(t.trip.startDate, t.trip.endDate)}
                    </span>
                  </div>
                </div>
                <h3 className="trip-card-title">{t.trip.title.toUpperCase()}</h3>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

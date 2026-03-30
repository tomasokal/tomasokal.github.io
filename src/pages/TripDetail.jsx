import { useParams, Link } from 'react-router-dom';
import { usePhotos, getTripById } from '../hooks/usePhoto';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ---------- helpers ---------- */

function groupByLocation(photos, locationsDef) {
  const map = new Map();
  photos.forEach((photo) => {
    const loc = photo.location;
    const key = typeof loc === 'string' ? loc : (loc?.name || 'Unknown');
    if (!map.has(key)) {
      map.set(key, { name: key, lat: loc?.lat, lng: loc?.lng, photos: [] });
    }
    map.get(key).photos.push(photo);
  });

  // If explicit locations with order are provided, use them
  if (locationsDef && locationsDef.length > 0) {
    const orderMap = new Map(locationsDef.map((l) => [l.name, l]));
    const result = [];
    // Add locations in explicit order, attaching photos
    const sorted = [...locationsDef].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    sorted.forEach((def) => {
      const existing = map.get(def.name);
      result.push({
        name: def.name,
        lat: def.lat,
        lng: def.lng,
        order: def.order,
        photos: existing ? existing.photos : [],
      });
      map.delete(def.name);
    });
    // Append any locations found in photos but not in the definition
    map.forEach((loc) => result.push(loc));
    return result;
  }

  return Array.from(map.values());
}

const LOC_LABELS = ['BASE', 'TRANSIT', 'SURVEY', 'ENDPOINT'];

/**
 * Build a Catmull-Rom spline through loc points, returning
 * an array of [lat,lng] with `density` intermediate points per segment.
 */
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
        0.5 * (
          (2 * p1[0]) +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
        );
      const lng =
        0.5 * (
          (2 * p1[1]) +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
        );
      result.push([lat, lng]);
    }
  }
  // ensure last point is included
  const last = pts[pts.length - 1];
  result.push([last[0], last[1]]);
  return result;
}



/* ---------- main component ---------- */

export default function TripDetail() {
  const { tripId } = useParams();
  const { data, loading, error } = usePhotos();

  const heroRef = useRef(null);
  const sectionRefs = useRef([]);
  const sidebarMapRef = useRef(null);
  const sidebarLeaflet = useRef(null);
  const sidebarLayers = useRef({ markers: [], routeLine: null, ghostLine: null });
  const [isCompact, setIsCompact] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // We need locations computed before hooks, so we derive early
  // (hooks must be called unconditionally)
  const tripData = data ? getTripById(data, tripId) : null;
  const locations = tripData ? groupByLocation(tripData.photos, tripData.locations) : [];

  /* --- scroll handler: hero → compact bar --- */
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      setIsCompact(heroBottom < 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --- intersection observer: which location block is in view --- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let topIdx = -1;
        let topY = Infinity;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.locIdx);
            const y = entry.boundingClientRect.top;
            if (y < topY) { topY = y; topIdx = idx; }
          }
        });
        if (topIdx >= 0) setActiveIdx(topIdx);
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );
    const nodes = sectionRefs.current.filter(Boolean);
    nodes.forEach((n) => observer.observe(n));
    return () => nodes.forEach((n) => observer.unobserve(n));
  }, [data, tripId]);

  /* --- sidebar Leaflet map --- */
  useEffect(() => {
    if (!sidebarMapRef.current || sidebarLeaflet.current) return;
    const map = L.map(sidebarMapRef.current, {
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
    sidebarLeaflet.current = map;
    const validLocs = locations.filter((l) => l.lat != null && l.lng != null);
    if (validLocs.length > 0) {
      const bounds = L.latLngBounds(validLocs.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds.pad(0.25), { animate: false, maxZoom: 9 });
    }
    return () => { map.remove(); sidebarLeaflet.current = null; };
  }, [locations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* resize map when sidebar slides in */
  useEffect(() => {
    if (isCompact && sidebarLeaflet.current) {
      const timer = setTimeout(() => {
        sidebarLeaflet.current.invalidateSize();
        const validLocs = locations.filter((l) => l.lat != null && l.lng != null);
        if (validLocs.length > 0) {
          const bounds = L.latLngBounds(validLocs.map((l) => [l.lat, l.lng]));
          sidebarLeaflet.current.fitBounds(bounds.pad(0.25), { animate: false, maxZoom: 9 });
        }
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isCompact, locations]);

  /* update markers + route on scroll */
  useEffect(() => {
    const map = sidebarLeaflet.current;
    if (!map) return;
    const layers = sidebarLayers.current;
    layers.markers.forEach((m) => map.removeLayer(m));
    if (layers.routeLine) map.removeLayer(layers.routeLine);
    if (layers.ghostLine) map.removeLayer(layers.ghostLine);

    const newMarkers = [];
    const visibleCount = activeIdx + 1;
    const validLocs = locations.filter((l) => l.lat != null && l.lng != null);
    const validVisible = validLocs.filter((_, i) => i < visibleCount);

    if (validLocs.length >= 2) {
      const spline = catmullRomSpline(validLocs);
      layers.ghostLine = L.polyline(spline, {
        color: '#0047AB', weight: 1, dashArray: '4 8', opacity: 0.15, interactive: false,
      }).addTo(map);
    }

    if (validVisible.length >= 2) {
      const spline = catmullRomSpline(validVisible);
      layers.routeLine = L.polyline(spline, {
        color: '#b8101c', weight: 2, dashArray: '6 4', opacity: 0.7,
        lineCap: 'round', lineJoin: 'round', interactive: false,
      }).addTo(map);
    } else {
      layers.routeLine = null;
    }

    validLocs.forEach((loc, i) => {
      const revealed = i < visibleCount;
      const isActive = locations.indexOf(loc) === activeIdx;
      const size = isActive ? 10 : 7;
      const icon = L.divIcon({
        className: 'td-leaflet-marker',
        html: `<div class="td-marker-sq ${revealed ? 'td-marker-sq--on' : ''} ${isActive ? 'td-marker-sq--active' : ''}" style="width:${size}px;height:${size}px;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const m = L.marker([loc.lat, loc.lng], { icon, interactive: false }).addTo(map);
      newMarkers.push(m);
    });

    layers.markers = newMarkers;
  }, [activeIdx, locations]);

  /* --- early returns --- */
  if (loading) return <main className="page-loading"><p>LOADING ARCHIVE...</p></main>;
  if (error) return <main className="page-error"><p>ARCHIVE UNAVAILABLE</p></main>;
  if (!tripData) return <main className="page-error"><p>EXPEDITION NOT FOUND</p></main>;

  const { trip, photos } = tripData;
  const tripNum = data?.trips
    ? String(data.trips.findIndex((t) => t.trip.id === tripId) + 1).padStart(2, '0')
    : '01';

  return (
    <main className="trip-detail-page archival-bg">
      <div className="margin-line" />

      {/* ===== HERO ===== */}
      <header className="td-hero" ref={heroRef}>
        <div className="td-hero-inner">
          <div className="td-hero-left">
            <p className="td-recording-id">
              <span className="td-recording-line" />
              RECORDING ID: {trip.id.toUpperCase().replace(/-/g, '_')}
            </p>
            <h1 className="td-title">
              {trip.title.toUpperCase()}
            </h1>
          </div>
          <div className="td-hero-right">
            {trip.description && (
              <p className="td-hero-desc">{trip.description}</p>
            )}
            <div className="td-hero-meta">
              <span>{trip.location?.name?.toUpperCase()}</span>
              {trip.startDate && (
                <span>{trip.startDate}{trip.endDate ? ` — ${trip.endDate}` : ''}</span>
              )}
              <span>{locations.length} LOCATION{locations.length !== 1 ? 'S' : ''} / {photos.length} PHOTOGRAPH{photos.length !== 1 ? 'S' : ''}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== LEFT SIDEBAR ===== */}
      <div className={`td-sidebar ${isCompact ? 'td-sidebar--visible' : ''}`}>
        <div className="td-sidebar-header">
          <h2 className="td-sidebar-title">
            TRIP {tripNum}: {trip.title.toUpperCase()}
          </h2>
          <p className="td-sidebar-sub">
            {activeIdx >= 0 ? locations[activeIdx].name.toUpperCase() : 'SCROLL TO BEGIN'}
          </p>
        </div>
        <div className="td-sidebar-map">
          <div ref={sidebarMapRef} className="td-sidebar-leaflet" />
        </div>
      </div>

      {/* ===== LOCATION BLOCKS ===== */}
      <div className={`td-content ${isCompact ? 'td-content--sidebar' : ''}`}>
        {locations.map((loc, locIdx) => {
          const locNum = String(locIdx + 1).padStart(2, '0');
          const label = LOC_LABELS[locIdx] || 'SURVEY';
          return (
            <section
              key={loc.name}
              className="td-location-block"
              data-loc-idx={locIdx}
              ref={(el) => (sectionRefs.current[locIdx] = el)}
            >
              <div className="td-loc-header">
                <span className="td-loc-label">{locNum}_{label}</span>
                <h3 className="td-loc-name">{loc.name.toUpperCase()}</h3>
                {loc.lat != null && (
                  <p className="td-loc-coord">
                    {Math.abs(loc.lat).toFixed(3)}°{' '}
                    {loc.lat >= 0 ? 'N' : 'S'} /{' '}
                    {Math.abs(loc.lng).toFixed(3)}°{' '}
                    {loc.lng >= 0 ? 'E' : 'W'}
                  </p>
                )}
              </div>

              <div className="td-gallery">
                {loc.photos.map((photo) => {
                  const imagePath = `${import.meta.env.BASE_URL}images/${trip.id}/${photo.id}.webp`;
                  return (
                    <Link to={`/photos/${photo.id}`} key={photo.id} className="td-gallery-item">
                      <div className="td-gallery-img-wrap">
                        <img src={imagePath} alt={photo.title} loading="lazy" />
                      </div>
                      <p className="td-gallery-caption">{photo.description}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {photos.length === 0 && (
          <div className="empty-state">
            <p>No observations recorded for this expedition.</p>
          </div>
        )}
      </div>
    </main>
  );
}


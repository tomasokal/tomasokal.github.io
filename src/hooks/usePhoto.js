import { useEffect, useState } from 'react';

let cachedData = null;

export function usePhotos() {
  const [data, setData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      return;
    }

    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        cachedData = d;
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error('Failed to load photos:', e);
        setError(e);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

export function getAllPhotos(data) {
  if (!data?.trips) return [];
  return data.trips.flatMap(trip => 
    trip.photos.map(p => ({ ...p, tripId: trip.trip.id }))
  );
}

export function getTripById(data, tripId) {
  if (!data?.trips) return null;
  return data.trips.find(t => t.trip.id === tripId);
}

export function getPhotoById(data, photoId) {
  if (!data?.trips) return null;
  for (const trip of data.trips) {
    const photo = trip.photos.find(p => p.id === photoId);
    if (photo) return { photo, trip: trip.trip, locations: trip.locations };
  }
  return null;
}
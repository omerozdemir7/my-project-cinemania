import { useState, useEffect } from 'react';
import { fetchMovieVideos } from '../utils/moviesApi';

export function useMovieVideos(movieId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setVideos([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMovieVideos(movieId)
      .then((data) => {
        if (cancelled) return;
        setVideos(data?.results || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  return { videos, loading, error };
}

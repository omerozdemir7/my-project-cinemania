const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const POSTER_PLACEHOLDER = 'https://via.placeholder.com/500x750?text=No+Poster';
const BACKDROP_PLACEHOLDER =
  'https://via.placeholder.com/1280x720?text=No+Image';
const PROVIDER_PLACEHOLDER =
  'https://via.placeholder.com/154x154?text=No+Logo';

const TMDB_SIZE_WIDTHS = {
  w45: 45,
  w92: 92,
  w154: 154,
  w185: 185,
  w300: 300,
  w342: 342,
  w500: 500,
  w780: 780,
  w1280: 1280,
  original: 2000,
};

function buildTmdbImageUrl(path, size) {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

function buildTmdbSrcSet(path, sizes) {
  if (!path) return '';

  return sizes
    .map((size) => {
      const width = TMDB_SIZE_WIDTHS[size];
      if (!width) return null;
      return `${buildTmdbImageUrl(path, size)} ${width}w`;
    })
    .filter(Boolean)
    .join(', ');
}

async function fetchFromAPI(endpoint, params = {}, lang = 'en-US') {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);

  if (lang) {
    url.searchParams.append('language', lang);
  }

  for (const key in params) {
    if (params[key]) url.searchParams.append(key, params[key]);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API Request Failed:', err);
    return null;
  }
}

export async function fetchPopularMovies(page = 1) {
  return await fetchFromAPI('/movie/popular', { page });
}

export async function fetchTrendingMovies(period = 'week', page = 1) {
  return await fetchFromAPI(`/trending/movie/${period}`, { page });
}

export async function fetchUpcomingMovies(page = 1) {
  return await fetchFromAPI('/movie/upcoming', { page, region: 'US' });
}

export async function searchMovies(query, page = 1, year = '') {
  return await fetchFromAPI('/search/movie', {
    query,
    page,
    primary_release_year: year,
  });
}

export async function fetchMovieDetails(id) {
  return await fetchFromAPI(`/movie/${id}`);
}

export async function fetchMovieVideos(id) {
  return await fetchFromAPI(`/movie/${id}/videos`, {}, null);
}

export function getImageUrl(path, size = 'w500') {
  return buildTmdbImageUrl(path, size) || POSTER_PLACEHOLDER;
}

export function getPosterSrcSet(path, sizes = ['w342', 'w500', 'w780']) {
  return buildTmdbSrcSet(path, sizes);
}

export function getOriginalImageUrl(path) {
  return getBackdropUrl(path, 'w1280');
}

export function getBackdropUrl(path, size = 'w1280') {
  return buildTmdbImageUrl(path, size) || BACKDROP_PLACEHOLDER;
}

export function getBackdropSrcSet(path, sizes = ['w780', 'w1280']) {
  return buildTmdbSrcSet(path, sizes);
}

export function getProviderLogoUrl(path, size = 'w154') {
  return buildTmdbImageUrl(path, size) || PROVIDER_PLACEHOLDER;
}

export function getProviderLogoSrcSet(path, sizes = ['w92', 'w154', 'w300']) {
  return buildTmdbSrcSet(path, sizes);
}

export async function fetchMovieProviders(id) {
  return await fetchFromAPI(`/movie/${id}/watch/providers`);
}

export async function fetchMovieCredits(id) {
  return await fetchFromAPI(`/movie/${id}/credits`, {}, null);
}

export async function fetchMovieReviews(id, page = 1) {
  return await fetchFromAPI(`/movie/${id}/reviews`, { page });
}

import { getImageUrl } from './moviesApi';

export function getGenresText(genreData) {
  if (!genreData || !Array.isArray(genreData) || genreData.length === 0) {
    return 'N/A';
  }

  const firstItem = genreData[0];

  if (typeof firstItem === 'object' && firstItem !== null && firstItem.name) {
    return genreData
      .map((g) => g.name)
      .slice(0, 2)
      .join(', ');
  }

  if (typeof firstItem === 'number') {
    const genreMap = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Sci-Fi',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western',
    };

    const genres = genreData.map((id) => genreMap[id]).filter(Boolean);
    return genres.length > 0 ? genres.slice(0, 2).join(', ') : 'Other';
  }

  return 'N/A';
}

export function renderStars(vote) {
  const stars = Math.round((vote || 0) / 2);
  const starElements = [];
  for (let i = 1; i <= 5; i++) {
    starElements.push(
      <i
        key={i}
        className={`fa-star ${i <= stars ? 'fas active' : 'far'}`}
      ></i>,
    );
  }
  return starElements;
}

export function getMovieYear(releaseDate) {
  return releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
}

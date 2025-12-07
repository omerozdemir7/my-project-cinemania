import { showLoader, hideLoader } from './loader.js';
import { fetchTrendingMovies, fetchUpcomingMovies } from './movies-data.js';
import {
  renderMovieCard,
  updateHeroWithMovie,
  renderUpcomingSection,
} from './ui-helpers.js';

const initHome = async () => {
  const heroSection = document.getElementById('home-hero');
  const heroContent = heroSection?.querySelector('.hero-content');
  const trendsGrid = document.getElementById('weekly-trends-grid');
  const upcomingContainer = document.getElementById('upcoming-container');

  if (!heroSection && !trendsGrid) return;

  showLoader();

  try {
    const [dayTrends, weekTrends, upcomingData] = await Promise.all([
      fetchTrendingMovies('day'),
      fetchTrendingMovies('week'),
      fetchUpcomingMovies(),
    ]);

    let heroMovie = null;
    if (dayTrends?.results?.length) {
      const rand = Math.floor(
        Math.random() * Math.min(5, dayTrends.results.length),
      );
      heroMovie = dayTrends.results[rand];
    } else if (weekTrends?.results?.length) {
      heroMovie = weekTrends.results[0];
    }

    if (heroMovie) {
      await updateHeroWithMovie(heroMovie.id, heroSection, heroContent);
    }

    if (weekTrends?.results?.length && trendsGrid) {
      trendsGrid.innerHTML = weekTrends.results
        .slice(0, 3)
        .map((m) => renderMovieCard(m))
        .join('');

      trendsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.movie-card');
        if (card && card.dataset.id) {
          updateHeroWithMovie(card.dataset.id, heroSection, heroContent);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (upcomingData?.results?.length && upcomingContainer) {
      const rand = Math.floor(
        Math.random() * Math.min(10, upcomingData.results.length),
      );
      const movie = upcomingData.results[rand];
      renderUpcomingSection(movie, upcomingContainer);
    }
  } catch (error) {
    console.error('Anasayfa yükleme hatası:', error);
  } finally {
    hideLoader();
  }
};

initHome();

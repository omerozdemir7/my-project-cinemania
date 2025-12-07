export function setupTeamModal() {
  const openBtn = document.querySelector('.footer-link');
  const backdrop = document.getElementById('team-modal-backdrop');
  const closeBtn = document.getElementById('team-modal-close-btn');

  if (!openBtn || !backdrop) return;

  function openModal(e) {
    e.preventDefault();
    backdrop.classList.remove('is-hidden');
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onEscKeyPress);
  }

  function closeModal() {
    backdrop.classList.add('is-hidden');
    document.body.classList.remove('modal-open');
    window.removeEventListener('keydown', onEscKeyPress);
  }

  function onEscKeyPress(e) {
    if (e.code === 'Escape') {
      closeModal();
    }
  }

  openBtn.addEventListener('click', openModal);

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
}

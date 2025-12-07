document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle-checkbox');
  const body = document.body;

  if (!themeToggle) return;

  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'light') {
    body.classList.add('light-mode');
    themeToggle.checked = true;
  }

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  });
});

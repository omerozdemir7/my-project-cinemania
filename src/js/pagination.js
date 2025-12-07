export function setupPagination(
  container,
  totalPages,
  currentPage,
  onPageChange,
) {
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  container.innerHTML = '';
  const maxButtons = 5;

  let start = Math.max(currentPage - 2, 1);
  let end = Math.min(start + maxButtons - 1, totalPages);

  if (end - start < maxButtons - 1) {
    start = Math.max(end - maxButtons + 1, 1);
  }

  const prev = document.createElement('button');
  prev.className = 'pagination-arrow';
  prev.innerHTML = '&laquo;';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => onPageChange(currentPage - 1));
  container.appendChild(prev);

  if (start > 1) {
    container.appendChild(createPageButton(1, onPageChange));
    if (start > 2) {
      container.appendChild(createDots());
    }
  }

  for (let i = start; i <= end; i++) {
    const btn = createPageButton(i, onPageChange, i === currentPage);
    container.appendChild(btn);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      container.appendChild(createDots());
    }
    container.appendChild(createPageButton(totalPages, onPageChange));
  }

  const next = document.createElement('button');
  next.className = 'pagination-arrow';
  next.innerHTML = '&raquo;';
  next.disabled = currentPage === totalPages;
  next.addEventListener('click', () => onPageChange(currentPage + 1));
  container.appendChild(next);
}

function createPageButton(page, onClick, isActive = false) {
  const btn = document.createElement('button');
  btn.className = 'pagination-btn';
  if (isActive) btn.classList.add('active');
  btn.textContent = page;
  btn.addEventListener('click', () => onClick(page));
  return btn;
}

function createDots() {
  const dots = document.createElement('span');
  dots.className = 'pagination-dots';
  dots.textContent = '...';
  return dots;
}

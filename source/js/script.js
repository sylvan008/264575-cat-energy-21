(function() {
  const OPEN = 'main-nav--open';
  const CLOSED = 'main-nav--closed';
  const NO_JS = 'main-nav--nojs';
  const toggleButton = document.querySelector('[data-toggle]');
  const target = document.querySelector('[data-target]');

  target.classList.remove(NO_JS);

  toggleButton.addEventListener('click', () => {
    if (target.classList.contains(CLOSED)) {
      target.classList.remove(CLOSED);
      target.classList.add(OPEN);
    } else {
      target.classList.remove(OPEN);
      target.classList.add(CLOSED);
    }
  });
})();

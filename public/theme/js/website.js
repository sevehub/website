document.addEventListener('DOMContentLoaded', () => {
  const backToTop = document.getElementById('backToTop');

  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

    document.querySelector('#toc').addEventListener('click', () => { document.getElementById('toc').classList.toggle('collapsed'); });
});



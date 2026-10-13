document.addEventListener('DOMContentLoaded', () => {
  
  document.querySelector("img").classList.add("loaded");
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
 document.querySelector('#toc').addEventListener('click', (e) => { 
  // Only toggle if the summary (or its icon) was clicked
  if (e.target.closest('.toc-summary')) {
    document.getElementById('toc').classList.toggle('collapsed'); 
  }
});


});



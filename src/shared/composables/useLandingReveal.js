import { onMounted, onUnmounted } from 'vue';

export function useLandingReveal() {
  let observer = null;

  const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]:not(.lnd-nav-link)').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  };

  onMounted(() => {
    initSmoothScrolling();

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  });

  onUnmounted(() => {
    observer?.disconnect();
  });
}

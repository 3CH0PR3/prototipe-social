import { onMounted, onUnmounted, ref } from 'vue';

export const LANDING_SECTION_IDS = ['inicio', 'caracteristicas', 'enterprise', 'tokenomics'];

const NAVBAR_OFFSET = 72;

function cleanUrl() {
  const url = window.location.pathname + window.location.search;
  if (window.location.hash) {
    history.replaceState(null, '', url);
  }
}

export function useLandingScrollSpy() {
  const activeSection = ref('inicio');
  let observer = null;
  let resumeTimer = null;

  const observeSections = () => {
    observer?.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          activeSection.value = visible[0].target.id;
        }
      },
      {
        rootMargin: `-${NAVBAR_OFFSET}px 0px -55% 0px`,
        threshold: 0
      }
    );

    LANDING_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  };

  onMounted(() => {
    const hash = window.location.hash.replace('#', '');
    if (LANDING_SECTION_IDS.includes(hash)) {
      const el = document.getElementById(hash);
      if (el) {
        activeSection.value = hash;
        window.scrollTo({ top: Math.max(0, el.offsetTop - NAVBAR_OFFSET) });
      }
    }

    cleanUrl();
    observeSections();
  });

  onUnmounted(() => {
    observer?.disconnect();
    clearTimeout(resumeTimer);
  });

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el || !LANDING_SECTION_IDS.includes(id)) return;

    activeSection.value = id;
    observer?.disconnect();
    clearTimeout(resumeTimer);

    window.scrollTo({
      top: Math.max(0, el.offsetTop - NAVBAR_OFFSET),
      behavior: 'smooth'
    });

    resumeTimer = window.setTimeout(observeSections, 700);
  };

  return { activeSection, scrollToSection };
}

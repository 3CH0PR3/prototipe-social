import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useSocialThemeStore = defineStore('social.theme', () => {
  const isDark = ref(localStorage.getItem('social-theme') === 'dark');

  watch(
    isDark,
    (val) => {
      localStorage.setItem('social-theme', val ? 'dark' : 'light');
      if (val) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    { immediate: true }
  );

  function toggle() {
    isDark.value = !isDark.value;
  }

  async function toggleWithTransition(event) {
    const goingDark = !isDark.value;

    if (!goingDark || !document.startViewTransition) {
      toggle();
      return;
    }

    const x = event?.clientX ?? window.innerWidth;
    const y = event?.clientY ?? 0;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => toggle());
    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  }

  return { isDark, toggle, toggleWithTransition };
});

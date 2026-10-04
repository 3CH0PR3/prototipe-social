import { useDark, useToggle } from '@vueuse/core';

export function useThemeTransition() {
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light',
    disableTransitionOnChange: false,
    storageKey: 'templateCustomizer--Theme',
    initialValue: () => {
      const stored = localStorage.getItem('templateCustomizer--Theme');
      if (stored === 'dark') return 'dark';
      if (stored === 'light') return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  });

  const toggle = useToggle(isDark);

  async function toggleWithTransition(event) {
    const goingDark = !isDark.value;

    // Light mode: sin animación
    if (!goingDark || !document.startViewTransition) {
      toggle();
      return;
    }

    // Dark mode: círculo desde top-right (donde está el botón)
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

  return { isDark, toggleWithTransition };
}

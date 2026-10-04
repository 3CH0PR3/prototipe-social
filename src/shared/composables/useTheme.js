import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('system.theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark');

  watch(
    isDark,
    (val) => {
      document.documentElement.classList.toggle('dark', val);
      localStorage.setItem('theme', val ? 'dark' : 'light');

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', val ? '#111110' : '#ffffff');
      }
    },
    { immediate: true }
  );

  const toggle = () => (isDark.value = !isDark.value);

  return { isDark, toggle };
});

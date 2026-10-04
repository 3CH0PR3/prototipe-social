<script setup>
import { ref, watch, computed } from 'vue';
import OffCanvas from './OffCanvas.vue';
import { RefreshCcw, Moon, Sun, Monitor, Settings } from '@lucide/vue';

import { useThemeTransition } from '@shared/composables/useThemeTransition.js';
import { useUISettings, COLOR_PRESETS } from '@shared/composables/useUISettings.js';

import DefaultSvg from '@img/system/customizer/default.svg';
import BorderSvg from '@img/system/customizer/border.svg';

import MenuExpandedSvg from '@img/system/customizer/expanded.svg';
import MenuCollapsedSvg from '@img/system/customizer/collapsed.svg';
import MenuRailSvg from '@img/system/customizer/collapsed.svg'; // reutiliza collapsed hasta tener SVG propio

import NavbarStickySvg from '@img/system/customizer/sticky.svg';
import NavbarStaticSvg from '@img/system/customizer/static.svg';
import NavbarHiddenSvg from '@img/system/customizer/hidden.svg';

import ContentCompactSvg from '@img/system/customizer/content-compact.svg';
import ContentWideSvg from '@img/system/customizer/content-wide.svg';

const { isDark, toggleWithTransition } = useThemeTransition();
const { color, skin, menuLayout, contentLayout, navbarLayout } = useUISettings();

const open = ref(false);

// Sincronizado con isDark — refleja el estado real en todo momento
const theme = computed({
  get: () => (isDark.value ? 'dark' : 'light'),
  set: (val) => {
    const target =
      val === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : val === 'dark';

    if (target !== isDark.value) {
      toggleWithTransition(null); // sin evento → usa top-right por defecto
    }
    localStorage.setItem('templateCustomizer--Theme', val);
  }
});

const pixel = skin;
const menu = menuLayout;
const navbar = navbarLayout;
const content = contentLayout;

// Arrays
const colors = Object.entries(COLOR_PRESETS).map(([value, p]) => ({
  value,
  color: `rgb(${p[500]})`
}));

const themes = [
  {
    value: 'light',
    label: 'Luz',
    icon: Sun
  },
  {
    value: 'dark',
    label: 'Oscuro',
    icon: Moon
  },
  {
    value: 'system',
    label: 'Sistema',
    icon: Monitor
  }
];

const pixels = [
  {
    value: 'default',
    label: 'Predeterminado',
    icon: DefaultSvg
  },
  {
    value: 'bordered',
    label: 'Bordeado',
    icon: BorderSvg
  }
];

const menus = [
  { value: 'expanded', label: 'Expandido', icon: MenuExpandedSvg },
  { value: 'rail', label: 'Rail', icon: MenuRailSvg },
  { value: 'collapsed', label: 'Colapsado', icon: MenuCollapsedSvg }
];

const navbars = [
  {
    value: 'sticky',
    label: 'Pegadizo',
    icon: NavbarStickySvg
  },
  {
    value: 'static',
    label: 'Estático',
    icon: NavbarStaticSvg
  },
  {
    value: 'hidden',
    label: 'Oculto',
    icon: NavbarHiddenSvg
  }
];

const contents = [
  {
    value: 'compact',
    label: 'Compacto',
    icon: ContentCompactSvg
  },
  {
    value: 'wide',
    label: 'Ancho',
    icon: ContentWideSvg
  }
];
</script>

<template>
  <div>
    <button
      @click="open = true"
      type="button"
      class="hidden md:block btn-primary text-white/50 hover:text-white bg-brand-500/20 hover:bg-brand-500 p-2 fixed top-[150px] -right-[10px] z-50 pe-5"
    >
      <Settings class="hover:animate-spin hover:[animation-duration:3s]" size="18" />
    </button>

    <OffCanvas :show="open" @close="open = false" :show-footer="false" :show-reset="true">
      <template #header>
        <h2 class="text-base font-bold leading-tight text-slate-900 dark:text-white">
          Personalizador de plantilla
        </h2>
        <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-200">
          Personalizar y previsualizar en tiempo real
        </p>
      </template>

      <template #body>
        <span
          class="inline-flex items-center rounded-md bg-brand-400/10 mb-3 px-2 py-1 text-xs font-medium text-brand-500 inset-ring inset-ring-gray-400/20"
        >
          Tematización
        </span>

        <!-- Colors -->
        <p class="text-sm mb-3 font-medium text-slate-900 dark:text-white">Color primario</p>
        <div class="grid grid-cols-6 gap-4 justify-between">
          <label v-for="item in colors" :key="item.value" class="cursor-pointer">
            <input v-model="color" type="radio" :value="item.value" class="peer sr-only" />

            <div
              class="flex flex-col items-center h-12 w-12 rounded-md border border-1 border-slate-300 dark:border-slate-700/50 p-1 transition peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500/20"
            >
              <span class="w-full h-full rounded-md" :style="{ backgroundColor: item.color }"></span>
            </div>
          </label>
        </div>

        <br />

        <!-- Themes -->
        <p class="text-sm mb-3 font-medium text-slate-900 dark:text-white">Tema</p>
        <div class="grid grid-cols-3 gap-4">
          <label v-for="item in themes" :key="item.value" class="cursor-pointer">
            <input v-model="theme" type="radio" :value="item.value" class="peer sr-only" />

            <div
              class="flex flex-col items-center rounded-md border border-1 border-slate-300 dark:border-slate-700/50 p-4 transition peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500/20"
            >
              <component :is="item.icon" class="h-6 w-6 text-slate-950 dark:text-slate-100" />
            </div>
            <span class="text-sm text-slate-700 dark:text-white">{{ item.label }}</span>
          </label>
        </div>

        <br />

        <!-- Pixels -->
        <p class="text-sm mb-3 font-medium text-slate-900 dark:text-white">Pieles</p>
        <div class="grid grid-cols-3 gap-3">
          <label v-for="item in pixels" :key="item.value" class="cursor-pointer">
            <input v-model="pixel" type="radio" :value="item.value" class="peer sr-only" />

            <div
              class="flex gap-4 flex-col items-center rounded-md border border-1 border-slate-300 dark:border-slate-700/50 p-1 transition peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500/20"
            >
              <img :src="item.icon" class="h-16 w-24" />
            </div>
            <span class="text-sm text-slate-700 dark:text-white">{{ item.label }}</span>
          </label>
        </div>

        <br />
        <hr />
        <br />

        <span
          class="inline-flex items-center rounded-md bg-brand-400/10 mb-3 px-2 py-1 text-xs font-medium text-brand-500 inset-ring inset-ring-gray-400/20"
        >
          Diseño
        </span>

        <!-- Menus -->
        <p class="text-sm mb-3 font-medium text-slate-900 dark:text-white">Menú (Navegación)</p>
        <div class="grid grid-cols-3 gap-3">
          <label v-for="item in menus" :key="item.value" class="cursor-pointer">
            <input v-model="menu" type="radio" :value="item.value" class="peer sr-only" />

            <div
              class="flex gap-4 flex-col items-center rounded-md border border-1 border-slate-300 dark:border-slate-700/50 p-1 transition peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500/20"
            >
              <img :src="item.icon" class="h-16 w-24" />
            </div>
            <span class="text-sm text-slate-700 dark:text-white">{{ item.label }}</span>
          </label>
        </div>

        <br />

        <!-- Navs -->
        <p class="text-sm mb-3 font-medium text-slate-900 dark:text-white">Tipos</p>
        <div class="grid grid-cols-3 gap-3">
          <label v-for="item in navbars" :key="item.value" class="cursor-pointer">
            <input v-model="navbar" type="radio" :value="item.value" class="peer sr-only" />

            <div
              class="flex gap-4 flex-col items-center rounded-md border border-1 border-slate-300 dark:border-slate-700/50 p-1 transition peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500/20"
            >
              <img :src="item.icon" class="h-16 w-24" />
            </div>
            <span class="text-sm text-slate-700 dark:text-white">{{ item.label }}</span>
          </label>
        </div>

        <br />

        <!-- Contents -->
        <p class="text-sm mb-3 font-medium text-slate-900 dark:text-white">Contenido</p>
        <div class="grid grid-cols-3 gap-3">
          <label v-for="item in contents" :key="item.value" class="cursor-pointer">
            <input v-model="content" type="radio" :value="item.value" class="peer sr-only" />

            <div
              class="flex gap-4 flex-col items-center rounded-md border border-1 border-slate-300 dark:border-slate-700/50 p-1 transition peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500/20"
            >
              <img :src="item.icon" class="h-16 w-24" />
            </div>
            <span class="text-sm text-slate-700 dark:text-white">{{ item.label }}</span>
          </label>
        </div>
      </template>
    </OffCanvas>
  </div>
</template>

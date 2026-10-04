import { ref, watch } from 'vue';

export const COLOR_PRESETS = {
  indigo: {
    50: '238 242 255',
    100: '224 231 255',
    200: '199 210 254',
    300: '165 180 252',
    400: '129 140 248',
    500: '99 102 241',
    600: '79 70 229',
    700: '67 56 202',
    800: '55 48 163',
    900: '49 46 129',
    950: '30 27 75',
    accent: '139 92 246',
    accentHover: '124 58 237'
  },
  teal: {
    50: '240 253 250',
    100: '204 251 241',
    200: '153 246 228',
    300: '94 234 212',
    400: '45 212 191',
    500: '13 148 136',
    600: '15 118 110',
    700: '17 94 89',
    800: '19 78 74',
    900: '19 63 60',
    950: '4 47 46',
    accent: '6 182 212',
    accentHover: '8 145 178'
  },
  amber: {
    50: '255 251 235',
    100: '254 243 199',
    200: '253 230 138',
    300: '252 211 77',
    400: '251 191 36',
    500: '245 158 11',
    600: '217 119 6',
    700: '180 83 9',
    800: '146 64 14',
    900: '120 53 15',
    950: '69 26 3',
    accent: '251 146 60',
    accentHover: '249 115 22'
  },
  rose: {
    50: '255 241 242',
    100: '255 228 230',
    200: '254 205 211',
    300: '253 164 175',
    400: '251 113 133',
    500: '244 63 94',
    600: '225 29 72',
    700: '190 18 60',
    800: '159 18 57',
    900: '136 19 55',
    950: '76 5 25',
    accent: '251 113 133',
    accentHover: '244 63 94'
  },
  blue: {
    50: '239 246 255',
    100: '219 234 254',
    200: '191 219 254',
    300: '147 197 253',
    400: '96 165 250',
    500: '59 130 246',
    600: '37 99 235',
    700: '29 78 216',
    800: '30 64 175',
    900: '30 58 138',
    950: '23 37 84',
    accent: '99 102 241',
    accentHover: '79 70 229'
  },
  dark: {
    50: '248 250 252',
    100: '241 245 249',
    200: '226 232 240',
    300: '203 213 225',
    400: '148 163 184',
    500: '100 116 139',
    600: '71 85 105',
    700: '51 65 85',
    800: '30 41 59',
    900: '15 23 42',
    950: '2 6 23',
    accent: '100 116 139',
    accentHover: '71 85 105'
  }
};

const applyColor = (key) => {
  const p = COLOR_PRESETS[key];
  if (!p) return;
  const r = document.documentElement;
  r.style.setProperty('--color-brand-50', p[50]);
  r.style.setProperty('--color-brand-100', p[100]);
  r.style.setProperty('--color-brand-200', p[200]);
  r.style.setProperty('--color-brand-300', p[300]);
  r.style.setProperty('--color-brand-400', p[400]);
  r.style.setProperty('--color-brand', p[500]);
  r.style.setProperty('--color-brand-hover', p[600]);
  r.style.setProperty('--color-brand-700', p[700]);
  r.style.setProperty('--color-brand-800', p[800]);
  r.style.setProperty('--color-brand-900', p[900]);
  r.style.setProperty('--color-brand-950', p[950]);
  r.style.setProperty('--color-accent', p.accent);
  r.style.setProperty('--color-accent-hover', p.accentHover);
};

const applySkin = (val) => {
  document.documentElement.classList.toggle('bordered', val === 'bordered');
};

const color = ref(localStorage.getItem('templateCustomizer--Colors') ?? 'blue');
const skin = ref(localStorage.getItem('templateCustomizer--Skin') ?? 'default');
const menuLayout = ref(localStorage.getItem('templateCustomizer--MenuLayout') ?? 'rail');
const contentLayout = ref(localStorage.getItem('templateCustomizer--ContentLayout') ?? 'compact');
const navbarLayout = ref(localStorage.getItem('templateCustomizer--NavbarLayout') ?? 'sticky');

applyColor(color.value);
applySkin(skin.value);

watch(color, (val) => {
  applyColor(val);
  localStorage.setItem('templateCustomizer--Colors', val);
});
watch(skin, (val) => {
  applySkin(val);
  localStorage.setItem('templateCustomizer--Skin', val);
});
watch(menuLayout, (val) => {
  localStorage.setItem('templateCustomizer--MenuLayout', val);
});
watch(contentLayout, (val) => {
  localStorage.setItem('templateCustomizer--ContentLayout', val);
});
watch(navbarLayout, (val) => {
  localStorage.setItem('templateCustomizer--NavbarLayout', val);
});

export const useUISettings = () => ({
  color,
  skin,
  menuLayout,
  contentLayout,
  navbarLayout
});

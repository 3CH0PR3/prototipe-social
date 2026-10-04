import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { loadLanguageAsync } from '@shared/plugins/i18n/i18n';

export const useTranslations = () => {
  const { t, locale } = useI18n();

  const changeLang = async (lang) => {
    await loadLanguageAsync(lang);
  };

  const currentLang = computed(() => locale.value);

  return {
    t,
    locale,
    currentLang,
    changeLang
  };
};
